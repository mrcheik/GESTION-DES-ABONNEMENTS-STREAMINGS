from django.db import models

from apps.providers.models import Provider

class Plan(models.Model):
    provider = models.ForeignKey(
        Provider,
        on_delete=models.CASCADE,
        related_name='plans'
    )

    name = models.CharField(max_length=100)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    duration_days = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.provider.name} - {self.name}"
