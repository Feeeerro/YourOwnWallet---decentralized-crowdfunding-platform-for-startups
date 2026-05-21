from rest_framework import serializers
from users.models import User


class RegisterSerializer(serializers.ModelSerializer):
    # write_only: password is accepted as input but never returned in responses
    # min_length: validates password is at least 8 characters
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        # fields accepted from the frontend during registration
        fields = [
            'username', 'email', 'password', 'first_name',
            'last_name', 'phone', 'country', 'city', 'address', 'role',
        ]

    def create(self, validated_data):
        # create_user instead of create → hashes the password automatically
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone'),
            country=validated_data.get('country'),
            city=validated_data.get('city'),
            address=validated_data.get('address'),
            role=validated_data.get('role', 'investor'),
        )


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # fields returned to the frontend
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'country', 'city', 'address', 'role', 'wallet_address',
        ]
        # wallet_address can be returned but never changed by the frontend
        # it is assigned automatically by Django via Web3.py
        read_only_fields = ['wallet_address']