from rest_framework import serializers
from transaction.models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    # sender is set automatically from the authenticated user
    sender = serializers.StringRelatedField(read_only=True)
    # campaign name shown in responses instead of just the ID
    campaign_name = serializers.CharField(source='campaign.campaign_name', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id',
            'sender',
            'campaign',
            'campaign_name',
            'date',
            'amount',
        ]
        read_only_fields = ['date', 'sender', 'campaign_name']