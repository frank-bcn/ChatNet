import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  username: string;
  greeting: string;

  constructor(private router: Router) {
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

  openProfile() {
    this.router.navigate(['/profile']);
  }
}
