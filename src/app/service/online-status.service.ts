import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OnlineStatusService {
  isOnline: boolean = false;

  constructor() { }
}