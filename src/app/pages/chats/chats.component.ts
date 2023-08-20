import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import { OnlineStatusService } from 'src/app/service/online-status.service';
import { ChatService } from 'src/app/service/chat-service.service';
import { User } from 'src/app/models/signUpUserdata';

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

  ) {
    this.username = '';
    this.email = '';
  }


  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      console.log('Chats:', this.chats);
      if (user) {
        this.username = user.displayName || '';
        this.email = user.email || '';
        this.loadContactList(user.uid);
      }
    });
    
  }

  async loadContactList(userId: string) {
    const contactsRef = collection(this.firestore, 'users');
    const contactsQuery = query(contactsRef, where('uid', '!=', userId));

    const querySnapshot = await getDocs(contactsQuery);

    this.contacts = [];
    querySnapshot.forEach((doc) => {
      this.contacts.push(doc.data());
    });
  }

  goToMainPage() {
    this.router.navigate(['/main-page']);
  }

  openChatDialog(user: User) {
    this.selectedUser = user;
    console.log('Ausgewählter Benutzer:', this.selectedUser);
    this.router.navigate(['/chat-dialog'], { state: { selectedUser: user } });
  }
}
