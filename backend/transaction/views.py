from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from transaction.models import Transaction
from transaction.serializers import TransactionSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_list(request):
    # GET → return all transactions for the authenticated user only
    transactions = Transaction.objects.filter(sender=request.user)
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_detail(request, pk):
    # GET → return a single transaction (only if it belongs to the user)
    try:
        transaction = Transaction.objects.get(pk=pk, sender=request.user)
    except Transaction.DoesNotExist:
        return Response(
            {'error': 'Transaction not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    serializer = TransactionSerializer(transaction)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def campaign_transactions(request, campaign_pk):
    # GET → return all transactions for a specific campaign (public)
    transactions = Transaction.objects.filter(campaign=campaign_pk)
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data)