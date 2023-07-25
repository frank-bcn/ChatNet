import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  username: string;
  email: any;
  showSuccessMessage: boolean = false;

  constructor(private router: Router, private afAuth: AngularFireAuth, private firestore: Firestore) {
    this.username = '';
    this.email = '';
  }

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.username = user.displayName || '';
        this.email = user.email || '';
      }
    });
  }

  goToMainPage() {
    this.router.navigate(['/main-page']);
  }

  updateUserData() {
    this.afAuth.currentUser.then(user => {
      if (user) {
        
        user.updateProfile({
          displayName: this.username,
        }).then(() => {
          this.showSuccessMessage = true;
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);
        }).catch(error => {
          console.error('Fehler beim Aktualisieren des Benutzernamens:', error);
        });

        
        user.updateEmail(this.email).then(() => {
          console.log('E-Mail wurde erfolgreich aktualisiert!');
        }).catch(error => {
          console.error('Fehler beim Aktualisieren der E-Mail:', error);
        });

        
        const userRef = doc(this.firestore, 'users', user.uid);
        const userData = {
          displayName: this.username,
          email: this.email
        };

        setDoc(userRef, userData, { merge: true })
          .then(() => {
            console.log('Benutzerdaten wurden in Firestore aktualisiert!');
          })
          .catch(error => {
            console.error('Fehler beim Aktualisieren der Benutzerdaten in Firestore:', error);
          });
      } else {
        console.error('Benutzer nicht gefunden.');
      }
    }).catch(error => {
      console.error('Fehler beim Abrufen des aktuellen Benutzers:', error);
    });
  }
}