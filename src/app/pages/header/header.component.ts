import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  username: string;
  greeting: string;
  isDropdownOpen: boolean = false;

  constructor(private router: Router, private afAuth: AngularFireAuth) {
    this.username = '';
    this.greeting = this.getGreeting();
  }

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.username = user.displayName || '';
        this.updateGreeting();
      }
    });
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

  updateGreeting() {
    if (this.username) {
      this.greeting = `${this.getGreeting()}`;
    } else {
      this.greeting = this.getGreeting();
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    const button = document.querySelector('.menuButton');
    if (button) {
      button.classList.toggle('open', this.isDropdownOpen);
    }
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  openProfile() {
    this.router.navigate(['/profile']);
    this.closeDropdown();
  }
}