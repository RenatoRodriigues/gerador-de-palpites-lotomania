
export interface Sequence {
  id: number;
  numbers: number[];
  timestamp: number;
}

export interface Stats {
  mostFrequent: { num: number; count: number }[];
  leastFrequent: { num: number; count: number }[];
  mostDelayed: { num: number; delay: number }[];
  probabilityMap: Record<number, number>;
}

export interface Prediction {
  id: number;
  numbers: number[];
}
