import { Injectable, inject } from '@angular/core';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TicketsApiService } from '../../core/tickets-api.service';

/** Klasowy async validator z ręcznym debounce przez timer(). */
@Injectable({ providedIn: 'root' })
export class DuplicateTitleValidator implements AsyncValidator {
  private api = inject(TicketsApiService);

  excludeId = 0;

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    const title = (control.value ?? '').trim();
    if (title.length < 5) return of(null);
    return timer(400).pipe(
      switchMap(() => this.api.checkTitle(title, this.excludeId)),
      map((res) => (res.duplicate ? { duplicateTitle: true } : null)),
      catchError(() => of(null)),
    );
  }
}
