import { Component } from '@angular/core';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent {
  username: string;
  greeting: string;

  constructor() {
    this.username = '';
    this.greeting = this.getGreeting();
  }

  getGreeting(): string {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
      return 'Guten Morgen';
    } else if (currentHour >= 12 && currentHour < 18) {
      return 'Guten Tag';
    } else {
      return 'Guten Abend';
    }
  }
}
