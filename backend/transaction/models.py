from django.db import models
from django.conf import settings

class Transaction(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='transactions')
    campaign = models.ForeignKey('campaign.Campaign', on_delete=models.CASCADE, related_name='transactions', null=True)
    date   = models.DateTimeField(auto_now_add=True)  # set automatically on creation
    amount = models.DecimalField(max_digits=15, decimal_places=2)

    def __str__(self):
        return f"Transaction {self.id} - {self.amount} by {self.sender}"