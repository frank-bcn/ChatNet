import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ChatDataService } from 'src/app/service/chat-data.service';


@Injectable({
  providedIn: 'root',
})

export class ChatService {

  smileys: string[] = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',

  ];

  constructor(
    private router: Router,
    public chatDataService: ChatDataService

  ) { }

  //Öffnet ein Chat-Dialog, indem sie die relevanten Informationen über den ausgewählten Chat und die ausgewählten user an die Chat-Dialog-Seite weitergibt.
  openChatDialog(chat: any) {
    if (chat) {
      this.chatDataService.currentChatDetails = {};
      this.chatDataService.currentChatDetails = { ...chat };
      this.router.navigate(['/chat-dialog', chat.groupName], { state: { selectedContacts: this.chatDataService.selectedContacts } });
    }
  }
}    