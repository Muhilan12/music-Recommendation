from django.db import models
from django.contrib.auth.models import User

class MoodFolder(models.Model):
    MOOD_CHOICES = [
        ('happy', 'Happy'),
        ('sad', 'Sad'),
        ('energetic', 'Energetic'),
        ('relaxed', 'Relaxed'),
        ('romantic', 'Romantic'),
        ('angry', 'Angry'),
    ]
    
    name = models.CharField(max_length=100)
    mood = models.CharField(max_length=20, choices=MOOD_CHOICES)
    description = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mood_folders')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.mood}"

class Song(models.Model):
    title = models.CharField(max_length=200)
    artist = models.CharField(max_length=200)
    audio_file = models.FileField(upload_to='songs/')
    folder = models.ForeignKey(MoodFolder, on_delete=models.CASCADE, related_name='songs')
    duration = models.IntegerField(help_text="Duration in seconds", null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['title']
    
    def __str__(self):
        return f"{self.title} by {self.artist}"