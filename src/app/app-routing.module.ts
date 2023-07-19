import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from 'src/app/pages/login/login.component';
import { SignUpComponent } from 'src/app/pages/sign-up/sign-up.component';
import { MainPageComponent } from 'src/app/pages/main-page/main-page.component';
import { ProfileComponent } from 'src/app/pages/profile/profile.component';
import { ChatDialogComponent } from 'src/app/pages/chat-dialog/chat-dialog.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'main-page', component: MainPageComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'chat-dialog', component: ChatDialogComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }