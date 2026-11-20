from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


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


class FirebaseIdentity(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='firebase_identity')
    firebase_uid = models.CharField(max_length=128, unique=True, db_index=True)
    email = models.EmailField()
    display_name = models.CharField(max_length=150, blank=True)
    photo_url = models.URLField(blank=True)
    provider = models.CharField(max_length=40, default='google')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.display_name or self.email} ({self.firebase_uid})'


class ResumeSeoPage(models.Model):
    PAGE_TYPES = (
        ('guide', 'Resume guide'),
        ('category', 'Role category'),
        ('country', 'Country format'),
        ('role', 'Role page override'),
    )

    path = models.CharField(max_length=255, unique=True)
    page_type = models.CharField(max_length=20, choices=PAGE_TYPES, default='guide')
    title = models.CharField(max_length=160)
    meta_description = models.CharField(max_length=320)
    h1 = models.CharField(max_length=180)
    intro = models.TextField()
    body = models.TextField(blank=True)
    faqs = models.JSONField(default=list, blank=True)
    published = models.BooleanField(default=True)
    indexable = models.BooleanField(default=True)
    include_in_sitemap = models.BooleanField(default=True)
    content_quality_score = models.PositiveSmallIntegerField(default=0)
    editorial_notes = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['path']
        verbose_name = 'Resume SEO page'
        verbose_name_plural = 'Resume SEO pages'

    def __str__(self):
        return self.title

    def clean(self):
        """Keep published landing pages useful, unique, and crawl-safe."""
        errors = {}

        if not self.path.startswith('/') or not self.path.endswith('/'):
            errors['path'] = 'Use a canonical path that starts and ends with /. '

        if self.published and self.indexable:
            if self.content_quality_score < 70:
                errors['content_quality_score'] = (
                    'Published indexable pages need a content quality score of at least 70.'
                )
            if len((self.title or '').strip()) < 30:
                errors['title'] = 'Published indexable pages need a descriptive title.'
            if len((self.meta_description or '').strip()) < 80:
                errors['meta_description'] = (
                    'Published indexable pages need a useful meta description of at least 80 characters.'
                )
            if self.page_type != 'role' and len((self.intro or '').strip()) < 120:
                errors['intro'] = 'Published guide and category pages need a substantive introduction.'

            other_pages = ResumeSeoPage.objects.filter(
                published=True,
                indexable=True,
            ).exclude(pk=self.pk)
            if self.title and other_pages.filter(title__iexact=self.title.strip()).exists():
                errors['title'] = 'This title is already used by another indexable SEO page.'
            if self.meta_description and other_pages.filter(
                meta_description__iexact=self.meta_description.strip()
            ).exists():
                errors['meta_description'] = (
                    'This meta description is already used by another indexable SEO page.'
                )

        if errors:
            raise ValidationError(errors)
