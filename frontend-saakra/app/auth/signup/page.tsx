import { SignupForm } from "@/components/auth/signup-form"
import Link from "next/link"
import { GraduationCap } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-primary/10 via-background to-accent/10 p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-semibold">{"Saakra Learning"}</span>
        </Link>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight">{"Start Your Learning Journey Today"}</h1>
          <p className="text-lg text-muted-foreground">
            {"Access industry-leading courses, expert mentorship, and career-ready skills all in one platform."}
          </p>

          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
              <span>{"Free access to curated learning resources"}</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
              <span>{"Live sessions with expert trainers"}</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
              <span>{"AI-powered personalized learning paths"}</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
              <span>{"Verified certificates on completion"}</span>
            </li>
          </ul>
        </div>

        <div className="text-sm text-muted-foreground">
          {"By signing up, you agree to our "}
          <Link href="/terms" className="text-foreground underline">
            {"Terms of Service"}
          </Link>
          {" and "}
          <Link href="/privacy" className="text-foreground underline">
            {"Privacy Policy"}
          </Link>
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="mb-2 text-3xl font-bold">{"Create your account"}</h2>
            <p className="text-muted-foreground">{"Join thousands of learners transforming their careers"}</p>
          </div>

          <SignupForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {"Already have an account? "}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              {"Sign in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
