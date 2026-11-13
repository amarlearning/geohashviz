import { Link } from "react-router-dom";
import NestingDemo from "../components/NestingDemo/NestingDemo";
import SiteFooter from "../components/SiteFooter/SiteFooter";
import "./About.css";

const features = [
  {
    title: "See every cell",
    text: "Paste any number of geohashes and each one is drawn as its bounding box on the map, then the view glides to fit them all.",
  },
  {
    title: "Measure between them",
    text: "Draw arcs between cells and read distances four ways: from a reference point, along a path, to the nearest neighbour, or across all pairs.",
  },
  {
    title: "Watch a hash narrow down",
    text: "Point at a cell to see each character's 32-square grid and the square it picks, from the whole planet down to a few metres.",
  },
];

const specs = [
  {
    term: "Stack",
    detail: "React and TypeScript, with Leaflet drawing OpenStreetMap tiles.",
  },
  {
    term: "Geohash code",
    detail:
      "Written from scratch: base32 bit interleaving, up to 12 characters.",
  },
  {
    term: "Speed",
    detail:
      "Bounding boxes and distances are memoized, so repeat work is instant.",
  },
  {
    term: "Sharing",
    detail: "The cells you plot live in the page address. Copy it and send it.",
  },
  {
    term: "Settings",
    detail:
      "Distance units, calculation modes and highlights are all yours to set.",
  },
];

const About = () => {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="page-container about-hero-grid">
          <div className="about-hero-copy">
            <h1 className="about-title">
              Geohashes, drawn as the squares they are
            </h1>
            <p className="about-lede">
              GeohashViz turns short location codes into grid cells you can see,
              measure and share, right in your browser.
            </p>
            <div className="about-actions">
              <Link to="/" className="btn-primary-gh about-action">
                Open the map
              </Link>
              <Link to="/blogs/geohash-101" className="btn-quiet about-action">
                Read Geohash 101
              </Link>
            </div>
          </div>
          <NestingDemo geohash="gcpvj" />
        </div>
      </section>

      <section className="about-section">
        <div className="page-container about-split">
          <h2 className="about-heading">Short codes, hard to picture</h2>
          <p className="about-text">
            Geohashes are a compact way to work with geographic data, but a
            string like <code>gcpvj</code> tells you nothing at a glance.
            GeohashViz exists to close that gap: paste the codes, and the map
            shows you exactly what they cover.
          </p>
        </div>
      </section>

      <section className="about-section">
        <div className="page-container">
          <h2 className="about-heading">What you can do</h2>
          <ol className="about-features">
            {features.map((f, i) => (
              <li
                key={f.title}
                className="about-feature"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="about-feature-mark" aria-hidden="true" />
                <h3 className="about-feature-title">{f.title}</h3>
                <p className="about-feature-text">{f.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="about-section">
        <div className="page-container about-split">
          <h2 className="about-heading">How it is built</h2>
          <dl className="about-specs">
            {specs.map((s) => (
              <div key={s.term} className="about-spec">
                <dt>{s.term}</dt>
                <dd>{s.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="about-section about-open">
        <div className="page-container about-split">
          <h2 className="about-heading">Open source, shaped by its users</h2>
          <div className="about-open-body">
            <p className="about-text">
              The code lives on GitHub and contributions are welcome. Much of
              what you see came from user feedback, so a bug report, an idea or
              a pull request all make the tool better for the next person.
            </p>
            <div className="about-actions">
              <a
                href="https://github.com/amarlearning/geohashviz"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-gh about-action"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Contribute on GitHub
              </a>
              <Link to="/" className="btn-quiet about-action">
                Open the map
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default About;
