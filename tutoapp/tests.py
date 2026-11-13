import json

from django.test import TestCase

from .models import SavedProgram


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
