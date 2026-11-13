import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import BlogList from "./pages/blog/BlogList";
import Geohash101 from "./pages/blog/Geohash101";
import RealWorldUseCases from "./pages/blog/RealWorldUseCases";
import GeohashPrecision from "./pages/blog/GeohashPrecision";
import DistanceAnalysisFeature from "./pages/blog/DistanceAnalysisFeature";
import OptimizingGeoQueries from "./pages/blog/OptimizingGeoQueries";
import BuildingGeohashViz from "./pages/blog/BuildingGeohashViz";

/** Wordmark: a grid square split 8 by 4, one cell picked, the way a geohash character picks */
const GridMark = () => (
  <svg
    className="grid-mark"
    width="22"
    height="22"
    viewBox="0 0 22 22"
    aria-hidden="true"
  >
    <rect className="grid-mark-frame" x="1" y="1" width="20" height="20" />
    <path
      className="grid-mark-lines"
      d="M6 1v20M11 1v20M16 1v20M1 6h20M1 11h20M1 16h20"
    />
    <rect className="grid-mark-cell" x="11" y="6" width="5" height="5" />
  </svg>
);

const GitHubIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

function AppContent() {
  const location = useLocation();
  const onMap = location.pathname === "/";

  return (
    <div className={`app-container ${onMap ? "is-map" : "is-page"}`}>
      <header className="app-bar">
        <Link to="/" className="app-brand" aria-label="GeohashViz home">
          <GridMark />
          <span className="app-brand-name">GeohashViz</span>
        </Link>
        <nav className="app-nav" aria-label="Primary">
          <NavLink to="/" end className="app-nav-link">
            Map
          </NavLink>
          <NavLink to="/about" className="app-nav-link">
            About
          </NavLink>
          <NavLink to="/blogs" className="app-nav-link">
            Blog
          </NavLink>
          <a
            href="https://github.com/amarlearning/geohashviz"
            target="_blank"
            rel="noopener noreferrer"
            className="app-nav-link app-nav-icon"
            aria-label="GeohashViz on GitHub"
          >
            <GitHubIcon />
          </a>
        </nav>
      </header>
      <main className="app-main" key={onMap ? "map" : location.pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/blogs" element={<BlogList />} />
          <Route path="/blogs/geohash-101" element={<Geohash101 />} />
          <Route
            path="/blogs/real-world-geohash-use-cases"
            element={<RealWorldUseCases />}
          />
          <Route
            path="/blogs/geohash-precision-guide"
            element={<GeohashPrecision />}
          />
          <Route
            path="/blogs/distance-analysis-feature"
            element={<DistanceAnalysisFeature />}
          />
          <Route
            path="/blogs/optimizing-geo-queries"
            element={<OptimizingGeoQueries />}
          />
          <Route
            path="/blogs/building-geohashviz"
            element={<BuildingGeohashViz />}
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
