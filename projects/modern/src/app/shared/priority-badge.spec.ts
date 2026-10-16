import { TestBed } from '@angular/core/testing';
import { PriorityBadge } from './priority-badge';

// Test zoneless: setInput + whenStable, bez fakeAsync i bez ręcznego ngOnChanges.
describe('PriorityBadge', () => {
  beforeEach(() => TestBed.createComponent(PriorityBadge));

  it('normalizuje wartość przez transform i wylicza etykietę', async () => {
    const fixture = TestBed.getLastFixture<PriorityBadge>();
    fixture.componentRef.setInput('priority', 'HIGH');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Wysoki');
  });

  it('pokazuje strzałkę eskalacji dla zaległego terminu', async () => {
    const fixture = TestBed.getLastFixture<PriorityBadge>();
    fixture.componentRef.setInput('priority', 'low');
    fixture.componentRef.setInput('dueDate', '2026-01-01');
    fixture.componentRef.setInput('showEscalation', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('⬆');
  });

  it('emituje badgeClick po kliknięciu', async () => {
    const fixture = TestBed.getLastFixture<PriorityBadge>();
    fixture.componentRef.setInput('priority', 'critical');
    const emitted: string[] = [];
    fixture.componentInstance.badgeClick.subscribe((p) => emitted.push(p));
    await fixture.whenStable();
    (fixture.nativeElement as HTMLElement).click();
    expect(emitted).toEqual(['critical']);
  });
});
