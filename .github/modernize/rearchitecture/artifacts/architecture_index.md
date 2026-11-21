# Implementation Guide

This is an implementation index, not a full behavioral contract.

- Public homepage: `tutoapp/views.py::home` and `templates/tutoapp/home.html`. Verify SEO title/description, category links, and popular-question links.
- Category listing: `interview_categories`, `interview_category`, `interview_category.html`. Verify slugs map to `CATEGORIES` and answer cards link to canonical question URLs.
- Search: `interview_search` and `interview_search.html`. Verify keyword, difficulty, and audience filtering and empty state.
- Question detail: `interview_question` and `interview_question.html`. Verify answer, example, use case, breadcrumbs, Article schema, related links, and navigation.
- Quiz: `interview_quiz` and `interview_quiz.html`. Verify required answers, score calculation, and explanations.
- Shared styling and client behavior: `static/tutoapp/interview.css` and `interview.js`.

Completion evidence for future changes should include `manage.py check`, the existing test suite, public-route smoke checks, and inspection of sitemap/robots output.
