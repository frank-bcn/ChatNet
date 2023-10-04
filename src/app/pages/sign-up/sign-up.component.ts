import { Component} from '@angular/core';
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
  showErrorMessage: boolean = false;
  usernameError: string = '';
  emailError: string = '';
  passwordError: string = '';


  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private firestore: Firestore,
  ) { }

  registerUser() {
    this.usernameError = ''; 
    this.emailError = '';
    this.passwordError = '';
  
    this.afAuth.createUserWithEmailAndPassword(this.email, this.password)
      .then(userCredential => {
        userCredential.user?.updateProfile({
          displayName: this.username
        }).then(() => {
          this.saveSignUpUserData(userCredential.user?.uid, this.email, this.username);
          this.addUidToContactList(userCredential.user?.uid);
          this.showSuccessMessage = true;
          setTimeout(() => {
            this.showSuccessMessage = false;
            this.router.navigate(['']);
          }, 3000);
        })
      })
      .catch(error => {
        if (error.code === 'auth/invalid-email') {
          this.emailError = 'Ungültige E-Mail-Adresse';
        } else if (error.code === 'auth/weak-password') {
          this.passwordError = 'Das Passwort ist zu schwach';
        } else {
          this.usernameError = 'Fehler: ' + error.message;
        }
        this.showErrorMessage = true;
      });
  }
  

  saveSignUpUserData(uid: any, email: any, username: any): void {
    this.user.uid = uid;
    this.user.email = email;
    this.user.username = username;

    const docRef = doc(this.firestore, 'users', uid);
    setDoc(docRef, this.user.toJson())
      .then(() => {

      })
      .catch(error => {
        /*console.log('Save user failed', error);*/
      });
  }

  addUidToContactList(uid: any): void {
    let contactListDocRef = doc(this.firestore, 'contactlist', uid);

    let data = {
      uid: uid
    };

    setDoc(contactListDocRef, data)
      .then(() => {

      })
      .catch(error => {
        /* console.log('Speichern des Benutzers fehlgeschlagen', error);*/
      });
  }

  closeErrorPopup() {
    this.showErrorMessage = false;
}


  
}