import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PriorityBadgeComponent } from './priority-badge.component';

// Ćw. 4: inputy ustawiamy przez setInput, bez ręcznego wołania hooka zmian.
describe('PriorityBadgeComponent (legacy)', () => {
  let fixture: ComponentFixture<PriorityBadgeComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PriorityBadgeComponent);
  });

  it('normalizuje priorytet przez transform', () => {
    fixture.componentRef.setInput('priority', 'CRITICAL');
    expect(fixture.componentInstance.priority()).toBe('critical');
  });

  it('pokazuje etykietę po setInput', () => {
    fixture.componentRef.setInput('priority', 'HIGH');
    // Aplikacja ma jeszcze zone.js, więc test odświeża widok ręcznie (po ćw. 5 wystarczy whenStable).
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Wysoki');
  });
});
