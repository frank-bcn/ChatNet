import { Component } from '@angular/core';
import { Firestore, collection, query, orderBy, startAt, endAt, getDocs } from '@angular/fire/firestore';
import { User } from 'src/app/models/signUpUserdata';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent {
  searchQuery: string = '';
  searchResults: User[] = [];
  DropdownMenu: boolean = false;
  showChatList: boolean = true;

  constructor(private firestore: Firestore) {}

  searchUsers() {
    const coll = collection(this.firestore, 'users');

    if (this.searchQuery && this.searchQuery.length > 0) {
      const firstChar = this.searchQuery.charAt(0).toLowerCase();
      const queryField = this.searchQuery.startsWith('@') ? 'email' : 'username';
      const queryValue = this.searchQuery.startsWith('@')
        ? this.searchQuery.substring(1).toLowerCase()
        : firstChar;

      const searchQuery = query(
        coll,
        orderBy(queryField),
        startAt(queryValue),
        endAt(queryValue + '\uf8ff')
      );

      getDocs(searchQuery)
        .then((querySnapshot) => {
          this.searchResults = querySnapshot.docs.map((doc) => doc.data() as User);
          this.searchResults = this.searchResults.filter(user => user.username);
          this.showChatList = false;
        })
        .catch((error) => {
          console.log('Error searching users', error);
        });
    } else {
      this.searchResults = [];
      this.showChatList = true;
    }
  }

  getFilteredResults(): User[] {
    return [...this.searchResults];
  }

  toggleDropdown() {
    this.DropdownMenu = !this.DropdownMenu;
  }
}