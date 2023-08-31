import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { OnlineStatusService } from 'src/app/service/online-status.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent {
  email: any;
  password: any;
  darkMode = false;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private onlineStatusService: OnlineStatusService
  ) {}

  // registiert den neuen user
  async loginUser() {
    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(this.email, this.password);
      const userId = userCredential.user?.uid;
      
      if (userId) {
        await this.onlineStatusService.updateUserOnlineStatus(userId, true);
        this.router.navigate(['/main-page']);
      }
    } catch (error) {
      console.error('Fehler beim Einloggen', error);
    }
  }  

  // naviegiert den user zur signup
  navigateToSignUp() {
    this.router.navigate(['/signup']);
  }
}
