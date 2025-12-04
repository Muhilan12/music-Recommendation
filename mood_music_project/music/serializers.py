from rest_framework import serializers
from django.contrib.auth.models import User
from .models import MoodFolder, Song

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class SongSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = ['id', 'title', 'artist', 'audio_file', 'folder', 'duration', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class MoodFolderSerializer(serializers.ModelSerializer):
    songs = SongSerializer(many=True, read_only=True)
    song_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MoodFolder
        fields = ['id', 'name', 'mood', 'description', 'user', 'songs', 'song_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_song_count(self, obj):
        return obj.songs.count()