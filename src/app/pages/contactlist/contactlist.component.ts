import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, collection, getDocs, query, where, deleteDoc, doc, updateDoc, getDoc } from '@angular/fire/firestore';
import { OnlineStatusService } from 'src/app/service/online-status.service';
import { ChatService } from 'src/app/service/chat-service.service';
import { User } from 'src/app/models/signUpUserdata';

@Component({
  selector: 'app-contactlist',
  templateUrl: './contactlist.component.html',
  styleUrls: ['./contactlist.component.scss']
})
export class ContactlistComponent implements OnInit {

  username: string;
  email: any;
  showSuccessMessage: boolean = false;
  isOnline: boolean = false;
  contacts: any[] = [];
  contactList: User[] = [];

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: Firestore,
    private router: Router,
    private onlineStatusService: OnlineStatusService,
    public chatService: ChatService,

  ) {
    this.username = '';
    this.email = '';
  }

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.username = user.displayName || '';
        this.email = user.email || '';
        this.loadContactList(user.uid);
      }
    });
  }

  async loadContactList(userId: string) {
    const contactsRef = collection(this.firestore, 'users');
    const contactsQuery = query(contactsRef, where('uid', '!=', userId));

    const querySnapshot = await getDocs(contactsQuery);

    this.contacts = [];
    querySnapshot.forEach((doc) => {
      this.contacts.push(doc.data());
    });
  }

  goToMainPage() {
    this.router.navigate(['/main-page']);
  }

  async deleteContact(contact: any) {
    const loggedInUser = await this.afAuth.currentUser;
    if (loggedInUser) {
      const loggedInUserId = loggedInUser.uid;
  
      const userDocRef = doc(this.firestore, 'users', loggedInUserId);
      const userDocSnapshot = await getDoc(userDocRef);
  
      if (userDocSnapshot.exists()) {
        const userContacts = userDocSnapshot.data()['contactList'] || [];
        const updatedContacts = userContacts.filter((c: any) => c.uid !== contact.uid);
  
        await updateDoc(userDocRef, { contactList: updatedContacts });
  
        console.log('Contact removed from the contact list:', contact);
  
        // Reload the contact list
        await this.loadContactList(loggedInUserId);
      }
    }
  }
  
  async addContactToChat(contact: any) {
    const loggedInUser = await this.afAuth.currentUser;
    if (loggedInUser) {
      const loggedInUserId = loggedInUser.uid;
      const userToAdd: User = contact;
  
      // Überprüfen, ob bereits ein Chat zwischen den Benutzern existiert
      const chatExists = await this.chatService.checkIfChatExists(loggedInUserId, userToAdd.uid);
  
      if (!chatExists) {
        // Überprüfen, ob der eingeloggte Benutzer dieselbe UID wie "addedUid" hat
        if (loggedInUserId !== userToAdd.uid) {
          // Überprüfen, ob ein Chat bereits mit beiden Benutzern existiert
          const chatWithBothExists = await this.chatService.checkIfChatWithBothExists(loggedInUserId, userToAdd.uid);
  
          if (!chatWithBothExists) {
            this.chatService.addUserToContactList(loggedInUserId, userToAdd);
            console.log('Chat entry added to database:', userToAdd);
          } else {
            console.log('Chat between users already exists.');
          }
        } else {
          console.log('Cannot start a chat with yourself.');
        }
      } else {
        console.log('Chat between users already exists.');
      }
    }
  }
}