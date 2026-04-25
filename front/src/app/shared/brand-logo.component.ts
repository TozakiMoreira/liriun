import { Component } from '@angular/core';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  template: `
    <div class="flex flex-col items-center gap-4">
      <div
        class="w-10 h-10 rounded-lg bg-logo-grad grid place-items-center text-xl font-bold tracking-tight shadow-accent"
        aria-hidden="true"
      >
        J
      </div>
      <div class="text-[22px] font-semibold tracking-tight">Jarvis</div>
    </div>
  `,
})
export class BrandLogoComponent {}
