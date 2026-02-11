import React, { useState, useEffect } from "react";
import { Users, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = {
  async get(endpoint) {
    const res = await fetch(`${API_URL}${endpoint}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const [employees, todayAttendance] = await Promise.all([
        api.get("/api/employees"),
        api.get(`/api/attendance?date=${today}`),
      ]);
      setStats({ employees, todayAttendance });
      setError(null);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <AlertCircle size={20} />
        {error}
      </div>
    );
  }

  const totalEmployees = stats.employees.length;
  const presentToday = stats.todayAttendance.filter(
    (att) => att.status === "Present",
  ).length;
  const absentToday = stats.todayAttendance.filter(
    (att) => att.status === "Absent",
  ).length;
  const notMarked = totalEmployees - presentToday - absentToday;

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Today's attendance overview - {new Date().toLocaleDateString()}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">
            <Users size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalEmployees}</div>
            <div className="stat-label">Total Employees</div>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">
            <CheckCircle size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{presentToday}</div>
            <div className="stat-label">Present Today</div>
          </div>
        </div>

        <div className="stat-card stat-danger">
          <div className="stat-icon">
            <XCircle size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{absentToday}</div>
            <div className="stat-label">Absent Today</div>
          </div>
        </div>

        {notMarked > 0 && (
          <div
            className="stat-card"
            style={{
              background: "var(--color-amber-50)",
              borderColor: "var(--color-amber-200)",
            }}
          >
            <div
              className="stat-icon"
              style={{ color: "var(--color-amber-600)" }}
            >
              <AlertCircle size={32} />
            </div>
            <div className="stat-content">
              <div
                className="stat-value"
                style={{ color: "var(--color-amber-600)" }}
              >
                {notMarked}
              </div>
              <div
                className="stat-label"
                style={{ color: "var(--color-amber-700)" }}
              >
                Not Marked
              </div>
            </div>
          </div>
        )}
      </div>

      {stats.todayAttendance.length > 0 && (
        <div className="card" style={{ marginTop: "32px" }}>
          <h3 style={{ marginBottom: "24px" }}>Today's Attendance Details</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.todayAttendance.map((record) => {
                  const employee = stats.employees.find(
                    (emp) => emp.employee_id === record.employee_id,
                  );
                  return (
                    <tr key={record.id}>
                      <td>
                        <strong>{record.employee_id}</strong>
                      </td>
                      <td>{employee?.full_name || "Unknown"}</td>
                      <td>
                        <span
                          className={`badge ${
                            record.status === "Present"
                              ? "badge-success"
                              : "badge-danger"
                          }`}
                        >
                          {record.status === "Present" ? (
                            <CheckCircle size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
