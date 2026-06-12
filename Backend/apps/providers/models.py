from django.db import models

class Provider(models.Model):
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to='providers/')
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name