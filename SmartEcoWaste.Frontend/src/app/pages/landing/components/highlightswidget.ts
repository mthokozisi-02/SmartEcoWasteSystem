import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'highlights-widget',
    standalone: true,
    imports: [CommonModule],
    template: `
        <section id="highlights" style="background: #060e0a; padding: 100px 0; border-top: 1px solid rgba(16,185,129,0.08);">
            <div class="w-full px-8 lg:px-16">

                <!-- Header -->
                <div class="text-center mb-16 flex flex-col items-center justify-center" style="text-align: center !important;">
                    <div class="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                         style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: #34d399; display: inline-block; margin: 0 auto 1rem auto; text-align: center !important;">
                        Recycling Guide
                    </div>
                    <h2 class="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-5 leading-tight tracking-tight" style="color: #f0fdf4; text-align: center !important; width: 100%;">
                        Know what to <span style="background: linear-gradient(90deg, #10b981, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">recycle</span>
                    </h2>
                    <p class="text-lg md:text-2xl max-w-3xl" style="color: rgba(209,250,229,0.55); text-align: center !important; margin: 0 auto; width: 100%; line-height: 1.6;">
                        Correct sorting prevents contamination and ensures materials are actually processed — not landfilled.
                    </p>
                </div>

                <!-- DO / DON'T Grid -->
                <div class="grid grid-cols-12 gap-6 mb-12">

                    <!-- DO -->
                    <div class="col-span-12 lg:col-span-6 p-8 rounded-3xl flex flex-col gap-6"
                         style="background: #0d1f17; border: 1px solid rgba(16,185,129,0.15);">
                        <div class="flex items-center gap-3.5">
                            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black shrink-0"
                                 style="background: #10b981; color: white; box-shadow: 0 4px 16px rgba(16,185,129,0.4);"><i class="fa-solid fa-check"></i></div>
                            <div>
                                <h3 class="text-xl font-bold" style="color: #f0fdf4;">Common Recyclables</h3>
                                <p class="text-base" style="color: rgba(209,250,229,0.45);">Place these in the smart recycling bins</p>
                            </div>
                        </div>

                        <div class="flex flex-col gap-3.5">
                            <div *ngFor="let item of recyclables"
                                 class="flex items-start gap-4 p-4 rounded-2xl transition-all duration-200"
                                 style="background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.1);"
                                 onmouseover="this.style.background='rgba(16,185,129,0.09)'; this.style.borderColor='rgba(16,185,129,0.22)'"
                                 onmouseout="this.style.background='rgba(16,185,129,0.05)'; this.style.borderColor='rgba(16,185,129,0.1)'">
                                <span class="text-2xl shrink-0 mt-0.5" style="color: #10b981;"><i [class]="item.icon"></i></span>
                                <div>
                                    <div class="text-base font-semibold mb-0.5" style="color: #d1fae5;">{{ item.name }}</div>
                                    <div class="text-base leading-relaxed" style="color: rgba(209,250,229,0.45);">{{ item.desc }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- DON'T -->
                    <div class="col-span-12 lg:col-span-6 p-8 rounded-3xl flex flex-col gap-6"
                         style="background: #1a0909; border: 1px solid rgba(239,68,68,0.15);">
                        <div class="flex items-center gap-3.5">
                            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black shrink-0"
                                 style="background: #ef4444; color: white; box-shadow: 0 4px 16px rgba(239,68,68,0.4);"><i class="fa-solid fa-xmark"></i></div>
                            <div>
                                <h3 class="text-xl font-bold" style="color: #f0fdf4;">Non-Recyclables</h3>
                                <p class="text-base" style="color: rgba(209,250,229,0.45);">Do NOT place these in recycling bins</p>
                            </div>
                        </div>

                        <div class="flex flex-col gap-3.5">
                            <div *ngFor="let item of nonRecyclables"
                                 class="flex items-start gap-4 p-4 rounded-2xl transition-all duration-200"
                                 style="background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.1);"
                                 onmouseover="this.style.background='rgba(239,68,68,0.09)'; this.style.borderColor='rgba(239,68,68,0.22)'"
                                 onmouseout="this.style.background='rgba(239,68,68,0.05)'; this.style.borderColor='rgba(239,68,68,0.1)'">
                                <span class="text-2xl shrink-0 mt-0.5" style="color: #ef4444;"><i [class]="item.icon"></i></span>
                                <div>
                                    <div class="text-base font-semibold mb-0.5" style="color: #fca5a5;">{{ item.name }}</div>
                                    <div class="text-base leading-relaxed" style="color: rgba(209,250,229,0.45);">{{ item.desc }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pro Tips Row -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div *ngFor="let tip of tips" class="flex items-start gap-4.5 p-5 rounded-2xl transition-all duration-200"
                         style="background: rgba(255,255,255,0.02); border: 1px solid rgba(16,185,129,0.1);"
                         onmouseover="this.style.borderColor='rgba(16,185,129,0.25)'"
                         onmouseout="this.style.borderColor='rgba(16,185,129,0.1)'">
                        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                             style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.15); color: #10b981;"><i [class]="tip.icon"></i></div>
                        <div>
                            <div class="text-base font-bold mb-1" style="color: #d1fae5;">{{ tip.title }}</div>
                            <div class="text-base leading-relaxed" style="color: rgba(209,250,229,0.45);">{{ tip.desc }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `
})
export class HighlightsWidget {
    recyclables = [
        { icon: 'fa-solid fa-bottle-water', name: 'Plastic Bottles & Containers (PET #1, HDPE #2)', desc: 'Water bottles, soda bottles, milk jugs, shampoo containers — rinsed clean.' },
        { icon: 'fa-solid fa-box-open', name: 'Clean Paper & Cardboard', desc: 'Newspapers, flattened delivery boxes, magazines, office paper (no food stains).' },
        { icon: 'fa-solid fa-trash-can', name: 'Aluminium & Metal Cans', desc: 'Beverage cans, food tins, clean aluminium foil — empty and rinsed.' },
        { icon: 'fa-solid fa-prescription-bottle', name: 'Glass Bottles & Jars', desc: 'Clear, green and amber glass containers — remove lids, rinse.' },
    ];

    nonRecyclables = [
        { icon: 'fa-solid fa-pizza-slice', name: 'Food-Contaminated Packaging', desc: 'Greasy pizza boxes, used paper towels, food containers with leftover residue.' },
        { icon: 'fa-solid fa-bag-shopping', name: 'Soft Plastics & Carrier Bags', desc: 'Cling wrap, bubble wrap, thin plastic shopping bags, crisp packets.' },
        { icon: 'fa-solid fa-battery-quarter', name: 'Batteries & E-Waste', desc: 'Batteries, electronics, phone chargers, light bulbs — use specialist drop-offs.' },
        { icon: 'fa-solid fa-mug-hot', name: 'Mixed-Material Packaging', desc: 'Disposable coffee cups (plastic-lined), juice cartons (tetrapaks), laminated paper.' },
    ];

    tips = [
        { icon: 'fa-solid fa-shower', title: 'Always Rinse Before Recycling', desc: 'Food residue contaminates entire batches. A quick rinse makes all the difference.' },
        { icon: 'fa-solid fa-box', title: 'Flatten All Cardboard Boxes', desc: 'Breaking down boxes maximises the bin volume and reduces collection frequency.' },
        { icon: 'fa-solid fa-circle-question', title: 'When In Doubt — Leave It Out', desc: 'Uncertain items contaminate the whole load. Check your local council guidelines first.' },
    ];
}
