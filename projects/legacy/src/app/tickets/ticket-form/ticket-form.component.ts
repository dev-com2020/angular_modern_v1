import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { STATUSES, Ticket, TicketDraft, User } from '@helpdesk/shared';
import { TicketsApiService } from '../../core/tickets-api.service';
import { UsersApiService } from '../../core/users-api.service';
import { ToastService } from '../../core/toast.service';
import { DuplicateTitleValidator } from './duplicate-title.validator';

import { PriorityPickerComponent } from '../../shared/priority-picker.component';
import { StatusLabelPipe } from '../../shared/status-label.pipe';

/** Walidator krzyżowy: krytyczne zgłoszenie musi mieć termin i osobę przypisaną. */
function criticalNeedsOwner(group: AbstractControl): ValidationErrors | null {
  const priority = group.get('priority')?.value;
  const assigneeId = group.get('assigneeId')?.value;
  const dueDate = group.get('dueDate')?.value;
  return priority === 'critical' && (!assigneeId || !dueDate) ? { criticalNeedsOwner: true } : null;
}

@Component({
  selector: 'app-ticket-form',
  templateUrl: './ticket-form.component.html',
  imports: [ReactiveFormsModule, PriorityPickerComponent, RouterLink, StatusLabelPipe],
})
export class TicketFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(TicketsApiService);
  private usersApi = inject(UsersApiService);
  private toast = inject(ToastService);
  private duplicateTitle = inject(DuplicateTitleValidator);

  form!: FormGroup;
  // Ćw. 5: pola zmieniane w subscribe jako sygnały.
  protected readonly users = signal<User[]>([]);
  protected readonly editedId = signal<number | null>(null);
  protected readonly saving = signal(false);
  statuses = STATUSES;
  private saved = false;
  private destroy$ = new Subject<void>();

  get tags(): FormArray {
    return this.form.get('tags') as FormArray;
  }

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        title: [
          '',
          [Validators.required, Validators.minLength(5), Validators.maxLength(80)],
          [this.duplicateTitle.validate.bind(this.duplicateTitle)],
        ],
        description: ['', [Validators.required, Validators.minLength(10)]],
        status: ['open'],
        priority: ['medium', Validators.required],
        assigneeId: [null as number | null],
        reporterEmail: ['', [Validators.required, Validators.email]],
        dueDate: [null as string | null],
        notifyReporter: [true],
        tags: this.fb.array([]),
      },
      { validators: criticalNeedsOwner },
    );

    // Pole "notifyReporter" ma sens tylko, gdy jest e-mail: ręczne enable/disable.
    this.form
      .get('reporterEmail')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((email: string) => {
        const ctrl = this.form.get('notifyReporter')!;
        if (email) ctrl.enable({ emitEvent: false });
        else ctrl.disable({ emitEvent: false });
      });

    this.usersApi.getAll().subscribe((u) => this.users.set(u));

    this.route.paramMap
      .pipe(
        filter((p) => p.has('id')),
        switchMap((p) => {
          const id = Number(p.get('id'));
          this.editedId.set(id);
          this.duplicateTitle.excludeId = id;
          return this.api.get(id);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((ticket) => this.patch(ticket));
  }

  private patch(ticket: Ticket): void {
    this.tags.clear();
    ticket.tags.forEach((t) => this.tags.push(new FormControl(t, Validators.required)));
    this.form.patchValue(ticket);
    this.form.markAsPristine();
  }

  addTag(): void {
    this.tags.push(new FormControl('', Validators.required));
  }

  removeTag(i: number): void {
    this.tags.removeAt(i);
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty && !this.saved;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const { notifyReporter, ...draft } = this.form.getRawValue() as TicketDraft & {
      notifyReporter: boolean;
    };
    const id = this.editedId();
    const request$ = id ? this.api.update(id, draft) : this.api.create(draft);
    request$.subscribe({
      next: (t) => {
        this.saved = true;
        this.saving.set(false);
        this.toast.show(notifyReporter ? 'Zapisano, wysłano powiadomienie' : 'Zapisano');
        this.router.navigate(['/tickets', t.id]);
      },
      error: () => {
        this.saving.set(false);
        this.toast.show('Błąd zapisu', 'error');
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
