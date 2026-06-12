from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from apps.providers.models import Provider
from apps.plans.models import Plan

LOGOS = {
    'Netflix': (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">'
        '<rect width="120" height="120" rx="20" fill="#E50914"/>'
        '<text x="60" y="72" text-anchor="middle" fill="white" font-size="28" '
        'font-family="Arial Black, sans-serif" font-weight="bold">N</text></svg>'
    ),
    'YouTube Premium': (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">'
        '<rect width="120" height="120" rx="20" fill="#FF0000"/>'
        '<polygon points="48,38 88,60 48,82" fill="white"/></svg>'
    ),
    'Spotify': (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">'
        '<rect width="120" height="120" rx="20" fill="#1DB954"/>'
        '<text x="60" y="72" text-anchor="middle" fill="white" font-size="22" '
        'font-family="Arial, sans-serif" font-weight="bold">S</text></svg>'
    ),
    'Disney+': (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">'
        '<rect width="120" height="120" rx="20" fill="#113CCF"/>'
        '<text x="60" y="72" text-anchor="middle" fill="white" font-size="20" '
        'font-family="Arial, sans-serif" font-weight="bold">D+</text></svg>'
    ),
    'Canal+': (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">'
        '<rect width="120" height="120" rx="20" fill="#000000"/>'
        '<text x="60" y="72" text-anchor="middle" fill="white" font-size="18" '
        'font-family="Arial, sans-serif" font-weight="bold">C+</text></svg>'
    ),
}

PLANS = [
    ('Netflix', 'Standard', '4500.00', 30),
    ('Netflix', 'Premium', '7500.00', 30),
    ('YouTube Premium', 'Famille', '3500.00', 30),
    ('Spotify', 'Individuel', '2500.00', 30),
    ('Disney+', 'Mensuel', '4000.00', 30),
    ('Canal+', 'Sport', '9000.00', 30),
]


class Command(BaseCommand):
    help = 'Initialise les fournisseurs, logos et forfaits de démonstration'

    def handle(self, *args, **options):
        providers = {}
        for name, svg in LOGOS.items():
            provider, _ = Provider.objects.get_or_create(
                name=name,
                defaults={'description': f'Abonnement {name} via MR CHEIK'},
            )
            if not provider.logo:
                filename = f'{name.lower().replace(" ", "_").replace("+", "plus")}.svg'
                provider.logo.save(filename, ContentFile(svg.encode('utf-8')), save=True)
            providers[name] = provider
            self.stdout.write(self.style.SUCCESS(f'Fournisseur prêt : {name}'))

        for provider_name, plan_name, price, days in PLANS:
            provider = providers[provider_name]
            Plan.objects.get_or_create(
                provider=provider,
                name=plan_name,
                defaults={'price': price, 'duration_days': days},
            )

        self.stdout.write(self.style.SUCCESS('Données de démonstration créées avec succès.'))
