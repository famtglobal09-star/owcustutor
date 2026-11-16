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


class EmailVerificationChallenge(models.Model):
    REGISTRATION = 'registration'
    PASSWORD_RESET = 'password_reset'
    PURPOSES = ((REGISTRATION, 'Registration'), (PASSWORD_RESET, 'Password reset'))

    email = models.EmailField(db_index=True)
    full_name = models.CharField(max_length=150, blank=True)
    purpose = models.CharField(max_length=20, choices=PURPOSES)
    code_hash = models.CharField(max_length=256)
    link_token_hash = models.CharField(max_length=256, blank=True)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    used_at = models.DateTimeField(null=True, blank=True)
    attempts = models.PositiveSmallIntegerField(default=0)

    class Meta:
        indexes = [models.Index(fields=['email', 'purpose', '-created_at'])]
