import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, doc, updateDoc, getDoc } from '@angular/fire/firestore';
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
  loggedInUserId: string = '';

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
        this.loggedInUserId = user.uid;

        this.loadContactList(this.loggedInUserId);
      }
    });
  }

  async loadContactList(loggedInUserId: string) {
    const userDocRef = doc(this.firestore, 'contactlist', loggedInUserId);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      const userContacts = userDocSnapshot.data()['contactList'] || [];

      for (const contact of userContacts) {
        const isContactOnline = await this.onlineStatusService.getOnlineStatus(contact.uid);
        contact.online = isContactOnline;
      }

      this.contacts = userContacts;
    }
  }

  goToMainPage() {
    this.router.navigate(['/main-page']);
  }

  async deleteContactFromList(contact: any) {
    try {
      const loggedInUser = await this.afAuth.currentUser;
      if (loggedInUser) {
        const loggedInUserId = loggedInUser.uid;

        const userDocRef = doc(this.firestore, 'contactlist', loggedInUserId);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userContacts = userDocSnapshot.data()?.['contactList'] || [];
          const updatedContacts = userContacts.filter((c: any) => c.uid !== contact.uid);

          await updateDoc(userDocRef, { ['contactList']: updatedContacts });

          console.log('Contact removed from contact list:', contact);

          await this.loadContactList(loggedInUserId);
        }
      }
    } catch (error) {
      console.error('Error deleting contact from list:', error);
    }
  }

  async addContactToChat(contact: any) {
    try {
      const loggedInUser = await this.afAuth.currentUser;
      if (loggedInUser) {
        const loggedInUserId = loggedInUser.uid;
        const userToAdd: User = contact;
        const sortedUids = [loggedInUserId, userToAdd.uid].sort();
        const chatId = sortedUids.join('_');
  
        const chatExists = await this.checkIfChatExists(chatId);
  
        if (!chatExists) {
          await this.chatService.addOrGetChat(loggedInUserId, userToAdd.uid);
          console.log('Navigiere zum Chat-Dialog mit Chat-ID:', chatId);
        } else {
          console.log('Chat existiert bereits:', chatId);
        }
  
        this.router.navigate(['/chat-dialog', chatId]);
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Kontakts zum Chat:', error);
    }
  }
  
  async checkIfChatExists(chatId: string): Promise<boolean> {
    try {
      const chatDocRef = doc(this.firestore, 'chats', chatId);
      const chatDocSnapshot = await getDoc(chatDocRef);
  
      if (chatDocSnapshot.exists()) {
        return true;
      }
      const uids = chatId.split('_');
      const reverseChatId = `${uids[1]}_${uids[0]}`;
      const reverseChatDocRef = doc(this.firestore, 'chats', reverseChatId);
      const reverseChatDocSnapshot = await getDoc(reverseChatDocRef);
  
      return reverseChatDocSnapshot.exists();
    } catch (error) {
      console.error('Fehler beim Überprüfen des Chat-Existenz:', error);
      return false;
    }
  }
}