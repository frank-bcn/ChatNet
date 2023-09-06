import { Injectable } from '@angular/core';
import { User } from 'src/app/models/signUpUserdata';
import { Firestore, collection, doc, setDoc, getDocs, getDoc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})

export class ChatDataService {

  currentChatDetails: any;
  usernames: { [uid: string]: string } = {};
  loggedUserId: string = '';
  selectedUser: User | null = null;
  chats: any[] = [];
  chatId: string = '';
  groupName: string ='';
  showChatTitle: boolean = false;
  usernamesLoaded: boolean = false;
  username: string = '';
  greeting: string = '';
  contacts: any[] = [];
  contactList: User[] = [];
  searchResults: User[] = [];
  searchQuery: string = '';
  chatUsernames: { [uid: string]: string } = {};
  loadedUsernames: { [uid: string]: string } = {};
  selectedContacts: User[] = [];
  admin: string | null = null;

  
  constructor(private firestore: Firestore) { }

  // läd die kontaktliste für den angemeldeten User.
  async loadUserContactlist(loggedUserId: string) {
    this.loggedUserId = loggedUserId;
    const chatsCollectionRef = collection(this.firestore, 'chats');
    const chatsQuerySnapshot = await getDocs(chatsCollectionRef);
    this.chats = chatsQuerySnapshot.docs.map(doc => doc.data());
  
    // Nachdem Sie die Kontakte geladen haben, rufen Sie die Benutzernamen für diese Kontakte ab und speichern sie direkt in selectedContacts.
    for (const contact of this.contacts) {
      const username = await this.loadUsernameViaUID(contact.uid);
      contact.username = username;
    }
  }

  // Ruft die Daten eines bestimmten Chats anhand der Chat-ID ab.
  async loadChatData(chatId: string) {
    const chatDocumentReference = doc(this.firestore, 'chats', chatId);
    const chatDocumentSnapshot = await getDoc(chatDocumentReference);
    if (chatDocumentSnapshot.exists()) {
      return chatDocumentSnapshot.data();
    }
    return null;
  }
  
  // Holt den Benutzernamen anhand der Benutzer-UID aus der Datenbank.
  async loadUsernameViaUID(uid: string): Promise<string> {
    const userDocumentRef = doc(collection(this.firestore, 'users'), uid);
    const userDocumentSnapshot = await getDoc(userDocumentRef);
    if (userDocumentSnapshot.exists()) {
      const userData = userDocumentSnapshot.data() as User;
      return userData.username || '';
    }
    return '';
  }

  // Speichert Chat-Daten in der Datenbank.
  async saveChatData(chatData: any) {
    try {
      const chatsCollectionRef = collection(this.firestore, 'chats');
      await setDoc(doc(chatsCollectionRef), chatData);

    } catch (error) {
      console.error('Fehler beim Speichern des Chats in der Datenbank:', error);
    }
  }

  // Erstellt einen Gruppenchat mit ausgewählten Kontakten.
  async createGroupChat(groupName: string, loggedUserId: string, selectedContactUids: string[]): Promise<string | null> {
    try {
      const chatId = loggedUserId + '_' + groupName;
      const chatCollectionRef = collection(this.firestore, 'chats');
      const chatDocRef = doc(chatCollectionRef, chatId);
      const chatDocSnapshot = await getDoc(chatDocRef);
      if (chatDocSnapshot.exists()) {
        return null;
      }
      const chatData = {
        groupName: groupName,
        selectedContacts: selectedContactUids,
        admin: loggedUserId,
      };

      await setDoc(chatDocRef, chatData);
      return chatId;
    } catch (error) {
      console.error('Fehler beim Erstellen des Gruppenchats:', error);
      return null;
    }
  }

  //weist denn admin den übergebenen Wert zu, wodurch der Administrator für den aktuellen Chat festgelegt wird
  setAdminUid(uid: string) {
    this.admin = uid;
  }
}