import { TestBed } from '@angular/core/testing';
import { PriorityBadgeComponent } from './priority-badge.component';

// Ćw. 10: test zoneless: setInput + whenStable, bez fakeAsync i bez detectChanges.
describe('PriorityBadgeComponent', () => {
  beforeEach(() => TestBed.createComponent(PriorityBadgeComponent));

  it('normalizuje priorytet przez transform', () => {
    const fixture = TestBed.getLastFixture<PriorityBadgeComponent>();
    fixture.componentRef.setInput('priority', 'CRITICAL');
    expect(fixture.componentInstance.priority()).toBe('critical');
  });

  it('pokazuje etykietę po setInput', async () => {
    const fixture = TestBed.getLastFixture<PriorityBadgeComponent>();
    fixture.componentRef.setInput('priority', 'HIGH');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Wysoki');
  });

  it('pokazuje strzałkę eskalacji dla zaległego terminu', async () => {
    const fixture = TestBed.getLastFixture<PriorityBadgeComponent>();
    fixture.componentRef.setInput('priority', 'low');
    fixture.componentRef.setInput('dueDate', '2026-01-01');
    fixture.componentRef.setInput('showEscalation', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('⬆');
  });

  it('emituje badgeClick po kliknięciu', async () => {
    const fixture = TestBed.getLastFixture<PriorityBadgeComponent>();
    fixture.componentRef.setInput('priority', 'critical');
    const emitted: string[] = [];
    fixture.componentInstance.badgeClick.subscribe((p) => emitted.push(p));
    await fixture.whenStable();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.badge')!.click();
    expect(emitted).toEqual(['critical']);
  });
});
