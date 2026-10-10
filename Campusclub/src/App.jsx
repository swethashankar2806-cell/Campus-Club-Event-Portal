
import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clubs from './pages/Clubs';
import Events from './pages/Events';
import MyEvents from './pages/MyEvents';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import JoinClub from './pages/JoinClub';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clubs" element={<Clubs />} />
        <Route path="/join-club" element={<JoinClub />} />
        <Route path="/events" element={<Events />} />
        <Route path="/my-events" element={<MyEvents />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}

export default App;
