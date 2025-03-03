import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Media } from '../models/media.model';

@Injectable({
  providedIn: 'root'
})
export class MediasService {

  constructor(private http: HttpClient) {
  }

  getMedia(media: Media, attachmentType: 'pictures' | 'documents' | 'videos'): Observable<{ media: Media, blob: Blob }> {
    return this.http.get(`${environment.API_URL}/api/medias/${attachmentType}/${media.uuid}`, {responseType: 'blob'}).pipe(
      map(blob => ({media, blob}))
    );
  }

}
