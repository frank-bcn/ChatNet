import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, collection, addDoc, doc, getDoc } from '@angular/fire/firestore';
import { User } from 'src/app/models/signUpUserdata';
import { ChatService } from 'src/app/service/chat-service.service'; // Importieren Sie Ihren ChatService

@Component({
  selector: 'app-group-chat',
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.scss']
})
export class GroupChatComponent {

  username: string;
  email: any;
  showSuccessMessage: boolean = false;
  contacts: any[] = [];
  loggedInUserId: string = '';
  selectedContacts: User[] = [];
  groupName: string;
  showContactList: boolean = false;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: Firestore,
    private router: Router,
    private chatService: ChatService // Fügen Sie Ihren ChatService hinzu
  ) {
    this.username = '';
    this.email = '';
    this.groupName = '';
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
      this.contacts = userContacts;
    }
  }
  
  goToMainPage() {
    this.router.navigate(['/main-page']);
  }

  async createGroup() {
    const groupName = this.groupName;
    const selectedContactUids = this.selectedContacts.map(contact => contact.uid);
    const loggedInUserUid = this.loggedInUserId;
  
    const chatId = await this.chatService.createGroupChat(groupName, loggedInUserUid, selectedContactUids);
  
    if (chatId) {
      this.showSuccessMessage = true;
  
      setTimeout(() => {
        this.showSuccessMessage = false;
  
        // Navigiere zum Chat-Dialog
        this.navigateToChatDialog(chatId);
      }, 3000);
    } else {
      console.error('Fehler beim Erstellen des Gruppenchats.');
    }
  }  

  navigateToChatDialog(chatId: string) {
    console.log('Navigating to chat dialog with chat ID:', chatId);
    this.router.navigate(['/chat-dialog', chatId]);
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