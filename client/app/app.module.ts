import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { SigninComponent } from './signin/signin.component';
import { ChatComponent } from './chat/chat.component';
import { RouterModule, Routes, Router } from '@angular/router';

const appRoutes :Routes =[
    { path: 'login', component: SigninComponent},
    { path: 'chatting', component: ChatComponent},
    { path: '', component: SigninComponent}
    
];


@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    ChatComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

