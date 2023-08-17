import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, collection, getDocs, query, where, deleteDoc, doc } from '@angular/fire/firestore';
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
  contactList: User[] = [];

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

  async removeContact(contact: any) {
    try {
      this.contacts = this.contacts.filter(c => c.uid !== contact.uid);
  
      // Remove the user from the contact list in memory
      this.contactList = this.contactList.filter(c => c.uid !== contact.uid);
  
      // Update the contact list in the database
      /*this.updateContactListInDatabase();*/
  
    } catch (error) {
      console.error('Error removing contact:', error);
      this.contacts.push(contact);
    }
  }
}
