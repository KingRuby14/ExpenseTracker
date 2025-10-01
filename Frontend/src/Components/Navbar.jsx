export default function Navbar({ title = "Dashboard" }) {
  return (
    <header className="bg-white p-4 border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
    </header>
  );
}
