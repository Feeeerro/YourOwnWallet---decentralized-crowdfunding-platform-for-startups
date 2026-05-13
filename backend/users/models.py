from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):

    ROLE_CHOICES = [
        ('startupper', 'Startupper'),
        ('investor', 'Investor'),
        ('judge', 'Judge'),
        ('visitor', 'Visitor'),
    ]

    # AbstractUser already has: username, email, password, first_name, last_name, date_joined
    # We override email to make it unique
    email          = models.EmailField(unique=True)
    phone          = models.CharField(max_length=20, blank=True, null=True)
    country        = models.CharField(max_length=100, blank=True, null=True)
    city           = models.CharField(max_length=100, blank=True, null=True)
    address        = models.CharField(max_length=255, blank=True, null=True)
    role           = models.CharField(max_length=50, choices=ROLE_CHOICES)
    wallet_address = models.CharField(max_length=255)

    def save(self, *args, **kwargs):
        # Only assign a wallet address on first creation, not on updates
        if not self.pk and not self.wallet_address:
            from users.utils import assign_wallet_address
            self.wallet_address = assign_wallet_address()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"