import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RegisterComponent } from './register/register.component';

import { ForgetPassComponent } from './forget-pass/forget-pass.component';
import { ResetPassComponent } from './reset-pass/reset-pass.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ChangepassComponent } from './changepass/changepass.component';
import { CritereComponent } from './components/critere/critere.component';
import { SousCritereComponent } from './components/sous-critere/sous-critere.component';
import { NoteTgrpComponent } from './components/note-tgrp/note-tgrp.component';
import { GrilleEvaluationComponent } from './components/grille-evaluation/grille-evaluation.component';
import { NoteTindivComponent } from './components/note-tindiv/note-tindiv.component';
import { DiscussionComponent } from './discussion/discussion.component';
import { AdminComponent } from './admin/admin.component';
import { UpdateUserComponent } from './update-user/update-user.component';
import { AddUsersComponent } from './add-users/add-users.component';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board.component';
import { TacheComponent } from './components/tache/tache.component';
import { ChangePDFComponent } from './change-pdf/change-pdf.component';
import { ImageCropperModule } from 'ngx-img-cropper';




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
    DiscussionComponent,
    AdminComponent,
    UpdateUserComponent,
    AddUsersComponent,
    KanbanBoardComponent,
    TacheComponent,
    ChangePDFComponent
    
 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    DragDropModule,
    ReactiveFormsModule,
    ImageCropperModule
    

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
