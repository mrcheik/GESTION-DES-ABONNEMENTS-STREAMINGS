import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { AccountService } from '../../../core/services/account.service';
import { DeliveredCredential } from '../../../core/models/admin.model';

@Component({
  selector: 'app-credentials',
  standalone: true,
  imports: [DatePipe, PageHeaderComponent],
  templateUrl: './credentials.component.html',
  styleUrl: './credentials.component.scss',
})
export class CredentialsComponent implements OnInit {
  private readonly accountService = inject(AccountService);

  credentials: DeliveredCredential[] = [];
  errorMessage = '';

  ngOnInit(): void {
    this.accountService.getCredentials().subscribe({
      next: (credentials) => (this.credentials = credentials),
      error: () => (this.errorMessage = 'Impossible de charger vos identifiants.'),
    });
  }
}
