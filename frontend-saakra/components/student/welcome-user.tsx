"use client"

import { useEffect, useState } from "react"
import apiFetch from "@/lib/api"

export default function WelcomeUser() {
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    apiFetch("/api/auth/me")
      .then((res: any) => {
        if (!mounted) return
        setName(res?.user?.name || null)
      })
      .catch(() => {
        if (!mounted) return
        setName(null)
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">{`Welcome back${name ? ", " + name + "!" : "!"}`}</h1>
      <p className="text-muted-foreground">{"Continue your learning journey and achieve your goals."}</p>
    </div>
  )
}
