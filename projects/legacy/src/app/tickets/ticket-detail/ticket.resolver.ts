import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Ticket } from '@helpdesk/shared';
import { TicketsApiService } from '../../core/tickets-api.service';

// Resolver funkcyjny: nadal blokuje nawigację do czasu pobrania danych.
export const ticketResolver: ResolveFn<Ticket> = (route) => inject(TicketsApiService).get(Number(route.paramMap.get('id')));
