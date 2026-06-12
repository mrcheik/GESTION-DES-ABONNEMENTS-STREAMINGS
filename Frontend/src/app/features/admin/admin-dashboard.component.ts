import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { AdminService } from '../../core/services/admin.service';
import {
  AdminOrder,
  AdminPayment,
  AdminStats,
  AdminUser,
  DeliveredCredential,
  SupportThread,
} from '../../core/models/admin.model';
import { Subscription } from '../../core/models/subscription.model';

type AdminTab = 'overview' | 'users' | 'orders' | 'payments' | 'credentials' | 'messages';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly fb = inject(FormBuilder);

  activeTab: AdminTab = 'overview';
  loading = true;
  errorMessage = '';
  successMessage = '';

  stats: AdminStats = {
    users: 0,
    orders: 0,
    payments: 0,
    active_subscriptions: 0,
    revenue: '0.00',
    pending_orders: 0,
    pending_payments: 0,
  };
  users: AdminUser[] = [];
  orders: AdminOrder[] = [];
  payments: AdminPayment[] = [];
  credentials: DeliveredCredential[] = [];
  threads: SupportThread[] = [];
  subscriptions: Subscription[] = [];
  selectedThread: SupportThread | null = null;

  readonly tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Vue globale', icon: 'bi-speedometer2' },
    { id: 'users', label: 'Utilisateurs', icon: 'bi-people' },
    { id: 'orders', label: 'Commandes', icon: 'bi-receipt' },
    { id: 'payments', label: 'Paiements', icon: 'bi-credit-card' },
    { id: 'credentials', label: 'Livraisons', icon: 'bi-key' },
    { id: 'messages', label: 'Messages', icon: 'bi-chat-dots' },
  ];

  readonly credentialForm = this.fb.nonNullable.group({
    subscription: ['', Validators.required],
    service_name: ['', Validators.required],
    login_identifier: ['', Validators.required],
    password: ['', Validators.required],
    profile_name: [''],
    notes: [''],
  });

  readonly replyForm = this.fb.nonNullable.group({
    body: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadAll();
  }

  setTab(tab: AdminTab): void {
    this.activeTab = tab;
  }

  loadAll(): void {
    this.loading = true;
    forkJoin({
      stats: this.adminService.getStats(),
      users: this.adminService.getUsers(),
      orders: this.adminService.getOrders(),
      payments: this.adminService.getPayments(),
      credentials: this.adminService.getCredentials(),
      threads: this.adminService.getThreads(),
      subscriptions: this.adminService.getSubscriptions(),
    }).subscribe({
      next: (data) => {
        this.stats = data.stats;
        this.users = data.users;
        this.orders = data.orders;
        this.payments = data.payments;
        this.credentials = data.credentials;
        this.threads = data.threads;
        this.subscriptions = data.subscriptions.filter((item) => item.status === 'active');
        this.selectedThread = this.threads[0] ?? null;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = "Impossible de charger le back-office administrateur.";
        this.loading = false;
      },
    });
  }

  revenueNumber(): number {
    return Number(this.stats.revenue || 0);
  }

  maxChartValue(): number {
    return Math.max(this.stats.users, this.stats.orders, this.stats.payments, this.stats.active_subscriptions, 1);
  }

  chartHeight(value: number): string {
    return `${Math.max(8, (value / this.maxChartValue()) * 100)}%`;
  }

  activateUser(user: AdminUser): void {
    this.adminService.activateUser(user.id).subscribe({ next: () => this.afterAction('Utilisateur activé.') });
  }

  deactivateUser(user: AdminUser): void {
    this.adminService.deactivateUser(user.id).subscribe({ next: () => this.afterAction('Utilisateur désactivé.'), error: (err) => this.showError(err) });
  }

  toggleRole(user: AdminUser): void {
    const request$ = user.role === 'ADMIN' ? this.adminService.makeClient(user.id) : this.adminService.makeAdmin(user.id);
    request$.subscribe({ next: () => this.afterAction('Rôle mis à jour.'), error: (err) => this.showError(err) });
  }

  deleteUser(user: AdminUser): void {
    if (!confirm(`Supprimer ${user.username} ?`)) return;
    this.adminService.deleteUser(user.id).subscribe({ next: () => this.afterAction('Utilisateur supprimé.') });
  }

  validateOrder(order: AdminOrder): void {
    this.adminService.validateOrder(order.id).subscribe({ next: () => this.afterAction('Commande validée.') });
  }

  refuseOrder(order: AdminOrder): void {
    this.adminService.refuseOrder(order.id).subscribe({ next: () => this.afterAction('Commande refusée.') });
  }

  changeOrderStatus(order: AdminOrder, status: string): void {
    this.adminService.changeOrderStatus(order.id, status).subscribe({ next: () => this.afterAction('Statut commande mis à jour.') });
  }

  confirmPayment(payment: AdminPayment): void {
    this.adminService.confirmPayment(payment.id).subscribe({ next: () => this.afterAction('Paiement confirmé.') });
  }

  failPayment(payment: AdminPayment): void {
    this.adminService.failPayment(payment.id).subscribe({ next: () => this.afterAction('Paiement marqué échoué.') });
  }

  createCredential(): void {
    if (this.credentialForm.invalid) {
      this.credentialForm.markAllAsTouched();
      return;
    }
    const raw = this.credentialForm.getRawValue();
    this.adminService
      .createCredential({
        subscription: Number(raw.subscription),
        service_name: raw.service_name,
        login_identifier: raw.login_identifier,
        password: raw.password,
        profile_name: raw.profile_name,
        notes: raw.notes,
      })
      .subscribe({
        next: () => {
          this.credentialForm.reset({
            subscription: '',
            service_name: '',
            login_identifier: '',
            password: '',
            profile_name: '',
            notes: '',
          });
          this.afterAction('Identifiants livrés.');
        },
        error: (err) => this.showError(err),
      });
  }

  deleteCredential(credential: DeliveredCredential): void {
    if (!confirm('Supprimer cette livraison ?')) return;
    this.adminService.deleteCredential(credential.id).subscribe({ next: () => this.afterAction('Livraison supprimée.') });
  }

  selectThread(thread: SupportThread): void {
    this.selectedThread = thread;
    this.replyForm.reset({ body: '' });
  }

  reply(): void {
    if (!this.selectedThread || this.replyForm.invalid) {
      this.replyForm.markAllAsTouched();
      return;
    }
    this.adminService.replyThread(this.selectedThread.id, this.replyForm.getRawValue().body).subscribe({
      next: () => {
        this.replyForm.reset({ body: '' });
        this.afterAction('Message envoyé.');
      },
      error: (err) => this.showError(err),
    });
  }

  closeThread(thread: SupportThread): void {
    this.adminService.closeThread(thread.id).subscribe({ next: () => this.afterAction('Conversation fermée.') });
  }

  private afterAction(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    this.loadAll();
  }

  private showError(err: { error?: Record<string, string[] | string> | string }): void {
    if (typeof err.error === 'string') {
      this.errorMessage = err.error;
      return;
    }
    if (err.error && typeof err.error === 'object') {
      const detail = (err.error as Record<string, unknown>)['detail'];
      if (typeof detail === 'string') {
        this.errorMessage = detail;
        return;
      }
      const first = Object.values(err.error)[0];
      this.errorMessage = Array.isArray(first) ? first[0] : String(first);
      return;
    }
    this.errorMessage = 'Une erreur est survenue.';
  }
}
