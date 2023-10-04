import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore } from '@angular/fire/firestore';
import { ChatDataService } from 'src/app/service/chat-data.service';
import { ChangeBackgroundService  } from 'src/app/service/change-background.service';

@Component({
  selector: 'app-design',
  templateUrl: './design.component.html',
  styleUrls: ['./design.component.scss']
})
export class DesignComponent {

  backgroundColor: string = '';
  isDropdownOpen: boolean = false;



  constructor(
    public chatDataService: ChatDataService,
    public changeBackgroundService: ChangeBackgroundService,
    private router: Router,
    private afAuth: AngularFireAuth, 
    private firestore: Firestore) {
      
    }

    // navigiert zur mainpaige
  goToMainPage() {
    this.router.navigate(['/main-page']);
  }

   // Function to change the background color
   changeBackgroundColor(color: string) {
    this.backgroundColor = color;
    this.changeBackgroundService.setBackgroundColor(color); // Update the background color service
  }

  // öffnet das menu
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    let button = document.querySelector('.menuButton');
    if (button) {
      button.classList.toggle('open', this.isDropdownOpen);
    }
  }
}
