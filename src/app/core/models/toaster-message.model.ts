export interface ToasterMessage {
  severity: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';
  summary: string;
  detail: string;
}
