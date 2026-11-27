/**
 * Minimal structured logger. One JSON object per line, using the `severity` and `message`
 * fields that Google Cloud Logging recognizes for Cloud Run.
 */
export type Severity = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';

export type LogFields = Readonly<Record<string, unknown>>;

export interface Logger {
  log(severity: Severity, message: string, fields?: LogFields): void;
}

export function createJsonLogger(
  write: (line: string) => void,
  now: () => Date = () => new Date(),
  baseFields: LogFields = {},
): Logger {
  return {
    log(severity, message, fields = {}) {
      write(
        JSON.stringify({
          severity,
          message,
          time: now().toISOString(),
          ...baseFields,
          ...fields,
        }),
      );
    },
  };
}
