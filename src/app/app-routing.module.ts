import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { authGuard } from './Auth/auth.guard';
import { authOnlyGuardGuard } from './Auth/auth-only-guard.guard';
import { ForgetPassComponent } from './forget-pass/forget-pass.component';
import { ResetPassComponent } from './reset-pass/reset-pass.component';
import { DiscussionComponent } from './discussion/discussion.component';
import { AdminComponent } from './admin/admin.component';



const routes: Routes = [
  {  path: '', canActivate: [authGuard], component: LoginComponent }, // Automatically redirects
  { path: 'login', component: LoginComponent },
  { path: 'forget', component: ForgetPassComponent },
  { path: 'home', canActivate:[authOnlyGuardGuard], component: HomeComponent },
  { path: 'registerUser', canActivate:[authOnlyGuardGuard] , component: RegisterComponent }, 
  { path: 'discussion', canActivate:[authOnlyGuardGuard] , component: DiscussionComponent },
  { path: 'admin', canActivate:[authOnlyGuardGuard] , component: AdminComponent },
  {path: 'reset-password',component: ResetPassComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
