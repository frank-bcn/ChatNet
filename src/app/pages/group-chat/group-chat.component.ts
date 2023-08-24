import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, collection, getDocs, doc, getDoc, where, query} from '@angular/fire/firestore';
import { User } from 'src/app/models/signUpUserdata';
import { ChatService } from 'src/app/service/chat-service.service';

@Component({
  selector: 'app-group-chat',
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.scss']
})
export class GroupChatComponent {

  username: string;
  email: any;
  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false;
  contacts: any[] = [];
  loggedInUserId: string = '';
  selectedContacts: User[] = [];
  groupName: string;
  showContactList: boolean = false;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: Firestore,
    private router: Router,
    private chatService: ChatService,
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
    const { groupName, selectedContacts } = this;
    const adminUid = this.loggedInUserId;
  
    if (selectedContacts.length < 2) {
      this.showErrorMessage = true; 
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 3000);
      return;
    }
  
    const selectedContactUids = this.getSelectedContactUids(selectedContacts, adminUid);
    const chatId = this.createChatId(groupName, selectedContactUids);
  
    if (await this.checkIfGroupChatExists(chatId)) {
      this.navigateToChatDialog(chatId);
      return;
    }
  
    const createdChatId = await this.createGroupChat(groupName, selectedContactUids);
    this.handleChatCreationResult(createdChatId);
  }
  
  
  getSelectedContactUids(selectedContacts: any[], adminUid: string) {
    return selectedContacts.map(contact => contact.uid).concat(adminUid).sort();
  }
  
  createChatId(groupName: string, selectedContactUids: string[]) {
    return `${groupName}_${selectedContactUids.join('_')}`;
  }
  
  async createGroupChat(groupName: string, selectedContactUids: string[]) {
    const loggedInUserUid = this.loggedInUserId;
    return await this.chatService.createGroupChat(groupName, loggedInUserUid, selectedContactUids);
  }
  
  handleChatCreationResult(createdChatId: string | null) {
    if (createdChatId) {
      this.showSuccessMessage = true;
      setTimeout(() => {
        this.showSuccessMessage = false;
        this.navigateToChatDialog(createdChatId);
      }, 3000);
    } else {
      this.showErrorMessage = true;
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 3000);
    }
  }
  
  async checkIfGroupChatExists(chatId: string): Promise<boolean> {
    try {
      const chatCollectionRef = collection(this.firestore, 'chats');
      const chatQuery = query(chatCollectionRef, where('chatId', '==', chatId));
      const querySnapshot = await getDocs(chatQuery);
  
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Fehler beim Überprüfen des Gruppenchat-Existenz:', error);
      return false;
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