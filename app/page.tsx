import { InterMateLandingPage } from "@/components/home/intermate-landing-page"
import { LandingFooter } from "@/components/layout/landing-footer"
import { LandingHeader } from "@/components/layout/landing-header"

export default function HomePage() {
  return (
    <>
      <LandingHeader />
      <main className="min-h-screen bg-transparent text-foreground">
        <InterMateLandingPage />
      </main>
      <LandingFooter />
    </>
  )
}
