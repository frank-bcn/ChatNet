import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, deleteDoc, doc } from '@angular/fire/firestore';
import { ChatDataService } from 'src/app/service/chat-data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  isDropdownOpen: boolean = false;
  showConfirmation: boolean = false;

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private firestore: Firestore,
    public chatDataService: ChatDataService,
  ) {
    this.chatDataService.greeting = this.getGreeting();
  }

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.chatDataService.username = user.displayName || '';
        this.chatDataService.loggedUserId = user.uid;
        this.updateGreeting();
      }
    });
  }

  // grüßt den User
  getGreeting(): string {
    let currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      return 'Good morning';
    } else if (currentHour >= 12 && currentHour < 18) {
      return 'Good afternoon';
    } else if (currentHour >= 18 && currentHour < 22) {
      return 'Good evening';
    } else {
      return 'Good night';
    }
  }

  // aktualisiert den Begrüßungstext 
  updateGreeting() {
    if (this.chatDataService.username) {
      this.chatDataService.greeting = `${this.getGreeting()}`;
    } else {
      this.chatDataService.greeting = this.getGreeting();
    }
  }

  // öffnet das menu
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    let button = document.querySelector('.menuButton');
    if (button) {
      button.classList.toggle('open', this.isDropdownOpen);
    }
  }

  // schließt das menu
  closeDropdown() {
    this.isDropdownOpen = false;
  }

  // navigiert zur profil.component und schließt das menu
  openProfile() {
    this.router.navigate(['/profile']);
    this.closeDropdown();
  }

  // navigiert zur group.component und schließt das menu
  openGroupChat() {
    this.router.navigate(['/group']);
    this.closeDropdown();
  }

  //öffnet das popup zur bestätigung des löschvorgangs
  openConfirmation() {
    /* console.log("openConfirmation called");*/
    this.showConfirmation = true;
  }

  // bricht den löschvorgang ab
  cancelDelete() {
    /*console.log("cancelDelete called");*/
    this.showConfirmation = false;
  }

  // bestätigt den löschvorgang und ruft die lösch function auf
  confirmDelete() {
    this.showConfirmation = false;
    this.deleteAccount();
  }

  // löscht den user aus beiden datenbanken
  deleteAccount() {
    if (this.chatDataService.loggedUserId) {
      let user = this.afAuth.currentUser;
      if (user) {
        user.then(currentUser => {
          if (currentUser) {
            let userUid = currentUser.uid;
            let contactListDocRef = doc(this.firestore, 'contactlist', userUid);
            deleteDoc(contactListDocRef)
              .then(() => {
                return deleteDoc(doc(this.firestore, 'contactlist', userUid));
              })
              .then(() => {
                return currentUser.delete();
              })
              .then(() => {
                return deleteDoc(doc(this.firestore, 'users', userUid));
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

  openDesign() {
    this.router.navigate(['/design']);
  }
}