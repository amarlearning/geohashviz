import React from "react";
import { Link } from "react-router-dom";
import "./SiteFooter.css";

/** Ruled strip that closes the reading pages */
const SiteFooter: React.FC = () => (
  <footer className="site-footer">
    <div className="page-container site-footer-inner">
      <p className="site-footer-name">
        GeohashViz
        <span className="site-footer-note">
          Free and open source. Map data from OpenStreetMap contributors.
        </span>
      </p>
      <nav className="site-footer-links" aria-label="Footer">
        <Link to="/">Map</Link>
        <Link to="/about">About</Link>
        <Link to="/blogs">Blog</Link>
        <a
          href="https://github.com/amarlearning/geohashviz"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </nav>
    </div>
  </footer>
);

export default SiteFooter;
