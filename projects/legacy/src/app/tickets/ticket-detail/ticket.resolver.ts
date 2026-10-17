import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { Ticket } from '@helpdesk/shared';
import { TicketsApiService } from '../../core/tickets-api.service';

// Resolver klasowy: blokuje nawigację do czasu pobrania danych.
@Injectable({ providedIn: 'root' })
export class TicketResolver implements Resolve<Ticket> {
  private api = inject(TicketsApiService);

  resolve(route: ActivatedRouteSnapshot): Observable<Ticket> {
    return this.api.get(Number(route.paramMap.get('id')));
  }
}
