import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RegisterComponent } from './register/register.component';

import { ForgetPassComponent } from './forget-pass/forget-pass.component';
import { ResetPassComponent } from './reset-pass/reset-pass.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ChangepassComponent } from './changepass/changepass.component';
import { CritereComponent } from './components/critere/critere.component';
import { SousCritereComponent } from './components/sous-critere/sous-critere.component';
import { NoteTgrpComponent } from './components/note-tgrp/note-tgrp.component';
import { NoteTindivComponent } from './components/note-tindiv/note-tindiv.component';
import { GrilleEvaluationComponent } from './components/grille-evaluation/grille-evaluation.component';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,

    ForgetPassComponent,
      ResetPassComponent,
      NavbarComponent,
      ChangepassComponent,
      CritereComponent,
      SousCritereComponent,
      NoteTgrpComponent,
      NoteTindivComponent,
      GrilleEvaluationComponent,


  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
