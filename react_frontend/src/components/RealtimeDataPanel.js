import React, { useEffect, useState } from "react";
import "./RealtimeDataPanel.css";

// PUBLIC_INTERFACE
/**
 * Real-time data component.
 * Simulates fetching backend data every few seconds (polling).
 */
function RealtimeDataPanel() {
  const [timestamp, setTimestamp] = useState(Date.now());
  const [message, setMessage] = useState("Waiting for data...");

  useEffect(() => {
    const interval = setInterval(() => {
      // Example: fetch('/api/realtime') ...
      setTimestamp(Date.now());
      setMessage(`Refreshed at ${new Date().toLocaleTimeString()}`);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="realtime-panel">
      <h2>Real-time Data</h2>
      <div className="realtime-panel__timestamp">
        <span>{message}</span>
      </div>
    </section>
  );
}

export default RealtimeDataPanel;
