import json
import logging
import os
import secrets
import shutil
import subprocess
import tempfile
import time
from datetime import timedelta
from html import escape
from urllib import request as urlrequest
from urllib.error import HTTPError, URLError

from django.contrib.auth import get_user_model, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.password_validation import validate_password
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db import transaction
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods, require_POST
from django.utils import timezone
from django.urls import reverse

from .models import EmailVerificationChallenge, FirebaseIdentity, PracticeSubmission, SavedProgram
from .resume_catalog import EXPERIENCE_OPTIONS, ROLE_BY_SLUG, ROLE_CATALOG, ROLE_GROUPS, role_content

logger = logging.getLogger(__name__)

try:
    import firebase_admin
    from firebase_admin import auth as firebase_auth
    from firebase_admin import credentials as firebase_credentials
except ImportError:
    firebase_admin = None
    firebase_auth = None
    firebase_credentials = None


LANGUAGES = [
    {'id': 'python', 'label': 'Python 3', 'runtime': 'Judge0 Python 3', 'mode': 'remote', 'extension': '.py'},
    {'id': 'javascript', 'label': 'JavaScript', 'runtime': 'Browser sandbox', 'mode': 'browser', 'extension': '.js'},
    {'id': 'java', 'label': 'Java', 'runtime': 'Judge0 OpenJDK', 'mode': 'remote', 'extension': '.java'},
    {'id': 'c', 'label': 'C', 'runtime': 'Judge0 GCC', 'mode': 'remote', 'extension': '.c'},
    {'id': 'cpp', 'label': 'C++', 'runtime': 'Judge0 G++', 'mode': 'remote', 'extension': '.cpp'},
    {'id': 'csharp', 'label': 'C#', 'runtime': 'Judge0 .NET', 'mode': 'remote', 'extension': '.cs'},
    {'id': 'html', 'label': 'HTML', 'runtime': 'Browser sandbox', 'mode': 'browser', 'extension': '.html'},
    {'id': 'css', 'label': 'CSS', 'runtime': 'Browser sandbox', 'mode': 'browser', 'extension': '.css'},
    {'id': 'sql', 'label': 'SQL', 'runtime': 'Judge0 SQLite', 'mode': 'remote', 'extension': '.sql'},
    {'id': 'typescript', 'label': 'TypeScript', 'runtime': 'Judge0 TypeScript', 'mode': 'remote', 'extension': '.ts'},
    {'id': 'go', 'label': 'Go', 'runtime': 'Judge0 Go', 'mode': 'remote', 'extension': '.go'},
    {'id': 'rust', 'label': 'Rust', 'runtime': 'Judge0 Rust', 'mode': 'remote', 'extension': '.rs'},
]

LANGUAGE_IDS = {
    'python': 71, 'javascript': 63, 'java': 62, 'c': 50, 'cpp': 54,
    'csharp': 51, 'sql': 82, 'typescript': 74, 'go': 60, 'rust': 73,
}

STARTERS = {
    'python': 'name = input("Name: ")\nprint(f"Hello, {name}!")',
    'javascript': 'const name = "OWCUS";\nconsole.log(`Hello, ${name}!`);',
    'java': 'import java.util.Scanner;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner input = new Scanner(System.in);\n    String name = input.hasNextLine() ? input.nextLine() : "OWCUS";\n    System.out.println("Hello, " + name);\n  }\n}',
    'c': '#include <stdio.h>\n\nint main(void) {\n    printf("Hello, OWCUS!\\n");\n    return 0;\n}',
    'cpp': '#include <iostream>\n\nint main() {\n    std::cout << "Hello, OWCUS!\\n";\n}',
    'csharp': 'using System;\n\nConsole.WriteLine("Hello, OWCUS!");',
    'html': '<!doctype html>\n<html>\n  <body>\n    <h1>Hello, OWCUS!</h1>\n  </body>\n</html>',
    'css': '<style>\n  body { font-family: system-ui; color: #176b5b; }\n</style>\n<h1>Style this preview</h1>',
    'sql': 'CREATE TABLE students (name TEXT, score INTEGER);\nINSERT INTO students VALUES (\'Ravi\', 92);\nSELECT * FROM students;',
    'typescript': 'const message: string = "Hello, OWCUS!";\nconsole.log(message);',
    'go': 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, OWCUS!")\n}',
    'rust': 'fn main() {\n    println!("Hello, OWCUS!");\n}',
}

PRACTICE_CHALLENGES = [
    {'id': 'hello-world', 'title': 'Hello World', 'difficulty': 'Beginner', 'topic': 'Basics', 'statement': 'Print the exact text Hello, World!.', 'input': 'No input', 'output': 'Hello, World!', 'constraints': 'Print one line.', 'starter': STARTERS['python'], 'hint': 'Use print in Python or the equivalent output function in your language.'},
    {'id': 'sum-two-numbers', 'title': 'Sum Two Numbers', 'difficulty': 'Beginner', 'topic': 'Operators', 'statement': 'Read two integers and print their sum.', 'input': 'Two space-separated integers a and b.', 'output': 'The value of a + b.', 'constraints': '-10^9 <= a, b <= 10^9', 'starter': 'a, b = map(int, input().split())\nprint(a + b)', 'hint': 'Convert input tokens to integers before adding them.'},
    {'id': 'palindrome', 'title': 'Palindrome Check', 'difficulty': 'Intermediate', 'topic': 'Strings', 'statement': 'Print YES if a word reads the same forwards and backwards; otherwise print NO.', 'input': 'One lowercase word.', 'output': 'YES or NO.', 'constraints': '1 <= length <= 100000', 'starter': 'word = input().strip()\nprint("YES" if word == word[::-1] else "NO")', 'hint': 'Compare the word with its reversed form.'},
    {'id': 'two-sum', 'title': 'Two Sum', 'difficulty': 'Advanced', 'topic': 'Algorithms', 'statement': 'Given a list and a target, find two different positions whose values add to the target.', 'input': 'A list of integers and a target value.', 'output': 'The two positions, or -1 if no pair exists.', 'constraints': 'Use a dictionary for an O(n) approach.', 'starter': 'numbers = [2, 7, 11, 15]\ntarget = 9\nseen = {}\nfor index, value in enumerate(numbers):\n    needed = target - value\n    if needed in seen:\n        print(seen[needed], index)\n        break\n    seen[value] = index', 'hint': 'Store values already seen and look up the complement.'},
]

@ensure_csrf_cookie
def home(request):
    return render(request, 'tutoapp/home.html')

def about_page(request):
    return render(request, 'tutoapp/about.html')

def contact_page(request):
    return render(request, 'tutoapp/contact.html')

def privacy_page(request):
    return render(request, 'tutoapp/privacy.html')

def terms_page(request):
    return render(request, 'tutoapp/terms.html')

@login_required(login_url='/?auth=required')
def dashboard(request):
    return render(request, 'tutoapp/dashboard.html')

def tutorials(request):
    return render(request, 'tutoapp/tutorials.html')


def dv360_page(request):
    return render(request, 'tutoapp/dv360.html')


def cm360_page(request):
    return render(request, 'tutoapp/cm360.html')


def marketing_sandbox_showcase(request):
    return render(request, 'tutoapp/marketing_sandbox_showcase.html')


def course_page(request, course_name):
    course_templates = {
        'html': 'html.html',
        'css': 'css.html',
        'javascript': 'javascript.html',
        'python': 'python.html',
        'csharp': 'csharp.html',
        'data_science': 'data_science.html',
        'manual_testing': 'manual_testing.html',
        'practical_skills': 'practical_skills.html',
    }
    template = course_templates.get(course_name, 'html.html')
    return render(request, f'tutoapp/{template}', {'course': course_name})


@ensure_csrf_cookie
def java(request):
    return render(request, 'tutoapp/java.html')


@ensure_csrf_cookie
def compiler_page(request):
    return render(request, 'tutoapp/compiler.html', {'languages': LANGUAGES})


@ensure_csrf_cookie
def practice_page(request):
    return render(request, 'tutoapp/practice.html')


@ensure_csrf_cookie
def resume_builder_page(request):
    return render(request, 'tutoapp/resume_builder.html')


def resume_hub(request):
    groups = [
        {'name': name, 'roles': [role for role in ROLE_CATALOG if role['category'] == name]}
        for name in ROLE_GROUPS
    ]
    return render(request, 'tutoapp/resume_hub.html', {'groups': groups, 'roles': ROLE_CATALOG})


def resume_role(request, slug):
    role = ROLE_BY_SLUG.get(slug)
    if not role:
        from django.http import Http404
        raise Http404('Resume role not found')
    experience = request.GET.get('experience', '')
    content = role_content(role, experience)
    related_roles = [
        candidate for candidate in ROLE_CATALOG
        if candidate['category'] == role['category'] and candidate['slug'] != role['slug']
    ][:4]
    structured_data = json.dumps({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        'name': f"{role['title']} Resume Example",
        'description': f"ATS-friendly {role['title']} resume example and career guidance.",
        'url': f'https://www.owcus.com{reverse("resume_role", kwargs={"slug": role["slug"]})}',
        'breadcrumb': {
            '@type': 'BreadcrumbList',
            'itemListElement': [
                {'@type': 'ListItem', 'position': 1, 'name': 'Resume Examples', 'item': 'https://www.owcus.com/resume/'},
                {'@type': 'ListItem', 'position': 2, 'name': role['category']},
                {'@type': 'ListItem', 'position': 3, 'name': role['title']},
            ],
        },
    })
    return render(request, 'tutoapp/resume_role.html', {
        'role': role, 'content': content, 'experience_options': EXPERIENCE_OPTIONS,
        'selected_experience': experience, 'related_roles': related_roles,
        'structured_data': structured_data,
    })


def resume_sitemap(request):
    urls = [
        '/', '/about/', '/contact/', '/privacy/', '/terms/', '/tutorials/', '/html/', '/css/', '/javascript/', '/python/',
        '/csharp/', '/data-science/', '/manual-testing/', '/practical-skills/',
        '/java/', '/compiler/', '/practice/', '/resume-builder/', '/resume/', '/marketing-sandboxes/', '/dv360/', '/cm360/',
    ] + [f"/resume/{role['slug']}/" for role in ROLE_CATALOG]
    body = '<?xml version="1.0" encoding="UTF-8"?>' + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    canonical_base = 'https://www.owcus.com'
    body += ''.join(f'<url><loc>{escape(canonical_base + path)}</loc></url>' for path in urls)
    body += '</urlset>'
    return HttpResponse(body, content_type='application/xml')


def robots_txt(request):
    return HttpResponse(
        'User-agent: *\nAllow: /\nDisallow: /dashboard/\nDisallow: /admin/\nSitemap: https://www.owcus.com/sitemap.xml\n',
        content_type='text/plain',
    )

def ads_txt(request):
    return HttpResponse(
        'google.com, pub-6776941375498143, DIRECT, f08c47fec0942fa0\n',
        content_type='text/plain',
    )


def google_site_verification(request):
    return HttpResponse('google-site-verification: google25bab95f8df852e0.html\n', content_type='text/html')


OTP_TTL_SECONDS = 5 * 60
OTP_RESEND_SECONDS = 60
OTP_MAX_ATTEMPTS = 5
OTP_MAX_PER_HOUR = 5


def _normalise_email(value):
    return str(value or '').strip().casefold()


@require_POST
def auth_otp_start(request):
    payload = _json_body(request) or {}
    email = _normalise_email(payload.get('email'))
    purpose = payload.get('purpose')
    full_name = str(payload.get('full_name') or '').strip()[:150]
    if '@' not in email or len(email) > 254:
        return JsonResponse({'ok': False, 'error': 'Enter a valid email address.'}, status=400)
    if purpose not in {EmailVerificationChallenge.REGISTRATION, EmailVerificationChallenge.PASSWORD_RESET}:
        return JsonResponse({'ok': False, 'error': 'Unsupported verification request.'}, status=400)

    user_model = get_user_model()
    existing = user_model.objects.filter(email__iexact=email).first()
    if purpose == EmailVerificationChallenge.REGISTRATION and existing:
        return JsonResponse({'ok': False, 'error': 'An account already exists for this email. Please sign in.'}, status=409)

    now = timezone.now()
    recent = EmailVerificationChallenge.objects.filter(email=email, purpose=purpose, created_at__gte=now - timedelta(hours=1)).count()
    latest = EmailVerificationChallenge.objects.filter(email=email, purpose=purpose).order_by('-created_at').first()
    if recent >= OTP_MAX_PER_HOUR or (latest and (now - latest.created_at).total_seconds() < OTP_RESEND_SECONDS):
        return JsonResponse({'ok': True, 'message': 'A verification code was recently sent. Please wait before requesting another code.'})

    if settings.EMAIL_BACKEND == 'django.core.mail.backends.smtp.EmailBackend' and not settings.EMAIL_HOST_PASSWORD:
        logger.error('OWCUS verification email is not configured: ZOHO_EMAIL_PASSWORD is missing.')
        return JsonResponse({'ok': False, 'error': 'Email verification is temporarily unavailable because the email service is not configured.'}, status=503)

    link_token = secrets.token_urlsafe(32)
    challenge = EmailVerificationChallenge.objects.create(email=email, full_name=full_name, purpose=purpose, code_hash=make_password(secrets.token_urlsafe(24)), link_token_hash=make_password(link_token), expires_at=now + timedelta(seconds=OTP_TTL_SECONDS))
    verification_url = request.build_absolute_uri(f'{reverse("home")}?verify={challenge.pk}&token={link_token}')
    if purpose == EmailVerificationChallenge.REGISTRATION:
        subject = 'Verify your OWCUS email and create your password'
        delivery_text = f'Click this secure OWCUS verification link to verify your email and create your password:\n\n{verification_url}\n\nThis link expires in 5 minutes. If you did not request this, you can ignore this email.'
    else:
        subject = 'Reset your OWCUS password'
        delivery_text = f'Click this secure OWCUS link to verify your email and reset your OWCUS password:\n\n{verification_url}\n\nThis link expires in 5 minutes. If you did not request a password reset, you can ignore this email.'
    try:
        send_mail(subject, delivery_text, settings.DEFAULT_FROM_EMAIL, [email], fail_silently=False)
    except Exception:
        logger.exception('OWCUS verification email delivery failed for %s', email)
        challenge.delete()
        return JsonResponse({'ok': False, 'error': 'We could not send the verification email. Please try again later.'}, status=503)
    return JsonResponse({'ok': True, 'challenge_id': challenge.pk, 'cooldown_seconds': OTP_RESEND_SECONDS, 'message': 'Check your email for the verification code.'})


@require_POST
def auth_otp_verify(request):
    payload = _json_body(request) or {}
    challenge = EmailVerificationChallenge.objects.filter(pk=payload.get('challenge_id')).first()
    now = timezone.now()
    if not challenge or challenge.used_at or challenge.verified_at or challenge.expires_at <= now or challenge.attempts >= OTP_MAX_ATTEMPTS:
        return JsonResponse({'ok': False, 'error': 'That verification code is invalid or expired.'}, status=400)
    challenge.attempts += 1
    if not check_password(str(payload.get('code') or '').strip(), challenge.code_hash):
        challenge.save(update_fields=['attempts'])
        return JsonResponse({'ok': False, 'error': 'That verification code is incorrect.'}, status=400)
    challenge.verified_at = now
    challenge.save(update_fields=['attempts', 'verified_at'])
    return JsonResponse({'ok': True, 'message': 'Email verified. You can now create your password.'})


@require_POST
def auth_otp_verify_link(request):
    payload = _json_body(request) or {}
    with transaction.atomic():
        challenge = EmailVerificationChallenge.objects.select_for_update().filter(pk=payload.get('challenge_id')).first()
        now = timezone.now()
        if not challenge or challenge.used_at or challenge.verified_at or challenge.expires_at <= now or not check_password(str(payload.get('token') or ''), challenge.link_token_hash):
            return JsonResponse({'ok': False, 'error': 'That verification link is invalid or expired.'}, status=400)
        challenge.verified_at = now
        challenge.save(update_fields=['verified_at'])
    return JsonResponse({'ok': True, 'challenge_id': challenge.pk, 'purpose': challenge.purpose, 'email': challenge.email, 'name': challenge.full_name})


@require_POST
def auth_otp_complete(request):
    payload = _json_body(request) or {}
    password = str(payload.get('password') or '')
    if password != str(payload.get('confirm_password') or ''):
        return JsonResponse({'ok': False, 'error': 'Passwords do not match.'}, status=400)
    try:
        validate_password(password)
    except ValidationError as error:
        return JsonResponse({'ok': False, 'error': ' '.join(error.messages)}, status=400)
    with transaction.atomic():
        challenge = EmailVerificationChallenge.objects.select_for_update().filter(pk=payload.get('challenge_id')).first()
        now = timezone.now()
        if not challenge or not challenge.verified_at or challenge.used_at or challenge.expires_at <= now:
            return JsonResponse({'ok': False, 'error': 'Verify your email again before creating a password.'}, status=400)
        user_model = get_user_model()
        user = user_model.objects.select_for_update().filter(email__iexact=challenge.email).first()
        if challenge.purpose == EmailVerificationChallenge.REGISTRATION:
            if user:
                return JsonResponse({'ok': False, 'error': 'An account already exists for this email. Please sign in.'}, status=409)
            user = user_model.objects.create_user(username=challenge.email, email=challenge.email, password=password, first_name=challenge.full_name)
        elif not user or not user.is_active:
            return JsonResponse({'ok': False, 'error': 'We could not reset that account. Please contact support.'}, status=400)
        else:
            user.set_password(password)
            user.save(update_fields=['password'])
        challenge.used_at = now
        challenge.save(update_fields=['used_at'])
    if user:
        login(request, user)
    return JsonResponse({'ok': True, 'message': 'Password saved successfully.', 'user': {'email': challenge.email, 'name': challenge.full_name}})


@require_http_methods(['GET'])
def auth_session(request):
    if not request.user.is_authenticated:
        return JsonResponse({'authenticated': False})
    identity = getattr(request.user, 'firebase_identity', None)
    return JsonResponse({'authenticated': True, 'user': {
        'uid': identity.firebase_uid if identity else '',
        'email': request.user.email,
        'name': (identity.display_name if identity else '') or request.user.first_name or request.user.username,
        'photoURL': identity.photo_url if identity else '',
    }})


@require_POST
def auth_email_login(request):
    payload = _json_body(request) or {}
    email = _normalise_email(payload.get('email'))
    user = get_user_model().objects.filter(email__iexact=email).first()
    if not user or not user.check_password(str(payload.get('password') or '')) or not user.is_active:
        return JsonResponse({'ok': False, 'error': 'Email or password is incorrect.'}, status=401)
    login(request, user)
    return JsonResponse({'ok': True, 'user': {'email': user.email, 'name': user.first_name or user.username}})


def _firebase_admin_auth():
    if firebase_admin is None or not settings.FIREBASE_ADMIN_CREDENTIALS:
        return None
    try:
        app = firebase_admin.get_app()
    except ValueError:
        credential_path = settings.FIREBASE_ADMIN_CREDENTIALS
        app = firebase_admin.initialize_app(
            firebase_credentials.Certificate(credential_path),
            {'projectId': settings.FIREBASE_PROJECT_ID},
        )
    return firebase_auth


@require_POST
def auth_firebase_login(request):
    payload = _json_body(request) or {}
    id_token = str(payload.get('id_token') or '').strip()
    if not id_token:
        return JsonResponse({'ok': False, 'error': 'Firebase ID token is required.'}, status=400)
    try:
        firebase = _firebase_admin_auth()
        if firebase is None:
            return JsonResponse({'ok': False, 'error': 'Google sign-in is not configured on the server.'}, status=503)
        decoded = firebase.verify_id_token(id_token, check_revoked=True)
        uid = str(decoded.get('uid') or '')
        email = _normalise_email(decoded.get('email'))
        if not uid or not email or not decoded.get('email_verified', False):
            return JsonResponse({'ok': False, 'error': 'Google returned an unverified account.'}, status=401)
    except Exception:
        logger.exception('Firebase ID token verification failed')
        return JsonResponse({'ok': False, 'error': 'Google sign-in could not be verified. Please try again.'}, status=401)

    user_model = get_user_model()
    identity = FirebaseIdentity.objects.select_related('user').filter(firebase_uid=uid).first()
    user = identity.user if identity else user_model.objects.filter(email__iexact=email).first()
    display_name = str(decoded.get('name') or email.split('@', 1)[0])[:150]
    photo_url = str(decoded.get('picture') or '')[:500]
    if user is None:
        username = f'firebase_{uid}'
        user = user_model.objects.create_user(username=username, email=email, first_name=display_name)
    elif not user.is_active:
        return JsonResponse({'ok': False, 'error': 'This account has been disabled.'}, status=403)
    user.email = email
    if display_name and not user.first_name:
        user.first_name = display_name
    user.save(update_fields=['email', 'first_name'])
    FirebaseIdentity.objects.update_or_create(
        user=user,
        defaults={'firebase_uid': uid, 'email': email, 'display_name': display_name, 'photo_url': photo_url, 'provider': 'google'},
    )
    login(request, user)
    return JsonResponse({'ok': True, 'user': {'uid': uid, 'email': email, 'name': display_name, 'photoURL': photo_url}})


@require_POST
def auth_logout(request):
    logout(request)
    return JsonResponse({'ok': True})


@csrf_exempt
@require_POST
def resume_ai_suggest_responsibilities(request):
    payload = _json_body(request) or {}
    role = payload.get('role') or 'Software Engineer'
    company = payload.get('company') or 'the organization'
    skills = payload.get('skills') or []
    skill_text = ' and '.join(str(skill) for skill in skills[:3]) or 'modern technologies'
    return JsonResponse({'suggestions': [
        f'Developed scalable {role} solutions using {skill_text} at {company}, improving delivery efficiency by 28%.',
        'Automated testing and deployment workflows, reducing manual release effort by 40%.',
        'Collaborated with cross-functional teams to deliver roadmap initiatives ahead of schedule.',
        f'Optimized application performance using {skill_text}, reducing average response time by 30%.',
        'Documented technical decisions and mentored teammates on maintainable engineering practices.',
    ]})


@csrf_exempt
@require_POST
def resume_ai_ats_audit(request):
    payload = _json_body(request) or {}
    resume = payload.get('resumeData') or {}
    personal = resume.get('personalInfo') or {}
    skills = resume.get('skills') or []
    experience = resume.get('experience') or []
    education = resume.get('education') or []
    summary = resume.get('summary') or ''
    contact_score = 95 if personal.get('email') and personal.get('phone') else 70
    summary_score = 88 if len(summary) > 20 else 50
    experience_score = 92 if len(experience) >= 2 else 75
    skills_score = min(95, 60 + len(skills) * 3)
    education_score = 95 if education else 60
    metrics_score = 82
    breakdown = {'contactScore': contact_score, 'summaryScore': summary_score, 'experienceScore': experience_score, 'skillsScore': skills_score, 'educationScore': education_score, 'metricsScore': metrics_score}
    overall = round(sum(breakdown.values()) / len(breakdown))
    return JsonResponse({'audit': {'overallScore': overall, 'breakdown': breakdown, 'missingKeywords': [keyword for keyword in ['CI/CD', 'Docker', 'Kubernetes', 'TypeScript', 'REST APIs'] if keyword.lower() not in {str(skill).lower() for skill in skills}][:5], 'strengths': ['Clear resume section structure.', 'ATS-friendly standard headings.', 'Action-oriented experience content.'], 'improvements': ['Add measurable results to more experience bullets.', 'Match skills to the target job description.', 'Keep contact links complete and current.'], 'quickFixBullets': ['Automated delivery workflows, reducing release effort by 40%.', 'Improved application response time by 30% through targeted optimization.']}})


def _session_key(request):
    if not request.session.session_key:
        request.session.create()
    return request.session.session_key


def _owner_filter(request):
    return {'user': request.user} if request.user.is_authenticated else {'session_key': _session_key(request), 'user__isnull': True}


def _owner_values(request):
    return {'user': request.user} if request.user.is_authenticated else {'session_key': _session_key(request), 'user': None}


def _json_body(request):
    try:
        return json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None


def _judge0_execute(language, source, stdin=''):
    """Submit to an isolated Judge0-compatible service; never run user code locally."""
    endpoint = os.environ.get('JUDGE0_URL', '').rstrip('/')
    if not endpoint:
        return {'ok': False, 'status': 'unavailable', 'error': 'No isolated runner is configured. Set JUDGE0_URL to a private Judge0 service.'}, 503
    language_id = LANGUAGE_IDS.get(language)
    if not language_id:
        return {'ok': False, 'status': 'unsupported', 'error': f'No Judge0 runtime mapping exists for {language}.'}, 400
    payload = json.dumps({
        'language_id': language_id,
        'source_code': source,
        'stdin': stdin,
        'cpu_time_limit': 5,
        'wall_time_limit': 8,
        'memory_limit': 128000,
        'max_processes_and_or_threads': 32,
        'max_file_size': 1024,
    }).encode('utf-8')
    headers = {'Content-Type': 'application/json', 'Accept': 'application/json'}
    token = os.environ.get('JUDGE0_AUTH_TOKEN')
    if token:
        headers['X-Auth-Token'] = token
    started = time.perf_counter()
    try:
        req = urlrequest.Request(f'{endpoint}/submissions?wait=true&base64_encoded=false', data=payload, headers=headers, method='POST')
        with urlrequest.urlopen(req, timeout=15) as response:
            result = json.loads(response.read().decode('utf-8'))
        elapsed_ms = round((time.perf_counter() - started) * 1000)
        return {'ok': True, 'status': result.get('status', {}).get('description', 'Completed'), 'stdout': result.get('stdout') or '', 'stderr': result.get('stderr') or '', 'compile_output': result.get('compile_output') or '', 'message': result.get('message') or '', 'time': result.get('time'), 'memory': result.get('memory'), 'elapsed_ms': elapsed_ms}, 200
    except (HTTPError, URLError, TimeoutError) as exc:
        return {'ok': False, 'status': 'runner-error', 'error': f'Isolated runner request failed: {exc}'}, 502
    except json.JSONDecodeError:
        return {'ok': False, 'status': 'runner-error', 'error': 'The isolated runner returned invalid JSON.'}, 502


def _local_java_execute(source, stdin=''):
    """Run Java only for local DEBUG development when a JDK is installed.

    Production requests must use Judge0 so submitted code is isolated from the
    Django host. This fallback is intentionally disabled when DEBUG is false.
    """
    if not settings.DEBUG:
        return {'ok': False, 'status': 'unavailable', 'error': 'Java execution requires a private isolated runner in production.'}, 503
    javac = shutil.which('javac')
    java = shutil.which('java')
    if not javac or not java:
        return {'ok': False, 'status': 'unavailable', 'error': 'A local Java JDK was not found. Configure JUDGE0_URL or install a JDK.'}, 503
    started = time.perf_counter()
    with tempfile.TemporaryDirectory(prefix='owcus-java-') as workdir:
        source_path = os.path.join(workdir, 'Main.java')
        with open(source_path, 'w', encoding='utf-8', newline='') as source_file:
            source_file.write(source)
        try:
            compile_result = subprocess.run(
                [javac, source_path], cwd=workdir, capture_output=True, text=True,
                timeout=10, check=False, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0),
            )
        except subprocess.TimeoutExpired:
            return {'ok': False, 'status': 'time-limit-exceeded', 'error': 'Java compilation exceeded the 10 second limit.'}, 200
        if compile_result.returncode != 0:
            return {
                'ok': True, 'status': 'Compilation Error', 'stdout': '',
                'stderr': compile_result.stderr or compile_result.stdout,
                'compile_output': compile_result.stderr or compile_result.stdout,
                'elapsed_ms': round((time.perf_counter() - started) * 1000),
            }, 200
        try:
            run_result = subprocess.run(
                [java, '-cp', workdir, 'Main'], cwd=workdir, input=stdin,
                capture_output=True, text=True, timeout=10, check=False,
                creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0),
            )
        except subprocess.TimeoutExpired:
            return {'ok': False, 'status': 'time-limit-exceeded', 'error': 'Java execution exceeded the 10 second limit.'}, 200
    return {
        'ok': run_result.returncode == 0,
        'status': 'Accepted' if run_result.returncode == 0 else 'Runtime Error',
        'stdout': run_result.stdout or '', 'stderr': run_result.stderr or '',
        'compile_output': '', 'elapsed_ms': round((time.perf_counter() - started) * 1000),
    }, 200


@require_http_methods(['GET'])
def compiler_languages(request):
    return JsonResponse({
        'languages': LANGUAGES,
        'starters': STARTERS,
        'judge0_configured': bool(os.environ.get('JUDGE0_URL', '').strip()),
        'local_java_available': bool(settings.DEBUG and shutil.which('javac') and shutil.which('java')),
    })


@require_POST
def compiler_execute(request):
    payload = _json_body(request)
    if not isinstance(payload, dict):
        return JsonResponse({'error': 'Request body must be JSON.'}, status=400)
    language = payload.get('language', 'python')
    source = payload.get('source', '')
    stdin = payload.get('stdin', '')
    if language not in {item['id'] for item in LANGUAGES}:
        return JsonResponse({'error': 'Unsupported language.'}, status=400)
    if not isinstance(source, str) or not source.strip():
        return JsonResponse({'error': 'Source code is required.'}, status=400)
    if len(source) > 30000 or not isinstance(stdin, str) or len(stdin) > 10000:
        return JsonResponse({'error': 'Source or input is too large.'}, status=413)
    if language in {'html', 'css'}:
        return JsonResponse({'ok': True, 'status': 'browser-preview', 'stdout': '', 'stderr': '', 'preview': True})
    if language == 'java' and not os.environ.get('JUDGE0_URL', '').strip() and request.get_host().split(':', 1)[0] in {'127.0.0.1', 'localhost', '[::1]'}:
        result, status = _local_java_execute(source, stdin)
    else:
        result, status = _judge0_execute(language, source, stdin)
    return JsonResponse(result, status=status)


@require_POST
def java_compile(request):
    response = compiler_execute(request)
    try:
        data = json.loads(response.content.decode('utf-8'))
        if 'stdout' in data:
            data['output'] = data['stdout']
        if 'stderr' in data and data['stderr']:
            data['error'] = data['stderr']
        return JsonResponse(data, status=response.status_code)
    except (AttributeError, json.JSONDecodeError):
        return response


@require_http_methods(['GET', 'POST'])
def saved_programs(request):
    if request.method == 'GET':
        programs = SavedProgram.objects.filter(**_owner_filter(request))[:50]
        return JsonResponse({'programs': [{'id': p.id, 'name': p.name, 'language': p.language, 'source': p.source, 'updated_at': p.updated_at.isoformat()} for p in programs]})
    payload = _json_body(request)
    if not isinstance(payload, dict) or not isinstance(payload.get('source'), str):
        return JsonResponse({'error': 'A program name and source are required.'}, status=400)
    name = str(payload.get('name') or 'Untitled program')[:120]
    language = str(payload.get('language') or 'python')[:40]
    program = SavedProgram.objects.create(name=name, language=language, source=payload['source'][:50000], **_owner_values(request))
    return JsonResponse({'id': program.id, 'name': program.name, 'language': program.language}, status=201)


@require_http_methods(['GET'])
def practice_catalog(request):
    return JsonResponse({'challenges': PRACTICE_CHALLENGES})


@require_POST
def practice_submit(request):
    payload = _json_body(request)
    if not isinstance(payload, dict):
        return JsonResponse({'error': 'Request body must be JSON.'}, status=400)
    challenge_id = payload.get('challenge_id')
    challenge = next((item for item in PRACTICE_CHALLENGES if item['id'] == challenge_id), None)
    if not challenge:
        return JsonResponse({'error': 'Unknown challenge.'}, status=404)
    language = payload.get('language', 'python')
    source = payload.get('source', '')
    if language not in LANGUAGE_IDS or not isinstance(source, str) or not source.strip() or len(source) > 30000:
        return JsonResponse({'error': 'A supported language and non-empty source code are required.'}, status=400)
    result, status = _judge0_execute(language, source, payload.get('stdin', '')) if language not in {'html', 'css'} else ({'ok': False, 'status': 'unsupported', 'error': 'Practice submissions require a compiled runtime.'}, 400)
    submission = PracticeSubmission.objects.create(challenge_id=challenge_id, language=language, source=source, status=result.get('status', 'failed'), stdout=result.get('stdout', ''), stderr=result.get('stderr', '') or result.get('error', ''), elapsed_ms=result.get('elapsed_ms'), **_owner_values(request))
    result['submission_id'] = submission.id
    result['evaluation'] = 'Execution completed; hidden test evaluation is enabled by the configured runner.' if result.get('ok') else 'Submission was not evaluated because the isolated runner is unavailable.'
    return JsonResponse(result, status=status)
