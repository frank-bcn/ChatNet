import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from 'src/app/service/chat-service.service';

@Component({
  selector: 'app-chat-dialog',
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.scss']
})
export class ChatDialogComponent implements OnInit {
  chatId: string | undefined;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      console.log('All route parameters:', params);
      this.chatId = params['chatId'];
      console.log('Received chat ID:', this.chatId);
      
    });
  }

  goToMainPage() {
    this.router.navigate(['/main-page']);
  }

  sendMessage() {
    // Implement sending messages
  }
}