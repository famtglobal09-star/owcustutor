from django.contrib import admin

from .models import ResumeSeoPage


@admin.register(ResumeSeoPage)
class ResumeSeoPageAdmin(admin.ModelAdmin):
    list_display = ('path', 'page_type', 'published', 'indexable', 'include_in_sitemap', 'content_quality_score', 'updated_at')
    list_filter = ('page_type', 'published', 'indexable', 'include_in_sitemap')
    search_fields = ('path', 'title', 'h1', 'meta_description')
    list_editable = ('published', 'indexable', 'include_in_sitemap', 'content_quality_score')
    readonly_fields = ('updated_at',)
