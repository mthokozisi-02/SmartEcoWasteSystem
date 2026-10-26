import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'highlights-widget',
    standalone: true,
    imports: [CommonModule],
    template: `
        <section id="highlights" class="py-24 bg-slate-50/70 border-b border-slate-200/80 relative overflow-hidden">

            <!-- Wide Container: 1600px, Minimal Padding -->
            <div class="w-full px-4 sm:px-8 lg:px-12 max-w-[1600px] mx-auto relative z-10">

                <!-- Header -->
                <div class="text-center mb-16 flex flex-col items-center justify-center" data-aos="fade-up">
                    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 bg-emerald-100 border border-emerald-300 text-emerald-800 shadow-sm">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping"></span>
                        Segregation & Eco Standards
                    </div>
                    <h2 class="text-4xl sm:text-5xl lg:text-6xl font-black mb-5 leading-tight tracking-tight text-slate-900">
                        Know What To <br/>
                        <span class="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Sort, Recycle & Report</span>
                    </h2>
                    <p class="text-base sm:text-lg lg:text-xl max-w-3xl text-slate-600 leading-relaxed">
                        Correct source separation prevents batch contamination, lowers collection processing overhead, and guarantees maximum Eco-Points for citizens.
                    </p>
                </div>

                <!-- High-Resolution Visual Community Banner -->
                <div class="relative rounded-3xl overflow-hidden mb-14 shadow-2xl border border-slate-200 group"
                     data-aos="zoom-in" data-aos-duration="800">
                    <img src="images/eco-community.jpg" alt="Eco Community" class="w-full h-72 sm:h-88 object-cover object-center group-hover:scale-105 transition-transform duration-700" />
                    <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent"></div>
                    <div class="absolute inset-0 p-6 sm:p-12 flex flex-col justify-center text-white max-w-2xl">
                        <span class="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">Clean Environments, Zero Landfill</span>
                        <h3 class="text-2xl sm:text-4xl font-black leading-tight mb-3">Community-Led Waste Segregation</h3>
                        <p class="text-slate-200 text-sm sm:text-base leading-relaxed mb-6">Every clean container recycled and every prompt QR report keeps our shared spaces pristine and rewards community members with 100 Eco-Points.</p>
                        <div class="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm font-black text-emerald-200">
                            <span class="flex items-center gap-2 bg-emerald-950/70 px-4 py-2 rounded-xl border border-emerald-500/30 backdrop-blur-md">
                                <i class="pi pi-check-circle text-emerald-400"></i> +100 Eco-Points / Verified Report
                            </span>
                            <span class="flex items-center gap-2 bg-emerald-950/70 px-4 py-2 rounded-xl border border-emerald-500/30 backdrop-blur-md">
                                <i class="pi pi-camera text-emerald-400"></i> 100% Photographic Proof
                            </span>
                        </div>
                    </div>
                </div>

                <!-- DO / DON'T Comparison Grid -->
                <div class="grid grid-cols-12 gap-8 mb-14">

                    <!-- DO: Common Recyclables -->
                    <div class="col-span-12 lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white border border-emerald-300 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col gap-6"
                         data-aos="fade-right" data-aos-duration="800">
                        <div class="flex items-center gap-4">
                            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                                <i class="fa-solid fa-check"></i>
                            </div>
                            <div>
                                <h3 class="text-2xl font-black text-slate-900">Acceptable Recyclables (DO)</h3>
                                <p class="text-xs text-slate-500 font-medium">Deposit these items in SmartEco recycling stations</p>
                            </div>
                        </div>

                        <div class="flex flex-col gap-3.5">
                            <div *ngFor="let item of recyclables"
                                 class="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 hover:bg-emerald-100/60 transition-colors">
                                <span class="text-2xl shrink-0 mt-0.5 text-emerald-600"><i [class]="item.icon"></i></span>
                                <div>
                                    <div class="text-sm font-black text-slate-900 mb-0.5">{{ item.name }}</div>
                                    <div class="text-xs text-slate-600 leading-relaxed font-medium">{{ item.desc }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- DON'T: Non-Recyclables -->
                    <div class="col-span-12 lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white border border-rose-300 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col gap-6"
                         data-aos="fade-left" data-aos-duration="800">
                        <div class="flex items-center gap-4">
                            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 bg-rose-600 text-white shadow-lg shadow-rose-600/30">
                                <i class="fa-solid fa-xmark"></i>
                            </div>
                            <div>
                                <h3 class="text-2xl font-black text-slate-900">Contaminants & Trash (DON'T)</h3>
                                <p class="text-xs text-slate-500 font-medium">Do NOT place these inside standard recycling bins</p>
                            </div>
                        </div>

                        <div class="flex flex-col gap-3.5">
                            <div *ngFor="let item of nonRecyclables"
                                 class="flex items-start gap-4 p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 hover:bg-rose-100/60 transition-colors">
                                <span class="text-2xl shrink-0 mt-0.5 text-rose-600"><i [class]="item.icon"></i></span>
                                <div>
                                    <div class="text-sm font-black text-slate-900 mb-0.5">{{ item.name }}</div>
                                    <div class="text-xs text-slate-600 leading-relaxed font-medium">{{ item.desc }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pro Tips Row -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div *ngFor="let tip of tips; let i = index"
                         class="flex items-start gap-4 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                         data-aos="fade-up" [attr.data-aos-delay]="(i * 100) + 100">
                        <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <i [class]="tip.icon"></i>
                        </div>
                        <div>
                            <div class="text-sm font-black text-slate-900 mb-1">{{ tip.title }}</div>
                            <div class="text-xs text-slate-600 leading-relaxed font-medium">{{ tip.desc }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `
})
export class HighlightsWidget {
    recyclables = [
        { icon: 'fa-solid fa-bottle-water', name: 'Plastic Bottles & Containers (PET #1, HDPE #2)', desc: 'Water bottles, beverage containers, milk jugs, detergent containers — rinsed clean.' },
        { icon: 'fa-solid fa-box-open', name: 'Clean Paper & Cardboard', desc: 'Flattened shipping boxes, newspapers, clean paper packaging without food grease.' },
        { icon: 'fa-solid fa-trash-can', name: 'Aluminium & Metal Cans', desc: 'Beverage cans, clean tins, rinsed aluminium foil containers.' },
        { icon: 'fa-solid fa-prescription-bottle', name: 'Glass Bottles & Jars', desc: 'Clear and amber glass food jars and beverage bottles with lids removed.' },
    ];

    nonRecyclables = [
        { icon: 'fa-solid fa-pizza-slice', name: 'Food-Contaminated Packaging', desc: 'Greasy pizza boxes, stained paper containers, takeaway boxes with food remnants.' },
        { icon: 'fa-solid fa-bag-shopping', name: 'Soft Plastics & Carrier Bags', desc: 'Plastic grocery bags, cling film, shrink wrap, and snack chip wrappers.' },
        { icon: 'fa-solid fa-battery-quarter', name: 'Batteries & Hazardous E-Waste', desc: 'Lithium batteries, mobile devices, fluorescent tubes — use certified e-waste points.' },
        { icon: 'fa-solid fa-mug-hot', name: 'Mixed-Material Packaging', desc: 'Wax-lined coffee cups, multi-layer foil/plastic drink cartons, contaminated composites.' },
    ];

    tips = [
        { icon: 'fa-solid fa-shower', title: 'Always Rinse Containers', desc: 'Food residue contaminates batches. A quick rinse ensures materials can be processed.' },
        { icon: 'fa-solid fa-box', title: 'Flatten Cardboard Boxes', desc: 'Flattening boxes optimizes smart bin fill volume and reduces overflow frequency.' },
        { icon: 'fa-solid fa-circle-question', title: 'Report Overflow Promptly', desc: 'Notice a full bin? Scan the QR code to dispatch collection and earn 100 Eco-Points.' },
    ];
}
