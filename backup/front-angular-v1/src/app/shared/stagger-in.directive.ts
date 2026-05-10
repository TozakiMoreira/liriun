import { AfterViewInit, Directive, ElementRef, Input, inject } from '@angular/core';

/**
 * Aplica animacao "fade-up" em cada elemento filho com delay incremental.
 * Uso: <div appStaggerIn> <div>1</div> <div>2</div> ... </div>
 */
@Directive({
  selector: '[appStaggerIn]',
  standalone: true,
})
export class StaggerInDirective implements AfterViewInit {
  private readonly el = inject(ElementRef<HTMLElement>);

  /** Delay base em ms entre filhos. Default 60ms. */
  @Input() staggerDelay = 60;
  /** Delay inicial antes do primeiro filho. Default 0. */
  @Input() staggerStart = 0;

  ngAfterViewInit(): void {
    const filhos = Array.from(this.el.nativeElement.children) as HTMLElement[];
    filhos.forEach((filho, i) => {
      filho.style.animationDelay = `${this.staggerStart + i * this.staggerDelay}ms`;
      filho.classList.add('animate-fade-up');
    });
  }
}
