import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  computed,
  forwardRef,
  inject,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface FilterSelectOption {
  id: string | number;
  nombre: string;
}

/** Combobox propio con filtro de búsqueda: reemplaza cualquier <select> nativo del panel admin. */
@Component({
  selector: 'app-filter-select',
  templateUrl: './filter-select.component.html',
  styleUrl: './filter-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterSelectComponent),
      multi: true,
    },
  ],
})
export class FilterSelectComponent implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  @Input() options: FilterSelectOption[] = [];
  @Input() placeholder = 'Todas';
  @Output() readonly valueChange = new EventEmitter<string | number | null>();

  readonly open = signal(false);
  readonly selectedId = signal<string | number | null>(null);
  readonly busqueda = signal('');
  readonly disabled = signal(false);

  private onChange: (value: string | number | null) => void = () => {};
  private onTouched: () => void = () => {};

  readonly selectedLabel = computed(() => {
    const id = this.selectedId();
    return this.options.find((option) => option.id === id)?.nombre ?? this.placeholder;
  });

  readonly opcionesFiltradas = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    return texto ? this.options.filter((o) => o.nombre.toLowerCase().includes(texto)) : this.options;
  });

  toggle(): void {
    if (this.disabled()) {
      return;
    }
    this.open.update((value) => !value);
    if (!this.open()) {
      this.busqueda.set('');
    }
    this.onTouched();
  }

  select(id: string | number | null): void {
    this.selectedId.set(id);
    this.open.set(false);
    this.busqueda.set('');
    this.onChange(id);
    this.valueChange.emit(id);
  }

  onBusquedaInput(value: string): void {
    this.busqueda.set(value);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
      this.busqueda.set('');
    }
  }

  writeValue(value: string | number | null): void {
    this.selectedId.set(value);
  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
