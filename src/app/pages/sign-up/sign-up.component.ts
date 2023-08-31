import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { User } from 'src/app/models/signUpUserdata';
import { ChatDataService } from 'src/app/service/chat-data.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  email: any;
  password: any;
  showSuccessMessage: boolean = false;
  user: User = new User();

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private firestore: Firestore,
    public chatDataService: ChatDataService,
  ) { }

  //erstellt einen neuen user und aktualiesiert sein profile
  registerUser() {
    this.afAuth.createUserWithEmailAndPassword(this.email, this.password)
      .then(userCredential => {
        userCredential.user?.updateProfile({
          displayName: this.chatDataService.username
        }).then(() => {
          this.saveSignUpUserData(userCredential.user?.uid, this.email, this.chatDataService.username);
          this.saveUidContactlist(userCredential.user?.uid);
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

  // speichert die Benutzerdaten (UID, E-Mail, Benutzername) in der Firestore-Datenbank.
  saveSignUpUserData(uid: any, email: any, username: any): void {
    this.user.uid = uid;
    this.user.email = email;
    this.user.username = username;
    const docRef = doc(this.firestore, 'users', uid);
    setDoc(docRef, this.user.toJson())
      .then(() => { 
      })
      .catch(error => {
        console.log('Save user failed', error);
      });
  }

  // speichert die uid des users in contactlist database
  saveUidContactlist(uid: any): void {
    const contactListDocRef = doc(this.firestore, 'contactlist', uid);
    const data = {
      uid: uid
    }; 
    setDoc(contactListDocRef, data)
      .then(() => { 
      })
      .catch(error => {
        console.log('Speichern des Benutzers fehlgeschlagen', error);
      });
  }
}