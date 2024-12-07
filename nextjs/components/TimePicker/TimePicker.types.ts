export type TimeToken = 'hh' | 'mm' | 'ss' | 'aa';
export type TimeType = 'hour' | 'minute' | 'second' | 'ampm';
export type HourFormat = '12' | '24';
export type TimeSection = {
  format: string;
  token: TimeToken;
  value: string;
  order: number;
  maxLength: number;
  type: TimeType;
  startSeparator: string;
  endSeparator: string;
  selectionStart: number;
  selectionEnd: number;
};

export const DEFAULT_TIME_FORMAT = 'hh:mm:ss';
