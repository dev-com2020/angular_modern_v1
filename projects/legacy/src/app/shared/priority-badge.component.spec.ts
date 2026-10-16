import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from './shared.module';
import { PriorityBadgeComponent } from './priority-badge.component';

// Test w "starym" stylu: import całego SharedModule, ręczne wywołanie ngOnChanges.
describe('PriorityBadgeComponent (legacy)', () => {
  let fixture: ComponentFixture<PriorityBadgeComponent>;
  let component: PriorityBadgeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SharedModule] }).compileComponents();
    fixture = TestBed.createComponent(PriorityBadgeComponent);
    component = fixture.componentInstance;
  });

  it('normalizuje priorytet w setterze', () => {
    component.priority = 'CRITICAL';
    expect(component.priority).toBe('critical');
  });

  it('pokazuje etykietę dopiero po ręcznym ngOnChanges', () => {
    component.priority = 'high';
    fixture.detectChanges();
    // Pułapka: przypisanie inputu w teście NIE wywołuje ngOnChanges, więc label jest pusty.
    expect(component.label).toBe('');

    component.ngOnChanges({ priority: {} as never });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Wysoki');
  });
});
