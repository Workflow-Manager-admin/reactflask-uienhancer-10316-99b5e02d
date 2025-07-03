import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import CricketScenarioGenerator from "./CricketScenarioGenerator";
import "./Layout.css";

// PUBLIC_INTERFACE
/**
 * Main layout with Header, Content, and Footer - no sidebar, minimal & modern.
 * Shows only CricketScenarioGenerator as the main content.
 */
function Layout() {
  return (
    <div className="layout-root">
      <Header />
      <div className="layout-main">
        <main className="main-content">
          <CricketScenarioGenerator />
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Layout;
