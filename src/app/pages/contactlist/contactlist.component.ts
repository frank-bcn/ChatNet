import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, collection, getDocs, query, where, doc, updateDoc, getDoc } from '@angular/fire/firestore';
import { OnlineStatusService } from 'src/app/service/online-status.service';
import { ChatService } from 'src/app/service/chat-service.service';
import { User } from 'src/app/models/signUpUserdata';

@Component({
  selector: 'app-contactlist',
  templateUrl: './contactlist.component.html',
  styleUrls: ['./contactlist.component.scss']
})
export class ContactlistComponent implements OnInit {

  username: string;
  email: any;
  showSuccessMessage: boolean = false;
  isOnline: boolean = false;
  contacts: any[] = [];
  loggedInUserId: string = '';

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
      if (user) {
        this.username = user.displayName || '';
        this.email = user.email || '';
        this.loggedInUserId = user.uid;
  
        this.loadContactList(this.loggedInUserId);
      }
    });
  }
  
  async loadContactList(loggedInUserId: string) {
    const userDocRef = doc(this.firestore, 'contactlist', loggedInUserId);
    const userDocSnapshot = await getDoc(userDocRef);
  
    if (userDocSnapshot.exists()) {
      const userContacts = userDocSnapshot.data()['contactList'] || [];
  
      for (const contact of userContacts) {
        const isContactOnline = await this.onlineStatusService.getOnlineStatus(contact.uid);
        contact.online = isContactOnline;
      }
  
      this.contacts = userContacts;
    }
  }
  
  goToMainPage() {
    this.router.navigate(['/main-page']);
  }

  async deleteContact(contact: any) {
    const loggedInUser = await this.afAuth.currentUser;
    if (loggedInUser) {
      const loggedInUserId = loggedInUser.uid;
  
      const userDocRef = doc(this.firestore, 'users', loggedInUserId);
      const userDocSnapshot = await getDoc(userDocRef);
  
      if (userDocSnapshot.exists()) {
        const userContacts = userDocSnapshot.data()['contactList'] || [];
        const updatedContacts = userContacts.filter((c: any) => c.uid !== contact.uid);
  
        await updateDoc(userDocRef, { contactList: updatedContacts });
  
        console.log('Contact removed from the contact list:', contact);
  
        await this.loadContactList(this.loggedInUserId);;
      }
    }
  }
}