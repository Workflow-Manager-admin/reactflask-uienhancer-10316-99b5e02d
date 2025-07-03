import React from "react";
import "./Header.css";

// PUBLIC_INTERFACE
/**
 * Application Header with navigation.
 * Contains site title/logo and top navigation.
 */
function Header() {
  return (
    <header className="header">
      <div className="header__logo">UIEnhancer</div>
      <nav className="header__nav">
        <a href="/" className="header__nav-link">
          Dashboard
        </a>
        <a href="/forms" className="header__nav-link">
          Forms
        </a>
        <a href="/realtime" className="header__nav-link">
          Real-time
        </a>
      </nav>
    </header>
  );
}

export default Header;
