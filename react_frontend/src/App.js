import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import "./App.css";

// PUBLIC_INTERFACE
/**
 * Top-level App component, manages theme, and renders main Layout.
 */
function App() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  function toggleTheme() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  return (
    <div className="App">
      <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
      <Layout />
    </div>
  );
}

export default App;
