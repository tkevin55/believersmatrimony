export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 md:px-8 lg:px-24">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-3 sm:mb-4">
          Believers Matrimony
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
          Find your life partner in faith
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
          <a
            href="/auth/register"
            className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition text-center font-medium"
          >
            Get Started
          </a>
          <a
            href="/auth/login"
            className="w-full sm:w-auto px-6 py-3 border border-border rounded-lg hover:bg-muted transition text-center font-medium"
          >
            Sign In
          </a>
        </div>
      </div>
    </main>
  )
}
