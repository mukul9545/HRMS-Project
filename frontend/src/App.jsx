import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { Users, Calendar, BarChart3 } from "lucide-react";

import Dashboard from "./Dashboard";
import EmployeeManagement from "./EmployeeManagement";
import AttendanceManagement from "./AttendanceManagement";

import "./App.css";

function Header() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: BarChart3 },
    { path: "/employees", label: "Employees", icon: Users },
    { path: "/attendance", label: "Attendance", icon: Calendar },
  ];

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Users size={32} />
            <h1>HRMS</h1>
          </div>

          <nav className="nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive ? "active" : ""}`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <Header />

        <main className="main">
          <div className="container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/employees" element={<EmployeeManagement />} />
              <Route path="/attendance" element={<AttendanceManagement />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
