const ORDER_STATUS: Record<string, string> = {
  pending: 'En attente',
  paid: 'Payée',
  cancelled: 'Annulée',
};

const SUBSCRIPTION_STATUS: Record<string, string> = {
  active: 'Actif',
  expired: 'Expiré',
  cancelled: 'Annulé',
};

const PAYMENT_STATUS: Record<string, string> = {
  pending: 'En attente',
  completed: 'Complété',
  failed: 'Échoué',
};

const PAYMENT_METHOD: Record<string, string> = {
  mtn: 'MTN Mobile Money',
  orange: 'Orange Money',
  card: 'Carte bancaire',
};

export function labelOrderStatus(status: string): string {
  return ORDER_STATUS[status] ?? status;
}

export function labelSubscriptionStatus(status: string): string {
  return SUBSCRIPTION_STATUS[status] ?? status;
}

export function labelPaymentStatus(status: string): string {
  return PAYMENT_STATUS[status] ?? status;
}

export function labelPaymentMethod(method: string): string {
  return PAYMENT_METHOD[method] ?? method;
}

export function statusBadgeClass(
  status: string,
  type: 'order' | 'subscription' | 'payment'
): string {
  if (type === 'order') {
    if (status === 'paid') return 'success';
    if (status === 'cancelled') return 'danger';
    return 'warning';
  }
  if (type === 'subscription') {
    if (status === 'active') return 'success';
    if (status === 'cancelled') return 'danger';
    return 'secondary';
  }
  if (status === 'completed') return 'success';
  if (status === 'failed') return 'danger';
  return 'warning';
}
