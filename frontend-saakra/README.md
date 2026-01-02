# Saakra Learning - AI-Assisted Skill Development Platform

A comprehensive learning management system built with Next.js, designed to bridge the gap between academic education and industry-required skills.

## Features

### For Students
- Browse and enroll in courses for 10th, 12th, and College levels
- Interactive learning dashboard with progress tracking
- Access to curated YouTube educational resources
- Live sessions with expert trainers
- Assignment submission and feedback system
- AI-powered personalized learning paths
- Verified certificates upon course completion

### For Trainers
- Course creation and management
- Student progress monitoring
- Assignment review and grading
- Live session scheduling and management
- Performance analytics
- Direct student interaction and mentorship

### For Admins
- Complete platform oversight
- User management (students, trainers, admins)
- Course approval and management
- Analytics and reporting
- System health monitoring
- Certificate verification

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Database**: PostgreSQL (Supabase/Neon recommended)
- **Authentication**: Custom auth with bcrypt
- **AI Integration**: OpenAI API for personalized learning
- **Video**: YouTube Embed API

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Supabase/Neon account)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd saakra-learning
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```env
DATABASE_URL=your_database_url
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. Run database migrations:
```bash
# Execute SQL scripts in the scripts/ folder
```

5. Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

The platform uses a relational database with the following main tables:
- `users` - Student, trainer, and admin accounts
- `courses` - Course information and metadata
- `course_modules` - Course structure and modules
- `course_content` - Videos, assignments, and learning materials
- `enrollments` - Student course enrollments
- `student_progress` - Progress tracking per content item
- `assignment_submissions` - Student assignment submissions
- `live_sessions` - Scheduled live training sessions
- `certificates` - Issued completion certificates

See `scripts/001_create_tables.sql` for the complete schema.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Landing page
│   ├── auth/              # Authentication pages
│   ├── student/           # Student dashboard
│   ├── trainer/           # Trainer portal
│   └── admin/             # Admin dashboard
├── components/            # React components
│   ├── auth/             # Auth components
│   ├── student/          # Student components
│   ├── trainer/          # Trainer components
│   ├── admin/            # Admin components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
├── scripts/              # Database scripts
└── public/               # Static assets
```

## Key Features Implementation

### Authentication
- Role-based access control (Student, Trainer, Admin)
- Secure password hashing with bcrypt
- Session management

### Learning Management
- Multi-level course structure (10th, 12th, College)
- Progress tracking and analytics
- Assignment submission workflow
- Live session integration

### AI Features
- Personalized learning path recommendations
- Skill gap analysis
- Auto-evaluation for quizzes
- Smart content suggestions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For support, email support@saakra.edu or join our community forum.
```
