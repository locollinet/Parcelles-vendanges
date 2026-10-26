import { ParcelFeature, ClassificationLevel } from '../types';

export interface IndexedParcel {
  feature: ParcelFeature;
  id: string;
  niveau: ClassificationLevel;
  climatNorm: string;
  nomAppNorm: string;
  communeNorm: string;
  vigneronNorm: string;
  codeParcelNorm: string;
  notesNorm: string;
  fullTextNorm: string;
  words: string[];
}

/**
 * Remove accents/diacritics, convert to lowercase, normalize punctuation
 */
export function normalizeSearchString(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’\-]/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Common French wine & address abbreviations expansion
 */
export function expandSynonyms(text: string): string {
  if (!text) return '';
  return text
    .replace(/\bst\b/g, 'saint')
    .replace(/\bste\b/g, 'sainte')
    .replace(/\b1er\b/g, 'premier')
    .replace(/\bgrd\b/g, 'grand');
}

/**
 * Standard Levenshtein distance for fuzzy typo matching
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  if (a.length > b.length) {
    const tmp = a;
    a = b;
    b = tmp;
  }

  const row = Array.from({ length: a.length + 1 }, (_, i) => i);

  for (let i = 1; i <= b.length; i++) {
    let prevDiag = row[0];
    row[0] = i;

    for (let j = 1; j <= a.length; j++) {
      const temp = row[j];
      if (b[i - 1] === a[j - 1]) {
        row[j] = prevDiag;
      } else {
        row[j] = 1 + Math.min(row[j - 1], row[j], prevDiag);
      }
      prevDiag = temp;
    }
  }

  return row[a.length];
}

export class SearchEngine {
  private indexMap: Map<string, IndexedParcel> = new Map();

  /**
   * Pre-compute normalized indices for O(1) fast lookup
   */
  public indexParcel(feature: ParcelFeature): IndexedParcel {
    const props = feature.properties;
    const id = String(feature.id || props.id || `${props.commune}-${props.code_parcel || props.code_livret || 'id'}`);

    const climatNorm = normalizeSearchString(props.climat || props.nom_climat || props.nom_parcelle || '');
    const nomAppNorm = normalizeSearchString(props.nom_app || props.appellation || props.nom_aoc || '');
    const communeNorm = normalizeSearchString(props.commune || props.nom_commune || '');
    const vigneronNorm = normalizeSearchString(props.vigneron || props.producteur || props.proprietaire || '');
    const codeParcelNorm = normalizeSearchString(props.code_parcel || props.code_livret || '');
    const secteurNorm = normalizeSearchString(props.secteur_livret || '');
    const notesNorm = normalizeSearchString(props.notes || props.notes_acces || props.nb_rangs_details || '');

    const combined = `${climatNorm} ${nomAppNorm} ${communeNorm} ${vigneronNorm} ${codeParcelNorm} ${secteurNorm} ${notesNorm}`;
    const fullTextNorm = expandSynonyms(combined);
    
    const wordsSet = new Set(fullTextNorm.split(/\s+/).filter(w => w.length > 0));
    const words = Array.from(wordsSet);

    const indexed: IndexedParcel = {
      feature,
      id,
      niveau: props.niveau,
      climatNorm,
      nomAppNorm,
      communeNorm,
      vigneronNorm,
      codeParcelNorm,
      notesNorm,
      fullTextNorm,
      words,
    };

    this.indexMap.set(id, indexed);
    return indexed;
  }

  public clear(): void {
    this.indexMap.clear();
  }

  /**
   * Smart, accent-insensitive, typo-tolerant search with relevance scoring
   */
  public search(query: string, levelFilter: string = 'ALL'): ParcelFeature[] {
    const rawNormalized = normalizeSearchString(query);
    const normalizedQuery = expandSynonyms(rawNormalized);

    const indexedList = Array.from(this.indexMap.values());

    // Level filter (supports ALL, LIVRET, LIVRET:Grand Cru, LIVRET:1er Cru, LIVRET:a_faire, etc.)
    const levelFiltered = levelFilter === 'ALL' 
      ? indexedList 
      : levelFilter === 'LIVRET'
      ? indexedList.filter(item => item.feature.properties.is_vendange_livret || item.feature.properties.code_livret || item.feature.properties.page_livret)
      : levelFilter.startsWith('LIVRET:')
      ? indexedList.filter(item => {
          const isLivret = Boolean(item.feature.properties.is_vendange_livret || item.feature.properties.code_livret || item.feature.properties.page_livret);
          if (!isLivret) return false;
          const subLvl = levelFilter.replace('LIVRET:', '').trim();
          if (subLvl === 'ALL' || subLvl === '') return true;
          if (['a_faire', 'en_cours', 'vendange'].includes(subLvl)) {
            const currentStatus = item.feature.properties.harvest_status || 'a_faire';
            return currentStatus === subLvl;
          }
          return item.niveau?.trim().toLowerCase() === subLvl.toLowerCase();
        })
      : indexedList.filter(item => item.niveau?.trim().toLowerCase() === levelFilter.trim().toLowerCase());

    if (!normalizedQuery) {
      return levelFiltered.map(item => item.feature);
    }

    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
    if (queryTokens.length === 0) {
      return levelFiltered.map(item => item.feature);
    }

    const scoredResults: { item: IndexedParcel; score: number }[] = [];

    for (const item of levelFiltered) {
      let totalScore = 0;
      let matchedAllTokens = true;

      // Direct full string query match boost
      if (item.fullTextNorm.includes(normalizedQuery)) {
        totalScore += 100;
      }

      // Exact/substring match on appellation or climat boost
      if (item.climatNorm === normalizedQuery || item.nomAppNorm === normalizedQuery) {
        totalScore += 200;
      } else if (item.climatNorm.includes(normalizedQuery) || item.nomAppNorm.includes(normalizedQuery)) {
        totalScore += 120;
      }

      for (const qToken of queryTokens) {
        let tokenScore = 0;

        // 1. Direct substring match
        if (item.fullTextNorm.includes(qToken)) {
          tokenScore = 80;
          if (item.climatNorm.includes(qToken) || item.nomAppNorm.includes(qToken)) {
            tokenScore += 40;
          }
        } else {
          // 2. Fuzzy match against indexed target words
          let bestFuzzy = 0;
          const tokenLen = qToken.length;
          const maxDist = tokenLen <= 3 ? 0 : tokenLen <= 5 ? 1 : tokenLen <= 10 ? 2 : 3;

          for (const targetWord of item.words) {
            // Check prefix
            if (tokenLen >= 3 && targetWord.startsWith(qToken)) {
              bestFuzzy = Math.max(bestFuzzy, 70);
              continue;
            }

            if (maxDist > 0) {
              const dist = levenshteinDistance(qToken, targetWord);
              if (dist <= maxDist) {
                const scoreForDist = 60 - dist * 15;
                bestFuzzy = Math.max(bestFuzzy, scoreForDist);
              }
            }
          }

          if (bestFuzzy > 0) {
            tokenScore = bestFuzzy;
          } else {
            matchedAllTokens = false;
            break;
          }
        }

        totalScore += tokenScore;
      }

      if (matchedAllTokens && totalScore > 0) {
        scoredResults.push({ item, score: totalScore });
      }
    }

    // Sort by descending relevance score
    scoredResults.sort((a, b) => b.score - a.score);

    return scoredResults.map(res => res.item.feature);
  }
}

export const searchEngine = new SearchEngine();
