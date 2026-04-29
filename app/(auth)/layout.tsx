import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF8E7] px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo / branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FFD93D] mb-4 shadow-lg">
              <span className="text-3xl">✨</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">KidSpark</h1>
            <p className="text-gray-500 mt-1 text-sm">Learning through play</p>
          </Link>
        </div>
        {children}
      </div>

      {/* Footer links */}
      <footer className="mt-8 text-center">
        <p className="text-[11px] text-gray-400">
          <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-600">
            Privacy Policy
          </Link>
          {" · "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-gray-600">
            Terms of Use
          </Link>
          {" · "}
          <a
            href="mailto:support@kidspark.app"
            className="underline underline-offset-2 hover:text-gray-600"
          >
            Contact
          </a>
        </p>
      </footer>
    </div>
  );
}
