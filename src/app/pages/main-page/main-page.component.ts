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
        this.loadContactList();
        this.onlineStatusService.isOnline;
      }
    });
  }

  getFilteredResults(): User[] {
    return this.searchResults.filter(user => user.email !== this.loggedInUserId);
  }

  toggleDropdown() {
    this.DropdownMenu = !this.DropdownMenu;
  }

  openChatDialog(user: User) {
    this.selectedUser = user;
    console.log('Ausgewählter Benutzer:', this.selectedUser);
    this.router.navigate(['/chat-dialog'], { state: { selectedUser: user } });
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

  addUserToContactList(loggedInUserId: string, userToAdd: User) {
    
    this.contactList.push(userToAdd);
    console.log('Benutzer zur Kontaktliste hinzugefügt:', userToAdd);

    const chatData = {
      loggedInUid: loggedInUserId,
      addedUid: userToAdd.uid,
    };

    this.chats.push(chatData);
    this.saveChatsToDatabase(this.chats);
  }

  async saveChatToDatabase(chatData: any) {
    try {
     
      console.log('Chat in Datenbank gespeichert:', chatData);

      this.chats.push(chatData);

      console.log('Chat wurde zu "chats" hinzugefügt:', chatData);
    } catch (error) {
      console.error('Fehler beim Speichern des Chats in der Datenbank:', error);
    }
  }


  async saveChatsToDatabase(chats: any[]) {
    try {
    
      const chatsCollectionRef = collection(this.firestore, 'chats'); 
      for (const chat of chats) {
        await setDoc(doc(chatsCollectionRef), chat);
      }

      console.log('Chats in Datenbank gespeichert:', chats);
    } catch (error) {
      console.error('Fehler beim Speichern der Chats in der Datenbank:', error);
    }
  }

  updateContactListInDatabase() {
    const userRef = doc(this.firestore, 'users', this.loggedInUserId);
    setDoc(userRef, { contactList: this.contactList }, { merge: true })
      .then(() => {
        console.log('Benutzer zur Kontaktliste in der Datenbank hinzugefügt');
        this.resetSearchResultsAndShowChatList();
      })
      .catch((error) => {
        console.error('Fehler beim Hinzufügen des Benutzers zur Kontaktliste:', error);
      });
  }

  addToContactList(user: User) {
  
    const userExists = this.userExistsInContactList(user);

    if (!userExists) {

      this.addUserToContactList(this.loggedInUserId, user);

      this.updateContactListInDatabase();
    } else {
      console.log('Benutzer existiert bereits in der Kontaktliste');
    }
  }

  loadContactList() {
    const userRef = doc(this.firestore, 'users', this.loggedInUserId);
    getDoc(userRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          this.contactList = data['contactList'] || [];
        }
      })
      .catch((error) => {
        console.error('Fehler beim Laden der Kontaktliste:', error);
      });
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
}