import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ChatService } from 'src/app/service/chat-service.service';
import { ChatDataService } from 'src/app/service/chat-data.service';
import { Message } from 'src/app/service/message.model';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';


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
  messages: Message[] = [];
  hasManySelectedContacts(): boolean {
    return this.chat.selectedContacts && this.chat.selectedContacts.length > 3;
  }

  constructor(
    public afAuth: AngularFireAuth,
    private router: Router,
    public chatService: ChatService,
    public chatDataService: ChatDataService,
    private firestore: Firestore,

  ) { }

  async ngOnInit() {
    this.afAuth.authState.subscribe(async (user) => {
      if (user) {
        this.initializeChat();
        await this.loadChatMessages();
        /*console.log(this.chat);*/
      }
    });
  }

  //setzt den aktuellen Chat basierend auf den ausgewählten Details und dem Benutzer und lädt die Benutzernamen für die ausgewählten Chat-Kontakte, sofern vorhanden.
  async initializeChat() {
    let selectedChat = this.chatDataService.currentChatDetails;
    this.chat = selectedChat ? { ...selectedChat } : {};
    this.chatDataService.setAdminUid(this.chat.admin);
    this.chatDataService.chatUsernames = {};

    if (this.chat.selectedContacts) {
      await this.loadUsernamesForSelectedContacts();
    }
  }

  // lädt die Benutzernamen für die ausgewählten Chat-Kontakte
  async loadUsernamesForSelectedContacts() {
    for (const contactUid of this.chat.selectedContacts) {
      let username = await this.chatDataService.loadUsernameViaUID(contactUid);
      this.chatDataService.chatUsernames[contactUid] = username;
    }
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

  // öffnet das popup
  toggleEmojiPopup() {
    this.showEmojiPopup = !this.showEmojiPopup;
  }

  //fügt das smiley in das input feld
  insertSmiley(smiley: string) {
    this.messageText += smiley;
    this.showEmojiPopup = false;
  }

  //sendet Narichten und überprüft ob das das inputfeld 
  async sendMessage() {
    if (this.isMessageEmpty()) {
      return;
    }
    try {
      const user = await this.getCurrentUser();
      if (user) {
        const message = this.createMessage(user.uid);
        await this.sendMessageToFirestore(message);
        await this.loadChatMessages();
        this.clearMessageText();
      } else {
        this.handleUserNotLoggedIn();
      }
    } catch (error) {
      this.handleSendMessageError(error);
    }
  }

  //prüft das keine leeren Nachrichten gesendet werden können
  isMessageEmpty(): boolean {
    return this.messageText.trim() === '';
  }

  //ruft den angemeldeten user ab
  async getCurrentUser(): Promise<any> {
    const user = await this.afAuth.currentUser;
    return user;
  }

  //erstellt die Nachricht und die Informationen über den Chat, den Zeitstempel, den Absender und den Text der Nachricht
  createMessage(senderId: string): Message {
    return {
      chatId: this.chat.chatId,
      timestamp: Date.now(),
      senderId: senderId,
      text: this.messageText,
    };
  }

  //speichert die Nachricht in database
  async sendMessageToFirestore(message: Message) {
    let messagesCollectionRef = collection(this.firestore, 'messages');
    await addDoc(messagesCollectionRef, message);
  }

  // leert das inputfeld
  clearMessageText() {
    this.messageText = '';
  }

  //error message
  handleUserNotLoggedIn() {
    console.error('Benutzer ist nicht angemeldet.');
  }

  //error message
  handleSendMessageError(error: any) {
    console.error('Fehler beim Senden der Nachricht:', error);
  }

  // lädt Chat-Nachrichten asynchron
  async loadChatMessages() {
    let chatId = this.chat.chatId;
    let messages = await this.chatDataService.loadMessages(chatId, 10);
    this.messages = messages;
  }

  //prüft die uid's in chats um den online status anzuzeigen
  shouldDisplayOnlineStatus(): boolean {
    return this.chat.users && this.chat.users.length < 3;
  }
}
