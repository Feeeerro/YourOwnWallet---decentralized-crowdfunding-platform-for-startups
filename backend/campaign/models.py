from django.db import models
from django.conf import settings
from startup.models import Startup

class Campaign(models.Model):

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('rejected', 'Rejected'),
    ]

    campaign_name             = models.CharField(max_length=255)
    description               = models.TextField()
    funded                    = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    target                    = models.DecimalField(max_digits=15, decimal_places=2)
    deadline                  = models.DateTimeField()
    created_at                = models.DateTimeField(auto_now_add=True)
    created_by                = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='campaigns')
    startup                   = models.ForeignKey(Startup, on_delete=models.CASCADE, related_name='campaigns')
    status                    = models.CharField(max_length=50, choices=STATUS_CHOICES)
    campaign_address          = models.CharField(max_length=255)
    campaign_approval_address = models.CharField(max_length=255)

    def __str__(self):
        return self.campaign_name