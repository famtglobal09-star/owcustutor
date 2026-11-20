import json
from urllib.parse import parse_qs, urlsplit

from django.core import mail
from django.core.exceptions import ValidationError
from django.test import TestCase, override_settings
from django.contrib.auth.models import User

from .models import EmailVerificationChallenge, ResumeSeoPage, SavedProgram
from .resume_catalog import ROLE_CATALOG, role_content


class CompilerPlatformTests(TestCase):
    def test_every_resume_role_has_ten_unique_role_specific_responsibilities(self):
        self.assertGreaterEqual(len(ROLE_CATALOG), 100)
        for role in ROLE_CATALOG:
            content = role_content(role)
            responsibilities = content['responsibilities']
            self.assertEqual(len(responsibilities), 10, role['title'])
            self.assertEqual(len(set(responsibilities)), 10, role['title'])
            self.assertTrue(any('[Sample achievement]' in item for item in responsibilities), role['title'])
            self.assertTrue(any(role['title'].lower() in item.lower() for item in responsibilities), role['title'])

    def test_fresher_role_uses_internship_and_project_responsibilities_by_default(self):
        role = next(item for item in ROLE_CATALOG if item['title'] == 'Manual Testing Fresher')
        responsibilities = role_content(role)['responsibilities']
        self.assertIn('internship', responsibilities[0].lower())
        self.assertIn('project', responsibilities[2].lower())
    def test_dashboard_requires_an_authenticated_session(self):
        response = self.client.get('/dashboard/')
        self.assertEqual(response.status_code, 302)
        self.assertIn('auth=required', response['Location'])

    def test_playground_pages_render(self):
        self.assertEqual(self.client.get('/compiler/').status_code, 200)
        self.assertEqual(self.client.get('/practice/').status_code, 200)

    def test_resume_builder_page_and_assets_render(self):
        response = self.client.get('/resume-builder/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'OWCUS AI Resume Builder')
        self.assertContains(response, 'resume-builder/assets/index-')

    def test_resume_hub_and_role_pages_render(self):
        hub = self.client.get('/resume/')
        self.assertEqual(hub.status_code, 200)
        self.assertContains(hub, 'Find Your Perfect Resume')
        self.assertContains(hub, '/resume/qa-automation-engineer/')
        role = self.client.get('/resume/qa-automation-engineer/?experience=5-years-experience')
        self.assertEqual(role.status_code, 200)
        self.assertContains(role, 'QA Automation Engineer Resume Example')
        self.assertContains(role, 'BreadcrumbList')

    def test_resume_seo_endpoints_render(self):
        sitemap = self.client.get('/sitemap.xml')
        self.assertEqual(sitemap.status_code, 200)
        self.assertContains(sitemap, '/resume/ai-engineer/')
        self.assertContains(sitemap, '/resume-guides/ats-resumes/')
        self.assertNotContains(sitemap, '<loc>https://www.owcus.com/resume-builder/</loc>')
        robots = self.client.get('/robots.txt')
        self.assertEqual(robots.status_code, 200)
        self.assertContains(robots, 'Sitemap:')
        self.assertContains(robots, 'Disallow: /dashboard/')
        self.assertEqual(self.client.get('/sitemaps/resume-roles.xml').status_code, 200)
        self.assertContains(self.client.get('/sitemaps/resume-guides.xml'), '/resume-guides/ats-resumes/')

    def test_resume_seo_landing_pages_are_server_rendered_and_indexable(self):
        response = self.client.get('/resume-guides/india-resume-format/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'India resume format')
        self.assertContains(response, 'rel="canonical"')
        self.assertContains(response, 'index,follow')
        self.assertContains(response, 'BreadcrumbList')

    def test_country_alias_redirects_to_canonical_resume_guide(self):
        response = self.client.get('/resume/india/')
        self.assertEqual(response.status_code, 301)
        self.assertEqual(response['Location'], '/resume-guides/india-resume-format/')

    def test_indexable_seo_pages_reject_weak_or_duplicate_metadata(self):
        page = ResumeSeoPage(
            path='/resume-guides/test-quality/',
            title='Short title',
            meta_description='Too short',
            h1='Test page',
            intro='Brief introduction',
            published=True,
            indexable=True,
            content_quality_score=40,
        )
        with self.assertRaises(ValidationError):
            page.full_clean()

    def test_resume_builder_ai_compatibility_endpoints(self):
        suggestions = self.client.post('/api/ai/suggest-responsibilities', data=json.dumps({'role': 'Tester', 'company': 'OWCUS', 'skills': ['Python']}), content_type='application/json')
        self.assertEqual(suggestions.status_code, 200)
        self.assertTrue(suggestions.json()['suggestions'])
        audit = self.client.post('/api/ai/ats-audit', data=json.dumps({'resumeData': {'skills': ['Python'], 'summary': 'Experienced tester.'}}), content_type='application/json')
        self.assertEqual(audit.status_code, 200)
        self.assertIn('overallScore', audit.json()['audit'])

    def test_language_catalog_contains_real_runtime_metadata(self):
        response = self.client.get('/api/compiler/languages/')
        self.assertEqual(response.status_code, 200)
        languages = response.json()['languages']
        self.assertIn('python', {item['id'] for item in languages})
        self.assertEqual(next(item for item in languages if item['id'] == 'html')['mode'], 'browser')

    def test_anonymous_program_can_be_saved_and_retrieved(self):
        response = self.client.post('/api/compiler/saved/', data=json.dumps({'name': 'Test', 'language': 'python', 'source': 'print(1)'}), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(SavedProgram.objects.count(), 1)
        self.assertEqual(self.client.get('/api/compiler/saved/').json()['programs'][0]['name'], 'Test')

    def test_remote_execution_is_explicitly_unavailable_without_runner(self):
        response = self.client.post('/api/compiler/execute/', data=json.dumps({'language': 'python', 'source': 'print(1)'}), content_type='application/json')
        self.assertEqual(response.status_code, 503)
        self.assertIn('JUDGE0_URL', response.json()['error'])

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_registration_verification_link_is_hashed_and_creates_user(self):
        start = self.client.post('/api/auth/otp/start/', data=json.dumps({'email': 'new@example.com', 'full_name': 'New User', 'purpose': 'registration'}), content_type='application/json')
        self.assertEqual(start.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        challenge = EmailVerificationChallenge.objects.get(pk=start.json()['challenge_id'])
        self.assertNotIn('verification code is', mail.outbox[0].body)
        link = next(line for line in mail.outbox[0].body.splitlines() if '?verify=' in line)
        query = parse_qs(urlsplit(link).query)
        verified = self.client.post('/api/auth/otp/verify-link/', data=json.dumps({'challenge_id': query['verify'][0], 'token': query['token'][0]}), content_type='application/json')
        self.assertEqual(verified.status_code, 200)
        complete = self.client.post('/api/auth/otp/complete/', data=json.dumps({'challenge_id': challenge.pk, 'password': 'Safe password 123!', 'confirm_password': 'Safe password 123!'}), content_type='application/json')
        self.assertEqual(complete.status_code, 200)
        self.assertTrue(User.objects.filter(email='new@example.com').exists())

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_otp_cannot_be_reused_or_used_after_max_attempts(self):
        start = self.client.post('/api/auth/otp/start/', data=json.dumps({'email': 'retry@example.com', 'purpose': 'registration'}), content_type='application/json')
        challenge_id = start.json()['challenge_id']
        for _ in range(5):
            response = self.client.post('/api/auth/otp/verify/', data=json.dumps({'challenge_id': challenge_id, 'code': '111111'}), content_type='application/json')
            self.assertEqual(response.status_code, 400)
        self.assertEqual(EmailVerificationChallenge.objects.get(pk=challenge_id).attempts, 5)

    def test_django_email_session_login_and_logout(self):
        User.objects.create_user(username='session@example.com', email='session@example.com', password='Safe password 123!', first_name='Session User')
        login_response = self.client.post('/api/auth/login/', data=json.dumps({'email': 'session@example.com', 'password': 'Safe password 123!'}), content_type='application/json')
        self.assertEqual(login_response.status_code, 200)
        self.assertTrue(self.client.get('/api/auth/session/').json()['authenticated'])
        logout_response = self.client.post('/api/auth/logout/', data='{}', content_type='application/json')
        self.assertEqual(logout_response.status_code, 200)
        self.assertFalse(self.client.get('/api/auth/session/').json()['authenticated'])

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend', ALLOWED_HOSTS=['testserver'])
    def test_registration_email_contains_one_time_password_setup_link(self):
        start = self.client.post('/api/auth/otp/start/', data=json.dumps({'email': 'link@example.com', 'purpose': 'registration'}), content_type='application/json')
        self.assertEqual(start.status_code, 200)
        link = next(line for line in mail.outbox[0].body.splitlines() if '?verify=' in line)
        query = parse_qs(urlsplit(link).query)
        response = self.client.post('/api/auth/otp/verify-link/', data=json.dumps({'challenge_id': query['verify'][0], 'token': query['token'][0]}), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['email'], 'link@example.com')
        repeated = self.client.post('/api/auth/otp/verify-link/', data=json.dumps({'challenge_id': query['verify'][0], 'token': query['token'][0]}), content_type='application/json')
        self.assertEqual(repeated.status_code, 200)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend', ALLOWED_HOSTS=['testserver'])
    def test_password_reset_email_link_updates_existing_password(self):
        user = User.objects.create_user(username='reset@example.com', email='reset@example.com', password='Old password 123!', first_name='Reset User')
        start = self.client.post('/api/auth/otp/start/', data=json.dumps({'email': user.email, 'purpose': 'password_reset'}), content_type='application/json')
        self.assertEqual(start.status_code, 200)
        self.assertEqual(mail.outbox[0].subject, 'Reset your OWCUS password')
        link = next(line for line in mail.outbox[0].body.splitlines() if '?verify=' in line)
        query = parse_qs(urlsplit(link).query)
        verified = self.client.post('/api/auth/otp/verify-link/', data=json.dumps({'challenge_id': query['verify'][0], 'token': query['token'][0]}), content_type='application/json')
        self.assertEqual(verified.status_code, 200)
        complete = self.client.post('/api/auth/otp/complete/', data=json.dumps({'challenge_id': start.json()['challenge_id'], 'password': 'New password 456!', 'confirm_password': 'New password 456!'}), content_type='application/json')
        self.assertEqual(complete.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.check_password('New password 456!'))

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_email_password_completion_rejects_mismatch(self):
        start = self.client.post('/api/auth/otp/start/', data=json.dumps({'email': 'mismatch@example.com', 'purpose': 'registration'}), content_type='application/json')
        challenge = EmailVerificationChallenge.objects.get(pk=start.json()['challenge_id'])
        challenge.verified_at = challenge.created_at
        challenge.save(update_fields=['verified_at'])
        complete = self.client.post('/api/auth/otp/complete/', data=json.dumps({'challenge_id': challenge.pk, 'password': 'New password 456!', 'confirm_password': 'Different password 789!'}), content_type='application/json')
        self.assertEqual(complete.status_code, 400)
        self.assertFalse(User.objects.filter(email='mismatch@example.com').exists())
