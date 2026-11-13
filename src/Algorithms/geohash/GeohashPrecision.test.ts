import {
  encodeGeohash,
  formatLength,
  neighbourCells,
  precisionLadder,
} from "./GeohashPrecision";
import { getBoundingBox } from "./GeohashBoundingBox";

describe("precisionLadder", () => {
  test("first character splits the world 8 by 4", () => {
    const [g] = precisionLadder("g");
    expect([g.cols, g.rows]).toEqual([8, 4]);
    // 'g' is the 4th column from the west, top row (north-west Europe)
    expect([g.col, g.row]).toEqual([3, 0]);
  });

  test("second character splits its parent 4 by 8", () => {
    const rungs = precisionLadder("gc");
    expect(rungs).toHaveLength(2);
    expect([rungs[1].cols, rungs[1].rows]).toEqual([4, 8]);
    expect(rungs[1].col).toBeGreaterThanOrEqual(0);
    expect(rungs[1].col).toBeLessThan(4);
    expect(rungs[1].row).toBeLessThan(8);
  });

  test("cells shrink as the hash grows", () => {
    const rungs = precisionLadder("gcpvj");
    for (let i = 1; i < rungs.length; i++) {
      expect(rungs[i].size.heightKm).toBeLessThan(rungs[i - 1].size.heightKm);
    }
  });
});

describe("encodeGeohash", () => {
  test("round-trips through the decoder", () => {
    for (const hash of ["gcpuvpk", "dr5regy", "9q8yyk8", "u4pruy"]) {
      const b = getBoundingBox(hash);
      const lat = (b.sw.lat + b.ne.lat) / 2;
      const lon = (b.sw.lon + b.ne.lon) / 2;
      expect(encodeGeohash(lat, lon, hash.length)).toBe(hash);
    }
  });
});

describe("neighbourCells", () => {
  test("returns the 8 touching cells at the same precision", () => {
    const n = neighbourCells("gct");
    expect(n).toHaveLength(8);
    expect(n.every((c) => c.geohash.length === 3)).toBe(true);
    expect(new Set(n.map((c) => c.geohash)).size).toBe(8);
  });

  test("crosses the parent boundary with a different prefix", () => {
    // gcp sits on the east edge of gc, so its east neighbour lives under u
    const n = neighbourCells("gcp");
    const east = n.find((c) => c.direction === "e");
    expect(east?.geohash).toBe("u10");
    expect(n.find((c) => c.direction === "n")?.geohash).toBe("gcr");
  });

  test("known neighbours of a 1-char cell, wrapping the antimeridian", () => {
    const n = neighbourCells("8"); // west edge of the world
    expect(n.find((c) => c.direction === "w")?.geohash).toBe("x");
  });

  test("skips rows past the poles", () => {
    const n = neighbourCells("b"); // top row of the world
    expect(n.some((c) => c.direction === "n")).toBe(false);
    expect(n).toHaveLength(5);
  });
});

test("formatLength picks a readable unit", () => {
  expect(formatLength(5003.4)).toBe("5,003 km");
  expect(formatLength(4.89)).toBe("4.9 km");
  expect(formatLength(0.153)).toBe("153 m");
});
