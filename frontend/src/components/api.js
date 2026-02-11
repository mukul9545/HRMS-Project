// frontend/src/api.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = {
  // Employee endpoints
  async getEmployees() {
    const response = await fetch(`${API_URL}/api/employees`);
    if (!response.ok) throw new Error("Failed to fetch employees");
    return response.json();
  },

  async createEmployee(employee) {
    const response = await fetch(`${API_URL}/api/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employee),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create employee");
    }
    return response.json();
  },

  async deleteEmployee(employeeId) {
    const response = await fetch(`${API_URL}/api/employees/${employeeId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete employee");
  },

  // Attendance endpoints
  async getAttendance(employeeId = null, date = null) {
    let url = `${API_URL}/api/attendance?`;
    if (employeeId) url += `employee_id=${employeeId}&`;
    if (date) url += `date=${date}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch attendance");
    return response.json();
  },

  async markAttendance(attendance) {
    const response = await fetch(`${API_URL}/api/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(attendance),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to mark attendance");
    }
    return response.json();
  },

  async getAttendanceStats() {
    const response = await fetch(`${API_URL}/api/attendance/stats`);
    if (!response.ok) throw new Error("Failed to fetch attendance stats");
    return response.json();
  },

  // Monthly attendance statistics for individual employee
  async getMonthlyAttendanceStats(employeeId, month = null, year = null) {
    let url = `${API_URL}/api/attendance/monthly-stats/${employeeId}`;
    const params = new URLSearchParams();

    if (month !== null) params.append("month", month);
    if (year !== null) params.append("year", year);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.detail || "Failed to fetch monthly attendance stats",
      );
    }
    return response.json();
  },
};
