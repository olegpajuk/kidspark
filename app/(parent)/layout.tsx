import Link from "next/link";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r flex flex-col py-6 px-4 gap-2 shadow-sm">
        <div className="flex items-center gap-2 mb-6 px-2">
          <span className="text-2xl">✨</span>
          <span className="text-lg font-bold text-gray-800">KidSpark</span>
        </div>

        <nav className="flex flex-col gap-1">
          <NavLink href="/dashboard" label="Dashboard" icon="📊" />
          <NavLink href="/children" label="Children" icon="👧" />
          <NavLink href="/progress" label="Progress" icon="📈" />
          <NavLink href="/settings" label="Settings" icon="⚙️" />
        </nav>

        <div className="mt-auto">
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 text-sm font-medium transition-colors"
    >
      <span>{icon}</span>
      {label}
    </Link>
  );
}

function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="post">
      <button
        type="submit"
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 text-sm font-medium transition-colors"
      >
        <span>🚪</span>
        Sign out
      </button>
    </form>
  );
}
