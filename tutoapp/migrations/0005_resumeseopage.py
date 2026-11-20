from django.db import migrations, models


def seed_resume_seo_pages(apps, schema_editor):
    ResumeSeoPage = apps.get_model('tutoapp', 'ResumeSeoPage')
    from tutoapp.resume_catalog import ROLE_CATALOG
    from tutoapp.resume_seo import LANDING_PAGES

    for slug, page in LANDING_PAGES.items():
        path = f'/resume-guides/{slug}/'
        ResumeSeoPage.objects.update_or_create(
            path=path,
            defaults={
                'page_type': page['page_type'],
                'title': page['title'],
                'meta_description': page['description'],
                'h1': page['h1'],
                'intro': page['intro'],
                'body': '\n'.join(f'{heading}|{paragraph}' for heading, paragraph in page['sections']),
                'faqs': [{'question': question, 'answer': answer} for question, answer in page['faqs']],
                'published': True,
                'indexable': True,
                'include_in_sitemap': True,
                'content_quality_score': 80,
                'editorial_notes': 'Review the content and local conventions before changing publication status.',
            },
        )

    for role in ROLE_CATALOG:
        path = f"/resume/{role['slug']}/"
        ResumeSeoPage.objects.update_or_create(
            path=path,
            defaults={
                'page_type': 'role',
                'title': f"{role['title']} Resume Example & Guide | OWCUS",
                'meta_description': f"Explore an ATS-friendly {role['title']} resume example from OWCUS, with role-specific skills, projects, achievements, interview preparation, and practical career guidance.",
                'h1': f"{role['title']} Resume Example",
                'intro': '',
                'published': True,
                'indexable': True,
                'include_in_sitemap': True,
                'content_quality_score': 70,
                'editorial_notes': 'Generated baseline metadata. Review role-specific content before making editorial claims.',
            },
        )


def remove_seeded_resume_seo_pages(apps, schema_editor):
    apps.get_model('tutoapp', 'ResumeSeoPage').objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ('tutoapp', '0004_firebaseidentity'),
    ]

    operations = [
        migrations.CreateModel(
            name='ResumeSeoPage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('path', models.CharField(max_length=255, unique=True)),
                ('page_type', models.CharField(choices=[('guide', 'Resume guide'), ('category', 'Role category'), ('country', 'Country format'), ('role', 'Role page override')], default='guide', max_length=20)),
                ('title', models.CharField(max_length=160)),
                ('meta_description', models.CharField(max_length=320)),
                ('h1', models.CharField(max_length=180)),
                ('intro', models.TextField()),
                ('body', models.TextField(blank=True)),
                ('faqs', models.JSONField(blank=True, default=list)),
                ('published', models.BooleanField(default=True)),
                ('indexable', models.BooleanField(default=True)),
                ('include_in_sitemap', models.BooleanField(default=True)),
                ('content_quality_score', models.PositiveSmallIntegerField(default=0)),
                ('editorial_notes', models.TextField(blank=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Resume SEO page',
                'verbose_name_plural': 'Resume SEO pages',
                'ordering': ['path'],
            },
        ),
        migrations.RunPython(seed_resume_seo_pages, remove_seeded_resume_seo_pages),
    ]
