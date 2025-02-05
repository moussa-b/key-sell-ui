import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { type ToasterMessage } from '../models/toaster-message.model';

@Injectable({providedIn: 'root'})
export class ToasterService {
  private toasterSubject = new Subject<ToasterMessage>();

  emitValue(message: ToasterMessage): void {
    this.toasterSubject.next(message);
  }

  get toasterEvent$(): Observable<ToasterMessage> {
    return this.toasterSubject.asObservable();
  }
}
