import Link from "next/link";

interface Section {
  id: string;
  title: string;
}

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: Section[];
  children: React.ReactNode;
}

export function LegalLayout({
  title,
  subtitle,
  lastUpdated,
  sections,
  children,
}: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFD93D] shadow-sm">
              <span className="text-base leading-none">✨</span>
            </div>
            <span className="text-base font-bold text-gray-800">KidSpark</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-gray-500">
            <Link
              href="/privacy"
              className="transition-colors hover:text-gray-900"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-gray-900"
            >
              Terms
            </Link>
            <Link
              href="mailto:support@kidspark.app"
              className="transition-colors hover:text-gray-900"
            >
              Contact
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-16">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                On this page
              </p>
              <nav className="flex flex-col gap-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="rounded-md px-2 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <main>
            <div className="mb-10 border-b border-gray-100 pb-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 text-gray-500">{subtitle}</p>
              <p className="mt-2 text-xs text-gray-400">
                Last updated: {lastUpdated}
              </p>
            </div>

            <div className="prose-legal">{children}</div>
          </main>
        </div>
      </div>

      <footer className="mt-16 border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-5xl px-6 py-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} KidSpark. All rights reserved.{" "}
            <Link
              href="/privacy"
              className="underline hover:text-gray-600"
            >
              Privacy Policy
            </Link>
            {" · "}
            <Link
              href="/terms"
              className="underline hover:text-gray-600"
            >
              Terms of Use
            </Link>
            {" · "}
            <Link
              href="mailto:support@kidspark.app"
              className="underline hover:text-gray-600"
            >
              Contact
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

export function LegalSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-10 scroll-mt-24">
      <h2 className="mb-4 flex items-baseline gap-3 text-xl font-semibold text-gray-900">
        <span className="text-sm font-normal text-gray-400">{number}.</span>
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-gray-600">
        {children}
      </div>
    </section>
  );
}

export function LegalP({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

export function LegalUl({ children }: { children: React.ReactNode }) {
  return <ul className="ml-4 list-disc space-y-1 text-gray-600">{children}</ul>;
}

export function LegalLi({ children }: { children: React.ReactNode }) {
  return <li>{children}</li>;
}

export function LegalStrong({ children }: { children: React.ReactNode }) {
  return <strong className="font-medium text-gray-800">{children}</strong>;
}

export function LegalHighlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      {children}
    </div>
  );
}
