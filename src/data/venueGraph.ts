export interface GraphNode {
  id: string;
  name: string;
  zoneId?: string; // Links to Zustand zone state
}

export interface GraphEdge {
  from: string;
  to: string;
  distance: number;
  instructions: string;
}

export interface VenueGraph {
  nodes: { [id: string]: GraphNode };
  edges: GraphEdge[];
}

export const venueGraph: VenueGraph = {
  nodes: {
    "North Gate": { id: "North Gate", name: "North Entry", zoneId: "north-gate" },
    "Concourse A": { id: "Concourse A", name: "Main North Concourse" },
    "Concourse B": { id: "Concourse B", name: "Central Concourse" },
    "Concourse C": { id: "Concourse C", name: "South Concourse" },
    "Sector 101": { id: "Sector 101", name: "VIP Sector 101", zoneId: "section-101" },
    "Food Court A": { id: "Food Court A", name: "Food Court A", zoneId: "food-court-a" },
    "Food Court B": { id: "Food Court B", name: "Food Court B" },
    "South Exit Gate": { id: "South Exit Gate", name: "South Exit Gate", zoneId: "south-gate" },
    "Nearest Washroom": { id: "Nearest Washroom", name: "Washrooms" },
    "Medical Tent": { id: "Medical Tent", name: "Medical Tent" },
    "North Gate Stage": { id: "North Gate Stage", name: "North Stage", zoneId: "north-gate" },
  },
  edges: [
    // North connections
    { from: "North Gate", to: "Concourse A", distance: 50, instructions: "Walk straight down the main entrance tunnel." },
    { from: "Concourse A", to: "North Gate", distance: 50, instructions: "Head towards the main exit tunnels." },
    
    { from: "Concourse A", to: "North Gate Stage", distance: 20, instructions: "Turn left towards the open arena." },
    { from: "North Gate Stage", to: "Concourse A", distance: 20, instructions: "Exit the arena back to the main concourse." },
    
    { from: "Concourse A", to: "Concourse B", distance: 80, instructions: "Continue straight along the central corridor." },
    { from: "Concourse B", to: "Concourse A", distance: 80, instructions: "Walk North towards the main entrance." },

    // Central connections
    { from: "Concourse B", to: "Sector 101", distance: 30, instructions: "Turn right and walk down the stairs to Sector 101." },
    { from: "Sector 101", to: "Concourse B", distance: 30, instructions: "Climb the stairs back up to the main concourse." },

    { from: "Concourse B", to: "Food Court A", distance: 40, instructions: "Turn left and follow the blue line down the hall." },
    { from: "Food Court A", to: "Concourse B", distance: 40, instructions: "Exit the food court and turn right." },

    { from: "Concourse B", to: "Nearest Washroom", distance: 20, instructions: "Enter the washroom block on your right." },
    { from: "Nearest Washroom", to: "Concourse B", distance: 20, instructions: "Return to the main hallway." },

    { from: "Concourse B", to: "Concourse C", distance: 100, instructions: "Proceed forward towards the South End." },
    { from: "Concourse C", to: "Concourse B", distance: 100, instructions: "Head North towards the central hub." },

    // South connections
    { from: "Concourse C", to: "South Exit Gate", distance: 60, instructions: "Take the ramps down to Ground Level and exit." },
    { from: "South Exit Gate", to: "Concourse C", distance: 60, instructions: "Walk up the ramps to the South Concourse." },

    { from: "Concourse C", to: "Food Court B", distance: 50, instructions: "Turn right towards the alternative dining area." },
    { from: "Food Court B", to: "Concourse C", distance: 50, instructions: "Exit dining area back to the concourse." },

    { from: "Concourse C", to: "Medical Tent", distance: 30, instructions: "Follow the red cross signs to the Medical Tent." },
    { from: "Medical Tent", to: "Concourse C", distance: 30, instructions: "Return to the main concourse." },
    
    // Fallback direct links
    { from: "North Entry Gate", to: "North Gate", distance: 10, instructions: "Proceed through the security scanners." },
    { from: "North Gate", to: "North Entry Gate", distance: 10, instructions: "Proceed to the entry plaza." },
    
    { from: "VIP Box", to: "Sector 101", distance: 10, instructions: "Enter the VIP enclosure." },
    { from: "Sector 101", to: "VIP Box", distance: 10, instructions: "Exit the VIP enclosure." },
    
    { from: "North Stand", to: "North Gate", distance: 30, instructions: "Walk down the stairs to the North Gate." },
    { from: "North Gate", to: "North Stand", distance: 30, instructions: "Climb the stairs to the North Stand." }
  ]
};

// Dijkstra's Algorithm
export function calculateRoute(startNodeId: string, endNodeId: string, graph: VenueGraph, zones: Record<string, string>) {
  if (startNodeId === endNodeId) return [];

  // Add ad-hoc missing nodes if passed strings not strictly in dictionary (e.g. from user input)
  const allNodeIds = new Set<string>(Object.keys(graph.nodes));
  graph.edges.forEach(e => {
    allNodeIds.add(e.from);
    allNodeIds.add(e.to);
  });

  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const unvisited = new Set<string>(allNodeIds);

  allNodeIds.forEach(node => {
    dist[node] = Infinity;
    prev[node] = null;
  });

  if (!unvisited.has(startNodeId)) {
    // If start node not in graph, default to Concourse B
    startNodeId = "Concourse B";
  }
  if (!unvisited.has(endNodeId)) {
    endNodeId = "Concourse B";
  }

  dist[startNodeId] = 0;

  while (unvisited.size > 0) {
    let curr = Array.from(unvisited).reduce((minNode, node) => 
      dist[node] < dist[minNode] ? node : minNode
    );

    if (dist[curr] === Infinity || curr === endNodeId) break;

    unvisited.delete(curr);

    const neighbors = graph.edges.filter(e => e.from === curr);

    for (let edge of neighbors) {
      if (!unvisited.has(edge.to)) continue;

      let weight = edge.distance;
      
      // Dynamic Crowd Weights
      const targetNode = graph.nodes[edge.to];
      if (targetNode?.zoneId) {
        const zoneState = zones[targetNode.zoneId];
        if (zoneState === 'critical') {
          weight *= 1000; // Force algorithm to avoid
        } else if (zoneState === 'crowded') {
          weight *= 2; // Penalize, but don't strictly forbid unless necessary
        }
      }

      const alt = dist[curr] + weight;
      if (alt < dist[edge.to]) {
        dist[edge.to] = alt;
        prev[edge.to] = curr;
      }
    }
  }

  const pathEdges: GraphEdge[] = [];
  let current = endNodeId;

  // Track back
  while (current !== startNodeId) {
    const previous = prev[current];
    if (!previous) break; // No path found
    
    const edge = graph.edges.find(e => e.from === previous && e.to === current);
    if (edge) pathEdges.unshift(edge);
    
    current = previous;
  }

  return pathEdges;
}
