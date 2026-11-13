# GeohashViz

> Inferred from the repository (AGENTS.md, routes, copy) and confirmed scope answers on 2026-11-14. Fields marked _(inferred)_ have not been confirmed by the owner.

## Purpose

A free, browser-only tool that draws geohash cells on a map. Paste geohash strings, see each cell's bounding box, and measure distances between cells.

## Users and jobs

- **Primary:** developers and data engineers working with geospatial indexes (databases, search, ride-hailing, delivery, analytics) who need to check what a geohash or set of geohashes covers. _(inferred)_
- **Secondary:** learners reading the blog to understand geohashing, precision and real-world use. _(inferred)_
- Jobs: decode and inspect cells, compare neighbours and precision levels, share a view by URL, measure distances (reference, consecutive, nearest neighbour, all pairs).

## Mechanism

Geohash encoding implemented from scratch in TypeScript (base32 bit interleaving, max 12 chars). State lives in the URL (`?view=gct,gcp`) so any view can be shared.

## Surfaces

- `/` map workspace: Operate.
- `/about`: Read.
- `/blogs` and articles: Read.

## Constraints

- Static SPA on GitHub Pages, React 18 + Vite, Leaflet with OpenStreetMap tiles.
- Must keep all existing behaviour: URL state, localStorage keys, keyboard shortcuts (Shift+F, Esc), distance modes, all routes.
- No backend, no accounts, no tracking claims.

## Platform

web

## Proof and claims

No user counts, customers, metrics or testimonials exist. Never invent them.
