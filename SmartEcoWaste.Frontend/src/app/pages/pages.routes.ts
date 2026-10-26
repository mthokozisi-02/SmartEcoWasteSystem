import { Routes } from '@angular/router';
import { ReportBin } from './report-bin/report-bin';
import { CreateBin } from './create-bin/create-bin';
import { CreateUser } from './create-user/create-user';
import { SmartGuard } from '@/core/guards/smart.guard';
import { ManageUsers } from './manage-users/manage-users';
import { ManageReports } from './manage-reports/manage-reports';
import { ManageBins } from './manage-bins/manage-bins';
import { UserProfile } from './user-profile/user-profile';
import { ManageProperties } from './manage-properties/manage-properties';
import { ManageTasks } from './manage-tasks/manage-tasks';

export default [
    { path: 'report-bin', component: ReportBin },
    { path: 'manage-bins', component: ManageBins, canActivate: [SmartGuard], data: { role: ['Admin', 'Staff'] } },
    { path: 'manage-properties', component: ManageProperties, canActivate: [SmartGuard], data: { role: 'Admin' } },
    { path: 'manage-tasks', component: ManageTasks, canActivate: [SmartGuard] },
    { path: 'create-bin', component: CreateBin, canActivate: [SmartGuard], data: { role: 'Admin' } },
    { path: 'create-user', component: CreateUser, canActivate: [SmartGuard], data: { role: 'Admin' } },
    { path: 'manage-users', component: ManageUsers, canActivate: [SmartGuard], data: { role: 'Admin' } },
    { path: 'manage-reports', component: ManageReports, canActivate: [SmartGuard] },
    { path: 'profile', component: UserProfile, canActivate: [SmartGuard] },
    { path: '**', redirectTo: '/landing' }
] as Routes;
