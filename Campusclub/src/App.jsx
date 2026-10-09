import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';

import Dashboard from './pages/Dashboard.jsx';
import Clubs from './pages/Clubs.jsx';
import Events from './pages/Events.jsx';
import MyEvents from './pages/MyEvents.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

function App() {
return ( <Routes>
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
  <Route element={<Layout />}>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/clubs" element={<Clubs />} />
    <Route path="/events" element={<Events />} />
    <Route path="/my-events" element={<MyEvents />} />
    <Route path="/profile" element={<Profile />} />
  </Route>
</Routes>

);
}

export default App;
