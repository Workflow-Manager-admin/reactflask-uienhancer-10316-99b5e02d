import React from "react";
import "./Header.css";

// PUBLIC_INTERFACE
/**
 * Application Header - minimal, only logo (navigation removed).
 */
function Header() {
  return (
    <header className="header">
      <div className="header__logo">UIEnhancer</div>
    </header>
  );
}

export default Header;
