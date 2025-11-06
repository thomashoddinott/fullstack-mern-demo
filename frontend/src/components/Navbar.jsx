export default function Navbar() {
  return (
    <nav className="w-full bg-white border-b px-6 py-3 flex flex-wrap justify-between items-center">
      {/* Left: Logo + Academy name */}
      <div className="flex items-center gap-3">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKrfmniVCTDVQibp1OvqzPpovIAPmIDFJ63w&s"
          alt="Logo"
          className="w-10 h-10 rounded"
        />
        <h1 className="text-xl font-semibold text-gray-800 whitespace-nowrap">
          BJJ Academy
        </h1>
      </div>

      {/* Center: Navigation links */}
      <div className="flex items-center gap-6 flex-wrap justify-center">
        <button className="text-sm font-medium text-blue-600">Dashboard</button>
        <button className="text-sm font-medium text-gray-600 hover:text-blue-600">Classes</button>
        <button className="text-sm font-medium text-gray-600 hover:text-blue-600">Subscription</button>
        <button className="text-sm font-medium text-gray-600 hover:text-blue-600">Schedule</button>
      </div>

      {/* Right: User info */}
      <div className="flex items-center gap-3">
        <img
          src="https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=0.752xw:1.00xh;0.175xw,0&resize=1200:*"
          alt="User avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          John Doe
        </span>
      </div>
    </nav>
  );
}
