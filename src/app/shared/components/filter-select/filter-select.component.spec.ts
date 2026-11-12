import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterSelectComponent } from './filter-select.component';

describe('FilterSelectComponent', () => {
  let fixture: ComponentFixture<FilterSelectComponent>;
  let component: FilterSelectComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [FilterSelectComponent] });
    fixture = TestBed.createComponent(FilterSelectComponent);
    component = fixture.componentInstance;
    component.options = [
      { id: 1, nombre: 'Skincare' },
      { id: 2, nombre: 'Maquillaje' },
    ];
    component.placeholder = 'Todas las categorías';
    fixture.detectChanges();
  });

  it('shows the placeholder as the label until something is selected', () => {
    expect(component.selectedLabel()).toBe('Todas las categorías');
  });

  it('toggles the options list open and closed', () => {
    component.toggle();
    expect(component.open()).toBe(true);

    component.toggle();
    expect(component.open()).toBe(false);
  });

  it('emits the selected id, updates the label and closes the list', () => {
    const emitted: (string | number | null)[] = [];
    component.valueChange.subscribe((value) => emitted.push(value));
    component.open.set(true);

    component.select(2);

    expect(emitted).toEqual([2]);
    expect(component.selectedLabel()).toBe('Maquillaje');
    expect(component.open()).toBe(false);
  });

  it('closes when a click happens outside the host element', () => {
    component.open.set(true);

    component.onDocumentClick({ target: document.body } as unknown as MouseEvent);

    expect(component.open()).toBe(false);
  });
});
