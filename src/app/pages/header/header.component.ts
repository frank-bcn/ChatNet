import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, deleteDoc, doc } from '@angular/fire/firestore';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  username: string;
  greeting: string;
  isDropdownOpen: boolean = false;
  loggedInUserId: string = '';
  showConfirmation: boolean = false;

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private firestore: Firestore
  ) {
    this.username = '';
    this.greeting = this.getGreeting();
  }

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.username = user.displayName || '';
        this.loggedInUserId = user.uid;
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

  openConfirmation() {
    console.log("openConfirmation called");
    this.showConfirmation = true;
  }

  cancelDelete() {
    console.log("cancelDelete called");
    this.showConfirmation = false;
  }

  confirmDelete() {
    console.log("confirmDelete called");
    this.showConfirmation = false;

    this.deleteAccount();
  }

  deleteAccount() {
    if (this.loggedInUserId) {
      const user = this.afAuth.currentUser;

      if (user) {
        user.then(currentUser => {
          if (currentUser) {
            currentUser.delete()
              .then(() => {

                return deleteDoc(doc(this.firestore, 'users', this.loggedInUserId));
              })
              .then(() => {

                this.router.navigate(['/signup']);
              })
              .catch(error => {
                console.error('Fehler beim Löschen des Benutzerkontos:', error);
              });
          }
        });
      }
    }
  }
}