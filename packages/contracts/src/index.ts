export interface TraceMeta {
  trace_id: string;
  data_period?: string;
  source?: string;
  last_synced_at?: string | null;
  completeness?: 'COMPLETE' | 'PARTIAL' | 'MISSING';
}

export interface Links {
  self: string;
}

export interface ApiSuccess<TData> {
  data: TData;
  meta?: TraceMeta;
  links?: Links;
}

export interface FieldError {
  field: string;
  code: string;
  message: string;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  fields?: FieldError[];
  trace_id: string;
}

export interface ApiFailure {
  error: ApiErrorBody;
}
