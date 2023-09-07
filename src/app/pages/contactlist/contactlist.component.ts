import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, doc, updateDoc, getDoc, collection, setDoc } from '@angular/fire/firestore';
import { DocumentReference } from 'firebase/firestore';
import { OnlineStatusService } from 'src/app/service/online-status.service';
import { ChatDataService } from 'src/app/service/chat-data.service';
import { ChatService } from 'src/app/service/chat-service.service';
import { User } from 'src/app/models/signUpUserdata';

@Component({
  selector: 'app-contactlist',
  templateUrl: './contactlist.component.html',
  styleUrls: ['./contactlist.component.scss']
})
export class ContactlistComponent implements OnInit {

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: Firestore,
    private router: Router,
    private onlineStatusService: OnlineStatusService,
    public chatDataService: ChatDataService,
    public chatService: ChatService,

  ) { }

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.chatDataService.username = user.displayName || '';
        this.chatDataService.loggedUserId = user.uid;
        this.loadContactList(this.chatDataService.loggedUserId);
      }
    });
  }

  // läd die kontaktliste des users
  async loadContactList(loggedInUserId: string) {
    const userDocRef = doc(this.firestore, 'contactlist', loggedInUserId);
    const userDocSnapshot = await getDoc(userDocRef);
    if (userDocSnapshot.exists()) {
      const userContacts = userDocSnapshot.data()['contactList'] || [];
      for (const contact of userContacts) {
        const isContactOnline = await this.onlineStatusService.checkUserOnlineStatus(contact.uid);
        contact.online = isContactOnline;
      }
      this.chatDataService.contacts = userContacts;
    }
  }

  // navigiert zur mainpaige
  goToMainPage() {
    this.router.navigate(['/main-page']);
  }

  // entfernt einen kontakt aus der kontaktliste
  async deleteContactFromList(contact: any) {
    try {
      const loggedInUser = await this.afAuth.currentUser;
      if (loggedInUser) {
        const loggedInUserId = loggedInUser.uid;
        const userContacts = await this.fetchUserContacts(loggedInUserId);
        const updatedContacts = userContacts.filter((c: any) => c.uid !== contact.uid);
        const userDocRef = doc(this.firestore, 'contactlist', loggedInUserId);
        await this.updateUserContacts(userDocRef, updatedContacts);
        await this.loadContactList(loggedInUserId);
      }
    } catch (error) {
      console.error('Error deleting contact from list:', error);
    }
  }

  // ruft die Kontaktliste des angemeldeten user aus der Firestore-Datenbank ab und gibt sie zurück.
  async fetchUserContacts(loggedInUserId: string) {
    const userDocRef = doc(this.firestore, 'contactlist', loggedInUserId);
    const userDocSnapshot = await getDoc(userDocRef);
    return userDocSnapshot.exists() ? userDocSnapshot.data()?.['contactList'] || [] : [];
  }

  // aktualisiert die Kontaktliste des users in der Firestore-Datenbank mit den aktualisierten Kontaktdaten.
  async updateUserContacts(userDocRef: DocumentReference, updatedContacts: any[]) {
    await updateDoc(userDocRef, { 'contactList': updatedContacts });
  }

  // erstellt den einzel chat
  async createSingleChat(contact: any) {
    try {
      const loggedInUser = await this.afAuth.currentUser;
      if (loggedInUser) {
        const userToAdd: User = contact;
        this.chatDataService.groupName = userToAdd.username;
        await this.ChatCreation(loggedInUser, contact);
      }
    } catch (error) {
    }
  }

  // koordiniert die erstellung eines einzelchats mit einem ausgewählten Kontakt, indem sie die userdaten abruft
  async ChatCreation(loggedInUser: any, contact: any) {
    const loggedInUserId = loggedInUser.uid;
    const userToAdd: User = contact;
    const userToAddUid = userToAdd.uid;
    try {
      const userToAddUsername = await this.usernameByUserId(userToAddUid);
      if (userToAddUsername) {
        await this.generateChatDataId(loggedInUserId, userToAddUid, userToAddUsername);
      } else {
        console.error('Benutzerdaten nicht gefunden.');
      }
    } catch (error) {
    }
  }

  // holt den username eines users aus der Firestore-Datenbank und gibt seinen usernamen zurück
  async usernameByUserId(userUid: string): Promise<string | null> {
    try {
      const userToAddDocRef = doc(this.firestore, 'users', userUid);
      const userToAddDocSnapshot = await getDoc(userToAddDocRef);

      if (userToAddDocSnapshot.exists()) {
        const userToAddData = userToAddDocSnapshot.data();
        return userToAddData['username'] || 'Unbekannter Benutzer';
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // erstellt einen chat zwischen dem eingeloggten user und einem hinzugefügten Kontakt. Dabei wird die user-ID des eingeloggten users und die user-ID des hinzugefügten Kontakts sowie der username des hinzugefügten users hinzugefügten 
  async generateChatDataId(loggedInUserId: string, userToAddUid: string, userToAddUsername: string) {
    // Setzen Sie den Chat-Namen auf den Benutzernamen des anderen Benutzers.
    this.chatDataService.groupName = userToAddUsername;
  
    const sortedUids = [loggedInUserId, userToAddUid].sort();
    const chatId = sortedUids.join('_');
    await this.createUpdateChatDocument(chatId, sortedUids, userToAddUsername);
    this.openChatDialog({ users: sortedUids, groupName: userToAddUsername });
  }

  // erstellt oder aktualisiert die funktion einen Chat. Dabei wird überprüft, ob das Dokument bereits existiert
  // erstellt oder aktualisiert die funktion einen Chat. Dabei wird überprüft, ob das Dokument bereits existiert
async createUpdateChatDocument(chatId: string, sortedUids: string[], userToAddUsername: string) {
  const chatCollectionRef = collection(this.firestore, 'chats');
  const chatDocRef = doc(chatCollectionRef, chatId);

  const chatDocSnapshot = await getDoc(chatDocRef);
  if (!chatDocSnapshot.exists()) {
    const chatData = {
      users: sortedUids,
      groupName: userToAddUsername,
      chatId: chatId // Fügt die chatId dem Chat-Datenobjekt hinzu
    };
    await setDoc(chatDocRef, chatData);
  } else {
    console.log('Chat existiert bereits:', chatId);
  }
}


  // öffnet den chat
  openChatDialog(chat: any) {
    this.chatService.openChatDialog(chat);
  }

  // prüft ob ein chat existiert und gibt entwerder true oder false wieder
  async checkChatExists(chatId: string): Promise<boolean> {
    try {
      const chatExists = await this.checkRegularChat(chatId);
      if (chatExists) {
        return true;
      }

      return await this.checkReversedChat(chatId);
    } catch (error) {
      return false;
    }
  }

  // prüft ob derselbe chat existiert
  async checkRegularChat(chatId: string): Promise<boolean> {
    const chatDocRef = doc(this.firestore, 'chats', chatId);
    const chatDocSnapshot = await getDoc(chatDocRef);
    return chatDocSnapshot.exists();
  }

  // prüft ob der umgekehr selbe chat exestiert
  async checkReversedChat(chatId: string): Promise<boolean> {
    const uids = chatId.split('_');
    const reverseChatId = `${uids[1]}_${uids[0]}`;
    const reverseChatDocRef = doc(this.firestore, 'chats', reverseChatId);
    const reverseChatDocSnapshot = await getDoc(reverseChatDocRef);
    return reverseChatDocSnapshot.exists();
  }
}