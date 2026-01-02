import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { GraduationCap } from "lucide-react"

export default function LoginPage() {
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
          <h1 className="text-4xl font-bold leading-tight">{"Transform Your Future with AI-Powered Learning"}</h1>
          <p className="text-lg text-muted-foreground">
            {
              "Join thousands of students mastering industry-ready skills through expert-led courses and practical projects."
            }
          </p>
        </div>

        <div className="flex gap-8 text-sm">
          <div>
            <div className="text-2xl font-bold text-primary">{"10,000+"}</div>
            <div className="text-muted-foreground">{"Active Students"}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{"50+"}</div>
            <div className="text-muted-foreground">{"Expert Trainers"}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{"95%"}</div>
            <div className="text-muted-foreground">{"Success Rate"}</div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="mb-2 text-3xl font-bold">{"Welcome back"}</h2>
            <p className="text-muted-foreground">{"Sign in to continue your learning journey"}</p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/auth/signup" className="font-medium text-primary hover:underline">
              {"Sign up"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
