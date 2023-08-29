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
  loggedInUserId: string = '';
  usernamesLoaded: boolean = false;
  showChatTitle: boolean = false;


  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    public chatService: ChatService,
    public chatDataService: ChatDataService,
    private firestore: Firestore,

  ) { 
    this.chat = {};
  }

  async ngOnInit() {
    this.afAuth.authState.subscribe(async user => {
      if (user) {
        this.loggedInUserId = user.uid;
        const selectedChat = this.chatDataService.selectedChat;
        this.chat = selectedChat ? { ...selectedChat } : {}; // Initialisierung des chat-Objekts in ngOnInit
  
        if (this.chat.groupName) {
          this.showChatTitle = true;
          this.usernamesLoaded = true;
          this.loadUsernames();
        } else if (this.chat.users || this.chat.selectedContacts) {
          this.showChatTitle = false;
          this.usernamesLoaded = true; // Set to true or false based on your logic
        } else {
          this.showChatTitle = false;
          this.usernamesLoaded = false; // Set to false
        }
      }
    });
  }


  async loadUsernames() {
    for (const uid of this.chat.selectedContacts) {
      const username = await this.groupChatUsername(uid);
      this.chatDataService.usernames[uid] = username;
    }
  }

  async groupChatUsername(uid: string): Promise<string> {
    const userDocRef = doc(collection(this.firestore, 'users'), uid);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      const userData = userDocSnapshot.data() as User;
      return userData.username || '';
    }

    return '';
  }

  goToChats() {
    console.log('Vor dem Zurücksetzen:');
    console.log('chat:', this.chat);
    console.log('loggedInUserId:', this.loggedInUserId);
    console.log('usernamesLoaded:', this.usernamesLoaded);
    console.log('showChatTitle:', this.showChatTitle);
  
    this.chat = {};
    this.loggedInUserId = '';
    this.usernamesLoaded = false;
    this.showChatTitle = false;
  
    console.log('Nach dem Zurücksetzen:');
    console.log('chat:', this.chat);
    console.log('loggedInUserId:', this.loggedInUserId);
    console.log('usernamesLoaded:', this.usernamesLoaded);
    console.log('showChatTitle:', this.showChatTitle);
  
    this.router.navigate(['/chats']);
  }
  


  sendMessage() {

  }
}