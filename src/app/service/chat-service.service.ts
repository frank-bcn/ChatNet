import { Injectable } from '@angular/core';
import { User } from 'src/app/models/signUpUserdata';
import { Firestore, collection, doc, setDoc, getDocs, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  loggedInUserId: string = '';
  selectedUser: User | null = null;
  chats: any[] = [];

  constructor(private firestore: Firestore, private router: Router) { }

  // Initialisiert die Chat-Liste für den angemeldeten Benutzer.
  async initializeChats(loggedInUserId: string) {
    this.loggedInUserId = loggedInUserId; 
    const chatsCollectionRef = collection(this.firestore, 'chats');
    const chatsSnapshot = await getDocs(chatsCollectionRef);
  
    this.chats = chatsSnapshot.docs.map(doc => doc.data());
  }
  
  // Ruft die Daten eines bestimmten Chats anhand der Chat-ID ab.
  async getChatData(chatId: string) {
    const chatDocRef = doc(this.firestore, 'chats', chatId);
    const chatDocSnapshot = await getDoc(chatDocRef);
  
    if (chatDocSnapshot.exists()) {
      return chatDocSnapshot.data();
    }
    
    return null;
  }
  
  // Holt den Benutzernamen anhand der Benutzer-ID aus der Datenbank.
  async getUsername(uid: string): Promise<string> {
    const userDocRef = doc(collection(this.firestore, 'users'), uid);
    const userDocSnapshot = await getDoc(userDocRef);
    
    if (userDocSnapshot.exists()) {
      const userData = userDocSnapshot.data() as User;
      return userData.username || '';
    }
    
    return '';
  }
  
  // Speichert Chat-Daten in der Datenbank.
  async saveChatToDatabase(chatData: any) {
    try {
      const chatsCollectionRef = collection(this.firestore, 'chats');
      await setDoc(doc(chatsCollectionRef), chatData);

    } catch (error) {
      console.error('Fehler beim Speichern des Chats in der Datenbank:', error);
    }
  }

  // Fügt einen neuen Chat hinzu oder gibt die ID eines bestehenden Chats zurück.
  async addOrGetChat(user1Id: string, user2Id: string) {
    const chatId = user1Id + '_' + user2Id;

    const chatCollectionRef = collection(this.firestore, 'chats');
    const chatDocRef = doc(chatCollectionRef, chatId);

    const chatDocSnapshot = await getDoc(chatDocRef);
    if (chatDocSnapshot.exists()) {
      return chatId;
    }

    const chatData = { users: [user1Id, user2Id] };
    await setDoc(chatDocRef, chatData);

    return chatId;
  }

  // Navigiert zu einem Chat-Dialog mit einer bestimmten Chat-ID.
  async navigateToChatDialog(chatId: string) {
    console.log('Navigiere zum Chat-Dialog mit Chat-ID:', chatId);
    this.router.navigate(['/chat-dialog', chatId]);
  }

  // Erstellt einen Gruppenchat mit ausgewählten Kontakten.
  async createGroupChat(groupName: string, loggedInUserId: string, selectedContactUids: string[]): Promise<string | null> {
    try {
      const chatId = loggedInUserId + '_' + groupName;
      
      const chatCollectionRef = collection(this.firestore, 'chats');
      const chatDocRef = doc(chatCollectionRef, chatId);
      
      const chatDocSnapshot = await getDoc(chatDocRef);
      if (chatDocSnapshot.exists()) {
        return null;
      }
      
      const chatData = {
        groupName: groupName,
        selectedContacts: selectedContactUids,
        admin: loggedInUserId,
      };
      
      await setDoc(chatDocRef, chatData);
      return chatId;
    } catch (error) {
      console.error('Fehler beim Erstellen des Gruppenchats:', error);
      return null;
    }
  }
}