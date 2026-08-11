type Point2D = [number, number];

function cross(O: Point2D, A: Point2D, B: Point2D): number {
  return (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]);
}

function distSq(a: Point2D, b: Point2D): number {
  return (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2;
}

// Jarvis march (gift-wrapping) — returns hull vertices in CCW order.
export function convexHull(points: Point2D[]): Point2D[] {
  const n = points.length;
  if (n < 3) return [...points];

  // Start from the leftmost point, breaking ties by lowest y.
  let start = 0;
  for (let i = 1; i < n; i++) {
    if (
      points[i][0] < points[start][0] ||
      (points[i][0] === points[start][0] && points[i][1] < points[start][1])
    ) {
      start = i;
    }
  }

  const hull: Point2D[] = [];
  let current = start;

  do {
    hull.push(points[current]);
    let next = (current + 1) % n;

    for (let i = 0; i < n; i++) {
      const c = cross(points[current], points[next], points[i]);
      // Pick i if it makes a more CCW turn, or is farther when collinear.
      if (c > 0 || (c === 0 && distSq(points[current], points[i]) > distSq(points[current], points[next]))) {
        next = i;
      }
    }

    current = next;
  } while (current !== start && hull.length <= n);

  return hull;
}
