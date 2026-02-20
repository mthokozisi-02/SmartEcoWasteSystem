import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'footer-widget',
    imports: [RouterModule],
    template: `
        <div class="py-2 px-12 mx-0 mt-2 lg:mx-20">
            <div class="grid grid-cols-12 gap-4">
                <div class="flex justify-center col-span-12">
                    <a (click)="router.navigate(['/landing'], { fragment: 'home' })" class="flex flex-wrap items-center justify-center md:justify-start md:mb-0 mb-6 cursor-pointer">
                        <span class="text-5xl">♻️</span>
                        <h4 class="font-medium text-3xl text-surface-900 dark:text-surface-0">Smart Eco-Waste System</h4>
                    </a>
                </div>
            </div>
        </div>
    `
})
export class FooterWidget {
    constructor(public router: Router) {}
}
