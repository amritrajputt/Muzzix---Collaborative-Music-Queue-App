import { createRootRoute, Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useState } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from '@clerk/clerk-react'
import { LoaderThree } from '../components/ui/loader'

function Header() {
  const [open, setOpen] = useState(false)
  const { isLoaded } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const scrollTo = (id: string) => {
    setOpen(false)
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      window.history.pushState(null, '', `/#${id}`)
    } else {
      navigate({ to: '/', hash: id })
    }
  }

  const links: [string, string][] = [
    ['Home', 'home'],
    ['About', 'about'],
    ['How It Works', 'how-it-works'],
    ['Pricing', 'pricing'],
    ['Contact', 'contact'],
  ]

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-12 py-3 bg-transparent">
        <Link
          to="/"
          onClick={(e) => {
            if (location.pathname === '/') {
              e.preventDefault()
              document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })
              window.history.pushState(null, '', '/')
            }
          }}
          className="text-base md:text-lg font-black tracking-[0.12em] uppercase text-white border-0 bg-transparent cursor-pointer hover:opacity-70 transition-opacity p-0 no-underline"
        >
          MUZZIX
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map(([label, id]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-sm text-white/70 hover:text-white transition-colors cursor-pointer border-0 bg-transparent font-medium p-0"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="hidden md:block min-w-[80px]">
          {!isLoaded ? (
            <div className="flex justify-end pr-2">
              <LoaderThree size="sm" />
            </div>
          ) : (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    className="px-5 py-2 text-sm font-semibold rounded-lg bg-white text-black hover:bg-white/90 active:scale-95 transition-all cursor-pointer"
                  >
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-5">
                  <Link
                    to="/dashboard"
                    className="text-sm font-semibold text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    Dashboard
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </>
          )}
        </div>

        <button
          className="md:hidden flex flex-col gap-[5px] p-1 border-0 bg-transparent cursor-pointer"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-6 bg-white transition-all duration-300 origin-center ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${open ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-white transition-all duration-300 origin-center ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </header>

      <div
        className={`fixed inset-0 z-40 flex flex-col bg-black/95 backdrop-blur-xl transition-all duration-300 md:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {links.map(([label, id]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-2xl font-semibold text-white/80 hover:text-white transition-colors cursor-pointer border-0 bg-transparent"
            >
              {label}
            </button>
          ))}
          {!isLoaded ? (
            <LoaderThree size="sm" />
          ) : (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    onClick={() => setOpen(false)}
                    className="mt-4 px-8 py-3 text-base font-semibold rounded-xl bg-white text-black hover:bg-white/90 transition-all cursor-pointer"
                  >
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex flex-col items-center gap-6 mt-4">
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="text-xl font-semibold text-white/80 hover:text-white transition-colors cursor-pointer"
                  >
                    Dashboard
                  </Link>
                  <div className="scale-125">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </div>
              </SignedIn>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export const Route = createRootRoute({
  component: () => (
    <>
      <Header />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})