# Data model

Existing persisted entities include `User`, `SavedProgram`, `PracticeSubmission`, `EmailVerificationChallenge`, `FirebaseIdentity`, and `ResumeSeoPage`. The new question bank is read-only catalog content in `tutoapp/interview_catalog.py`; bookmarks are intentionally client-local in browser storage, so no user records or migrations are affected.
