import { Navigate, Route, Routes } from 'react-router-dom';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clubs from './pages/Clubs';
import Events from './pages/Events';
import MyEvents from './pages/MyEvents';
import Profile from './pages/Profile';
import Register from './pages/Register';
import JoinClub from './pages/JoinClub';
import RegisterEvent from './pages/RegisterEvents';

function App() {
  return (
    <Routes>
      {/* Redirect the home page to Dashboard */}
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />
      <Route path="/coordinator" element={<CoordinatorDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      {/* Login and student registration */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Pages that use the common Navbar and Sidebar */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clubs" element={<Clubs />} />
        <Route path="/join-club" element={<JoinClub />} />
        <Route path="/events" element={<Events />} />

        {/* Separate event registration page */}
        <Route
          path="/register-event"
          element={<RegisterEvent />}
        />

        <Route path="/my-events" element={<MyEvents />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Handle unknown URLs */}
      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}

export default App;