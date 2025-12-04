from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import MoodFolder, Song
from .serializers import MoodFolderSerializer, SongSerializer, RegisterSerializer, UserSerializer

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout(request):
    request.user.auth_token.delete()
    return Response({'message': 'Logged out successfully'})

class MoodFolderViewSet(viewsets.ModelViewSet):
    serializer_class = MoodFolderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return MoodFolder.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_mood(self, request):
        mood = request.query_params.get('mood')
        if mood:
            folders = self.get_queryset().filter(mood=mood)
            serializer = self.get_serializer(folders, many=True)
            return Response(serializer.data)
        return Response({'error': 'Mood parameter required'}, status=status.HTTP_400_BAD_REQUEST)

class SongViewSet(viewsets.ModelViewSet):
    serializer_class = SongSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Song.objects.filter(folder__user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_mood(self, request):
        mood = request.query_params.get('mood')
        if mood:
            songs = self.get_queryset().filter(folder__mood=mood)
            serializer = self.get_serializer(songs, many=True)
            return Response(serializer.data)
        return Response({'error': 'Mood parameter required'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def shuffle(self, request):
        mood = request.query_params.get('mood')
        songs = self.get_queryset()
        if mood:
            songs = songs.filter(folder__mood=mood)
        songs = songs.order_by('?')[:20]
        serializer = self.get_serializer(songs, many=True)
        return Response(serializer.data)