import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'impact-widget',
    standalone: true,
    imports: [CommonModule],
    template: `
        <section style="background: linear-gradient(135deg, #050c09 0%, #0a1f14 50%, #060e0a 100%); padding: 100px 0; border-top: 1px solid rgba(16,185,129,0.08); border-bottom: 1px solid rgba(16,185,129,0.08);">
            <div class="w-full px-8 lg:px-16">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-10 text-center">

                    <div class="flex flex-col items-center gap-3">
                        <div class="text-6xl font-black tracking-tighter" style="background: linear-gradient(135deg, #10b981, #6ee7b7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">2.01B</div>
                        <div class="text-sm font-bold uppercase tracking-widest" style="color: rgba(209,250,229,0.5);">Tons of municipal waste per year</div>
                        <p class="text-sm leading-relaxed" style="color: rgba(209,250,229,0.35);">Global production, rising every decade without intervention.</p>
                    </div>

                    <div class="flex flex-col items-center gap-3">
                        <div class="text-6xl font-black tracking-tighter" style="background: linear-gradient(135deg, #ef4444, #fca5a5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">33%</div>
                        <div class="text-sm font-bold uppercase tracking-widest" style="color: rgba(209,250,229,0.5);">Unsafely managed or openly burned</div>
                        <p class="text-sm leading-relaxed" style="color: rgba(209,250,229,0.35);">A third of all waste worldwide is dumped or incinerated without controls.</p>
                    </div>

                    <div class="flex flex-col items-center gap-3">
                        <div class="text-6xl font-black tracking-tighter" style="background: linear-gradient(135deg, #06b6d4, #67e8f9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">8M</div>
                        <div class="text-sm font-bold uppercase tracking-widest" style="color: rgba(209,250,229,0.5);">Tons of plastic enter our oceans yearly</div>
                        <p class="text-sm leading-relaxed" style="color: rgba(209,250,229,0.35);">Destroying marine life and coastal ecosystems across the globe.</p>
                    </div>

                    <div class="flex flex-col items-center gap-3">
                        <div class="text-6xl font-black tracking-tighter" style="background: linear-gradient(135deg, #f59e0b, #fde68a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">$2.5T</div>
                        <div class="text-sm font-bold uppercase tracking-widest" style="color: rgba(209,250,229,0.5);">Annual cost of poor waste management</div>
                        <p class="text-sm leading-relaxed" style="color: rgba(209,250,229,0.35);">In health, productivity, and environmental remediation worldwide.</p>
                    </div>
                </div>

                <!-- Divider with CTA -->
                <div class="mt-20 pt-12 flex flex-col md:flex-row items-center justify-between gap-8" style="border-top: 1px solid rgba(16,185,129,0.1);">
                    <div>
                        <p class="text-xl font-bold mb-1" style="color: #d1fae5;">SmartEcoWaste addresses this head-on.</p>
                        <p class="text-base text-balance" style="color: rgba(209,250,229,0.5);">Every report filed. Every bin monitored. Every point earned. It all adds up.</p>
                    </div>
                    <a href="/landing#live-map-section"
                       class="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base no-underline shrink-0 transition-all duration-300"
                       style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25); color: #34d399;"
                       onmouseover="this.style.background='rgba(16,185,129,0.2)'; this.style.borderColor='rgba(16,185,129,0.5)'"
                       onmouseout="this.style.background='rgba(16,185,129,0.1)'; this.style.borderColor='rgba(16,185,129,0.25)'">
                        See the live impact <i class="pi pi-arrow-right text-sm"></i>
                    </a>
                </div>
            </div>
        </section>
    `
})
export class ImpactWidget {}
