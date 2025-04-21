const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Mapping of products to centers
const productToCenter = {
  A: 'C1', B: 'C1', C: 'C1',
  D: 'C2', E: 'C2', F: 'C2',
  G: 'C3', H: 'C3', I: 'C3'
};

// Distance map (in km)
const distances = {
  C1: { L1: 10, C2: 15, C3: 20 },
  C2: { L1: 20, C1: 15, C3: 25 },
  C3: { L1: 30, C1: 20, C2: 25 }
};

// Helper: get unique centers needed for a given order
const getInvolvedCenters = (order) => {
  const centers = new Set();
  for (let p in order) {
    if (order[p] > 0) {
      centers.add(productToCenter[p]);
    }
  }
  return Array.from(centers);
};

// Helper: get total weight to pick up from a center
const getWeightFromCenter = (order, center) => {
  let weight = 0;
  for (let p in order) {
    if (productToCenter[p] === center && order[p] > 0) {
      weight += order[p] * 0.5;
    }
  }
  return weight;
};

// Generate all permutations of an array
const permute = (arr) => {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (let perm of permute(rest)) {
      result.push([arr[i], ...perm]);
    }
  }
  return result;
};

// Core cost calculation logic
const calculateMinCost = (order) => {
  const centers = getInvolvedCenters(order);
  let minCost = Infinity;

  for (let start of centers) {
    const otherCenters = centers.filter(c => c !== start);
    const routes = permute(otherCenters);

    for (let route of routes) {
      let cost = 0;
      let current = start;
      let remaining = [start, ...route];

      let carriedWeight = getWeightFromCenter(order, start);
      cost += distances[current].L1 * carriedWeight;

      for (let next of route) {
        const dist = distances[current][next];
        current = next;
        carriedWeight = getWeightFromCenter(order, next);
        cost += distances[current].L1 * carriedWeight;
      }

      if (cost < minCost) minCost = cost;
    }
  }

  return Math.round(minCost);
};

app.post('/calculate-delivery-cost', (req, res) => {
  try {
    const order = req.body;
    const cost = calculateMinCost(order);
    res.json({ deliveryCost: cost });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});