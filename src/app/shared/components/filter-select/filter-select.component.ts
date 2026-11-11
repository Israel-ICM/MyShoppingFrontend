import { Component, ElementRef, EventEmitter, HostListener, Input, Output, computed, inject, signal } from '@angular/core';

export interface FilterSelectOption {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-filter-select',
  templateUrl: './filter-select.component.html',
  styleUrl: './filter-select.component.scss',
})
export class FilterSelectComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  @Input() options: FilterSelectOption[] = [];
  @Input() placeholder = 'Todas';
  @Output() readonly valueChange = new EventEmitter<number | null>();

  readonly open = signal(false);
  readonly selectedId = signal<number | null>(null);

  readonly selectedLabel = computed(
    () => this.options.find((option) => option.id === this.selectedId())?.nombre ?? this.placeholder,
  );

  toggle(): void {
    this.open.update((value) => !value);
  }

  select(id: number | null): void {
    this.selectedId.set(id);
    this.open.set(false);
    this.valueChange.emit(id);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}
