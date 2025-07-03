import React from "react";
import "./Sidebar.css";

// PUBLIC_INTERFACE
/**
 * Sidebar navigation component.
 * Contains links for menu options.
 */
function Sidebar() {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li><a href="/">🖥 Dashboard</a></li>
          <li><a href="/forms">📝 Forms</a></li>
          <li><a href="/realtime">🔄 Real-time</a></li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
