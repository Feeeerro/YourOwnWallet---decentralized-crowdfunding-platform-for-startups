from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from campaign.models import Campaign
from campaign.serializers import CampaignSerializer
from web3_utils import get_campaign_approval_contract, get_campaign_contract, get_web3
from django.utils import timezone
from decimal import Decimal
import math


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def campaign_list(request):
    # GET → return all campaigns (public)
    if request.method == 'GET':
        campaigns = Campaign.objects.all()
        serializer = CampaignSerializer(campaigns, many=True)
        return Response(serializer.data)

    # POST → create a new campaign (authenticated users only)
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        serializer = CampaignSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # get the 3 judge addresses from the database
                from users.models import User
                judges = User.objects.filter(role='judge').values_list('wallet_address', flat=True)[:3]

                if len(judges) < 3:
                    return Response(
                        {'error': 'Not enough judges registered. Need exactly 3 judges.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # deploy the contracts automatically
                from web3_utils import deploy_campaign_contracts
                # calculate duration in days from now to the deadline
                deadline = serializer.validated_data['deadline']
                now = timezone.now()
                duration_days = math.ceil((deadline - now).total_seconds() / 86400)

                if duration_days < 1:
                    return Response(
                        {'error': 'Deadline must be at least 1 day in the future'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                campaign_address, approval_address = deploy_campaign_contracts(
                    deployer_address=request.user.wallet_address,
                    judge_addresses=list(judges),
                    campaign_name=serializer.validated_data['campaign_name'],
                    target_eth=serializer.validated_data['target'],
                    duration_days=duration_days  # ← use calculated duration
                )

                # save the campaign with the deployed contract addresses
                serializer.save(
                    created_by=request.user,
                    campaign_address=campaign_address,
                    campaign_approval_address=approval_address,
                    status='pending',
                )

                return Response(serializer.data, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def campaign_detail(request, pk):
    # Get the campaign or return 404
    try:
        campaign = Campaign.objects.get(pk=pk)
    except Campaign.DoesNotExist:
        return Response(
            {'error': 'Campaign not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # GET → return the campaign (public)
    if request.method == 'GET':
        serializer = CampaignSerializer(campaign)
        return Response(serializer.data)

    # PUT and DELETE require authentication and ownership
    if not request.user.is_authenticated:
        return Response(
            {'error': 'Authentication required'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if campaign.created_by != request.user:
        return Response(
            {'error': 'You are not the owner of this campaign'},
            status=status.HTTP_403_FORBIDDEN
        )

    # PUT → update the campaign
    if request.method == 'PUT':
        serializer = CampaignSerializer(campaign, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE → delete the campaign
    if request.method == 'DELETE':
        campaign.delete()
        return Response(
            {'message': 'Campaign deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def judge_status(request, pk):
    """
    Returns whether the current judge has already voted on this campaign.
    Called on page load to restore the judge's voting state.
    """
    try:
        campaign = Campaign.objects.get(pk=pk)
    except Campaign.DoesNotExist:
        return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        contract = get_campaign_approval_contract(campaign.campaign_approval_address)
        judge_address = request.user.wallet_address

        # check both approved and rejected on the blockchain
        has_approved = contract.functions.hasApproved(judge_address).call()
        has_rejected = contract.functions.hasRejected(judge_address).call()

        return Response({
            'has_voted': has_approved or has_rejected,
            'has_approved': has_approved,
            'has_rejected': has_rejected,
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def judge_approve(request, pk):
    """
    Called by a judge to approve a campaign.
    - Calls approve() on the CampaignApproval contract
    - If all 3 judges approved, calls activate() on the Campaign contract
    - Updates campaign status to 'active' in the database
    """
    try:
        campaign = Campaign.objects.get(pk=pk)
    except Campaign.DoesNotExist:
        return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

    if campaign.status != 'pending':
        return Response({'error': 'Campaign is not pending'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        w3 = get_web3()
        contract = get_campaign_approval_contract(campaign.campaign_approval_address)

        # get the judge's wallet address from the database
        judge_address = request.user.wallet_address

        # call approve() on the CampaignApproval contract
        approve_tx = contract.functions.approve().transact({'from': judge_address})
        w3.eth.wait_for_transaction_receipt(approve_tx)

        # check if all 3 judges have now approved
        if contract.functions.isApproved().call():
            # activate the campaign contract on the blockchain
            campaign_contract = get_campaign_contract(campaign.campaign_address)
            activate_tx = campaign_contract.functions.activate().transact({
                'from': judge_address
            })
            w3.eth.wait_for_transaction_receipt(activate_tx)

            # update campaign status in the database
            campaign.status = 'active'
            campaign.save()

        return Response({
            'message': 'Approval submitted successfully',
            'campaign_status': campaign.status,
            'approval_count': contract.functions.approvalCount().call(),
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def judge_reject(request, pk):
    """
    Called by a judge to reject a campaign.
    - Checks the user's wallet address is one of the 3 judges
    - Calls reject() on the CampaignApproval contract
    - Updates campaign status to 'inactive'
    """
    try:
        campaign = Campaign.objects.get(pk=pk)
    except Campaign.DoesNotExist:
        return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

    if campaign.status != 'pending':
        return Response({'error': 'Campaign is not pending'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        w3 = get_web3()
        contract = get_campaign_approval_contract(campaign.campaign_approval_address)

        judge_address = request.user.wallet_address

        # call reject() on the contract using the judge's address
        tx_hash = contract.functions.reject().transact({'from': judge_address})
        w3.eth.wait_for_transaction_receipt(tx_hash)

        # update campaign status to inactive
        campaign.status = 'rejected'
        campaign.save()

        return Response({
            'message': 'Campaign rejected successfully',
            'campaign_status': campaign.status,
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def fund_campaign(request, pk):
    """
    Called by an investor to fund a campaign.
    - Calls fund() on the Campaign contract sending ETH
    - Creates a Transaction record in the database
    - Updates the funded amount on the campaign
    """
    try:
        campaign = Campaign.objects.get(pk=pk)
    except Campaign.DoesNotExist:
        return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

    if campaign.status != 'active':
        return Response({'error': 'Campaign is not active'}, status=status.HTTP_400_BAD_REQUEST)

    # prevent the campaign owner from funding their own campaign
    if campaign.created_by == request.user:
        return Response(
            {'error': 'You cannot fund your own campaign'},
            status=status.HTTP_400_BAD_REQUEST
        )

    amount_eth = request.data.get('amount')
    if not amount_eth:
        return Response({'error': 'Amount is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        w3 = get_web3()
        contract = get_campaign_contract(campaign.campaign_address)

        investor_address = request.user.wallet_address

        # convert ETH amount to wei
        amount_wei = w3.to_wei(float(amount_eth), 'ether')

        # call fund() on the contract sending ETH
        tx_hash = contract.functions.fund().transact({
            'from': investor_address,
            'value': amount_wei,
        })
        w3.eth.wait_for_transaction_receipt(tx_hash)

        # save the transaction to the database
        from transaction.models import Transaction
        Transaction.objects.create(
            sender=request.user,
            campaign=campaign,
            amount=amount_eth,
        )

        # update the funded amount on the campaign
        from decimal import Decimal
        campaign.funded += Decimal(str(amount_eth))
        campaign.save()

        return Response({
            'message': 'Funding successful',
            'amount': amount_eth,
            'total_funded': str(campaign.funded),
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def finalize_campaign(request, pk):
    """
    Finalizes a campaign after the deadline has passed.
    Called automatically by the frontend when the deadline is reached.
    """
    try:
        campaign = Campaign.objects.get(pk=pk)
    except Campaign.DoesNotExist:
        return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

    if campaign.status != 'active':
        return Response({'error': 'Campaign is not active'}, status=status.HTTP_400_BAD_REQUEST)

    now = timezone.now()
    if now < campaign.deadline:
        return Response(
            {'error': 'Campaign deadline has not passed yet'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        w3 = get_web3()
        contract = get_campaign_contract(campaign.campaign_address)

        tx_hash = contract.functions.finalize().transact({
            'from': request.user.wallet_address
        })
        w3.eth.wait_for_transaction_receipt(tx_hash)

        goal_reached = campaign.funded >= Decimal(str(campaign.target))
        campaign.status = 'completed' if goal_reached else 'failed'
        campaign.save()

        return Response({
            'message': 'Campaign finalized successfully',
            'campaign_status': campaign.status,
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def withdraw_funds(request, pk):
    """
    Allows the campaign owner to withdraw funds after a successful campaign.
    """
    try:
        campaign = Campaign.objects.get(pk=pk)
    except Campaign.DoesNotExist:
        return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

    if campaign.status != 'completed':
        return Response({'error': 'Campaign has not succeeded'}, status=status.HTTP_400_BAD_REQUEST)

    if campaign.created_by != request.user:
        return Response({'error': 'Only the campaign owner can withdraw funds'}, status=status.HTTP_403_FORBIDDEN)

    try:
        w3 = get_web3()
        contract = get_campaign_contract(campaign.campaign_address)

        # call withdraw() on the blockchain
        tx_hash = contract.functions.withdraw().transact({
            'from': request.user.wallet_address
        })
        w3.eth.wait_for_transaction_receipt(tx_hash)

        return Response({
            'message': f'Successfully withdrawn {campaign.funded} ETH',
            'amount': str(campaign.funded),
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def claim_refund(request, pk):
    """
    Allows an investor to claim a refund after a failed campaign.
    """
    try:
        campaign = Campaign.objects.get(pk=pk)
    except Campaign.DoesNotExist:
        return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

    if campaign.status != 'failed':
        return Response({'error': 'Campaign has not failed'}, status=status.HTTP_400_BAD_REQUEST)

    # check if the investor has funded this campaign
    from transaction.models import Transaction
    investor_transactions = Transaction.objects.filter(
        campaign=campaign,
        sender=request.user
    )
    if not investor_transactions.exists():
        return Response({'error': 'You have not invested in this campaign'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        w3 = get_web3()
        contract = get_campaign_contract(campaign.campaign_address)

        # call claimRefund() on the blockchain
        tx_hash = contract.functions.claimRefund().transact({
            'from': request.user.wallet_address
        })
        w3.eth.wait_for_transaction_receipt(tx_hash)

        # calculate total refund amount
        total_refund = sum(tx.amount for tx in investor_transactions)

        return Response({
            'message': f'Successfully refunded {total_refund} ETH',
            'amount': str(total_refund),
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)