import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore } from '@angular/fire/firestore';
import { OnlineStatusService } from 'src/app/service/online-status.service';
import { User } from 'src/app/models/signUpUserdata';
import { ChatDataService } from 'src/app/service/chat-data.service';
import { ChatService } from 'src/app/service/chat-service.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss']
})
export class ChatsComponent {

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: Firestore,
    private router: Router,
    private onlineStatusService: OnlineStatusService,
    public chatDataService: ChatDataService,
    public chatService: ChatService,
  ) { }

  async ngOnInit() {
    this.afAuth.authState.subscribe(async user => {
      if (user) {
        await this.loadChats(user.uid);
      }
    });
  }

  // initialisiert die Chat-Daten für den eingeloggten user
  async loadChats(loggedInUserId: string) {
    await this.chatDataService.loadUserContactlist(this.chatDataService.loggedUserId);
    this.chatDataService.chats = await Promise.all(this.chatDataService.chats.map(async chat => {
      const otherUserId = chat.users ? chat.users.find((uid: string) => uid !== loggedInUserId) : null;
      if (otherUserId) {
        const username = await this.loadUsernameUid(otherUserId);
        const isOtherUserOnline = await this.onlineStatusService.checkUserOnlineStatus(otherUserId);
        chat.online = isOtherUserOnline;
        chat.displayName = username;
        return chat;
      } else if (chat.groupName) {
        chat.displayName = chat.groupName;
        return chat;
      } else {
        return chat;
      }
    }));
  }

  // ermittelt den Benutzernamen für einen Chat, sei es ein Gruppenchat oder ein Einzelchat
  async UsernameChat(chat: any): Promise<string> {
    if (chat.groupName) {
      return chat.groupName;
    } else if (chat.users) {
      const otherUserId = chat.users.find((uid: string) => uid !== this.chatDataService.loggedUserId);
      if (otherUserId) {
        return await this.loadUsernameUid(otherUserId);
      }
    }
    return '';
  }

  // gibt den usernamen für eine gegebene userid zurück
  async loadUsernameUid(uid: string): Promise<string> {
    return this.chatDataService.loadUsernameViaUID(uid);
  }

  // naviegiert zur mainpage
  goToMainPage() {
    this.router.navigate(['/main-page']);
  }

  // öffnet einen Chat.Ein Gruppenchat oder ein Einzelchat
  openChatDialog(chat: any) {
    this.chatService.openChatDialog(chat);
  }

  // öffnet den chat
  async navigateToChatDialog(chatId: string) {
    this.chatDataService.currentChatDetails = {}; // Setzen Sie die aktuellen Chat-Details zurück, falls erforderlich
    console.log('Öffne Einzelchat mit Chat-ID:', chatId);
    this.router.navigate(['/chat-dialog', chatId]);
  }
  
}