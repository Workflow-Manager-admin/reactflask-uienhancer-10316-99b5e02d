import React from "react";
import "./Footer.css";

// PUBLIC_INTERFACE
/**
 * Footer displays application info and copyright.
 */
function Footer() {
  return (
    <footer className="footer">
      <span>© {new Date().getFullYear()} UIEnhancer</span>
      <span>Modern React & Flask App</span>
    </footer>
  );
}

export default Footer;
