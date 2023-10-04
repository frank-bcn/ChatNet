import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChangeBackgroundService {

  private backgroundColorSubject = new BehaviorSubject<string>('');
  public backgroundColor$ = this.backgroundColorSubject.asObservable();

  constructor() { }


  setBackgroundColor(color: string) {
    this.backgroundColorSubject.next(color);
  }
}
