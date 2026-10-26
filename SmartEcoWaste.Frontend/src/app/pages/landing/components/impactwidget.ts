import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'impact-widget',
    standalone: true,
    imports: [CommonModule],
    template: `
        <section class="py-20 bg-slate-50/70 border-b border-slate-200/80 relative overflow-hidden">

            <!-- Subtle Grid Accent -->
            <div class="absolute inset-0 pointer-events-none opacity-40" style="background-image: radial-gradient(rgba(16,185,129,0.12) 1px, transparent 1px); background-size: 28px 28px;"></div>

            <!-- Wide Container: 1600px, Minimal Padding -->
            <div class="w-full px-4 sm:px-8 lg:px-12 max-w-[1600px] mx-auto relative z-10">

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center mb-12">

                    <!-- Metric 1 -->
                    <div class="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-2xl hover:border-emerald-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center gap-3 group"
                         data-aos="fade-up" data-aos-delay="100">
                        <div class="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-xs">
                            <i class="fa-solid fa-earth-americas"></i>
                        </div>
                        <div class="text-5xl sm:text-6xl font-black tracking-tight text-emerald-600">2.01B</div>
                        <div class="text-xs font-black uppercase tracking-widest text-slate-900">Tons Municipal Waste / Year</div>
                        <p class="text-xs text-slate-600 leading-relaxed">Global production escalating without intelligent monitoring and multi-stakeholder intervention.</p>
                    </div>

                    <!-- Metric 2 -->
                    <div class="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-2xl hover:border-rose-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center gap-3 group"
                         data-aos="fade-up" data-aos-delay="200">
                        <div class="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-2xl font-bold group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shadow-xs">
                            <i class="fa-solid fa-fire-flame-curved"></i>
                        </div>
                        <div class="text-5xl sm:text-6xl font-black tracking-tight text-rose-600">33%</div>
                        <div class="text-xs font-black uppercase tracking-widest text-slate-900">Unsafely Dumped or Burned</div>
                        <p class="text-xs text-slate-600 leading-relaxed">A third of municipal waste is uncollected or openly burned without environmental controls.</p>
                    </div>

                    <!-- Metric 3 -->
                    <div class="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-2xl hover:border-teal-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center gap-3 group"
                         data-aos="fade-up" data-aos-delay="300">
                        <div class="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center text-2xl font-bold group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 shadow-xs">
                            <i class="fa-solid fa-camera"></i>
                        </div>
                        <div class="text-5xl sm:text-6xl font-black tracking-tight text-teal-600">100%</div>
                        <div class="text-xs font-black uppercase tracking-widest text-slate-900">Camera Photo Proof Audit</div>
                        <p class="text-xs text-slate-600 leading-relaxed">Every collection task is verified with live camera photo evidence before supervisory sign-off.</p>
                    </div>

                    <!-- Metric 4 -->
                    <div class="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-2xl hover:border-amber-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center gap-3 group"
                         data-aos="fade-up" data-aos-delay="400">
                        <div class="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl font-bold group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-xs">
                            <i class="fa-solid fa-star"></i>
                        </div>
                        <div class="text-5xl sm:text-6xl font-black tracking-tight text-amber-600">100 Pts</div>
                        <div class="text-xs font-black uppercase tracking-widest text-slate-900">Citizen Eco-Points Engine</div>
                        <p class="text-xs text-slate-600 leading-relaxed">Gamified reward engine awarding 100 Eco-Points for each verified community report.</p>
                    </div>
                </div>

                <!-- ROI Banner in Clean Unified Style -->
                <div class="p-6 sm:p-8 rounded-3xl bg-white border border-emerald-300/80 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
                     data-aos="zoom-in" data-aos-delay="200">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-emerald-600/30 shrink-0">
                            <i class="fa-solid fa-leaf"></i>
                        </div>
                        <div>
                            <h4 class="text-xl font-black text-slate-900">Measurable Operational & Ecological ROI</h4>
                            <p class="text-sm text-slate-600">Commercial properties eliminate dumpster overflow complaints; municipal truck routes save up to 38% in fleet fuel consumption.</p>
                        </div>
                    </div>
                    <a href="/landing#live-map-section"
                       class="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-black text-sm bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-600 hover:text-white hover:scale-105 transition-all duration-300 shrink-0 no-underline shadow-xs">
                        <span>Explore Real-Time Map</span>
                        <i class="pi pi-arrow-right text-xs"></i>
                    </a>
                </div>

            </div>
        </section>
    `
})
export class ImpactWidget {}
