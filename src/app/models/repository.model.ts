export interface Repository {
  name: string;
  description: string;
  language: string;
  visibility: 'Public' | 'Private';
  lastUpdated: string;
}
