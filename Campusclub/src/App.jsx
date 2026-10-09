<<<<<<< HEAD
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Layout>
      <Dashboard />
    </Layout>
=======
import { useState } from "react";
import Login from "../pages/Login";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "../pages/Dashboard";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return (
      <Login onLogin={() => setIsLoggedIn(true)} />
    );
  }

  return (
    <div className="app">

      <Navbar />

      <div className="layout">

        <Sidebar />

        <Dashboard />

      </div>

    </div>
>>>>>>> f8f353722619dbaadbdaaf5db18f0ae9097280f1
  );
}

export default App;