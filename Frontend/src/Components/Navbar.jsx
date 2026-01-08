

export default function Navbar({ title = "Expense Tracker" }) {

  return (
    <header className="bg-white p-4 border-b sticky top-0 left-0 z-40">
      <div className="max-w mx-auto flex items-center justify-between">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-2">
          <img
            src="/logo.png" // <-- replace with your logo path
            alt="Logo"
            className="w-12 h-12 object-contain"
          />
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
      </div>
    </header>
  );
}
