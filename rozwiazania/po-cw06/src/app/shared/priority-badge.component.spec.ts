import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PriorityBadgeComponent } from './priority-badge.component';

// Ćw. 4/5: inputy przez setInput; aplikacja jest zoneless, więc wystarczy whenStable().
describe('PriorityBadgeComponent (legacy)', () => {
  let fixture: ComponentFixture<PriorityBadgeComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PriorityBadgeComponent);
  });

  it('normalizuje priorytet przez transform', () => {
    fixture.componentRef.setInput('priority', 'CRITICAL');
    expect(fixture.componentInstance.priority()).toBe('critical');
  });

  it('pokazuje etykietę po setInput', async () => {
    fixture.componentRef.setInput('priority', 'HIGH');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Wysoki');
  });
});
