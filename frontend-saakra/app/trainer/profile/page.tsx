import { TrainerHeader } from "@/components/trainer/trainer-header"
import ProfileForm from "@/components/trainer/profile-form"

export default function TrainerProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <TrainerHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{"Profile"}</h1>
          <p className="text-muted-foreground">{"Manage your trainer profile and credentials"}</p>
        </div>

        <ProfileForm />
      </main>
    </div>
  )
}
