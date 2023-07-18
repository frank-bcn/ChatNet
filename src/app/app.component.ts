import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  username: any;
  email: any;
  password: any;

  constructor(private afAuth: AngularFireAuth) {}

  registerUser() {
    this.afAuth.createUserWithEmailAndPassword(this.email, this.password)
      .then(() => {
        // Benutzer erfolgreich erstellt
        console.log('Benutzer erfolgreich erstellt');
      })
      .catch(error => {
        // Fehler bei der Benutzererstellung
        console.error('Fehler bei der Benutzererstellung', error);
      });
  }
}
