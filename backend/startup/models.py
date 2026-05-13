from django.db import models
from django.conf import settings

class Startup(models.Model):

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('pending', 'Pending'),
    ]

    CONTINENT_CHOICES = [
        ('africa', 'Africa'),
        ('antarctica', 'Antarctica'),
        ('asia', 'Asia'),
        ('europe', 'Europe'),
        ('north_america', 'North America'),
        ('oceania', 'Oceania'),
        ('south_america', 'South America'),
    ]

    startup_name = models.CharField(max_length=255)
    country      = models.CharField(max_length=100)
    continent    = models.CharField(max_length=50, choices=CONTINENT_CHOICES)
    address      = models.CharField(max_length=255)
    description  = models.TextField()
    category     = models.CharField(max_length=100)
    created_at   = models.DateTimeField(auto_now_add=True)
    created_by   = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='startups')
    status       = models.CharField(max_length=50, choices=STATUS_CHOICES)

    def __str__(self):
        return self.startup_name