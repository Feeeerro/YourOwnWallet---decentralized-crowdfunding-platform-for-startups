from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from campaign.models import Campaign
from campaign.serializers import CampaignSerializer


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
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
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