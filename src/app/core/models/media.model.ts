export interface Media {
  id: number;
  uuid: string;
  fileName: string;
  fileSize: number;
  mediaType: MediaType;
  mimeType: string;
  createdBy?: number;
  createdAt: Date;
}

export enum MediaType {
  NONE = 'NONE',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
}
