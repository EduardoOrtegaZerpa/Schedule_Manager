import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { DegreesComponent } from './admin/degrees/degrees.component';
import { GroupsComponent } from './admin/groups/groups.component';
import { SubjectsComponent } from './admin/subjects/subjects.component';
import { AuthGuard } from './auth/auth.guard';
import { NotAvailableComponent } from './not-available/not-available.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'notAvailable', component: NotAvailableComponent},
    {path: 'admin', component: AdminComponent, children: [
        {path: 'degrees', component: DegreesComponent},
        {path: 'subjects', component: SubjectsComponent},
        {path: 'groups', component: GroupsComponent},
        {path: '', redirectTo: 'groups', pathMatch: 'full'}
    ]},
    {path: 'login', component: LoginComponent},
    { path: '**', component: NotAvailableComponent }
];
