export default function Navbar() {
  return (
    <div className="flex justify-between items-center bg-white shadow px-6 py-3">
      <h2 className="text-lg font-bold">Dashboard</h2>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
        className="bg-red-500 text-white px-3 py-1 rounded"
      >
        Logout
      </button>
    </div>
  );
}
