import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import CricketScenarioGenerator from "./CricketScenarioGenerator"; // NEW MAIN DASHBOARD
import DynamicForm from "./DynamicForm";
import RealtimeDataPanel from "./RealtimeDataPanel";
import "./Layout.css";

// Simple in-memory "router" for demo purposes
const routes = {
  "/": <CricketScenarioGenerator />,
  "/forms": <DynamicForm />,
  "/realtime": <RealtimeDataPanel />
};

// PUBLIC_INTERFACE
/**
 * Main layout with Header, Sidebar, Content, and Footer.
 * Routes views based on window.location.pathname (simulates SPA routing).
 */
function Layout() {
  const [path, setPath] = useState(window.location.pathname);

  React.useEffect(() => {
    // Listen for link navigation
    const handleClick = (e) => {
      if (e.target.tagName === "A" && e.target.href.startsWith(window.location.origin)) {
        e.preventDefault();
        window.history.pushState({}, "", e.target.getAttribute("href"));
        setPath(window.location.pathname);
      }
    };
    document.addEventListener("click", handleClick);

    window.onpopstate = () => setPath(window.location.pathname);

    return () => {
      document.removeEventListener("click", handleClick);
      window.onpopstate = null;
    };
  }, []);

  return (
    <div className="layout-root">
      <Header />
      <div className="layout-main">
        <Sidebar />
        <main className="main-content">
          {routes[path] ? routes[path] : <CricketScenarioGenerator />}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Layout;
