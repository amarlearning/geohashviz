import { Link } from "react-router-dom";
import SiteFooter from "../../components/SiteFooter/SiteFooter";
import "./Blog.css";

/** An 8 by 4 grid with one square picked: each post gets its own square */
const IndexMark = ({ index }: { index: number }) => {
  const col = (index * 3 + 1) % 8;
  const row = (index * 5 + 2) % 4;
  return (
    <svg
      className="index-mark"
      width="49"
      height="25"
      viewBox="-0.5 -0.5 49 25"
      aria-hidden="true"
    >
      <rect className="index-mark-frame" width="48" height="24" />
      <path
        className="index-mark-lines"
        d="M6 0v24M12 0v24M18 0v24M24 0v24M30 0v24M36 0v24M42 0v24M0 6h48M0 12h48M0 18h48"
      />
      <rect
        className="index-mark-cell"
        x={col * 6}
        y={row * 6}
        width="6"
        height="6"
      />
    </svg>
  );
};

const BlogList = () => {
  const blogPosts = [
    {
      slug: "geohash-101",
      title: "Geohash 101: Understanding Location Encoding",
      excerpt:
        "Learn the fundamentals of geohashing, how it works, and why it's essential for modern location-based applications.",
      readTime: "8 min read",
      date: "December 2024",
      category: "Fundamentals",
    },
    {
      slug: "geohash-precision-guide",
      title: "Comparing Geohash Precision: A Complete Guide",
      excerpt:
        "Explore different geohash lengths and their precision levels. Learn how to choose the right precision for your specific use case.",
      readTime: "7 min read",
      date: "December 2024",
      category: "Guide",
    },
    {
      slug: "distance-analysis-feature",
      title: "Introducing Distance Analysis in GeohashViz",
      excerpt:
        "Discover our new Distance Analysis feature that brings real-world distance measurements directly into the map interface with interactive filtering.",
      readTime: "6 min read",
      date: "December 2024",
      category: "Features",
    },
    {
      slug: "optimizing-geo-queries",
      title: "Optimizing Geo Queries with Geohashes",
      excerpt:
        "Learn how geohashes accelerate spatial queries in databases like Firestore and Elasticsearch with practical examples and code.",
      readTime: "8 min read",
      date: "December 2024",
      category: "Performance",
    },
    {
      slug: "building-geohashviz",
      title: "Behind the Scenes: Building GeohashViz",
      excerpt:
        "Insights into our tech stack, design decisions, and the engineering challenges of building a real-time geohash visualization platform.",
      readTime: "9 min read",
      date: "December 2024",
      category: "Engineering",
    },
    {
      slug: "real-world-geohash-use-cases",
      title: "Real-World Geohash Use Cases",
      excerpt:
        "Explore practical applications of geohashes in ride-sharing, delivery services, gaming, and more.",
      readTime: "6 min read",
      date: "December 2024",
      category: "Applications",
    },
  ];

  const [lead, ...rest] = [
    ...blogPosts.filter((post) => post.category === "Features"),
    ...blogPosts.filter((post) => post.category !== "Features"),
  ];

  return (
    <div className="blog-page">
      <header className="blog-index-head">
        <div className="page-container">
          <h1 className="blog-index-title">Field notes on geohashing</h1>
          <p className="blog-index-lede">
            {blogPosts.length} guides to geohashes, location encoding and the
            spatial queries built on them.
          </p>
        </div>
      </header>

      <div className="page-container blog-index">
        <Link to={`/blogs/${lead.slug}`} className="blog-lead">
          <span className="blog-lead-meta">
            <span className="blog-tag">Latest feature</span>
            <span>{lead.date}</span>
            <span>{lead.readTime}</span>
          </span>
          <span className="blog-lead-title">{lead.title}</span>
          <span className="blog-lead-excerpt">{lead.excerpt}</span>
          <span className="blog-lead-cta">Read the article</span>
        </Link>

        <h2 className="blog-index-heading">All guides</h2>
        <ol className="blog-rows">
          {rest.map((post, i) => (
            <li key={post.slug} style={{ animationDelay: `${i * 70}ms` }}>
              <Link to={`/blogs/${post.slug}`} className="blog-row">
                <IndexMark index={i} />
                <span className="blog-row-main">
                  <span className="blog-row-title">{post.title}</span>
                  <span className="blog-row-excerpt">{post.excerpt}</span>
                </span>
                <span className="blog-row-meta">
                  <span className="blog-tag">{post.category}</span>
                  <span>{post.readTime}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <SiteFooter />
    </div>
  );
};

export default BlogList;
