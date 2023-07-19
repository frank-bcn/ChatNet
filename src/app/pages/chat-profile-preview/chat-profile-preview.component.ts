import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-profile-preview',
  templateUrl: './chat-profile-preview.component.html',
  styleUrls: ['./chat-profile-preview.component.scss']
})
export class ChatProfilePreviewComponent {

  constructor(private router: Router) { }

  openChatDialog() {
    this.router.navigate(['/chat-dialog']);
  }

}
