from rest_framework import serializers
from campaign.models import Campaign


class CampaignSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    startup_name = serializers.CharField(source='startup.startup_name', read_only=True)
    # shows how many transactions this campaign has received
    transactions_count = serializers.IntegerField(source='transactions.count', read_only=True)

    class Meta:
        model = Campaign
        fields = [
            'id',
            'campaign_name',
            'description',
            'funded',
            'target',
            'deadline',
            'created_at',
            'created_by',
            'startup',
            'startup_name',
            'status',
            'campaign_address',
            'campaign_approval_address',
            'transactions_count',
        ]
        read_only_fields = ['created_at', 'created_by', 'funded', 'startup_name', 'transactions_count']