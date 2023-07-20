import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  username: string;
  email: any;
  showSuccessMessage: boolean = false;

  constructor(private router: Router, private afAuth: AngularFireAuth) {
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
      } else {
        console.error('Benutzer nicht gefunden.');
      }
    }).catch(error => {
      console.error('Fehler beim Abrufen des aktuellen Benutzers:', error);
    });
  }
}