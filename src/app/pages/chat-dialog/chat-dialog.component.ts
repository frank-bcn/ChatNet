import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ChatService } from 'src/app/service/chat-service.service';
import { ChatDataService } from 'src/app/service/chat-data.service';

@Component({
  selector: 'app-chat-dialog',
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.scss']
})
export class ChatDialogComponent implements OnInit {
  chat: any = {};
  chatUsernames: { [uid: string]: string } = {};
  isDropdownOpen: boolean = false;
  hasManySelectedContacts(): boolean {
    return this.chat.selectedContacts && this.chat.selectedContacts.length > 3;
  }

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    public chatService: ChatService,
    public chatDataService: ChatDataService,
  ) { }

  async ngOnInit() {
    this.afAuth.authState.subscribe(async (user) => {
      if (user) {
        const selectedChat = this.chatDataService.currentChatDetails;
        this.chat = selectedChat ? { ...selectedChat } : {};
        this.chatDataService.setAdminUid(this.chat.admin);
        if (this.chat.selectedContacts) {
          for (const contactUid of this.chat.selectedContacts) {
            const username = await this.chatDataService.loadUsernameViaUID(contactUid);
            this.chatDataService.chatUsernames[contactUid] = username;
          }
        }
      }
    });
  }

//dient dazu, zu überprüfen, ob ein bestimmter User der Administrator eines Chats ist.
  isAdmin(contactUid: string): boolean {
    return contactUid === this.chatDataService.admin;
  }

  // navigiert zur mainPaige
  goToMainPage() {
    this.chatDataService.groupName = '';
    this.router.navigate(['/chats']);
  }

  // öffnet das menu
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    const button = document.querySelector('.menuButton');
    if (button) {
      button.classList.toggle('open', this.isDropdownOpen);
    }
  }

  // schließt das menu
  closeDropdown() {
    this.isDropdownOpen = false;
  }

  sendMessage() {

  }
}