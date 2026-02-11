import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = {
  async get(endpoint) {
    const res = await fetch(`${API_URL}${endpoint}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async post(endpoint, data) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || `HTTP ${res.status}`);
    }
    return res.json();
  },
};

function AttendanceManagement() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    date: new Date().toISOString().split("T")[0],
    status: "Present",
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    loadData();
  }, [filterDate]);

  async function loadData() {
    try {
      setLoading(true);
      const empData = await api.get("/api/employees");
      setEmployees(empData);

      if (filterDate) {
        const attData = await api.get(`/api/attendance?date=${filterDate}`);
        setAttendance(attData);
      } else {
        setAttendance([]);
      }

      setError(null);
    } catch (err) {
      setError("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    try {
      await api.post("/api/attendance", formData);
      setFormSuccess("Attendance marked successfully!");
      setFormData({
        employee_id: "",
        date: new Date().toISOString().split("T")[0],
        status: "Present",
      });
      await loadData();
      setTimeout(() => {
        setShowModal(false);
        setFormSuccess(null);
      }, 1500);
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function viewEmployeeStats(employee) {
    setSelectedEmployee(employee);
    setShowStatsModal(true);
    setLoadingStats(true);
    setMonthlyStats(null);

    try {
      const stats = await api.get(
        `/api/attendance/monthly-stats/${employee.employee_id}`,
      );
      setMonthlyStats(stats);
    } catch (err) {
      console.error("Failed to load monthly stats:", err);
      setMonthlyStats({
        total_days: 0,
        present_days: 0,
        absent_days: 0,
        attendance_rate: 0,
      });
    } finally {
      setLoadingStats(false);
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading attendance...</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h2>Attendance Management</h2>
          <p>Track and manage employee attendance</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          disabled={employees.length === 0}
        >
          <Plus size={18} />
          Mark Attendance
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {employees.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Users className="empty-state-icon" size={80} />
            <h3>No employees found</h3>
            <p>Add employees first before marking attendance</p>
            <Link to="/employees" className="btn btn-primary">
              <Plus size={18} />
              Add Employees
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: "24px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Filter by Date</label>
              <input
                type="date"
                className="form-input"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={{ maxWidth: "300px" }}
                placeholder="Select a date to view attendance"
              />
              {!filterDate && (
                <p
                  style={{ fontSize: "14px", color: "#666", marginTop: "8px" }}
                >
                  Please select a date to view attendance records
                </p>
              )}
            </div>
          </div>

          {!filterDate ? (
            <div className="card">
              <div className="empty-state">
                <Calendar className="empty-state-icon" size={80} />
                <h3>Select a date to view attendance</h3>
                <p>
                  Choose a date from the filter above to see attendance records
                </p>
              </div>
            </div>
          ) : attendance.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <Calendar className="empty-state-icon" size={80} />
                <h3>No attendance records for this date</h3>
                <p>Start marking attendance for your employees on this date</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowModal(true)}
                >
                  <Plus size={18} />
                  Mark Attendance
                </button>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Full Name</th>
                      <th>Department</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((record) => {
                      const employee = employees.find(
                        (emp) => emp.employee_id === record.employee_id,
                      );
                      return (
                        <tr key={record.id}>
                          <td>
                            <strong>{record.employee_id}</strong>
                          </td>
                          <td>{employee?.full_name || "Unknown"}</td>
                          <td>
                            <span className="badge badge-info">
                              {employee?.department || "N/A"}
                            </span>
                          </td>
                          <td>{new Date(record.date).toLocaleDateString()}</td>
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
                          <td>
                            <button
                              className="btn btn-secondary"
                              style={{ fontSize: "12px", padding: "4px 12px" }}
                              onClick={() => viewEmployeeStats(employee)}
                            >
                              <BarChart3 size={14} />
                              View Stats
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Mark Attendance</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="alert alert-error">
                    <AlertCircle size={20} />
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="alert alert-success">
                    <CheckCircle size={20} />
                    {formSuccess}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Employee *</label>
                  <select
                    className="form-select"
                    value={formData.employee_id}
                    onChange={(e) =>
                      setFormData({ ...formData, employee_id: e.target.value })
                    }
                    required
                  >
                    <option value="">Select employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.employee_id}>
                        {emp.employee_id} - {emp.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status *</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    required
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  <CheckCircle size={18} />
                  Mark Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStatsModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowStatsModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <TrendingUp size={24} style={{ marginRight: "8px" }} />
                Attendance Statistics
              </h2>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ marginBottom: "8px", fontSize: "18px" }}>
                  {selectedEmployee.full_name}
                </h3>
                <p style={{ color: "#666", fontSize: "14px" }}>
                  Employee ID: {selectedEmployee.employee_id} | Department:{" "}
                  {selectedEmployee.department}
                </p>
              </div>

              {loadingStats ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <div
                    className="spinner"
                    style={{ margin: "0 auto 16px" }}
                  ></div>
                  <p style={{ color: "#666" }}>Loading statistics...</p>
                </div>
              ) : monthlyStats ? (
                <>
                  <div style={{ marginBottom: "16px" }}>
                    <h4 style={{ marginBottom: "12px", fontSize: "16px" }}>
                      This Month's Attendance (
                      {new Date().toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                      )
                    </h4>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "16px",
                      }}
                    >
                      <div
                        style={{
                          padding: "16px",
                          background: "#f0f9ff",
                          borderRadius: "8px",
                          border: "1px solid #bfdbfe",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#3b82f6",
                            marginBottom: "4px",
                          }}
                        >
                          Total Days
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: "bold" }}>
                          {monthlyStats.total_days}
                        </div>
                      </div>

                      <div
                        style={{
                          padding: "16px",
                          background: "#f0fdf4",
                          borderRadius: "8px",
                          border: "1px solid #bbf7d0",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#22c55e",
                            marginBottom: "4px",
                          }}
                        >
                          Present
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: "bold" }}>
                          {monthlyStats.present_days}
                        </div>
                      </div>

                      <div
                        style={{
                          padding: "16px",
                          background: "#fef2f2",
                          borderRadius: "8px",
                          border: "1px solid #fecaca",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#ef4444",
                            marginBottom: "4px",
                          }}
                        >
                          Absent
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: "bold" }}>
                          {monthlyStats.absent_days}
                        </div>
                      </div>

                      <div
                        style={{
                          padding: "16px",
                          background: "#faf5ff",
                          borderRadius: "8px",
                          border: "1px solid #e9d5ff",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#a855f7",
                            marginBottom: "4px",
                          }}
                        >
                          Attendance Rate
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: "bold" }}>
                          {monthlyStats.attendance_rate}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "20px",
                      padding: "12px",
                      background: "#f8fafc",
                      borderRadius: "6px",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    <strong>Note:</strong> Statistics are calculated for the
                    current month
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <AlertCircle
                    size={48}
                    style={{ color: "#ef4444", marginBottom: "16px" }}
                  />
                  <p style={{ color: "#666" }}>Failed to load statistics</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowStatsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceManagement;
