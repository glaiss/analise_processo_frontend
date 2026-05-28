export interface ProblemDetail {
  type: string; // URIs are typically handled as strings in frontend contexts
  title?: string;
  status: number;
  detail?: string;
  instance?: string;
  properties?: { [key: string]: any };
}
