import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collection, query, orderBy, startAt, endAt, getDocs, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { User } from 'src/app/models/signUpUserdata';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { OnlineStatusService } from 'src/app/service/online-status.service';
import { ChatService } from 'src/app/service/chat-service.service';
import { ChatDataService } from 'src/app/service/chat-data.service';


@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  DropdownMenu: boolean = false;
  showChatList: boolean = true;


  constructor(
    private afAuth: AngularFireAuth,
    private firestore: Firestore,
    private router: Router,
    private onlineStatusService: OnlineStatusService,
    public chatService: ChatService,
    public chatDataService: ChatDataService
  ) { }

  ngOnInit() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.chatDataService.loggedUserId = user.uid;
        this.chatDataService.selectedUser;
        this.loadOnlineStatus(user.uid);
      }
    });
  }

  //  fügt einen neuen Kontakt zur Kontaktliste hinzu, sofern er nicht bereits vorhanden ist
  addToContactList(uid: string, email: string, username: string, img: string, online: boolean) {
    if (!this.contactExistscontactList(uid)) {
      const newContact = this.createContact(uid, email, username, img, online);
      this.addContactContactList(newContact);
      this.updateContactListDatabase();
    }
  }

  // überprüft anhand der userid, ob ein Kontakt bereits in der Kontaktliste vorhanden ist
  contactExistscontactList(uid: string): boolean {
    return this.chatDataService.contactList.some(contact => contact.uid === uid);
  }

  // erstellt ein neues userobjekt mit den angegebenen Eigenschaften
  createContact(uid: string, email: string, username: string, img: string, online: boolean): User {
    return new User({
      uid: uid,
      email: email,
      username: username,
      img: img,
      online: online
    });
  }

  // pusht den erstellten user in die contactlist
  addContactContactList(contact: User) {
    this.chatDataService.contactList.push(contact);
  }

  // lädt den Online-Status für den angegebenen user anhand seiner userid,
  async loadOnlineStatus(useruid: string) {
    this.onlineStatusService.isOnline = await this.onlineStatusService.checkUserOnlineStatus(useruid);
  }

  // gibt eine Liste von user zurück, die in den Suchergebnissen enthalten sind, wobei der aktuell angemeldete user ausgeschlossen wird.
  FilteredResults(): User[] {
    return this.chatDataService.searchResults.filter(user => user.email !== this.chatDataService.loggedUserId);
  }

  // öffnet das dropdown menu
  toggleDropdown() {
    this.DropdownMenu = !this.DropdownMenu;
  }

  // navigiert zur kontktlist
  navigateToContactList() {
    this.router.navigate(['/contactlist']);
  }

  // navigiert zu den chats
  navigateToChats() {
    this.router.navigate(['/chats']);
  }

  //  erstellt eine Suchanfrage für die Firestore-Datenbank, basierend auf den aktuellen Suchkriterien
  createSearchQuery(): any {
    if (this.SearchQueryValid()) {
      const queryField = this.determineQueryField();
      const queryValue = this.QueryValue();
      return this.buildFirestoreQuery(queryField, queryValue);
    }
  }

  // überprüft, ob die aktuelle Suchanfrage gültig ist
  SearchQueryValid(): boolean {
    return !!this.chatDataService.searchQuery && this.chatDataService.searchQuery.length > 0;
  }

  // Sie prüft, ob die Suchanfrage mit '@' beginnt. Wenn ja, wird das Suchfeld auf email gesetzt, ansonsten auf username.
  determineQueryField(): string {
    return this.chatDataService.searchQuery.startsWith('@') ? 'email' : 'username';
  }

  // analysiert die Suchanfrage und gibt entweder den Teil nach '@' in Kleinbuchstaben zurück oder das erste Zeichen der Suchanfrage
  QueryValue(): string {
    const firstChar = this.chatDataService.searchQuery.charAt(0).toLowerCase();
    return this.chatDataService.searchQuery.startsWith('@')
      ? this.chatDataService.searchQuery.substring(1).toLowerCase()
      : firstChar;
  }

  // baut eine Firestore-Abfrage auf, die nach den angegebenen Kriterien filtert und sortiert
  buildFirestoreQuery(queryField: string, queryValue: string): any {
    return query(
      collection(this.firestore, 'users'),
      orderBy(queryField),
      startAt(queryValue),
      endAt(queryValue + '\uf8ff')
    );
  }

  // lädt die Suchergebnisse basierend auf der übergebenen Firestore-Abfrage.
  async loadSearchResults(searchQuery: any): Promise<User[]> {
    return getDocs(searchQuery)
      .then((querySnapshot) => {
        return querySnapshot.docs.map((doc) => doc.data() as User);
      })
      .catch((error) => {
        console.log('Fehler beim Suchen von Benutzern', error);
        return [];
      });
  }

  // gibt ein neues Array von userobjekten zurück, bei dem user entfernt wurden
  filterSearchResults(results: User[]): User[] {
    return results.filter(user =>
      user.username &&
      user.email !== this.chatDataService.loggedUserId &&
      user.uid !== this.chatDataService.loggedUserId
    );
  }

  // koordiniert also den Ablauf der Benutzersuche
  searchUsers() {
    const searchQuery = this.createSearchQuery();
    if (searchQuery) {
      this.performSearch(searchQuery);
    } else {
      this.clearSearchResults();
    }
  }

  // koordiniert die Durchführung der usersuche, das Filtern der Ergebnisse
  async performSearch(searchQuery: any) {
    try {
      const results = await this.loadSearchResults(searchQuery);
      const filteredResults = this.filterSearchResults(results);
      this.chatDataService.searchResults = this.filterSearchResults(filteredResults);
      this.openUserList(false);
    } catch (error) {
      console.error('Fehler bei der Benutzersuche:', error);
    }
  }

  // öffnet die userlist
  openUserList(show: boolean) {
    this.showChatList = show;
  }

  // löscht die suchergebnisse
  clearSearchResults() {
    this.chatDataService.searchResults = [];
    this.openUserList(true);
    this.chatDataService.searchQuery = '';
  }

  // prüft ob ein user bereits in der kontaktlist vorhanden ist
  userExistsContactList(user: User): boolean {
    return this.chatDataService.contactList.some((contact) => contact.email === user.email);
  }

  // updatet die kontaktliste in database
  async updateContactListDatabase() {
    try {
      const userRef = doc(this.firestore, 'contactlist', this.chatDataService.loggedUserId);
      const existingContactList = await this.fetchExistingContactList(userRef);
      const updatedContactList = this.updateContactList(existingContactList);
      await this.saveUpdatedContactList(userRef, updatedContactList);
      this.resetSearchResults();
    } catch (error) {
      this.handleUpdateError(error);
    }
  }

  // läd die vorhandene Kontaktliste eines users aus der Datenbank und stellt sicher, dass das Ergebnis immer ein Array ist
  async fetchExistingContactList(userRef: any): Promise<any[]> {
    const docSnap = await getDoc(userRef);
    const existingData: any = docSnap.data();
    return existingData ? existingData['contactList'] || [] : [];
  }

  // aktualisiert die kontaktliste
  updateContactList(existingContactList: any[]): any[] {
    const updatedContactList = [...existingContactList];
    for (const newContact of this.chatDataService.contactList) {
      if (!updatedContactList.some(contact => contact.uid === newContact.uid)) {
        updatedContactList.push(newContact.toJson());
      }
    }
    return updatedContactList;
  }

  //  speichert die aktualisierte Kontaktliste eines Benutzers in der Firestore-Datenbank
  async saveUpdatedContactList(userRef: any, updatedContactList: any[]) {
    await setDoc(userRef, { ['contactList']: updatedContactList });
  }

  // dient dazu, nach einer Suchaktion die Suchergebnisse zu löschen 
  resetSearchResults() {
    this.clearSearchResults();
    this.openUserList(true);
  }

  // muss mir noch was einfallen lassen was ich hier anzeigen lassen will
  handleUpdateError(error: any) {
    console.error('Fehler beim Aktualisieren der Kontaktliste:', error);
  }

// loggt den user aus
  async logout() {
    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        await this.onlineStatusService.updateUserOnlineStatus(user.uid, false);
        await this.afAuth.signOut();
      }
      this.router.navigate(['']);
    } catch (error) {
    }
  }
}