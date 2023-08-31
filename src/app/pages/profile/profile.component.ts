import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';

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

  // naviegiert zur mainpage
  goToMainPage() {
    this.router.navigate(['/main-page']);
  }

  //ruft den aktuellen user ab und ruft dann die Funktion updateUserDetails auf, um die userdaten zu aktualisieren.
  updateUserData() {
    this.afAuth.currentUser
      .then(user => {
        if (user) {
          this.updateUserDetails(user);
        } else {
          console.error('Benutzer nicht gefunden.');
        }
      })
      .catch(error => {
        console.error('Fehler beim Abrufen des aktuellen Benutzers:', error);
      });
  }

  // aktualisiert die userdaten
  async updateUserDetails(user: any) {
    await this.updateUserName(user);
    await this.updateUserEmail(user);
    const userData = {
      username: this.username,
      email: this.email
    };
    await this.updateUserDataFirestoreAndContactList(user, userData);
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

  // aktualisiert die userdaten in firestore und kontaktlist
  async updateUserDataFirestoreAndContactList(user: any, userData: any) {
    await this.updateUserInFirestore(user, userData);
    await this.updateContactList(user, userData);
  }

  // akzualisiert den anzeige namen
  async updateUserName(user: any) {
    try {
      await user.updateProfile({
        displayName: this.username,
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Benutzernamens:', error);
    }
  }

  // aktualisiert die email
  async updateUserEmail(user: any) {
    try {
      await user.updateEmail(this.email);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der E-Mail:', error);
    }
  }
  
// aktualisiert die userdaten in Firestore
  async updateUserInFirestore(user: any, userData: any) {
    try {
      const userRef = doc(this.firestore, 'users', user.uid);
      await setDoc(userRef, userData, { merge: true });
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Benutzerdaten in Firestore:', error);
    }
  }

  // aktualisiert die kontaktlist
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

  // aktualisiert ein user in der firestore
  async updateContact(user: any, contact: any, userData: any) {
    try {
      const contactRef = doc(this.firestore, 'contactlist', contact.uid);
      const contactSnapshot = await getDoc(contactRef);
  
      if (contactSnapshot.exists()) {
        const updatedContacts = this.updateContactsData(contactSnapshot.data()?.['contactList'], user, userData);
  
        await this.updateContactsInFirestore(contactRef, updatedContacts);
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Kontakts:', error);
    }
  }
  
  // aktualisiert die kontakte bei änderungen
  updateContactsData(existingContacts: any[], user: any, userData: any): any[] {
    return existingContacts.map((c: any) => {
      if (c.uid === user.uid) {
        return { ...c, username: userData.username, email: userData.email };
      }
      return c;
    });
  }
  
  // aktualisiert die kontakt daten in der kontaktlist
  async updateContactsInFirestore(contactRef: any, updatedContacts: any[]) {
    await updateDoc(contactRef, { ['contactList']: updatedContacts });
  }
}