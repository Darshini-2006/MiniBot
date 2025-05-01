import { useState } from 'react';
import Sidebar from '../components/SideBar.jsx';
import Navbar from '../components/NavBar.jsx';
import ChatWindow from '../components/ChatWindow.jsx';

export default function Layout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState(null); // State to manage the current chat

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const loadChat = (chat) => {
    setCurrentChat(chat); // Update the current chat with the selected chat details
    console.log(currentChat);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar - Now starts from top of screen */}
      <div
        className={`transition-transform duration-300 ease-in-out bg-gray-800 text-white fixed top-0 left-0 h-full z-20 w-64 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar closeSidebar={() => setSidebarOpen(false)} loadChat={loadChat} /> {/* Pass loadChat to Sidebar */}
      </div>

      {/* Main Content Area with Navbar */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Fixed Navbar */}
        <div className="fixed top-0 left-0 right-0 z-10 bg-[#262626] shadow-md">
          <Navbar toggleSidebar={toggleSidebar} />
        </div>
{/* Content below the Navbar */}
<div className="flex-1 overflow-y-auto bg-[#262626] mt-16 p-4">
          <ChatWindow currentChat={currentChat} />
        </div>
      </div> 
    </div>
  );
}
