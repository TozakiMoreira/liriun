import { Component } from '@angular/core';
import { BrandComponent } from './brand.component';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  imports: [BrandComponent],
  template: `
    <div class="flex flex-col items-center gap-4">
      <img
        src="/logo.png"
        alt="Liriun"
        class="w-10 h-10 rounded-lg object-contain shadow-accent"
        aria-hidden="true"
      />
      <div class="text-[22px] font-semibold tracking-tight"><app-brand /></div>
    </div>
  `,
})
export class BrandLogoComponent {}
