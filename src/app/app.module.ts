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
import { RegisterSuccessDialogComponent } from 'src/app/pages/register-success-dialog/register-success-dialog.component';
import { LoginComponent } from 'src/app/pages/login/login.component';
import { SignUpComponent } from 'src/app/pages/sign-up/sign-up.component';
import { MainPageComponent } from 'src/app/pages/main-page/main-page.component';
import { HeaderComponent } from 'src/app/pages/header/header.component';
import { ProfileComponent } from 'src/app/pages/profile/profile.component';
import { ChatProfilePreviewComponent } from 'src/app/pages/chat-profile-preview/chat-profile-preview.component';
import { ChatDialogComponent } from 'src/app/pages/chat-dialog/chat-dialog.component';



@NgModule({
  declarations: [
    AppComponent,
    RegisterSuccessDialogComponent,
    LoginComponent,
    SignUpComponent,
    MainPageComponent,
    HeaderComponent,
    ProfileComponent,
    ChatProfilePreviewComponent,
    ChatDialogComponent,
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MatDialogModule,

    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
