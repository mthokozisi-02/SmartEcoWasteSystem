import { AppFloatingConfigurator } from '@/layout/component/app.floatingconfigurator';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-report-bin',
    imports: [AppFloatingConfigurator, ButtonModule, RouterLink],
    templateUrl: './report-bin.html',
    styleUrl: './report-bin.scss'
})
export class ReportBin {}
