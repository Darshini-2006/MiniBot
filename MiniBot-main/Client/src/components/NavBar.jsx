import { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa"; // Import FaTimes
import { auth, provider, signInWithPopup, signOut } from "../../firebase";

export default function Navbar({ toggleSidebar }) {
  const [user, setUser] = useState(null);
  const [profilepic, setProfilepic] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown visibility

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setProfilepic(result.user.photoURL);
      console.log("User photo URL after login:", result.user.photoURL);
    } catch (error) {
      console.error("Error logging in with Google:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfilepic(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setProfilepic(currentUser?.photoURL || null);
      console.log("User photo URL on auth state change:", currentUser?.photoURL);
    });
    return () => unsubscribe();
  }, []);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  // Close dropdown
  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  return (
    <div className="bg-[#262626] text-white p-4 flex items-center justify-between border-b border-[#404040] relative">
      {/* Toggle Sidebar Button */}
      <button
        onClick={toggleSidebar}
        className="text-white hover:bg-[#404040] p-2 rounded-full transition-colors focus:outline-none"
      >
        <FaBars size={20} />
      </button>

      <h2 className="text-lg font-semibold">MiniBot</h2>

      <div className="relative flex items-center">
        {/* Profile Picture with Dropdown */}
        {profilepic && (
          <img
            src={profilepic}
            alt="Profile"
            className="w-8 h-8 rounded-full cursor-pointer"
            onClick={toggleDropdown}
          />
        )}

        {/* Dropdown Menu */}
        {dropdownOpen && user && (
          <div className="absolute right-0 bg-gray-700 mt-14 rounded shadow-lg z-10" style={{ width: '200px' }}>
            {/* Close Icon */}
            <div className="flex justify-between items-center px-4 py-2 text-white">
              <span>{user.displayName || "User Name"}</span>
              <FaTimes 
                className="cursor-pointer hover:text-gray-400" 
                onClick={closeDropdown} // Close dropdown on click
              />
            </div>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-white hover:bg-gray-600"
            >
              Logout
            </button>
          </div>
        )}

        {!user && (
          <button
            onClick={handleLogin}
            className="bg-[#626262] px-4 py-2 rounded-full text-white hover:bg-[#505050] transition-colors"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
}