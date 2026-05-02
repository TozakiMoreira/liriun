import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="relative">
      <input
        [id]="inputId"
        [name]="inputId"
        [type]="visivel() ? 'text' : 'password'"
        class="input-base w-full pr-10"
        [placeholder]="placeholder"
        [autocomplete]="autocomplete"
        [attr.data-testid]="testid"
        [ngModel]="value"
        (ngModelChange)="valueChange.emit($event)"
      />
      <button
        type="button"
        class="absolute inset-y-0 right-0 px-3 flex items-center text-text-subtle hover:text-text focus:outline-none focus:text-text"
        [attr.aria-label]="visivel() ? 'Ocultar senha' : 'Mostrar senha'"
        [attr.data-testid]="testid + '-toggle'"
        [attr.aria-pressed]="visivel()"
        (click)="alternar()"
        tabindex="-1"
      >
        <i class="fa-solid text-xs" [class.fa-eye]="!visivel()" [class.fa-eye-slash]="visivel()"></i>
      </button>
    </div>
  `,
})
export class PasswordInputComponent {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
  @Input() inputId = 'senha';
  @Input() placeholder = '';
  @Input() autocomplete = 'current-password';
  @Input() testid = 'password-input';

  readonly visivel = signal(false);

  alternar(): void {
    this.visivel.update((v) => !v);
  }
}
