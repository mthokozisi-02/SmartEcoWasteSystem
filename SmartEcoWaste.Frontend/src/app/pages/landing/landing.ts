import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TopbarWidget } from './components/topbarwidget.component';
import { HeroWidget } from './components/herowidget';
import { FeaturesWidget } from './components/featureswidget';
import { ImpactWidget } from './components/impactwidget';
import { LiveMapWidget } from './components/livemapwidget';
import { RoadmapWidget } from './components/roadmapwidget';
import { HighlightsWidget } from './components/highlightswidget';
import { FooterWidget } from './components/footerwidget';
import * as AOS from 'aos';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [
        RouterModule,
        TopbarWidget,
        HeroWidget,
        ImpactWidget,
        FeaturesWidget,
        LiveMapWidget,
        RoadmapWidget,
        HighlightsWidget,
        FooterWidget,
    ],
    template: `
        <div class="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
            <div id="home">
                <topbar-widget />
                <hero-widget />
                <impact-widget />
                <features-widget />
                <live-map-widget />
                <roadmap-widget />
                <highlights-widget />
                <footer-widget />
            </div>
        </div>
    `
})
export class Landing implements OnInit, AfterViewInit {
    ngOnInit() {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: false,
            mirror: true,
            offset: 40
        });
    }

    ngAfterViewInit() {
        setTimeout(() => {
            AOS.refresh();
        }, 300);
    }
}
