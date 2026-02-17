import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { ReportBin } from './report-bin/report-bin';
import { ViewBins } from './view-bins/view-bins';
import { CreateBin } from './create-bin/create-bin';
import { CreateUser } from './create-user/create-user';
import { SmartGuard } from '@/core/guards/smart.guard';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'report-bin', component: ReportBin },
    { path: 'view-bins', component: ViewBins, canActivate: [SmartGuard], data: { role: 'User' } },
    { path: 'create-bin', component: CreateBin },
    { path: 'create-user', component: CreateUser },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
