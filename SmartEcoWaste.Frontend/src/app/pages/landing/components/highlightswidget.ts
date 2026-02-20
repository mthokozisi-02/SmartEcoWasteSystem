import { Component } from '@angular/core';

@Component({
    selector: 'highlights-widget',
    template: `
        <div id="highlights" class="py-6 px-6 lg:px-20 mx-0 my-12 lg:mx-20">
            <div class="text-center">
                <div class="text-surface-900 dark:text-surface-0 font-normal mb-2 text-4xl">How to Recycle Properly</div>
                <span class="text-muted-color text-2xl">Recycling correctly makes a huge difference.</span>
            </div>

            <div class="grid grid-cols-12 gap-4 mt-20 pb-2 md:pb-2">
                <div class="col-span-12 lg:col-span-6 my-auto bg-green-100 p-4 flex flex-col lg:items-start text-center lg:text-start gap-4" style="border-radius: 8px">
                    <div class="flex items-center justify-center bg-green-200 self-center lg:self-start" style="width: 4.2rem; height: 4.2rem; border-radius: 10px">
                        <i class="text-4xl! text-green-700">✅</i>
                    </div>
                    <div class="leading-none text-surface-900 dark:text-surface-0 text-3xl font-normal">Common Recyclables</div>
                    <span class="text-surface-700 dark:text-surface-100 text-2xl leading-normal ml-0 md:ml-2" style="max-width: 650px">Plastic bottles and containers, Paper and cardboard, Aluminum cans and Glass bottles and jars.</span>
                    <span class="text-surface-700 dark:text-surface-100 text-2xl leading-normal ml-0 md:ml-2" style="max-width: 650px">Recycling correctly makes a huge difference.</span>
                </div>

                <div class="col-span-12 lg:col-span-6 my-auto bg-red-100 p-4 flex flex-col lg:items-start text-center lg:text-start gap-4" style="border-radius: 8px">
                    <div class="flex items-center justify-center bg-red-200 self-center lg:self-start" style="width: 4.2rem; height: 4.2rem; border-radius: 10px">
                        <i class="text-3xl! text-red-700">❌</i>
                    </div>
                    <div class="leading-none text-surface-900 dark:text-surface-0 text-3xl font-normal">Non Recyclables</div>
                    <span class="text-surface-700 dark:text-surface-100 text-2xl leading-normal mr-0 md:mr-2" style="max-width: 650px">Food-contaminated packaging, Batteries and Electronic waste and Mixed material packaging.</span>
                    <span class="text-surface-700 dark:text-surface-100 text-2xl leading-normal ml-0 md:ml-2" style="max-width: 650px">When in doubt, check your local recycling guidelines.</span>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-4 my-2">
                <div class="col-span-12 lg:col-span-6 my-auto bg-yellow-100 p-4 flex flex-col lg:items-start text-center lg:text-start gap-4" style="border-radius: 8px">
                    <div class="flex items-center justify-center bg-yellow-200 self-center lg:self-start" style="width: 4.2rem; height: 4.2rem; border-radius: 10px">
                        <i class="text-3xl! text-yellow-700">🌱</i>
                    </div>
                    <div class="leading-none text-surface-900 dark:text-surface-0 text-3xl font-normal">Everyday Eco Tips</div>
                    <span class="text-surface-700 dark:text-surface-100 text-2xl leading-normal mr-0 md:mr-2" style="max-width: 650px"
                        >Small changes create lasting impact: Use reusable shopping bags, Carry a refillable water bottle, Compost organic waste, Turn off and unplug unused electronics and Avoid single-use plastics.</span
                    >
                </div>

                <div class="col-span-12 lg:col-span-6 my-auto bg-blue-100 p-4 flex flex-col lg:items-start text-center lg:text-start gap-4" style="border-radius: 8px">
                    <div class="flex items-center justify-center bg-blue-200 self-center lg:self-start" style="width: 4.2rem; height: 4.2rem; border-radius: 10px">
                        <i class="text-3xl! text-blue-700">🌊</i>
                    </div>
                    <div class="leading-none text-surface-900 dark:text-surface-0 text-3xl font-normal">Environmental Impact of Action</div>
                    <span class="text-surface-700 dark:text-surface-100 text-2xl leading-normal mr-0 md:mr-2" style="max-width: 650px"
                        >When communities recycle and manage waste properly: Landfills shrink, Carbon emissions decrease, Oceans stay cleaner and Natural habitats are preserved.</span
                    >
                </div>
            </div>
        </div>
    `
})
export class HighlightsWidget {}
