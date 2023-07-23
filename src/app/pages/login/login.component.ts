import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: any;
  password: any;
  darkMode = false;

  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  loginUser() {
    this.afAuth.signInWithEmailAndPassword(this.email, this.password)
      .then(userCredential => {
        console.log('Benutzerdaten:', userCredential.user);

        console.log('Benutzername:', userCredential.user?.displayName);

        this.router.navigate(['/main-page']); 
      })
      .catch(error => {
        console.error('Fehler beim Einloggen', error);
      });
  }

  navigateToSignUp() {
    this.router.navigate(['/signup']);
  }

  toggleDarkMode() {
    const body = document.getElementsByTagName('body')[0];
    if (this.darkMode) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }
  }
}