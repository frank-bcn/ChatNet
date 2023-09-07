import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ChatService } from 'src/app/service/chat-service.service';
import { ChatDataService } from 'src/app/service/chat-data.service';
import { Message } from 'src/app/service/message.model';
import { Firestore, collection, query, where, orderBy, getDocs, addDoc } from '@angular/fire/firestore';
import { User } from 'src/app/models/signUpUserdata';

@Component({
  selector: 'app-chat-dialog',
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.scss']
})
export class ChatDialogComponent implements OnInit {
  chat: any = {};
  chatUsernames: { [uid: string]: string } = {};
  isDropdownOpen: boolean = false;
  messageText: string = '';
  showEmojiPopup: boolean = false;
  currentUser: User | null = null;
  messages: Message[] = [];
  hasManySelectedContacts(): boolean {
    return this.chat.selectedContacts && this.chat.selectedContacts.length > 3;
  }

  constructor(
    public afAuth: AngularFireAuth,
    private router: Router,
    public chatService: ChatService,
    public chatDataService: ChatDataService,
    private firestore: Firestore
  ) { }

  async ngOnInit() {
    this.afAuth.authState.subscribe(async (user) => {
      if (user) {
        const selectedChat = this.chatDataService.currentChatDetails;
        this.chat = selectedChat ? { ...selectedChat } : {};
        this.chatDataService.setAdminUid(this.chat.admin);
        if (this.chat.selectedContacts) {
          for (const contactUid of this.chat.selectedContacts) {
            const username = await this.chatDataService.loadUsernameViaUID(contactUid);
            this.chatDataService.chatUsernames[contactUid] = username;
          }
        }
        await this.loadChatMessages(); // Hier rufen Sie die Methode auf, um Nachrichten zu laden
        console.log(this.chat);
      }
    });
  }
  

//dient dazu, zu überprüfen, ob ein bestimmter User der Administrator eines Chats ist.
  isAdmin(contactUid: string): boolean {
    return contactUid === this.chatDataService.admin;
  }

  // navigiert zur mainPaige
  goToMainPage() {
    this.chatDataService.groupName = '';
    this.router.navigate(['/chats']);
  }

  // öffnet das menu
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    const button = document.querySelector('.menuButton');
    if (button) {
      button.classList.toggle('open', this.isDropdownOpen);
    }
  }

  // schließt das menu
  closeDropdown() {
    this.isDropdownOpen = false;
  }



  toggleEmojiPopup() {
    this.showEmojiPopup = !this.showEmojiPopup;
  }
  
  insertSmiley(smiley: string) {
    this.messageText += smiley;
    this.showEmojiPopup = false; 
  }

  async sendMessage() {
    if (this.messageText.trim() === '') {
      return; 
    }
  
    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        const message: Message = {
          chatId: this.chat.chatId,
          timestamp: Date.now(),
          senderId: user.uid,
          text: this.messageText,
        };
  
        const messagesCollectionRef = collection(this.firestore, 'messages');
        await addDoc(messagesCollectionRef, message);
        this.messageText = ''; // Nachrichtenfeld leeren
      } else {
        console.error('Benutzer ist nicht angemeldet.');
      }
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
    }
  }

  async loadChatMessages() {
    const chatId = this.chat.chatId;
    const messages = await this.chatDataService.loadMessages(chatId, 10); // Hier können Sie die Anzahl der Nachrichten anpassen
    this.messages = messages;
  }
  
}  