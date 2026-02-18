import { Routes } from '@angular/router';
import { ReportBin } from './report-bin/report-bin';
import { ViewBins } from './view-bins/view-bins';
import { CreateBin } from './create-bin/create-bin';
import { CreateUser } from './create-user/create-user';
import { SmartGuard } from '@/core/guards/smart.guard';
import { ManageUsers } from './manage-users/manage-users';
import { ManageReports } from './manage-reports/manage-reports';

export default [
    { path: 'report-bin', component: ReportBin },
    { path: 'view-bins', component: ViewBins, canActivate: [SmartGuard], data: { role: 'Admin' } },
    { path: 'create-bin', component: CreateBin },
    { path: 'create-user', component: CreateUser },
    { path: 'manage-users', component: ManageUsers },
    { path: 'manage-reports', component: ManageReports },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
