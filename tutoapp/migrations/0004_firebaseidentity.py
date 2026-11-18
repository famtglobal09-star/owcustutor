from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('tutoapp', '0003_emailverificationchallenge_link_token_hash'),
    ]

    operations = [
        migrations.CreateModel(
            name='FirebaseIdentity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('firebase_uid', models.CharField(db_index=True, max_length=128, unique=True)),
                ('email', models.EmailField(max_length=254)),
                ('display_name', models.CharField(blank=True, max_length=150)),
                ('photo_url', models.URLField(blank=True)),
                ('provider', models.CharField(default='google', max_length=40)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='firebase_identity', to='auth.user')),
            ],
        ),
    ]
