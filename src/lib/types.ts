export type FrequencyPreset = 'manual' | 'hourly' | '6h' | '24h';

export type ThresholdPreset =
  | '1d'
  | '1w'
  | '2w'
  | '1mo'
  | '2mo'
  | '6mo'
  | '1yr';

export interface Settings {
  thresholdMs: number;
  frequency: FrequencyPreset;
  exemptDomains: string[];
  autoTidy: boolean;
}

export interface Run {
  ts: number;
  trigger: 'auto' | 'manual';
  thresholdMs: number;
  inactiveDomains: number;
  deletedHistory: number;
  deletedDownloads: number;
  error?: string;
}

export interface DomainBucket {
  lastVisitAgoMs: number;
  domainCount: number;
}

export interface InFlight {
  startedAt: number;
  trigger: 'auto' | 'manual';
}
