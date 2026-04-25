export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8E7] p-4">
      <div className="w-full max-w-md">
        {/* Logo / branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FFD93D] mb-4 shadow-lg">
            <span className="text-3xl">✨</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">KidSpark</h1>
          <p className="text-gray-500 mt-1 text-sm">Learning through play</p>
        </div>
        {children}
      </div>
    </div>
  );
}
