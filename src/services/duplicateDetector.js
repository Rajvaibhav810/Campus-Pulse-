// Campus Pulse — Duplicate Detection and Issue Grouping Engine

/**
 * Normalizes string for keyword matching
 */
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !['the', 'and', 'for', 'with', 'not', 'this', 'that', 'near'].includes(token));
}

/**
 * Calculates similarity coefficient between two sets of tokens (Jaccard similarity)
 */
function jaccardSimilarity(tokensA, tokensB) {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

/**
 * Scans existing active issues and returns potential duplicates with match confidence
 * @param {Object} draft - { title, category, location }
 * @param {Array} existingIssues - List of active issues
 * @returns {Array} List of matched issues with similarity score and reason
 */
export function detectPotentialDuplicates(draft, existingIssues = []) {
  if (!draft.title || draft.title.trim().length < 4) {
    return [];
  }

  const draftTitleTokens = tokenize(draft.title);
  const draftLocationTokens = tokenize(draft.location || '');
  const draftCategory = draft.category;

  const matches = [];

  for (const issue of existingIssues) {
    // Only compare against open/active issues (not resolved)
    if (issue.status === 'resolved') continue;

    let score = 0;
    const reasons = [];

    // 1. Category exact match (+30%)
    if (draftCategory && issue.category === draftCategory) {
      score += 30;
      reasons.push('Same category');
    }

    // 2. Title token similarity (+45%)
    const issueTitleTokens = tokenize(issue.title + ' ' + (issue.description || ''));
    const titleSim = jaccardSimilarity(draftTitleTokens, issueTitleTokens);
    if (titleSim > 0.2) {
      const titleScore = Math.min(Math.round(titleSim * 70), 45);
      score += titleScore;
      reasons.push('Similar title phrasing');
    }

    // 3. Location overlap (+25%)
    if (draftLocationTokens.length) {
      const issueLocationTokens = tokenize(issue.location?.fullText || '');
      const locationSim = jaccardSimilarity(draftLocationTokens, issueLocationTokens);
      if (locationSim > 0.2) {
        score += 25;
        reasons.push('Matching area/zone');
      }
    }

    // If overall confidence >= 50%
    if (score >= 50) {
      matches.push({
        issue,
        confidence: Math.min(score, 98),
        reasons
      });
    }
  }

  // Sort by highest confidence match first
  return matches.sort((a, b) => b.confidence - a.confidence);
}
