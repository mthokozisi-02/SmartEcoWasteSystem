import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TopbarWidget } from './components/topbarwidget.component';
import { HeroWidget } from './components/herowidget';
import { FeaturesWidget } from './components/featureswidget';
import { ImpactWidget } from './components/impactwidget';
import { LiveMapWidget } from './components/livemapwidget';
import { RoadmapWidget } from './components/roadmapwidget';
import { HighlightsWidget } from './components/highlightswidget';
import { FooterWidget } from './components/footerwidget';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [
        RouterModule,
        TopbarWidget,
        HeroWidget,
        FeaturesWidget,
        ImpactWidget,
        LiveMapWidget,
        RoadmapWidget,
        HighlightsWidget,
        FooterWidget,
    ],
    template: `
        <div style="background: #050c09; min-height: 100vh;">
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
export class Landing {}
