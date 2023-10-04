import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from 'src/environments/environment';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { RegisterSuccessDialogComponent } from 'src/app/pages/sign-up/register-success-dialog/register-success-dialog.component';
import { LoginComponent } from 'src/app/pages/login/login.component';
import { SignUpComponent } from 'src/app/pages/sign-up/sign-up.component';
import { MainPageComponent } from 'src/app/pages/main-page/main-page.component';
import { HeaderComponent } from 'src/app/pages/header/header.component';
import { ProfileComponent } from 'src/app/pages/profile/profile.component';
import { ChatDialogComponent } from 'src/app/pages/chat-dialog/chat-dialog.component';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { ContactlistComponent } from './pages/contactlist/contactlist.component';
import { ChatsComponent } from './pages/chats/chats.component';
import { GroupChatComponent } from './pages/group-chat/group-chat.component';
import { DesignComponent } from './pages/design/design.component';



@NgModule({
  declarations: [
    AppComponent,
    RegisterSuccessDialogComponent,
    LoginComponent,
    SignUpComponent,
    MainPageComponent,
    HeaderComponent,
    ProfileComponent,  
    ChatDialogComponent,
    ContactlistComponent,
    ChatsComponent,
    GroupChatComponent,
    DesignComponent,
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MatDialogModule,
    AngularFireModule,
    AngularFireAuthModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    
  ],
  providers: [{ provide: FIREBASE_OPTIONS, useValue: environment.firebase }],
  bootstrap: [AppComponent]
})
export class AppModule { }
