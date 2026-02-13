
import { Sequence, Stats, Prediction } from '../types';

export const calculateStats = (history: Sequence[]): Stats => {
  const counts: Record<number, number> = {};
  const lastSeen: Record<number, number> = {};

  // Initialize
  for (let i = 1; i <= 100; i++) {
    counts[i] = 0;
    lastSeen[i] = -1;
  }

  history.forEach((seq, idx) => {
    seq.numbers.forEach(num => {
      counts[num]++;
      lastSeen[num] = idx;
    });
  });

  const totalSequences = history.length;
  const entries = Object.entries(counts).map(([num, count]) => ({
    num: parseInt(num),
    count
  }));

  const sortedByFreq = [...entries].sort((a, b) => b.count - a.count);
  const sortedByDelay = Object.entries(lastSeen).map(([num, lastIdx]) => ({
    num: parseInt(num),
    delay: lastIdx === -1 ? totalSequences : totalSequences - 1 - lastIdx
  })).sort((a, b) => b.delay - a.delay);

  // Simplified "LSTM-style" probability (Weighting frequency, recency, and sequence trends)
  const probabilityMap: Record<number, number> = {};
  for (let i = 1; i <= 100; i++) {
    const freqWeight = counts[i] / (totalSequences || 1);
    const delayWeight = (totalSequences - lastSeen[i]) / (totalSequences + 1);
    // Simple harmonic mean of factors
    probabilityMap[i] = (freqWeight * 0.6) + (delayWeight * 0.4);
  }

  return {
    mostFrequent: sortedByFreq.slice(0, 5),
    leastFrequent: sortedByFreq.slice(-5).reverse(),
    mostDelayed: sortedByDelay.slice(0, 5),
    probabilityMap
  };
};

/**
 * Simulates a refined LSTM output by analyzing the temporal patterns
 * of previous selections and generating 50-number predictions.
 */
export const generateLSTMPredictions = (history: Sequence[], stats: Stats): Prediction[] => {
  if (history.length < 15) return [];

  const predictions: Prediction[] = [];

  for (let p = 0; p < 10; p++) {
    const selected = new Set<number>();

    // Logic: Mix of high frequency, high delay, and stochastic sampling weighted by probabilityMap
    const probEntries = Object.entries(stats.probabilityMap)
      .map(([num, prob]) => ({ num: parseInt(num), prob }))
      .sort((a, b) => b.prob - a.prob);

    // 1. Top 15 highest probability (LSTM "Memory")
    probEntries.slice(0, 15).forEach(e => selected.add(e.num));

    // 2. Add some temporal variability (Random selection weighted by probability)
    while (selected.size < 50) {
      const candidate = Math.floor(Math.random() * 100) + 1;
      const prob = stats.probabilityMap[candidate] || 0.1;
      if (Math.random() < prob + 0.2) {
        selected.add(candidate);
      }
    }

    predictions.push({
      id: p + 1,
      numbers: Array.from(selected).sort((a, b) => a - b)
    });
  }

  return predictions;
};
