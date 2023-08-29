import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  groupName: string = '';
  loadedUsernames: { [uid: string]: string } = {};
  chatTitle: string = '';
  username: string;
  loggedInUserId: string = '';
  usernamesLoaded: boolean = false;
  showChatTitle: boolean = false;
  

  constructor(
    private router: Router,
    private route: ActivatedRoute,
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
        const selectedChat = this.chatDataService.selectedChat;
        this.chat = selectedChat ? { ...selectedChat } : {}; 

        if (this.chat.groupName) {
          this.showChatTitle = true;
          this.usernamesLoaded = true;
          this.loadUsernames();
        } else if (this.chat.users || this.chat.selectedContacts) {
          this.showChatTitle = false;
          this.usernamesLoaded = true; 
        } else {
          this.showChatTitle = false;
          this.usernamesLoaded = false; // Set to false
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
  
  async getUsernameForUid(otherUserId: string): Promise<string> {
    const username = await this.getUsernameForUid(otherUserId)
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
    this.usernamesLoaded = false;
    this.showChatTitle = false; 
    console.log('usernamesLoaded:', this.usernamesLoaded);
    console.log('showChatTitle:', this.showChatTitle); 
    
    this.router.navigate(['/chats']);
  }
  

  sendMessage() {
    
  }
}