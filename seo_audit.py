import re
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tutors.settings')
import django
django.setup()

from django.test import Client


client = Client()
xml = client.get('/sitemap.xml').content.decode()
urls = re.findall(r'<loc>https://www\.owcus\.com([^<]+)</loc>', xml)
print('COUNT', len(urls))
bad = []
seen = {}
for path in urls:
    response = client.get(path)
    html = response.content.decode(errors='ignore')
    title = re.search(r'<title>(.*?)</title>', html, re.I | re.S)
    descriptions = re.findall(r'<meta name="description" content="(.*?)"', html, re.I | re.S)
    canonicals = re.findall(r'<link rel="canonical" href="(.*?)"', html, re.I | re.S)
    heading = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.I | re.S)
    robots = re.search(r'<meta name="robots" content="(.*?)"', html, re.I | re.S)
    values = (
        title.group(1).strip() if title else '',
        descriptions[0].strip() if descriptions else '',
        canonicals[0].strip() if canonicals else '',
        re.sub('<[^>]+>', '', heading.group(1)).strip() if heading else '',
        robots.group(1).strip() if robots else '',
    )
    seen.setdefault(values[0], []).append(path)
    if response.status_code != 200 or not all(values[:4]) or len(descriptions) != 1 or len(canonicals) != 1 or 'noindex' in values[4]:
        bad.append((path, response.status_code, values, {'description_tags': len(descriptions), 'canonical_tags': len(canonicals)}))
print('BAD', bad)
print('DUPLICATE_TITLES', [(key, value) for key, value in seen.items() if len(value) > 1])
