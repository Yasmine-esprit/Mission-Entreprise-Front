import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { authGuard } from './Auth/auth.guard';
import { authOnlyGuardGuard } from './Auth/auth-only-guard.guard';
import { ForgetPassComponent } from './forget-pass/forget-pass.component';
import { ResetPassComponent } from './reset-pass/reset-pass.component';
import {TacheComponent} from "./components/tache/tache.component";
import {KanbanBoardComponent} from "./components/kanban-board/kanban-board.component";
import { LevelComponent } from './components/levels/level.component';


const routes: Routes = [
  {  path: '', canActivate: [authGuard], component: LoginComponent }, // Automatically redirects
  { path: 'login', component: LoginComponent },
  { path: 'forget', component: ForgetPassComponent },
  { path: 'home', canActivate:[authOnlyGuardGuard], component: HomeComponent },
  { path: 'registerUser', component: RegisterComponent }, //,canActivate:[authOnlyGuardGuard]
  {path: 'reset-password',component: ResetPassComponent},
  { path: 'kanban', component: KanbanBoardComponent }, //j'ajoute prochainement canActivate: [authOnlyGuardGuard],
  { path: 'tache/:id', component: TacheComponent }, //j'ajoute prochainement canActivate: [authOnlyGuardGuard],
  { path: 'levels', component: LevelComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
