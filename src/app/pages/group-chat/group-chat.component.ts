import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, collection, getDocs, doc, getDoc, where, query } from '@angular/fire/firestore';
import { User } from 'src/app/models/signUpUserdata';
import { ChatDataService } from 'src/app/service/chat-data.service';
import { ChatService } from 'src/app/service/chat-service.service';


@Component({
  selector: 'app-group-chat',
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.scss']

})
export class GroupChatComponent {

  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false;
  showContactList: boolean = false;


  constructor(
    private afAuth: AngularFireAuth,
    private firestore: Firestore,
    private router: Router,
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

  // Läd die Kontaktliste eines User aus der Firestore-Datenbank für den Gruppenchat. 
  async loadContactList(loggedInUserId: string) {
    const userDocRef = doc(this.firestore, 'contactlist', loggedInUserId);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      const userContacts = userDocSnapshot.data()['contactList'] || [];
      this.chatDataService.contacts = userContacts;
    }
  }

  // leitet weiter zur MainPaige
  goToMainPage() {
    this.router.navigate(['/main-page']);
  }

  // erstellt den gruppenchat
  createGroup() {
    if (this.checkEnoughUsers()) {
      this.showMessage(3000);
      return;
    }
    const selectedContactUids = this.generateGroupUserIds();
    const chatId = this.createChatId(selectedContactUids);
    console.log('ChatID, die erstellt werden soll:', chatId);
    console.log(this.chatDataService.groupName);
    this.checkExistingChat(chatId, selectedContactUids);
  }

  //prüft ob genügend User im Chat vorhanden sind
  checkEnoughUsers(): boolean {
    return this.chatDataService.selectedContacts.length < 2;
  }

  // lässt das popup erstellt/zuwenig User erscheinen beim erstellen des gruppenchats 
  showMessage(delay: number) {
    this.showErrorMessage = true;
    setTimeout(() => {
      this.showErrorMessage = false;
    }, delay);
  }

  // gerneriert und sortiert die uid des gruppenchat und des admin
  generateGroupUserIds(): string[] {
    const adminUid = this.chatDataService.loggedUserId;
    return this.chatDataService.selectedContacts.map(contact => contact.uid).concat(adminUid).sort();
  }

  //generiert eine eindeutige ChatID, die aus dem Gruppennamen und den UserIDs der ausgewählten Kontakte besteht. 
  //Die Methode join('_') fügt die Benutzer-IDs im Array durch Unterstriche getrennt zu einer einzigen Zeichenkette zusammen.
  createChatId(selectedContactUids: string[]): string {
    return `${this.chatDataService.groupName}_${selectedContactUids.join('_')}`;
  }

  //überprüft ob ein Gruppenchat existiert. Wenn er existiert, wird der User zum Chat weitergeleitet. Andernfalls wird ein neuer Gruppenchat erstellt.
  // Überprüfen Sie, ob ein Gruppenchat existiert. Wenn er existiert, wird der Benutzer zum Chat weitergeleitet.
  // Andernfalls wird ein neuer Gruppenchat erstellt.
  async checkExistingChat(chatId: string, selectedContactUids: string[]) {
    try {
      const chatCollectionRef = collection(this.firestore, 'chats');
      const chatQuery = query(chatCollectionRef, where('chatId', '==', chatId));
      const querySnapshot = await getDocs(chatQuery);
      const chatExists = !querySnapshot.empty;

      if (chatExists) {
        console.log('Der Chat mit der ID', chatId, 'existiert bereits.');
      } else {
        const createdChatId = await this.chatDataService.createGroupChat(this.chatDataService.groupName, this.chatDataService.loggedUserId, selectedContactUids);
        console.log('Chat erstellt mit ID:', createdChatId);
        this.chatDataService.selectedContacts = [];
        this.showChatStatus(createdChatId);
      }
    } catch (error) {
      console.error('Fehler beim Verarbeiten des Chats:', error);
    }
  }

  //setzt die variablen auf true oder false, wenn eine Chat erstellt wurde. Dann wird die Erfolgsmeldung angezeigt.
  showChatStatus(createdChatId: string | null) {
    if (createdChatId) {
      this.showSuccessMessage = true;
      setTimeout(() => {
        this.showSuccessMessage = false;
        const chat = {
          groupName: this.chatDataService.groupName,
        };
        this.openChatDialog(chat);
        this.openChatDialog(chat);
      }, 3000);
    } else {
      this.showErrorMessage = true;
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 3000);
    }
  }

  // öffnet einen Chat.Ein Gruppenchat oder ein Einzelchat
  openChatDialog(chat: any) {
    this.chatService.openChatDialog(chat);
  }

  // fügt die ausgewählten kontakte zum chat hinzu
  addUserToChat(contact: any) {
    contact.isSelected = !contact.isSelected;
    if (contact.isSelected) {
      this.chatDataService.selectedContacts.push(contact);
    } else {
      const index = this.chatDataService.selectedContacts.findIndex(selectedContact => selectedContact.uid === contact.uid);
      if (index !== -1) {
        this.chatDataService.selectedContacts.splice(index, 1);
      }
    }
  }

  //lädt die usernamen für eine Liste von ausgewählten Kontakten im Chat und speichert sie im array chatUsernames
  async loadChatUsernames(selectedContactUids: string[]) {
    for (const contactUid of selectedContactUids) {
      const username = await this.chatDataService.loadUsernameViaUID(contactUid);
      this.chatDataService.chatUsernames[contactUid] = username;
    }
  }
}