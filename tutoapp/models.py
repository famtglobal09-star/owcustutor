from django.db import models
from django.contrib.auth.models import User


class SavedProgram(models.Model):
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE, related_name='saved_programs')
    session_key = models.CharField(max_length=40, blank=True, db_index=True)
    name = models.CharField(max_length=120)
    language = models.CharField(max_length=40)
    source = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f'{self.name} ({self.language})'


class PracticeSubmission(models.Model):
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE, related_name='practice_submissions')
    session_key = models.CharField(max_length=40, blank=True, db_index=True)
    challenge_id = models.CharField(max_length=80)
    language = models.CharField(max_length=40)
    source = models.TextField()
    status = models.CharField(max_length=30, default='pending')
    stdout = models.TextField(blank=True)
    stderr = models.TextField(blank=True)
    elapsed_ms = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
