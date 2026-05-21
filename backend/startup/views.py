from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from startup.models import Startup
from startup.serializers import StartupSerializer


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def startup_list(request):
    # GET → return all startups (public)
    if request.method == 'GET':
        startups = Startup.objects.all()
        serializer = StartupSerializer(startups, many=True)
        return Response(serializer.data)

    # POST → create a new startup (authenticated users only)
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        serializer = StartupSerializer(data=request.data)
        if serializer.is_valid():
            # automatically set created_by to the logged-in user
            serializer.save(
                created_by=request.user,
                created_at=request.data.get('created_at')   # Theoretically useless for auto_now_add=True on model.
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def startup_detail(request, pk):
    # Get the startup or return 404
    try:
        startup = Startup.objects.get(pk=pk)    # GET startup from Primary Key
    except Startup.DoesNotExist:
        return Response(
            {'error': 'Startup not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # GET → return the startup (public)
    if request.method == 'GET':
        serializer = StartupSerializer(startup)
        return Response(serializer.data)

    # PUT and DELETE require authentication and ownership
    if not request.user.is_authenticated:
        return Response(
            {'error': 'Authentication required'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if startup.created_by != request.user:
        return Response(
            {'error': 'You are not the owner of this startup'},
            status=status.HTTP_403_FORBIDDEN
        )

    # PUT → update the startup
    if request.method == 'PUT':
        serializer = StartupSerializer(startup, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE → delete the startup
    if request.method == 'DELETE':
        startup.delete()
        return Response(
            {'message': 'Startup deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )