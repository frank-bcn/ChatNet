import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { User } from 'src/app/models/signUpUserdata';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  username: string = '';
  email: any;
  password: any;
  showSuccessMessage: boolean = false;
  user: User = new User();

  constructor(private afAuth: AngularFireAuth, private router: Router, private firestore: Firestore) {}

  registerUser() {
    this.afAuth.createUserWithEmailAndPassword(this.email, this.password)
      .then(userCredential => {
        userCredential.user?.updateProfile({
          displayName: this.username
        }).then(() => {
          this.saveSignUpUserData(userCredential.user?.uid, this.email, this.username); 
          this.showSuccessMessage = true;
          setTimeout(() => {
            this.showSuccessMessage = false;
            this.router.navigate(['']);
          }, 3000);
        }).catch(error => {
          
        });
      })
      .catch(error => {
        console.error('Fehler bei der Benutzererstellung', error);
      });
  }

  saveSignUpUserData(uid: any, email: any, username: any): void {
    this.user.email = email;
    this.user.username = username;
    this.user.contactList = [];
  
    const docRef = doc(this.firestore, 'users', uid);
    setDoc(docRef, this.user.toJson())
      .then(() => {

      })
      .catch((error) => {
        console.log('Save user failed', error);
      });
  }
}