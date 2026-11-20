"""
URL configuration for tutors project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from tutoapp.views import (
    about_page, ads_txt, compiler_execute, compiler_languages, compiler_page, contact_page, course_page, dashboard, home,
    java, java_compile, practice_catalog, practice_page, practice_submit, privacy_page, terms_page,
    google_site_verification, marketing_sandbox_showcase, resume_ai_ats_audit, resume_ai_suggest_responsibilities, resume_builder_page, resume_hub, resume_role, resume_seo_landing, resume_segment_sitemap, resume_sitemap, robots_txt, saved_programs, tutorials, dv360_page, cm360_page,
    auth_otp_start, auth_otp_verify, auth_otp_verify_link, auth_otp_complete, auth_session, auth_email_login, auth_firebase_login, auth_logout,
)

urlpatterns = [
    path('', home, name='home'),
    path('about/', about_page, name='about'),
    path('contact/', contact_page, name='contact'),
    path('privacy/', privacy_page, name='privacy'),
    path('terms/', terms_page, name='terms'),
    path('dashboard/', dashboard, name='dashboard'),
    path('tutorials/', tutorials, name='tutorials'),
    path('dv360/', dv360_page, name='dv360'),
    path('cm360/', cm360_page, name='cm360'),
    path('marketing-sandboxes/', marketing_sandbox_showcase, name='marketing_sandbox_showcase'),
    path('html/', course_page, {'course_name': 'html'}, name='html_course'),
    path('css/', course_page, {'course_name': 'css'}, name='css_course'),
    path('javascript/', course_page, {'course_name': 'javascript'}, name='javascript_course'),
    path('python/', course_page, {'course_name': 'python'}, name='python_course'),
    path('csharp/', course_page, {'course_name': 'csharp'}, name='csharp_course'),
    path('data-science/', course_page, {'course_name': 'data_science'}, name='data_science_course'),
    path('manual-testing/', course_page, {'course_name': 'manual_testing'}, name='manual_testing_course'),
    path('practical-skills/', course_page, {'course_name': 'practical_skills'}, name='practical_skills_course'),
    path('java/', java, name='java'),
    path('compiler/', compiler_page, name='compiler'),
    path('practice/', practice_page, name='practice'),
    path('resume-builder/', resume_builder_page, name='resume_builder'),
    path('resume/', resume_hub, name='resume_hub'),
    path('resume-guides/<slug:slug>/', resume_seo_landing, name='resume_seo_landing'),
    path('resume/<slug:slug>/', resume_role, name='resume_role'),
    path('sitemap.xml', resume_sitemap, name='resume_sitemap'),
    path('sitemaps/resume-<slug:segment>.xml', resume_segment_sitemap, name='resume_segment_sitemap'),
    path('robots.txt', robots_txt, name='robots_txt'),
    path('ads.txt', ads_txt, name='ads_txt'),
    path('google25bab95f8df852e0.html', google_site_verification, name='google_site_verification'),
    path('api/ai/suggest-responsibilities', resume_ai_suggest_responsibilities, name='resume_ai_suggest_responsibilities'),
    path('api/ai/ats-audit', resume_ai_ats_audit, name='resume_ai_ats_audit'),
    path('api/compiler/languages/', compiler_languages, name='compiler_languages'),
    path('api/compiler/execute/', compiler_execute, name='compiler_execute'),
    path('api/compiler/saved/', saved_programs, name='saved_programs'),
    path('api/practice/catalog/', practice_catalog, name='practice_catalog'),
    path('api/practice/submit/', practice_submit, name='practice_submit'),
    path('api/java/compile/', java_compile, name='java_compile'),
    path('api/auth/otp/start/', auth_otp_start, name='auth_otp_start'),
    path('api/auth/otp/verify/', auth_otp_verify, name='auth_otp_verify'),
    path('api/auth/otp/verify-link/', auth_otp_verify_link, name='auth_otp_verify_link'),
    path('api/auth/otp/complete/', auth_otp_complete, name='auth_otp_complete'),
    path('api/auth/session/', auth_session, name='auth_session'),
    path('api/auth/login/', auth_email_login, name='auth_email_login'),
    path('api/auth/firebase/', auth_firebase_login, name='auth_firebase_login'),
    path('api/auth/logout/', auth_logout, name='auth_logout'),
    path('admin/', admin.site.urls),
]
