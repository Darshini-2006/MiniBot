import { FaTimes } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { auth, provider, signInWithPopup, db, collection, getDocs } from '../../firebase'; // Adjust the path if needed.
import { query, orderBy } from 'firebase/firestore';

export default function Sidebar({ closeSidebar, loadChat }) {
  const [user, setUser] = useState(null);
  const [chatHistory, setChatHistory] = useState({ today: [], yesterday: [], past: [] });

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchChatHistory(currentUser.uid); // Fetch chat history when user is authenticated
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const fetchChatHistory = async (userId) => {
    try {
      const chatsRef = collection(db, `users/${userId}/chats`);
      const chatsQuery = query(chatsRef, orderBy("createdAt", "desc")); // Order by creation time
      const querySnapshot = await getDocs(chatsQuery);
      
      const fetchedChatHistory = {
        today: [],
        yesterday: [],
        past: []
      };

      querySnapshot.forEach((doc) => {
        const chatData = doc.data();
        const chatTitle = chatData.title;

        // Logic to categorize chats can go here
        const chatDate = chatData.createdAt.toDate(); // Convert Firestore timestamp to Date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (chatDate >= today) {
          fetchedChatHistory.today.push({ id: doc.id, name: chatTitle, ...chatData });
        } else if (chatDate >= yesterday) {
          fetchedChatHistory.yesterday.push({ id: doc.id, name: chatTitle, ...chatData });
        } else {
          fetchedChatHistory.past.push({ id: doc.id, name: chatTitle, ...chatData });
        }
      });

      setChatHistory(fetchedChatHistory);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const renderChatGroup = (chats, label) => (
    <div className="space-y-1">
      <div className="text-[#808080] text-xs px-2 py-1">{label}</div>
      {chats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => loadChat(chat)}  // Pass chat data to loadChat
          className="flex items-center justify-between w-full p-2 hover:bg-[#262626] rounded-lg text-left text-sm group transition-colors"
        >
          <span className="text-white">{chat.name}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="h-full p-4 bg-[#1f2021]">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-lg font-semibold text-white ${closeSidebar ? 'hidden' : ''}`}>
          {user ? `Welcome, ${user.displayName}` : 'Chat History'}
        </h2>
        <button
          onClick={closeSidebar}
          className="p-1 hover:bg-[#262626] rounded-full transition-colors"
        >
          <FaTimes className="text-white" />
        </button>
      </div>

      {user ? (
        <>
          <nav className="space-y-4">
            {renderChatGroup(chatHistory.today, 'Today')}
            {renderChatGroup(chatHistory.yesterday, 'Yesterday')}
            {renderChatGroup(chatHistory.past, 'Previous 7 Days')}
          </nav>
        </>
      ) : (
        <div className="text-center">
          <p className="text-white mb-4">Login to save your chats</p>
          <button
            onClick={handleLogin}
            className="bg-[#626262] px-4 py-2 rounded-full text-white hover:bg-[#505050] transition-colors"
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
}
