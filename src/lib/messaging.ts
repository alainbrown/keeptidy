import type { Run } from './types';

export type Message =
  | { type: 'tidy-now' }
  | { type: 'erase-all' }
  | { type: 'preview' };

export type Response<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export type TidyNowResponse = Response<Run>;
