// Force-directed graph auto layout

export function forceLayout(nodes, edges, width = 800, height = 600, iterations = 100) {
  const positions = new Map();

  // Initialize positions in a circle
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.35;

  nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length;
    positions.set(node.id, {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      vx: 0,
      vy: 0
    });
  });

  const k = Math.sqrt((width * height) / nodes.length);
  const dt = 0.1;

  for (let iter = 0; iter < iterations; iter++) {
    const temperature = 1 - iter / iterations;

    // Repulsive forces between all node pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const pi = positions.get(nodes[i].id);
        const pj = positions.get(nodes[j].id);
        const dx = pi.x - pj.x;
        const dy = pi.y - pj.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (k * k) / dist;

        const fx = (dx / dist) * force * dt * temperature;
        const fy = (dy / dist) * force * dt * temperature;

        pi.vx += fx;
        pi.vy += fy;
        pj.vx -= fx;
        pj.vy -= fy;
      }
    }

    // Attractive forces along edges
    for (const edge of edges) {
      const pi = positions.get(edge.source);
      const pj = positions.get(edge.target);
      if (!pi || !pj) continue;

      const dx = pj.x - pi.x;
      const dy = pj.y - pi.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist * dist) / k;

      const fx = (dx / dist) * force * dt * temperature;
      const fy = (dy / dist) * force * dt * temperature;

      pi.vx += fx;
      pi.vy += fy;
      pj.vx -= fx;
      pj.vy -= fy;
    }

    // Apply velocities and constrain
    for (const node of nodes) {
      const p = positions.get(node.id);
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.8;
      p.vy *= 0.8;

      // Keep within bounds
      p.x = Math.max(60, Math.min(width - 60, p.x));
      p.y = Math.max(60, Math.min(height - 60, p.y));
    }
  }

  const result = {};
  for (const node of nodes) {
    const p = positions.get(node.id);
    result[node.id] = { x: p.x, y: p.y };
  }
  return result;
}

export function circleLayout(nodeIds, width = 800, height = 600) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.35;
  const result = {};

  nodeIds.forEach((id, i) => {
    const angle = (2 * Math.PI * i) / nodeIds.length - Math.PI / 2;
    result[id] = {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    };
  });

  return result;
}
