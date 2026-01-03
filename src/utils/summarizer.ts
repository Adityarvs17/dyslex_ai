/**
 * Extractive Summarization Algorithm
 * Identifies key sentences based on word frequency and position.
 */

interface Sentence {
  text: string;
  score: number;
  index: number;
}

// Common stop words to ignore in frequency analysis
const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'of', 'for', 'with', 'by', 'as', 'it', 'that', 'this', 'are', 'was', 'were', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'but', 'or', 'so', 'if', 'when', 'where', 'how', 'why', 'who', 'what', 'all', 'any', 'some', 'no', 'not', 'can', 'could', 'will', 'would', 'should', 'may', 'might', 'must', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'he', 'she', 'they', 'we', 'i', 'you'
]);

export function summarizeText(text: string, ratio: number = 0.3): string {
  if (!text || text.length < 50) return text;

  // 1. Split into sentences (naive split on punctuation)
  const sentenceRegex = /[^.!?]+[.!?]+/g;
  const matches = text.match(sentenceRegex);
  
  if (!matches || matches.length <= 1) return text;

  const sentences = matches.map(s => s.trim());
  
  // 2. Calculate word frequency
  const wordFreq: Record<string, number> = {};
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  
  words.forEach(word => {
    if (!STOP_WORDS.has(word) && word.length > 2) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  // Normalize scores
  const maxFreq = Math.max(...Object.values(wordFreq), 1);
  Object.keys(wordFreq).forEach(word => {
    wordFreq[word] = wordFreq[word] / maxFreq;
  });

  // 3. Score sentences
  const scoredSentences: Sentence[] = sentences.map((s, index) => {
    const sWords = s.toLowerCase().match(/\b\w+\b/g) || [];
    let score = 0;
    
    sWords.forEach(word => {
      if (wordFreq[word]) {
        score += wordFreq[word];
      }
    });

    // Boost first and last sentences slightly as they often contain key info
    if (index === 0) score *= 1.2;
    if (index === sentences.length - 1) score *= 1.1;

    // Penalty for very short sentences
    if (sWords.length < 5) score *= 0.5;

    return { text: s, score: score / (sWords.length || 1), index };
  });

  // 4. Sort by score and select top sentences
  const count = Math.max(1, Math.ceil(sentences.length * ratio));
  const topSentences = [...scoredSentences]
    .sort((a, b) => b.score - a.score)
    .slice(0, count);

  // 5. Reorder by original position to maintain flow
  return topSentences
    .sort((a, b) => a.index - b.index)
    .map(s => s.text)
    .join(' ');
}
