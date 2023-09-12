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
  userChats: any[] = [];
  favoriteChats: any[] = [];
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

        // Laden Sie hier die Chat-Daten und speichern Sie sie in userChats
        this.loadChatDataForUser(user.uid);

        // Laden Sie die favorisierten Chats für den Benutzer
        this.loadFavoriteChats(user.uid);
      }
    });
  }

  // Fügt einen neuen Kontakt zur Kontaktliste hinzu, sofern er nicht bereits vorhanden ist
  addToContactList(uid: string, email: string, username: string, img: string, online: boolean) {
    if (!this.contactExistscontactList(uid)) {
      const newContact = this.createContact(uid, email, username, img, online);
      this.addContactContactList(newContact);
      this.updateContactListDatabase();
    }
  }

  // Überprüft anhand der userid, ob ein Kontakt bereits in der Kontaktliste vorhanden ist
  contactExistscontactList(uid: string): boolean {
    return this.chatDataService.contactList.some(contact => contact.uid === uid);
  }

  // Erstellt ein neues userobjekt mit den angegebenen Eigenschaften
  createContact(uid: string, email: string, username: string, img: string, online: boolean): User {
    return new User({
      uid: uid,
      email: email,
      username: username,
      img: img,
      online: online
    });
  }

  // Pusht den erstellten user in die contactlist
  addContactContactList(contact: User) {
    this.chatDataService.contactList.push(contact);
  }

  // Lädt den Online-Status für den angegebenen user anhand seiner userid
  async loadOnlineStatus(useruid: string) {
    this.onlineStatusService.isOnline = await this.onlineStatusService.checkUserOnlineStatus(useruid);
  }

  // Gibt eine Liste von user zurück, die in den Suchergebnissen enthalten sind, wobei der aktuell angemeldete user ausgeschlossen wird
  FilteredResults(): User[] {
    return this.chatDataService.searchResults.filter(user => user.email !== this.chatDataService.loggedUserId);
  }

  // Öffnet das dropdown menu
  toggleDropdown() {
    this.DropdownMenu = !this.DropdownMenu;
  }

  // Navigiert zur kontktlist
  navigateToContactList() {
    this.router.navigate(['/contactlist']);
  }

  // Navigiert zu den chats
  navigateToChats() {
    this.router.navigate(['/chats']);
  }

  // Erstellt eine Suchanfrage für die Firestore-Datenbank, basierend auf den aktuellen Suchkriterien
  createSearchQuery(): any {
    if (this.SearchQueryValid()) {
      const queryField = this.determineQueryField();
      const queryValue = this.QueryValue();
      return this.buildFirestoreQuery(queryField, queryValue);
    }
  }

  // Überprüft, ob die aktuelle Suchanfrage gültig ist
  SearchQueryValid(): boolean {
    return !!this.chatDataService.searchQuery && this.chatDataService.searchQuery.length > 0;
  }

  // Prüft, ob die Suchanfrage mit '@' beginnt. Wenn ja, wird das Suchfeld auf email gesetzt, ansonsten auf username
  determineQueryField(): string {
    return this.chatDataService.searchQuery.startsWith('@') ? 'email' : 'username';
  }

  // Analysiert die Suchanfrage und gibt entweder den Teil nach '@' in Kleinbuchstaben zurück oder das erste Zeichen der Suchanfrage
  QueryValue(): string {
    const firstChar = this.chatDataService.searchQuery.charAt(0).toLowerCase();
    return this.chatDataService.searchQuery.startsWith('@')
      ? this.chatDataService.searchQuery.substring(1).toLowerCase()
      : firstChar;
  }

  // Baut eine Firestore-Abfrage auf, die nach den angegebenen Kriterien filtert und sortiert
  buildFirestoreQuery(queryField: string, queryValue: string): any {
    return query(
      collection(this.firestore, 'users'),
      orderBy(queryField),
      startAt(queryValue),
      endAt(queryValue + '\uf8ff')
    );
  }

  // Lädt die Suchergebnisse basierend auf der übergebenen Firestore-Abfrage
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

  // Gibt ein neues Array von userobjekten zurück, bei dem user entfernt wurden
  filterSearchResults(results: User[]): User[] {
    return results.filter(user =>
      user.username &&
      user.email !== this.chatDataService.loggedUserId && 
      user.uid !== this.chatDataService.loggedUserId && 
      !this.contactExistscontactList(user.uid)
    );
  }

  // Koordiniert also den Ablauf der Benutzersuche
  searchUsers() {
    const searchQuery = this.createSearchQuery();
    if (searchQuery) {
      this.performSearch(searchQuery);
    } else {
      this.clearSearchResults();
    }
  }

  // Durchführung der Benutzersuche mit Berücksichtigung der Kontaktliste
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
  
  // Öffnet die userlist
  openUserList(show: boolean) {
    this.showChatList = show;
  }

  // Löscht die Suchergebnisse
  clearSearchResults() {
    this.chatDataService.searchResults = [];
    this.openUserList(true);
    this.chatDataService.searchQuery = '';
  }

  // Prüft, ob ein user bereits in der kontaktlist vorhanden ist
  userExistsContactList(user: User): boolean {
    return this.chatDataService.contactList.some((contact) => contact.email === user.email);
  }

  // Aktualisiert die kontaktliste in der Datenbank
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

  // Lädt die vorhandene Kontaktliste eines Benutzers aus der Datenbank und stellt sicher, dass das Ergebnis immer ein Array ist
  async fetchExistingContactList(userRef: any): Promise<any[]> {
    const docSnap = await getDoc(userRef);
    const existingData: any = docSnap.data();
    return existingData ? existingData['contactList'] || [] : [];
  }

  // Aktualisiert die kontaktliste
  updateContactList(existingContactList: any[]): any[] {
    const updatedContactList = [...existingContactList];
    for (const newContact of this.chatDataService.contactList) {
      if (!updatedContactList.some(contact => contact.uid === newContact.uid)) {
        updatedContactList.push(newContact.toJson());
      }
    }
    return updatedContactList;
  }

  // Speichert die aktualisierte Kontaktliste eines Benutzers in der Firestore-Datenbank
  async saveUpdatedContactList(userRef: any, updatedContactList: any[]) {
    await setDoc(userRef, { ['contactList']: updatedContactList });
  }

  // Dient dazu, nach einer Suchaktion die Suchergebnisse zu löschen 
  resetSearchResults() {
    this.clearSearchResults();
    this.openUserList(true);
  }

  // Muss mir noch überlegen, was hier angezeigt werden soll
  handleUpdateError(error: any) {
    console.error('Fehler beim Aktualisieren der Kontaktliste:', error);
  }

  // Loggt den Benutzer aus
  async logout() {
    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        await this.onlineStatusService.updateUserOnlineStatus(user.uid, false);
        await this.afAuth.signOut();
      }
      this.router.navigate(['']);
    } catch (error) {
      console.error('Fehler beim Abmelden:', error);
    }
  }

   // Lädt die favorisierten Chats für den eingeloggten Benutzer
   async loadFavoriteChats(userId: string) {
    try {
      // Erstellen Sie eine Referenz auf die favoritelist des Benutzers
      const userFavoritesRef = doc(this.firestore, 'favoritelist', userId);
      const userFavoritesSnapshot = await getDoc(userFavoritesRef);

      if (userFavoritesSnapshot.exists()) {
        const userFavoritesData = userFavoritesSnapshot.data();
        const chatIds = userFavoritesData['chatIds'] || [];

        // Laden Sie die Chat-Daten basierend auf den Chat-IDs
        this.favoriteChats = await this.loadChatDataForChatIds(chatIds);
      }
    } catch (error) {
      console.error('Fehler beim Laden der favorisierten Chats:', error);
    }
  }

  // Lädt die Chat-Daten für eine Liste von Chat-IDs
  async loadChatDataForChatIds(chatIds: string[]): Promise<any[]> {
    const chatData: any[] = [];
  
    for (const chatId of chatIds) {
      try {
        console.log('Lade Chat-Daten für Chat-ID', chatId);
  
        // Erstellen Sie eine Referenz auf das Dokument mit der Chat-ID in der Firestore-Datenbank
        const chatDocRef = doc(this.firestore, 'chats', chatId);
  
        // Rufen Sie die Daten aus Firestore für das Chat-Dokument ab
        const chatDocSnapshot = await getDoc(chatDocRef);
  
        // Überprüfen Sie, ob das Dokument vorhanden ist
        if (chatDocSnapshot.exists()) {
          // Extrahieren Sie die Daten aus dem Dokument
          const chatInfo = chatDocSnapshot.data();
          chatData.push(chatInfo);
        } else {
          console.error('Chat-Dokument mit Chat-ID', chatId, 'existiert nicht.');
        }
      } catch (error) {
        console.error('Fehler beim Laden von Chat-Daten für Chat-ID', chatId, error);
      }
    }
  
    console.log('Geladene Chat-Daten:', chatData);
  
    return chatData;
  }
  

  async loadChatDataForUser(userId: string) {
    try {
      // Erstellen Sie eine Referenz auf die Sammlung "userChats" für den Benutzer
      const userChatsRef = collection(this.firestore, `chats/${userId}/userChats`);
      
      // Laden Sie die Chat-Daten für den Benutzer
      const querySnapshot = await getDocs(userChatsRef);
      
      // Extrahieren Sie die Daten aus der Abfrage und speichern Sie sie in this.userChats
      this.userChats = querySnapshot.docs.map((doc) => doc.data());
  
      console.log('Geladene Chat-Daten für Benutzer:', this.userChats);
    } catch (error) {
      console.error('Fehler beim Laden der Chat-Daten:', error);
    }
  }
}