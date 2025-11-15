export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">
          Kaapi Connect
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Find your match through shared interests, values, and Kerala roots
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/auth/register"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
          >
            Get Started
          </a>
          <a
            href="/auth/login"
            className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition"
          >
            Sign In
          </a>
        </div>
      </div>
    </main>
  )
}
