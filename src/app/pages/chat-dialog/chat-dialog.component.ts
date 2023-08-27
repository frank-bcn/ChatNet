import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ChatService } from 'src/app/service/chat-service.service';
import { ChatDataService } from 'src/app/service/chat-data.service';


@Component({
  selector: 'app-chat-dialog',
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.scss']
})
export class ChatDialogComponent implements OnInit {
  chat: any = { groupName: '' };
  groupName: string ='';
  loadedUsernames: { [uid: string]: string } = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private afAuth: AngularFireAuth,
    public chatService: ChatService,
    private chatDataService: ChatDataService
    
  ) {}

  ngOnInit() {
    this.chat = this.chatDataService.selectedChat;
  }
  

  async loadChatDataFromDatabase(chatId: string) {
    const chatData = await this.chatService.getChatData(chatId);
    
    if (chatData) {
      this.groupName = chatData['groupName'];
      console.log('Group Name:', this.groupName);
    }
  }

  goToMainPage() {
    this.router.navigate(['/main-page']);
  }

  sendMessage() {
    // Implement sending messages
  }
}