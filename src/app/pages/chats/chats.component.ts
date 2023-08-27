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

  username: string;
  email: any;
  showSuccessMessage: boolean = false;
  isOnline: boolean = false;
  contacts: any[] = [];
  selectedUser: User | null = null;
  chats: any[] = [];

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
          return { ...chat, displayName: username };
        } else {
          return chat;
        }
      }
    }));
  }
  
  async getUsernameForUid(uid: string): Promise<string> {
    return this.chatService.getUsername(uid);
  }

  goToMainPage() {
    this.router.navigate(['/main-page']);
  }

  // In ChatsComponent
openChatDialog(chat: any) {
  if (chat && chat.groupName) {
    this.chatDataService.selectedChat = chat;
    this.router.navigate(['/chat-dialog', chat.groupName]);
  } else {
    console.error('Ungültiger Chat.');
  }
}

}