import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Mail,
  Briefcase,
  Hash,
  User,
  Search,
  X,
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
  async delete(endpoint) {
    const res = await fetch(`${API_URL}${endpoint}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },
};

function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    employee_id: "",
    full_name: "",
    email: "",
    department: "",
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEmployees(employees);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = employees.filter(
        (emp) =>
          emp.employee_id.toLowerCase().includes(query) ||
          emp.full_name.toLowerCase().includes(query) ||
          emp.email.toLowerCase().includes(query) ||
          emp.department.toLowerCase().includes(query),
      );
      setFilteredEmployees(filtered);
    }
  }, [searchQuery, employees]);

  async function loadEmployees() {
    try {
      setLoading(true);
      const data = await api.get("/api/employees");
      setEmployees(data);
      setFilteredEmployees(data);
      setError(null);
    } catch (err) {
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    try {
      await api.post("/api/employees", formData);
      setFormSuccess("Employee added successfully!");
      setFormData({
        employee_id: "",
        full_name: "",
        email: "",
        department: "",
      });
      await loadEmployees();
      setTimeout(() => {
        setShowModal(false);
        setFormSuccess(null);
      }, 1500);
    } catch (err) {
      setFormError(err.message);
    }
  }

  function openDeleteModal(employee) {
    setEmployeeToDelete(employee);
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setEmployeeToDelete(null);
  }

  async function confirmDelete() {
    if (!employeeToDelete) return;

    try {
      await api.delete(`/api/employees/${employeeToDelete.employee_id}`);
      setDeleteSuccess(
        `Employee ${employeeToDelete.full_name} deleted successfully`,
      );
      await loadEmployees();
      closeDeleteModal();

      setTimeout(() => {
        setDeleteSuccess(null);
      }, 3000);
    } catch (err) {
      setError("Failed to delete employee");
      closeDeleteModal();
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

  const departments = [...new Set(employees.map((emp) => emp.department))];

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h2>Employee Management</h2>
          <p>Manage your organization's employee records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {deleteSuccess && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          {deleteSuccess}
        </div>
      )}

      {employees.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            className="card"
            style={{
              padding: "20px",
              background: "#ffffff",
              borderLeft: "4px solid #475569",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    marginBottom: "4px",
                    fontWeight: "500",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Total Employees
                </div>
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "700",
                    color: "#1e293b",
                  }}
                >
                  {employees.length}
                </div>
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "8px",
                  background: "#f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Users size={24} style={{ color: "#475569" }} />
              </div>
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: "20px",
              background: "#ffffff",
              borderLeft: "4px solid #64748b",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    marginBottom: "4px",
                    fontWeight: "500",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Departments
                </div>
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "700",
                    color: "#1e293b",
                  }}
                >
                  {departments.length}
                </div>
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "8px",
                  background: "#f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Briefcase size={24} style={{ color: "#475569" }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {employees.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Users className="empty-state-icon" size={80} />
            <h3>No employees yet</h3>
            <p>Get started by adding your first employee to the system</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <Plus size={18} />
              Add Your First Employee
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ position: "relative", maxWidth: "400px" }}>
              <Search
                size={20}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Search employees by ID, name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "40px", marginBottom: 0 }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9ca3af",
                    padding: "4px",
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {searchQuery && (
              <p
                style={{ marginTop: "8px", fontSize: "14px", color: "#6b7280" }}
              >
                Found {filteredEmployees.length} employee
                {filteredEmployees.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Hash size={16} />
                      Employee ID
                    </div>
                  </th>
                  <th>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <User size={16} />
                      Full Name
                    </div>
                  </th>
                  <th>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Mail size={16} />
                      Email
                    </div>
                  </th>
                  <th>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Briefcase size={16} />
                      Department
                    </div>
                  </th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#6b7280",
                      }}
                    >
                      <Search
                        size={40}
                        style={{ margin: "0 auto 12px", opacity: 0.5 }}
                      />
                      <div>No employees found matching your search</div>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        <strong style={{ color: "#334155" }}>
                          {emp.employee_id}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: "500", color: "#1e293b" }}>
                          {emp.full_name}
                        </div>
                      </td>
                      <td>
                        <div style={{ color: "#64748b", fontSize: "14px" }}>
                          {emp.email}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">
                          {emp.department}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => viewEmployeeStats(emp)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <BarChart3 size={14} />
                            Stats
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => openDeleteModal(emp)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Plus size={24} />
                Add New Employee
              </h2>
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
                  <label
                    className="form-label"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Hash size={16} />
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.employee_id}
                    onChange={(e) =>
                      setFormData({ ...formData, employee_id: e.target.value })
                    }
                    required
                    placeholder="e.g., EMP001"
                  />
                  <small style={{ color: "#6b7280", fontSize: "13px" }}>
                    Unique identifier for the employee
                  </small>
                </div>

                <div className="form-group">
                  <label
                    className="form-label"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <User size={16} />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    required
                    placeholder="e.g., John Doe"
                  />
                </div>

                <div className="form-group">
                  <label
                    className="form-label"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Mail size={16} />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    placeholder="e.g., john.doe@company.com"
                  />
                </div>

                <div className="form-group">
                  <label
                    className="form-label"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Briefcase size={16} />
                    Department *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    required
                    placeholder="e.g., Engineering, HR, Sales"
                  />
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
                  <Plus size={18} />
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && employeeToDelete && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "500px" }}
          >
            <div
              className="modal-header"
              style={{
                background: "#fafafa",
                borderBottom: "2px solid #e5e7eb",
              }}
            >
              <h2
                style={{
                  color: "#1e293b",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <AlertCircle size={24} />
                Confirm Deletion
              </h2>
            </div>
            <div className="modal-body">
              <div
                style={{
                  padding: "16px",
                  background: "#fef3c7",
                  borderRadius: "8px",
                  border: "1px solid #fde68a",
                  marginBottom: "20px",
                }}
              >
                <p style={{ margin: 0, color: "#78350f", fontSize: "14px" }}>
                  <strong>Warning:</strong> This action cannot be undone. All
                  attendance records for this employee will also be deleted.
                </p>
              </div>

              <div
                style={{
                  padding: "16px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <p
                  style={{
                    marginBottom: "12px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  You are about to delete:
                </p>
                <div style={{ display: "grid", gap: "8px" }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#6b7280" }}>Employee ID:</span>
                    <strong style={{ color: "#1e293b" }}>
                      {employeeToDelete.employee_id}
                    </strong>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#6b7280" }}>Name:</span>
                    <strong style={{ color: "#1e293b" }}>
                      {employeeToDelete.full_name}
                    </strong>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#6b7280" }}>Email:</span>
                    <strong style={{ color: "#1e293b" }}>
                      {employeeToDelete.email}
                    </strong>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#6b7280" }}>Department:</span>
                    <span className="badge badge-info">
                      {employeeToDelete.department}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmDelete}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Trash2 size={18} />
                Delete Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {showStatsModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowStatsModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <TrendingUp size={24} />
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
                          background: "#f8fafc",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#64748b",
                            marginBottom: "4px",
                          }}
                        >
                          Total Days
                        </div>
                        <div
                          style={{
                            fontSize: "28px",
                            fontWeight: "bold",
                            color: "#1e293b",
                          }}
                        >
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
                            color: "#15803d",
                            marginBottom: "4px",
                          }}
                        >
                          Present
                        </div>
                        <div
                          style={{
                            fontSize: "28px",
                            fontWeight: "bold",
                            color: "#15803d",
                          }}
                        >
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
                            color: "#b91c1c",
                            marginBottom: "4px",
                          }}
                        >
                          Absent
                        </div>
                        <div
                          style={{
                            fontSize: "28px",
                            fontWeight: "bold",
                            color: "#b91c1c",
                          }}
                        >
                          {monthlyStats.absent_days}
                        </div>
                      </div>

                      <div
                        style={{
                          padding: "16px",
                          background: "#f8fafc",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#64748b",
                            marginBottom: "4px",
                          }}
                        >
                          Attendance Rate
                        </div>
                        <div
                          style={{
                            fontSize: "28px",
                            fontWeight: "bold",
                            color: "#1e293b",
                          }}
                        >
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

export default EmployeeManagement;
