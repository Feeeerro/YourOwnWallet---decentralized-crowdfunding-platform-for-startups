from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from users.serializers import RegisterSerializer, UserSerializer


# AllowAny → no authentication required (user doesn't have an account yet)
# POST → only accepts POST requests
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    # Pass the incoming JSON data to the serializer for validation
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        # Creates the user, hashes the password, assigns wallet address
        user = serializer.save()

        # Generate JWT token pair for the new user
        # so the frontend can immediately use the app after registering
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,       # user profile
            'access': str(refresh.access_token),     # short-lived token (60 min)
            'refresh': str(refresh),                 # long-lived token (7 days)
        }, status=status.HTTP_201_CREATED)

    # If validation fails, return the errors (e.g. missing fields, weak password)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    from django.contrib.auth import authenticate

    username = request.data.get('username')
    password = request.data.get('password')

    # authenticate checks username + password against the database
    # handles password hash comparison automatically
    # returns None if credentials are wrong
    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Generate JWT token pair for the logged-in user
    refresh = RefreshToken.for_user(user)

    return Response({
        'user': UserSerializer(user).data,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    })


# IsAuthenticated → requires a valid JWT token in the Authorization header
# GET → only accepts GET requests
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    # request.user is automatically populated by DRF from the JWT token
    # used by the frontend to get the current user's profile (e.g. after page refresh)
    return Response(UserSerializer(request.user).data)