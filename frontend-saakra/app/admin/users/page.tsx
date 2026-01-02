import { AdminHeader } from "@/components/admin/admin-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, Download } from "lucide-react"
import { UserManagement } from "@/components/admin/user-management"

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{"User Management"}</h1>
            <p className="text-muted-foreground">{"Manage students, trainers, and admin users"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {"Export"}
            </Button>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              {"Add User"}
            </Button>
          </div>
        </div>

        <Card className="mb-6 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search users by name, email, or ID..." className="pl-9" />
          </div>
        </Card>

        <UserManagement />
      </main>
    </div>
  )
}
