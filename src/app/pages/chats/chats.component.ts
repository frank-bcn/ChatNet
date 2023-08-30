import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore } from '@angular/fire/firestore';
import { OnlineStatusService } from 'src/app/service/online-status.service';
import { User } from 'src/app/models/signUpUserdata';
import { ChatDataService } from 'src/app/service/chat-data.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss']
})
export class ChatsComponent {
  chat: any = { groupName: '' };
  username: string;
  email: any;
  showSuccessMessage: boolean = false;
  isOnline: boolean = false;
  contacts: any[] = [];
  selectedUser: User | null = null;
  chats: any[] = [];
  loggedInUserId: string = '';
  chatUsernames:any= [];


  constructor(
    private afAuth: AngularFireAuth,
    private firestore: Firestore,
    private router: Router,
    private onlineStatusService: OnlineStatusService,
    public chatDataService: ChatDataService
  ) {
    this.username = '';
    this.email = '';
  }

  async ngOnInit() {
    // Wird aufgerufen, wenn die Komponente initialisiert wird
    this.afAuth.authState.subscribe(async user => {
      if (user) {
        this.username = user.displayName || '';
        this.email = user.email || '';
        console.log(this.chatUsernames);
        await this.loadChats(user.uid);
      }
    });
  }

  async loadChats(loggedInUserId: string) {
    // Lädt die Chat-Daten für den Benutzer
    console.log('Initialisiere Chats...');
    await this.chatDataService.loadUserContactlist(loggedInUserId);
    console.log('Chats initialisiert:', this.chatDataService.chats);

    this.chats = await Promise.all(this.chatDataService.chats.map(async chat => {
      if (chat.groupName) {
        return { ...chat, displayName: chat.groupName };
      } else {
        const otherUserId = chat.users && chat.users.find((uid: string) => uid !== loggedInUserId);
        if (otherUserId) {
          const username = await this.getUsernameForUid(otherUserId);
          /*this.chatUsernames[chat.id] += username;
          this.chatUsernames.push(username);*/
          
          console.log(this.chatDataService.chatId);
          
          this.chatUsernames.push({[this.chatDataService.chatId]:username});
          return { ...chat };
        } else {
          return chat;
        }
      }
    }));
  }

  async getUsernameForChat(chat: any): Promise<string> {
    // Gibt den Benutzernamen für einen Chat zurück
    if (chat.groupName) {
      return chat.groupName;
    } else if (chat.users) {
      const otherUserId = chat.users.find((uid: string) => uid !== this.loggedInUserId);
      if (otherUserId) {
        return await this.getUsernameForUid(otherUserId);
      }
    }
    return '';
  }

  async getUsernameForUid(uid: string): Promise<string> {
    // Gibt den Benutzernamen für eine gegebene Benutzer-ID zurück
    return this.chatDataService.loadUsernameViaUID(uid);
  }

  goToMainPage() {
    // Navigiert zur Hauptseite
    this.router.navigate(['/main-page']);
  }

  openChatDialog(chat: any) {
    // Öffnet einen ausgewählten Chat
    if (chat) {
      this.chatDataService.currentChatDetails = {};

      if (chat.groupName) {
        this.chatDataService.currentChatDetails = { ...chat };
        this.router.navigate(['/chat-dialog', chat.groupName]);
        console.log('Öffne Gruppenchat:', chat.groupName);
      } else if (chat.users) {
        const individualChatId = chat.users.join('_');
        this.navigateToChatDialog(individualChatId);
        console.log('Öffne Einzelchat mit User:', individualChatId);
      }
    }
  }

  async navigateToChatDialog(chatId: string) {
    // Navigiert zum Chat-Dialog
    this.chat = this.chatDataService.currentChatDetails;
    this.router.navigate(['/chat-dialog', chatId]);
    console.log('Öffne Einzelchat mit User:', this.username);
  }

}
