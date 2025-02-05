import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage: Storage;

  constructor() {
    if (localStorage.getItem('jwtToken') && localStorage.getItem('jwtToken')!.length > 0) {
      this.storage = localStorage;
    } else {
      this.storage = sessionStorage
    }
  }

  setStorage(storage: Storage): void {
    this.storage = storage;
  }

  set(key: string, value: string) {
    this.storage.setItem(key, value);
  }

  get(key: string) {
    return this.storage.getItem(key);
  }

  remove(key: string) {
    this.storage.removeItem(key);
  }
}
