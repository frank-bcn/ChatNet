import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collection, query, orderBy, startAt, endAt, getDocs, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { User } from 'src/app/models/signUpUserdata';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { OnlineStatusService } from 'src/app/service/online-status.service';
import { ChatService } from 'src/app/service/chat-service.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  searchQuery: string = '';
  searchResults: User[] = [];
  DropdownMenu: boolean = false;
  showChatList: boolean = true;
  loggedInUserId: string = '';
  contactList: User[] = [];
  selectedUser: User | null = null;
  isOnline: boolean = false;
  chats: any[] = [];

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: Firestore,
    private router: Router,
    private onlineStatusService: OnlineStatusService,
    public chatService: ChatService
  ) { }

  ngOnInit() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.loggedInUserId = user.uid;
        const userId = this.selectedUser;
        this.loadOnlineStatus(user.uid);
      }
    });
  }

  addToContactList(uid: string, email: string, username: string, img: string, online: boolean) {
    if (!this.contactList.some(contact => contact.uid === uid)) {
      const newContact = new User({
        uid: uid,
        email: email,
        username: username,
        img: img,
        online: online
      });
  
      this.contactList.push(newContact);
  
      this.updateContactListInDatabase();
    } else {
      console.log('Benutzer ist bereits in der Kontaktliste');
    }
  }
  
  async loadOnlineStatus(useruid: string) {
    this.isOnline = await this.onlineStatusService.getOnlineStatus(useruid);
  }

  getFilteredResults(): User[] {
    return this.searchResults.filter(user => user.email !== this.loggedInUserId);
  }

  toggleDropdown() {
    this.DropdownMenu = !this.DropdownMenu;
  }

  navigateToContactList() {
    this.router.navigate(['/contactlist']);
  }

  navigateToChats() {
    this.router.navigate(['/chats']);
  }

  createSearchQuery(): any {
    if (this.searchQuery && this.searchQuery.length > 0) {
      const firstChar = this.searchQuery.charAt(0).toLowerCase();
      const queryField = this.searchQuery.startsWith('@') ? 'email' : 'username';
      const queryValue = this.searchQuery.startsWith('@')
        ? this.searchQuery.substring(1).toLowerCase()
        : firstChar;

      return query(
        collection(this.firestore, 'users'),
        orderBy(queryField),
        startAt(queryValue),
        endAt(queryValue + '\uf8ff')
      );
    }
  }

  loadSearchResults(searchQuery: any): Promise<User[]> {
    return getDocs(searchQuery)
      .then((querySnapshot) => {
        return querySnapshot.docs.map((doc) => doc.data() as User);
      })
      .catch((error) => {
        console.log('Fehler beim Suchen von Benutzern', error);
        return [];
      });
  }

  filterSearchResults(results: User[]): User[] {
    return results.filter(user =>
      user.username && user.email !== this.loggedInUserId && user.uid !== this.loggedInUserId
    );
  }

  searchUsers() {
    const searchQuery = this.createSearchQuery();

    if (searchQuery) {
      this.loadSearchResults(searchQuery)
        .then((results) => {
          this.searchResults = this.filterSearchResults(results);
          this.searchResults = this.searchResults.filter(user => user.email !== this.loggedInUserId);
          this.showChatList = false;
        });
    } else {
      this.searchResults = [];
      this.showChatList = true;
    }
  }

  userExistsInContactList(user: User): boolean {
    return this.contactList.some((contact) => contact.email === user.email);
  }

  async updateContactListInDatabase() {
    const userRef = doc(this.firestore, 'contactlist', this.loggedInUserId);
    const contactListJSON = this.contactList.map(contact => contact.toJson());
  
    try {
      console.log('Kontaktliste zum Speichern:', contactListJSON);
      await setDoc(userRef, { contactList: contactListJSON }, { merge: true });
      this.resetSearchResultsAndShowChatList();
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Kontaktliste:', error);
    }
  }
  
  resetSearchResultsAndShowChatList() {
    this.searchResults = [];
    this.searchQuery = '';
    this.showChatList = true;
    this.toggleDropdown();
  }

  clearInputAndShowChatList() {
    this.searchQuery = '';
    this.showChatList = true;
  }

  async logout() {
    try {
      const user = await this.afAuth.currentUser;
  
      if (user) {
        await this.onlineStatusService.setOnlineStatus(user.uid, false);
        await this.afAuth.signOut();
        
      } else {
        
      }
  
      this.router.navigate(['']);
    } catch (error) {
      
    }
  }
}