import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, collection, addDoc, doc, getDoc } from '@angular/fire/firestore'; // Änderung hier
import { OnlineStatusService } from 'src/app/service/online-status.service';
import { ChatService } from 'src/app/service/chat-service.service';
import { User } from 'src/app/models/signUpUserdata';

@Component({
  selector: 'app-group-chat',
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.scss']
})
export class GroupChatComponent {

  username: string;
  email: any;
  showSuccessMessage: boolean = false;
  isOnline: boolean = false;
  contacts: any[] = [];
  loggedInUserId: string = '';
  contactlist: User[] = []; 
  selectedContact: string = '';
  isContactListOpen: boolean = false;
  selectedContacts: User[] = [];
  showContactList: boolean = false;


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

  async createGroup() {
    const groupName = this.username;
    const groupData = {
      username: groupName,
    };

    try {
      const docRef = await addDoc(collection(this.firestore, 'chats'), groupData);
      this.showSuccessMessage = true;
    } catch (error) {
      console.error('Error creating group:', error);
    }
  }

  toggleContact(contact: any) {
    contact.isSelected = !contact.isSelected;

    if (contact.isSelected) {
      this.selectedContacts.push(contact);
    } else {
      const index = this.selectedContacts.findIndex(selectedContact => selectedContact.uid === contact.uid);
      if (index !== -1) {
        this.selectedContacts.splice(index, 1);
      }
    }
  }
}