// src/app/app.module.ts

import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import localeFr from '@angular/common/locales/fr';
import { registerLocaleData } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgetPassComponent } from './forget-pass/forget-pass.component';
import { ResetPassComponent } from './reset-pass/reset-pass.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ChangepassComponent } from './changepass/changepass.component';
import { CritereComponent } from './components/critere/critere.component';
import { SousCritereComponent } from './components/sous-critere/sous-critere.component';
import { NoteTgrpComponent } from './components/note-tgrp/note-tgrp.component';
import { NoteTindivComponent } from './components/note-tindiv/note-tindiv.component';
import { EvaluationComponent } from './components/evaluation/evaluation.component';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board.component';
import { TacheComponent } from './components/tache/tache.component';
import { SousTacheComponent } from './components/sous-tache/sous-tache.component';
import { GroupeComponent } from './components/groupe/groupe.component';
import { ChangePDFComponent } from './change-pdf/change-pdf.component';
import { AddUsersComponent } from './add-users/add-users.component';
import { UpdateUserComponent } from './update-user/update-user.component';
import { AdminComponent } from './admin/admin.component';
import { DiscussionComponent } from './discussion/discussion.component';
import { EvaluationsDetailsComponent } from './components/evaluations-details/evaluations-details.component';
import { CreateCritereComponent } from './components/create-critere/create-critere.component';
import { InstitutionManagementComponent } from './components/organisation/institution-management.component';
import { ChoixClasseGroupeComponent } from './components/etudiant/choix-classe-groupe.component';
import { FileSizePipe } from './pipes/file-size.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { JwtInterceptor } from './service/jwt.interceptor';
import { ClasseService } from './service/classe.service';

registerLocaleData(localeFr);

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
    EvaluationComponent,
    KanbanBoardComponent,
    TacheComponent,
    SousTacheComponent,
    GroupeComponent,
    ChangePDFComponent,
    AddUsersComponent,
    UpdateUserComponent,
    AdminComponent,
    DiscussionComponent,
    EvaluationsDetailsComponent,
    CreateCritereComponent,
    InstitutionManagementComponent,
    ChoixClasseGroupeComponent,
    FileSizePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    DragDropModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr' },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    ClasseService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}