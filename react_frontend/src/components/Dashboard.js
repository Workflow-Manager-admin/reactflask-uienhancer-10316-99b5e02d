import React, { useEffect, useState } from "react";
import "./Dashboard.css";

// PUBLIC_INTERFACE
/**
 * Dashboard component.
 * Displays interactive widgets and example summary cards.
 */
function Dashboard() {
  // Simulate stats
  const [stats, setStats] = useState({
    users: 120,
    forms: 87,
    uptime: "99.8%",
    activity: 34
  });

  useEffect(() => {
    // Here you could fetch live dashboard data from backend
    // fetch('/api/stats') ...
  }, []);

  return (
    <section className="dashboard">
      <h2>Dashboard Overview</h2>
      <div className="dashboard__cards">
        <div className="dashboard__card">
          <span className="dashboard__card-label">Active Users</span>
          <span className="dashboard__card-value">{stats.users}</span>
        </div>
        <div className="dashboard__card">
          <span className="dashboard__card-label">Forms Created</span>
          <span className="dashboard__card-value">{stats.forms}</span>
        </div>
        <div className="dashboard__card">
          <span className="dashboard__card-label">Uptime</span>
          <span className="dashboard__card-value">{stats.uptime}</span>
        </div>
        <div className="dashboard__card">
          <span className="dashboard__card-label">New Activities</span>
          <span className="dashboard__card-value">{stats.activity}</span>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
