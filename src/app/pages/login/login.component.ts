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

  async loginUser() {
    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(this.email, this.password);
      const userId = userCredential.user?.uid;
      
      if (userId) {
        await this.onlineStatusService.setOnlineStatus(userId, true);
        this.router.navigate(['/main-page']);
      }
    } catch (error) {
      console.error('Fehler beim Einloggen', error);
    }
  }  

  navigateToSignUp() {
    this.router.navigate(['/signup']);
  }

  toggleDarkMode() {
    const body = document.getElementsByTagName('body')[0];
    if (this.darkMode) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }
  }
}
