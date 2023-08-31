import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ChatService } from 'src/app/service/chat-service.service';
import { ChatDataService } from 'src/app/service/chat-data.service';
import { User } from 'src/app/models/signUpUserdata';
import { Firestore, collection, doc, getDoc } from '@angular/fire/firestore';


@Component({
  selector: 'app-chat-dialog',
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.scss']
})
export class ChatDialogComponent implements OnInit {
  chat: any = { groupName: '' };
  
  loadedUsernames: { [uid: string]: string } = {};
  
  username: string;
  loggedInUserId: string = '';
  
  
  chats: any[] = [];
  chatUsernames: { [chatId: string]: string } = {};


  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    public chatService: ChatService,
    public chatDataService: ChatDataService,
    private firestore: Firestore,

  ) {
    this.username = '';

  }

  async ngOnInit() {
    this.afAuth.authState.subscribe(async user => {
      if (user) {
        this.loggedInUserId = user.uid;
        const selectedChat = this.chatDataService.currentChatDetails;
        this.chat = selectedChat ? { ...selectedChat } : {};
        
        if (this.chat.groupName) {
          /*this.showChatTitle = true;
          this.usernamesLoaded = true;*/
          this.loadUsernames();
          
        } else if (this.chat.users || this.chat.selectedContacts) {
          /*this.showChatTitle = false;
          this.usernamesLoaded = true;*/
        } else {
          /*this.showChatTitle = false;
          this.usernamesLoaded = false;*/
          await this.loadUserName(this.loggedInUserId); 
        }
      }
    });
  }

  getChatTitle(): string {
    if (this.chat?.groupName) {
      return this.chat.groupName;
    } else if (this.chat?.users) {
      const otherUserId = this.chat.users.find((uid: string) => uid !== this.loggedInUserId);
      if (otherUserId) {
        const username = this.loadedUsernames[otherUserId] || '';
        return username;
      }
    }
    return 'Unbekannt';
  }

  async loadUserName(loggedInUserId: string) {
    console.log('Initializing chats...');
    console.log(this.chatDataService.groupName);
    await this.chatDataService.loadUserContactlist(loggedInUserId);
    console.log('Chats initialized:', this.chatDataService.chats);
  
    this.chats = await Promise.all(this.chatDataService.chats.map(async chat => {
      console.log(this.chat);
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

  async getUsernameForUid(otherUserId: string): Promise<string> {
    const username = await this.getUsername(otherUserId);
    return username || '';
  }

  async loadUsernames() {
    for (const uid of this.chat.selectedContacts) {
      const username = await this.getUsername(uid);
      this.chatDataService.usernames[uid] = username;
    }
  }

  async getUsername(uid: string): Promise<string> {
    const userDocRef = doc(collection(this.firestore, 'users'), uid);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      const userData = userDocSnapshot.data() as User;
      return userData.username || '';
    }

    return '';
  }

  goToMainPage() {
    

    this.router.navigate(['/chats']);
  }

  sendMessage() {

  }
}