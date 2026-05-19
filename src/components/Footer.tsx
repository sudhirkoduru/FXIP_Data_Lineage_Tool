import React from "react";

/**
 * AA-branded footer — matches Flight Info Service footer style.
 */
const Footer: React.FC = () => (
  <footer
    style={{
      background: "#004687",
      color: "#ffffff",
      textAlign: "center",
      padding: "10px 0",
      fontSize: "0.8rem",
      letterSpacing: "0.05em",
      borderTop: "2px solid #c8102e",
      width: "100%",
      flexShrink: 0,
    }}
  >
    <p>© {new Date().getFullYear()} American Airlines. All rights reserved.</p>
  </footer>
);

export default Footer;
