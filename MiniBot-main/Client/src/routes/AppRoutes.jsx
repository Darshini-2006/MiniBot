// src/routes/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ChatWindow />} />
    </Routes>
  );
}
