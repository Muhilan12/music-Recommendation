from django.contrib import admin
from .models import MoodFolder, Song

@admin.register(MoodFolder)
class MoodFolderAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'mood', 'user', 'created_at')
    list_filter = ('mood', 'user', 'created_at')
    search_fields = ('name', 'mood', 'user__username')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'artist', 'folder', 'uploaded_at')
    list_filter = ('folder', 'artist', 'uploaded_at')
    search_fields = ('title', 'artist', 'folder__name')
    ordering = ('title',)
    readonly_fields = ('uploaded_at',)
