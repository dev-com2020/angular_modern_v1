import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
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
import { NgIf, NgFor } from '@angular/common';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './ticket-form.component.html',
  imports: [ReactiveFormsModule, NgIf, PriorityPickerComponent, NgFor, RouterLink, StatusLabelPipe],
})
export class TicketFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  users: User[] = [];
  statuses = STATUSES;
  editedId: number | null = null;
  saving = false;
  private saved = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: TicketsApiService,
    private usersApi: UsersApiService,
    private toast: ToastService,
    private duplicateTitle: DuplicateTitleValidator,
  ) {}

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

    this.usersApi.getAll().subscribe((u) => (this.users = u));

    this.route.paramMap
      .pipe(
        filter((p) => p.has('id')),
        switchMap((p) => {
          this.editedId = Number(p.get('id'));
          this.duplicateTitle.excludeId = this.editedId;
          return this.api.get(this.editedId);
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
    this.saving = true;
    const { notifyReporter, ...draft } = this.form.getRawValue() as TicketDraft & {
      notifyReporter: boolean;
    };
    const request$ = this.editedId ? this.api.update(this.editedId, draft) : this.api.create(draft);
    request$.subscribe({
      next: (t) => {
        this.saved = true;
        this.saving = false;
        this.toast.show(notifyReporter ? 'Zapisano, wysłano powiadomienie' : 'Zapisano');
        this.router.navigate(['/tickets', t.id]);
      },
      error: () => {
        this.saving = false;
        this.toast.show('Błąd zapisu', 'error');
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
