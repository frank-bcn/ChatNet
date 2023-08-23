import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, doc, setDoc, getDoc, updateDoc} from '@angular/fire/firestore';

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
    this.afAuth.currentUser
      .then(async user => {
        if (user) {
          await this.updateUserProfile(user);
          await this.updateUserEmail(user);
  
          const userData = {
            username: this.username,
            email: this.email
          };
          await this.updateUserInFirestore(user, userData);
          await this.updateContactList(user, userData);
  
          this.showSuccessMessage = true;
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);
        } else {
          console.error('Benutzer nicht gefunden.');
        }
      })
      .catch(error => {
        console.error('Fehler beim Abrufen des aktuellen Benutzers:', error);
      });
  }
  
  async updateUserProfile(user: any) {
    try {
      await user.updateProfile({
        displayName: this.username,
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Benutzernamens:', error);
    }
  }
  
  async updateUserEmail(user: any) {
    const newEmail = this.email;
    try {
      await user.updateEmail(this.email);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der E-Mail:', error);
    }
  }
  
  async updateUserInFirestore(user: any, userData: any) {
    try {
      const userRef = doc(this.firestore, 'users', user.uid);
      await setDoc(userRef, userData, { merge: true });
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Benutzerdaten in Firestore:', error);
    }
  }
  
  async updateContactList(user: any, userData: any) {
    try {
      const userContactListRef = doc(this.firestore, 'contactlist', user.uid);
      const userContactListSnapshot = await getDoc(userContactListRef);
  
      if (userContactListSnapshot.exists()) {
        const userContacts = userContactListSnapshot.data()?.['contactList'] || [];
  
        for (const contact of userContacts) {
          await this.updateContact(user, contact, userData);
        }
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Kontaktliste:', error);
    }
  }
  
  async updateContact(user: any, contact: any, userData: any) {
    try {
      const contactRef = doc(this.firestore, 'contactlist', contact.uid);
      const contactSnapshot = await getDoc(contactRef);
  
      if (contactSnapshot.exists()) {
        const updatedContactList = contactSnapshot.data()?.['contactList'] || [];
        const updatedContacts = updatedContactList.map((c: any) => {
          if (c.uid === user.uid) {
            return { ...c, username: userData.username, email: userData.email };
          }
          return c;
        });
  
        await updateDoc(contactRef, { ['contactList']: updatedContacts });
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Kontakts:', error);
    }
  }
}