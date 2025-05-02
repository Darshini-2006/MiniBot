import React, { useState, useEffect } from 'react';
import { auth, db, doc, setDoc, updateDoc } from '../../firebase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { toast, ToastContainer } from 'react-toastify';
import { AiOutlineSend } from 'react-icons/ai';
import { BiMicrophone } from 'react-icons/bi';
import { UserIcon, Bot } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

const ChatWindow = ({ currentChat }) => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [model, setModel] = useState(null);
  const [showLoginWarning, setShowLoginWarning] = useState(false); // New state for the warning

  const apiKey = '';

  // Configuration for the Gemini model
  const generationConfig = {
    temperature: 0.9,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  };

  // Initialize the model once when component mounts
  useEffect(() => {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const initializedModel = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig,
      });
      setModel(initializedModel);
    } catch (error) {
      console.error('Error initializing model:', error);
      toast.error('Failed to initialize AI model');
    }
  }, [apiKey]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentChat) {
      setMessages(currentChat.messages || []);
      setChatId(currentChat.id);
    }
  }, [currentChat]);

  // Add rate limiting
  const rateLimiter = {
    tokens: 60,
    lastRefill: Date.now(),
    refillRate: 60, // tokens per minute
    capacity: 60,

    async checkLimit() {
      const now = Date.now();
      const timePassed = now - this.lastRefill;
      const refillTokens = Math.floor((timePassed / 1000) * (this.refillRate / 60));

      this.tokens = Math.min(this.capacity, this.tokens + refillTokens);
      this.lastRefill = now;

      if (this.tokens < 1) {
        throw new Error('Rate limit exceeded. Please wait a moment before sending another message.');
      }

      this.tokens -= 1;
      return true;
    }
  };

  const saveMessage = async (userMessage, botMessage) => {
    if (!user || !chatId) return;

    try {
      const chatRef = doc(db, 'users', user.uid, 'chats', chatId);
      const updatedMessages = [...messages, userMessage, botMessage];

      await updateDoc(chatRef, {
        history: updatedMessages,
        createdAt: new Date(),
      });

      await updateDoc(doc(db, 'users', user.uid), {
        activeChat: chatId,
      });

      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error saving message:', error);
      toast.error('Failed to save message');
    }
  };

  const generateTitle = async (input) => {
    if (!model) {
      throw new Error('AI model not initialized');
    }

    try {
      const result = await model.generateContent(
        `Generate a title for the following conversation with a maximum of 4 words note - only return the title: "${input}"`
      );
      return result.response.text();
    } catch (error) {
      console.error('Error generating title:', error);
      return 'Untitled Chat';
    }
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const generateContent = async () => {
    if (!user) {
      setShowLoginWarning(true); // Show the warning
      return; // Prevent sending the message
    }

    if (!input.trim()) return;
    if (!model) {
      toast.error('AI model not initialized. Please try again.');
      return;
    }

    setLoading(true);
    const userMessage = {
      role: "user",
      parts: [{ text: input.trim() }],
    };

    // Update local state with user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // Check rate limit
      await rateLimiter.checkLimit();

      // Create chat session with current history
      const chatSession = model.startChat({
        history: messages.map(msg => ({
          role: msg.role,
          parts: msg.parts
        }))
      });

      // Send message with retry logic
      let retries = 3;
      let result;

      while (retries > 0) {
        try {
          result = await chatSession.sendMessage(userMessage.parts[0].text);
          break;
        } catch (error) {
          if (error.message.includes('429') && retries > 1) {
            retries--;
            await delay(1000); // Wait 1 second before retrying
            continue;
          }
          throw error;
        }
      }

      if (!result) {
        throw new Error('Failed to generate response after retries');
      }

      const responseText = await result.response.text();
      const botMessage = {
        role: "model",
        parts: [{ text: responseText }],
      };

      if (!chatId) {
        // Create new chat
        const newChatId = `chat_${Date.now()}`;
        setChatId(newChatId);

        const chatTitle = await generateTitle(input);

        await setDoc(doc(db, 'users', user.uid, 'chats', newChatId), {
          createdAt: new Date(),
          title: chatTitle,
          history: [userMessage, botMessage],
        });

        await setDoc(doc(db, 'users', user.uid), {
          activeChat: newChatId,
        }, { merge: true });

        setMessages([userMessage, botMessage]);
      } else {
        // Save messages to existing chat
        await saveMessage(userMessage, botMessage);
      }
    } catch (error) {
      console.error('Error generating content:', error);

      if (error.message.includes('429')) {
        toast.error('Too many requests. Please wait a moment before trying again.');
      } else if (error.message.includes('Rate limit exceeded')) {
        toast.error(error.message);
      } else {
        toast.error('Failed to generate content. Please try again.');
      }

      // Remove the user message if we failed to get a response
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!user) {
        setShowLoginWarning(true);
        return;
      }
      generateContent();
    }
  };

  const formatMessage = (message) => {
    const text = message.parts.map(part => part.text).join('');
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/\*/g, '<br>');
    return formattedText;
  };

  const closeLoginWarning = () => {
    setShowLoginWarning(false);
  };

  return (
    <div className="flex flex-col h-screen relative bg-[#262626]">

      {/* Login Warning Popup */}
      {showLoginWarning && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#333333] rounded-lg p-8 shadow-lg"> {/* Dark background */}
            <h2 className="text-lg font-semibold mb-4 text-white">Please Log In</h2> {/* White text */}
            <p className="mb-4 text-gray-300">You need to be logged in to send messages.</p> {/* Lighter text */}
            <button className="bg-[#626262] hover:bg-[#777777] text-white font-bold py-2 px-4 rounded" onClick={closeLoginWarning}> {/* Button style */}
              OK
            </button>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 pb-20">
        <div className="space-y-4 w-full max-w-3xl mx-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === "user" ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start max-w-[85%] ${msg.role === "user" ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${msg.role === "user" ? 'ml-2' : 'mr-2'}`}>
                  {msg.role === "user" ? (
                    <UserIcon className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div
                  className={`p-3 rounded-lg ${msg.role === "user" ? 'bg-[#404040]' : 'bg-[#262626]'} text-white break-words`}
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Container - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#262626]">
        <div className="px-4 py-2 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-[#626262] rounded-full">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 p-3 bg-transparent text-white focus:outline-none min-w-0"
                placeholder="Type your message..."
                disabled={loading}
              />
              <button
                onClick={generateContent}
                className="p-3 text-white disabled:opacity-50"
                disabled={loading || !input.trim()}
              >
                <AiOutlineSend className="text-lg" />
              </button>
            </div>
            <button
              className="w-12 h-12 bg-[#626262] rounded-full flex items-center justify-center flex-shrink-0"
            >
              <BiMicrophone className="text-white text-lg" />
            </button>
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-center" theme="dark" />
    </div>
  );
};

export default ChatWindow;
