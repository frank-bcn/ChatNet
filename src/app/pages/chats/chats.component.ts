import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore } from '@angular/fire/firestore';
import { OnlineStatusService } from 'src/app/service/online-status.service';
import { ChatService } from 'src/app/service/chat-service.service';
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
  chatUsernames: { [chatId: string]: string } = {};

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: Firestore,
    private router: Router,
    private onlineStatusService: OnlineStatusService,
    public chatService: ChatService,
    private chatDataService: ChatDataService,

  ) {
    this.username = '';
    this.email = '';
  }

  async ngOnInit() {
    this.afAuth.authState.subscribe(async user => {
      if (user) {
        this.username = user.displayName || '';
        this.email = user.email || '';
  
        await this.loadChats(user.uid);
      }
    });
  }

  async loadChats(loggedInUserId: string) {
    console.log('Initializing chats...');
    await this.chatService.initializeChats(loggedInUserId);
    console.log('Chats initialized:', this.chatService.chats);
  
    this.chats = await Promise.all(this.chatService.chats.map(async chat => {
      if (chat.groupName) {
        return { ...chat, displayName: chat.groupName };
      } else {
        const otherUserId = chat.users && chat.users.find((uid: string) => uid !== loggedInUserId);
        if (otherUserId) {
          const username = await this.getUsernameForUid(otherUserId);
          this.chatUsernames[chat.id] = username;
          return { ...chat };
        } else {
          return chat;
        }
      }
    }));
  }

  async getUsernameForChat(chat: any): Promise<string> {
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
    return this.chatService.getUsername(uid);
  }

  goToMainPage() {
    this.router.navigate(['/main-page']);
  }

  openChatDialog(chat: any) {
    if (chat) {
      this.chatDataService.selectedChat = {}; // Hier wird der ausgewählte Chat zurückgesetzt
  
      if (chat.groupName) {
        this.chatDataService.selectedChat = { ...chat }; // Hier setzt du den ausgewählten Gruppenchat
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
    this.chat = this.chatDataService.selectedChat; // Aktualisiere den Chat aus dem Service
    this.router.navigate(['/chat-dialog', chatId]);
    console.log('Öffne Einzelchat mit User:', this.username);
  }
   
}