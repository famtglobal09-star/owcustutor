# Project structure

OWCUS is a Django 5.2 project with one application, `tutoapp`, and template-driven public pages. Existing compiler, authentication, resume, marketing, and tutorial flows remain available for compatibility; the public homepage and navigation now prioritize the interview question bank.

The interview experience is split into catalog data (`interview_catalog.py`), function-based HTTP views (`views.py`), URL declarations (`tutors/urls.py`), and focused templates/static assets. This boundary is intentionally additive so existing user and resume data are not changed.
