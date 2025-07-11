import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { authGuard } from './Auth/auth.guard';
import { authOnlyGuardGuard } from './Auth/auth-only-guard.guard';
import { ForgetPassComponent } from './forget-pass/forget-pass.component';
import { ResetPassComponent } from './reset-pass/reset-pass.component';
import { TacheComponent } from './components/tache/tache.component';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board.component';
import { AddUsersComponent } from './add-users/add-users.component';
import { AdminComponent } from './admin/admin.component';
import { DiscussionComponent } from './discussion/discussion.component';
import { UpdateUserComponent } from './update-user/update-user.component';
import { ChangepassComponent } from './changepass/changepass.component';
import { ChangePDFComponent } from './change-pdf/change-pdf.component';

import { RepositoryComponent } from './repository/repository.component';
import { PostComponent } from './post/post.component';
import { PostDetailComponent } from './post-detail/post-detail.component';

import { EvaluationComponent } from './components/evaluation/evaluation.component';
import { CritereComponent } from './components/critere/critere.component';
import { EvaluationsDetailsComponent } from './components/evaluations-details/evaluations-details.component';
import { CreateCritereComponent } from './components/create-critere/create-critere.component';
import { QrCodeComponent } from './qr-code/qr-code.component';
import { CreateEvaluationComponent } from './components/create-evaluation/create-evaluation.component';






const routes: Routes = [
  {  path: '', canActivate: [authGuard], component: LoginComponent }, // Automatically redirects
  { path: 'login', component: LoginComponent },
  { path: 'forget', component: ForgetPassComponent },
  { path: 'home', canActivate:[authOnlyGuardGuard], component: HomeComponent },
  { path: 'registerUser', component: RegisterComponent }, //,canActivate:[authOnlyGuardGuard]
  {path: 'reset-password',component: ResetPassComponent},
  { path: 'kanban', component: KanbanBoardComponent }, //j'ajoute prochainement canActivate: [authOnlyGuardGuard],
  { path: 'task/:id', component: TacheComponent }, //j'ajoute prochainement canActivate: [authOnlyGuardGuard],
  { path: 'discussion' , component: DiscussionComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'updateUser/:id', component: UpdateUserComponent },
  {path: 'reset-password',component: ResetPassComponent},
  {path: 'addUsers' , component:AddUsersComponent},
  {path: 'changePass', component: ChangepassComponent },
  {path:'changePhoto', component: ChangePDFComponent},
  {path:'repo', component: RepositoryComponent},
  {path:'repository', component: RepositoryComponent},
  { path: 'post', component: PostComponent },
  { path: 'post/:id', component: PostDetailComponent },
  {path:'evaluation', component: EvaluationComponent},
  {path:'criteres', component:CritereComponent},
  {path: 'evalDetails', component:EvaluationsDetailsComponent},
  {path: 'createCritere', component:CreateCritereComponent},
  {path: 'qrCode', component:QrCodeComponent},
  {path: 'createEvaluation', component:CreateEvaluationComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
