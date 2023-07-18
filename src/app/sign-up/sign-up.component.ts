import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {

  username: any;
  email: any;
  password: any;
  showSuccessMessage: boolean = false;

  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  registerUser() {
    this.afAuth.createUserWithEmailAndPassword(this.email, this.password)
      .then(userCredential => {
        console.log('Benutzerdaten:', userCredential.user);

        this.showSuccessMessage = true;

        setTimeout(() => {
          this.showSuccessMessage = false;
          this.router.navigate(['']);
        }, 3000);
      })
      .catch(error => {
        console.error('Fehler bei der Benutzererstellung', error);
      });
  }
}
