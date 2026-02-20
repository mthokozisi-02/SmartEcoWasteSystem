import { Routes } from '@angular/router';
import { ReportBin } from './report-bin/report-bin';
import { ViewBins } from './view-bins/view-bins';
import { CreateBin } from './create-bin/create-bin';
import { CreateUser } from './create-user/create-user';
import { SmartGuard } from '@/core/guards/smart.guard';
import { ManageUsers } from './manage-users/manage-users';
import { ManageReports } from './manage-reports/manage-reports';
import { ManageBins } from './manage-bins/manage-bins';
import { UserProfile } from './user-profile/user-profile';
import { Signup } from './auth/signup';

export default [
    { path: 'report-bin', component: ReportBin },
    { path: 'manage-bins', component: ManageBins, canActivate: [SmartGuard], data: { role: 'Admin' } },
    { path: 'create-bin', component: CreateBin },
    { path: 'create-user', component: CreateUser },
    { path: 'manage-users', component: ManageUsers },
    { path: 'manage-reports', component: ManageReports },
    { path: 'profile', component: UserProfile },
    { path: '**', redirectTo: '/auth/login' }
] as Routes;
