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





const routes: Routes = [
  {  path: '', canActivate: [authGuard], component: LoginComponent }, // Automatically redirects
  { path: 'login', component: LoginComponent },
  { path: 'forget', component: ForgetPassComponent },
  { path: 'home', canActivate:[authOnlyGuardGuard], component: HomeComponent },
  { path: 'registerUser', component: RegisterComponent }, //,canActivate:[authOnlyGuardGuard]
  {path: 'reset-password',component: ResetPassComponent},
  { path: 'kanban', component: KanbanBoardComponent }, //j'ajoute prochainement canActivate: [authOnlyGuardGuard],
  { path: 'task/:id', component: TacheComponent }, //j'ajoute prochainement canActivate: [authOnlyGuardGuard],
  { path: 'discussion', canActivate:[authOnlyGuardGuard] , component: DiscussionComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'updateUser/:id', component: UpdateUserComponent },
  {path: 'reset-password',component: ResetPassComponent},
  {path: 'addUsers' , component:AddUsersComponent},
  {path: 'changePass', component: ChangepassComponent },
  {path:'changePhoto', component: ChangePDFComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
