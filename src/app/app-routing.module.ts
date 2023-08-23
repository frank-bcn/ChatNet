import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from 'src/app/pages/login/login.component';
import { SignUpComponent } from 'src/app/pages/sign-up/sign-up.component';
import { MainPageComponent } from 'src/app/pages/main-page/main-page.component';
import { ProfileComponent } from 'src/app/pages/profile/profile.component';
import { ChatDialogComponent } from 'src/app/pages/chat-dialog/chat-dialog.component';
import { ContactlistComponent } from 'src/app/pages/contactlist/contactlist.component';
import { ChatsComponent } from 'src/app/pages/chats/chats.component';
import { GroupChatComponent } from 'src/app/pages/group-chat/group-chat.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'main-page', component: MainPageComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'chat-dialog/:chatId', component: ChatDialogComponent },
  { path: 'contactlist', component: ContactlistComponent },
  { path: 'chats', component: ChatsComponent },
  { path: 'group', component: GroupChatComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }