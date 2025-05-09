import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Media } from '../models/media.model';
import { ResponseStatus } from '../models/response-status.model';

@Injectable({
  providedIn: 'root'
})
export class MediasService {

  constructor(private http: HttpClient) {
  }

  getMedia(media: Media): Observable<{ media: Media, blob: Blob }> {
    return this.http.get(`${environment.API_URL}/api/medias/${media.uuid}`, {responseType: 'blob'}).pipe(
      map(blob => ({media, blob}))
    );
  }

  removeMedia(uuid: string): Observable<ResponseStatus> {
    return this.http.delete<ResponseStatus>(`${environment.API_URL}/api/medias/${uuid}`);
  }
}
