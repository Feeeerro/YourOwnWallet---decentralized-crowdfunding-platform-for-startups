from rest_framework import serializers
from startup.models import Startup


class StartupSerializer(serializers.ModelSerializer):
    # created_by is set automatically from the authenticated user
    # so it's read-only and never sent by the frontend
    created_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Startup
        fields = [
            'id',
            'startup_name',
            'country',
            'continent',
            'address',
            'description',
            'category',
            'created_at',
            'created_by',
            'status',
        ]
        # created_at is set automatically on creation
        read_only_fields = ['created_at', 'created_by']