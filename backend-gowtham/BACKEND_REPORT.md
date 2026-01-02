# Backend Report — Saakra (backend-gowtham)

Date: 2025-12-31

## Overview
This document summarizes the backend implemented in `backend-gowtham`, important routes, recent changes (trainer/admin flow, evaluation endpoints), how to run the service locally, test examples, and next steps.

## Planned Output / Outcome
The backend delivers the following outcomes for the Saakra project:

- Advanced backend features: role-based access (student/trainer/admin), evaluation engine, analytics aggregation, enrollment and course management, automated account provisioning and admin tooling.
- AI-ready data structure: normalized collections and evaluation outputs (`assessments`, `assessment_submissions`, `evaluations`, `engagement_events`, `progress`) designed to support future ML/AI pipelines and feature extraction.
- Certificate & analytics support: certificate generation hooks, admin/trainer analytics endpoints, assessment and course-level metrics, and evaluation rules for pass/fail and grading.

These outcomes enable downstream AI integration (training/evaluation), enterprise reporting, and automated certificate issuance.

## How to run
- Ensure `serviceAccountKey.json` is present in `backend-gowtham/` (Firebase admin key).
- Set environment variables in `.env` (if used).
- Start server:

```powershell
cd backend-gowtham
npm install   # if not already
npm start
```

Default server base: `http://localhost:5000/api`

## Important files
- `server.js` — Express server bootstrap and route mounting
- `src/config/firebase.js` — Firebase Admin + Firestore initialization
- `src/controllers/*.js` — controller implementations (auth, course, assessment, analytics, certificate, etc.)
- `src/routes/*.js` — route definitions
- `src/services/*.js` — evaluation and analytics business logic
- `src/middlewares/authmiddleware.js` — verifies Firebase token; supports demo tokens
- `src/middlewares/rolemiddleware.js` — role checking (now accepts string or array)

## Recent/Key Features & Endpoints
Authentication & user management
- POST /api/auth/register — register (creates Firebase user + Firestore `users/{uid}` with role `student`)
- POST /api/auth/login — backend login (accepts `{ uid }` from client; auto-provisions Firestore profile if missing and reads custom claim `role`)
- PUT  /api/auth/update-role — protected (admin); body `{ uid, role }`
- POST /api/auth/create-trainer — protected (admin); body `{ name, email, password, phone? }` — creates Firebase user, sets custom claim `{ role: 'trainer' }`, creates Firestore profile
- POST /api/auth/create-admin — protected (admin); body `{ name, email, password, phone? }` — creates Firebase user + `role: 'admin'`

Course & enrollments
- POST /api/courses/add — trainer only — add course
- POST /api/courses/enroll — student only — enroll in course
- GET  /api/courses — list courses
- GET  /api/courses/:courseId/students — trainer/admin — returns enrolled students (reads `enrollments` then `users` profiles)

Assessments & submissions
- POST /api/assessments/create — admin/trainer — create assessment
- POST /api/assessments/submit — student — submit score/data
- POST /api/assessments/:assessmentId/submit — student — submit for a specific assessment
- GET  /api/assessments/:assessmentId — get assessment
- GET  /api/assessments/course/:courseId — list assessments for a course
- GET  /api/assessments/:assessmentId/analytics — admin/trainer — assessment analytics
- GET  /api/assessments/user/submissions — current user submissions
- GET  /api/assessments/user/:userId/submissions — admin/trainer — user's submissions

Analytics & evaluation
- GET  /api/analytics/user — current user analytics
- GET  /api/analytics/user/:userId — user analytics (admin/trainer can view)
- GET  /api/analytics/course/:courseId — course analytics (admin/trainer)
- GET  /api/analytics/admin — admin dashboard (admin only)
- POST /api/analytics/evaluation/submission — admin/trainer — evaluate a submission by `submissionId` (calls `evaluationService.evaluateAssessment`)
- POST /api/analytics/evaluation/user — admin/trainer — evaluate user's performance across a course `{ userId, courseId }` (calls `evaluationService.evaluateUserPerformance`)
- GET  /api/analytics/evaluation/rules — returns evaluation rules & grade scales
- POST /api/analytics/record-event — records engagement events

Other
- Progress, certificates, query-optimization routes exist (see `src/routes/*`)

## Auth & Roles notes
- Authentication uses Firebase ID tokens verified by `admin.auth().verifyIdToken` in `authmiddleware`.
- For local testing, `authmiddleware` supports tokens that start with `demo-token-<uid>` (it sets `req.user.uid` accordingly).
- Role checks use Firestore `users/{uid}.role` via `rolemiddleware`. The middleware now accepts e.g. `checkRole(['admin','trainer'])`.
- Role persistence: `createTrainer` and `createAdmin` set custom claims and create a Firestore profile right away.

## Sample curl requests
Replace `<TOKEN>`, `<UID>`, `<COURSE_ID>`, `<ADMIN_TOKEN>` as needed.

- Create trainer (admin):
```bash
curl -X POST http://localhost:5000/api/auth/create-trainer \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Trainer One","email":"trainer@example.com","password":"secret123"}'
```

- Get course students (trainer/admin):
```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:5000/api/courses/<COURSE_ID>/students
```

- Evaluate user performance (trainer/admin):
```bash
curl -X POST http://localhost:5000/api/analytics/evaluation/user \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"userId":"<STUDENT_UID>","courseId":"<COURSE_ID>"}'
```

## Testing checklist
- Start backend and verify `/` or `/health` returns 200.
- Create an admin account (via Firebase console or `create-admin`). Set custom claim if creating via console.
- Login as trainer/admin in frontend and verify access to trainer/admin routes.
- Create course, enroll students, and verify `GET /api/courses/:courseId/students` returns students.
- Submit assessments as student and verify `POST /api/assessments/submit` and analytics endpoints.

## Known issues & notes
- Previously there was a missing import for `getCourseStudents` in `courseRoutes.js` — fixed.
- Make sure `users/{uid}` profile documents exist; `login` will auto-provision profile on first login if user exists in Firebase Auth (reads custom claim `role`).
- Firestore `getAll` is used in `getCourseStudents` in batches — this is fine for moderate numbers; for large-scale datasets consider paginated queries or storing an enrollment subcollection with denormalized user data.

## Next recommended improvements
- Add endpoint to list submissions for a course assessment (paginated) and allow inline grading via an authenticated trainer UI.
- Add email notifications for created accounts and password-reset flows.
- Harden role checks by using both custom claims and Firestore roles, or centralize role source-of-truth.
- Add unit/integration tests for controllers and services.

---
Generated by development assistant — update this file as project evolves.
