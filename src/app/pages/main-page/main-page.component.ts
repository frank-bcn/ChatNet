import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collection, query, orderBy, startAt, endAt, getDocs, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { User } from 'src/app/models/signUpUserdata';
import { AngularFireAuth } from '@angular/fire/compat/auth';

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

  constructor(private afAuth: AngularFireAuth, private firestore: Firestore, private router: Router) { }

  ngOnInit() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.loggedInUserId = user.uid;
        console.log(this.loggedInUserId);
        this.loadContactList();
      }
    });
  }

  getFilteredResults(): User[] {
    return [...this.searchResults];
  }

  toggleDropdown() {
    this.DropdownMenu = !this.DropdownMenu;
  }

  openChatDialog(user: User) {
    this.selectedUser = user; 
    this.router.navigate(['/chat-dialog']);
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
    return results.filter(user => user.username);
  }

  searchUsers() {
    const searchQuery = this.createSearchQuery();

    if (searchQuery) {
      this.loadSearchResults(searchQuery)
        .then((results) => {
          this.searchResults = this.filterSearchResults(results);
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

  addUserToContactList(user: User) {
    this.contactList.push(user);
    console.log('User added to contactList:', user);
  }

  updateContactListInDatabase() {
    const userRef = doc(this.firestore, 'users', this.loggedInUserId);
    setDoc(userRef, { contactList: this.contactList }, { merge: true })
      .then(() => {
        console.log('User added to contactList in the database');
        this.resetSearchResultsAndShowChatList();
      })
      .catch((error) => {
        console.error('Error adding user to contactList:', error);
      });
  }

  addToContactList(user: User) {
    if (!this.contactList) {
      this.contactList = [];
    }

    const userExists = this.userExistsInContactList(user);
    console.log('User exists in contactList:', userExists);

    if (!userExists) {
      this.addUserToContactList(user);
      this.updateContactListInDatabase();
    } else {
      console.log('User already exists in contactList');
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
        console.error('Error loading contactList:', error);
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