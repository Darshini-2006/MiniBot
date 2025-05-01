// src/App.jsx
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Layout from './layout/Layout';

export default function App() {
  return (
    <Router>
      <Layout>
            <AppRoutes />
      </Layout>

    </Router>
  );
}
