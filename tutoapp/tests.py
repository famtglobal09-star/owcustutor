import json
from urllib.parse import parse_qs, urlsplit

from django.core import mail
from django.test import TestCase, override_settings
from django.contrib.auth.models import User

from .models import EmailVerificationChallenge, SavedProgram


class CompilerPlatformTests(TestCase):
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
        robots = self.client.get('/robots.txt')
        self.assertEqual(robots.status_code, 200)
        self.assertContains(robots, 'Sitemap:')

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
