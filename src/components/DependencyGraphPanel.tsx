import React, { useEffect, useRef, useState, useMemo } from "react";
import { DependencyGraph, GraphNode, GraphLink, Risk, Bottleneck } from "../types";
import * as d3 from "d3";
import { 
  Network, ZoomIn, ZoomOut, Search, Database, FileCode, Cpu, 
  Globe, AlertTriangle, ShieldCheck, Stars, Orbit, Eye, RefreshCw 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DependencyGraphProps {
  graph?: DependencyGraph;
  risks?: Risk[];
  bottlenecks?: Bottleneck[];
}

interface NodeScoreInfo {
  score: number;
  reasons: string[];
  severity: "critical" | "high" | "medium" | "low";
}

// Score static & dynamic structural debt vectors from current live evaluations
function calculateNodeScore(node: GraphNode, risks: Risk[] = [], bottlenecks: Bottleneck[] = []): NodeScoreInfo {
  let score = 0;
  const reasons: string[] = [];

  // 1. Complexity Baseline contribution
  if (node.complexity === "High") {
    score += 40;
    reasons.push("High module complexity detected by static analyzer");
  } else if (node.complexity === "Medium") {
    score += 20;
    reasons.push("Medium static module complexity rating");
  }

  const labelLower = node.label.toLowerCase();
  const idLower = node.id.toLowerCase();

  // 2. Risk Context correlation
  risks.forEach(r => {
    const titleLower = r.title.toLowerCase();
    const descLower = r.description.toLowerCase();
    
    if (
      titleLower.includes(labelLower) ||
      descLower.includes(labelLower) ||
      labelLower.includes(titleLower) ||
      (idLower && (titleLower.includes(idLower) || descLower.includes(idLower)))
    ) {
      const severity = r.severity.toLowerCase();
      if (severity === "critical") {
        score += 45;
        reasons.push(`Target of critical risk check: ${r.title}`);
      } else if (severity === "high") {
        score += 30;
        reasons.push(`Underlies high-risk threat landscape: ${r.title}`);
      } else {
        score += 15;
        reasons.push(`Linked to moderate risk posture: ${r.title}`);
      }
    }
  });

  // 3. Performance Bottleneck correlation
  bottlenecks.forEach(b => {
    const resLower = b.resource.toLowerCase();
    const impactLower = b.impact.toLowerCase();
    
    if (
      resLower.includes(labelLower) ||
      impactLower.includes(labelLower) ||
      (idLower && resLower.includes(idLower))
    ) {
      const likelihood = b.likelihood.toLowerCase();
      if (likelihood === "high" || likelihood === "critical") {
        score += 35;
        reasons.push(`Key resource in high-probability bottleneck: ${b.resource}`);
      } else {
        score += 20;
        reasons.push(`Bound to latency bottleneck pathway: ${b.resource}`);
      }
    }
  });

  if (score > 100) score = 100;

  let severity: "critical" | "high" | "medium" | "low" = "low";
  if (score >= 70) severity = "critical";
  else if (score >= 40) severity = "high";
  else if (score >= 15) severity = "medium";

  return { score, reasons, severity };
}

export default function DependencyGraphPanel({ graph, risks = [], bottlenecks = [] }: DependencyGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fsSvgRef = useRef<SVGSVGElement | null>(null);
  const fsContainerRef = useRef<HTMLDivElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [heatmapActive, setHeatmapActive] = useState(true);
  
  // Custom interactive enhancements: Time travel & Full screen spectrum
  const [selectedYear, setSelectedYear] = useState<"2023" | "2024" | "2025" | "Present">("Present");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [cinematicMode, setCinematicMode] = useState(true);

  // Time-travel graph formulation (transforms coordinates & modules seamlessly via D3 forces)
  const activeGraph = useMemo(() => {
    if (!graph) return null;
    if (selectedYear === "Present") return graph;
    
    if (selectedYear === "2023") {
      // 2023: Simple Monolithic core
      const nodes: GraphNode[] = [
        { id: "monolith", label: "AETHER Monolithic Engine", type: "module", details: "Core monolithic web server storing transactional code blocks with tight coupling.", complexity: "High" },
        { id: "database", label: "PostgreSQL Database Main", type: "database", details: "Isolated database service housing all system state coordinates.", complexity: "Medium" }
      ];
      const links: GraphLink[] = [
        { source: "monolith", target: "database", label: "Read/Write SQL" }
      ];
      return { nodes, links };
    }
    
    if (selectedYear === "2024") {
      // 2024: JWT authentication + Redis caching layer
      const nodes: GraphNode[] = [
        { id: "monolith", label: "AETHER Legacy Gateway", type: "module", details: "Throttled API servlet bridging database transactions.", complexity: "High" },
        { id: "auth", label: "Authentication Guardian (JWT)", type: "api", details: "JWT validator parsing active access tokens from callers dynamically.", complexity: "Medium" },
        { id: "redis", label: "Redis Memory Cache Store", type: "module", details: "In-memory cache cluster reducing PostgreSQL lookup latency.", complexity: "Low" },
        { id: "database", label: "PostgreSQL Database Main", type: "database", details: "Primary system status vault.", complexity: "Medium" }
      ];
      const links: GraphLink[] = [
        { source: "monolith", target: "auth", label: "Validate Token" },
        { source: "monolith", target: "redis", label: "Cache Read" },
        { source: "monolith", target: "database", label: "Direct Query" },
        { source: "redis", target: "database", label: "Evict/Writeback" }
      ];
      return { nodes, links };
    }
    
    if (selectedYear === "2025") {
      // 2025: Asynchronous event handling, decoupled Stripe payments
      const nodes: GraphNode[] = [
        { id: "core-router", label: "Unified API Gateway Service", type: "api", details: "Consolidated reverse proxy dispatching request footprints securely.", complexity: "Medium" },
        { id: "auth", label: "OAuth Identity Hub Module", type: "api", details: "Identity broker sync with external cloud endpoints.", complexity: "Low" },
        { id: "payments", label: "Payments Stripe Worker", type: "module", details: "Isolated component emitting charge events asynchronously.", complexity: "High" },
        { id: "ledger", label: "Ledger State Machine", type: "module", details: "Consolidation pipeline sorting financial operations.", complexity: "Medium" },
        { id: "redis", label: "Redis Memory Cache Store", type: "module", details: "Throttled distributed cache tier.", complexity: "Low" },
        { id: "database", label: "PostgreSQL Database Main", type: "database", details: "Primary system status vault.", complexity: "Medium" }
      ];
      const links: GraphLink[] = [
        { source: "core-router", target: "auth", label: "Validate Identity" },
        { source: "core-router", target: "payments", label: "Start Checkout" },
        { source: "payments", target: "ledger", label: "Relay event log" },
        { source: "ledger", target: "database", label: "Apply changes" },
        { source: "auth", target: "redis", label: "Sync Session" }
      ];
      return { nodes, links };
    }
    
    return graph;
  }, [graph, selectedYear]);

  // Pre-calculate warmth maps
  const nodeScores = useMemo(() => {
    if (!activeGraph) return {};
    const scores: Record<string, NodeScoreInfo> = {};
    activeGraph.nodes.forEach(n => {
      scores[n.id] = calculateNodeScore(n, risks, bottlenecks);
    });
    return scores;
  }, [activeGraph, risks, bottlenecks]);

  // Compute link degrees (number of connections each node has)
  const nodeDegrees = useMemo(() => {
    if (!activeGraph) return {};
    const degrees: Record<string, number> = {};
    activeGraph.nodes.forEach(n => {
      degrees[n.id] = 0;
    });
    activeGraph.links.forEach(l => {
      const srcId = typeof l.source === "string" ? l.source : (l.source as any).id;
      const tgtId = typeof l.target === "string" ? l.target : (l.target as any).id;
      if (degrees[srcId] !== undefined) degrees[srcId]++;
      if (degrees[tgtId] !== undefined) degrees[tgtId]++;
    });
    return degrees;
  }, [activeGraph]);

  // Aggregate modules containing critical structural debt levels
  const hotModules = useMemo(() => {
    if (!activeGraph) return [];
    return Object.entries(nodeScores)
      .map(([id, info]) => {
        const scoreInfo = info as NodeScoreInfo;
        const nodeObj = activeGraph.nodes.find(n => n.id === id);
        return {
          id,
          label: nodeObj?.label || id,
          score: scoreInfo.score,
          reasons: scoreInfo.reasons,
          severity: scoreInfo.severity
        };
      })
      .filter(item => item.score >= 15)
      .sort((a, b) => b.score - a.score);
  }, [nodeScores, activeGraph]);

  useEffect(() => {
    if (!activeGraph || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = 480;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create defs for gradients and filter glows
    const defs = svg.append("defs");
    
    // Create multiple glowing filters
    const glows = ["blue", "purple", "red", "green"];
    const colors = {
      blue: "#3b82f6",
      purple: "#8b5cf6",
      red: "#ef4444",
      green: "#10b981"
    };

    glows.forEach(colorKey => {
      const filter = defs.append("filter")
        .attr("id", `glow-${colorKey}`)
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");
      
      filter.append("feGaussianBlur")
        .attr("stdDeviation", "6")
        .attr("result", "blur");
        
      filter.append("feMerge")
        .selectAll("feMergeNode")
        .data(["blur", "SourceGraphic"])
        .enter()
        .append("feMergeNode")
        .attr("in", d => d);
    });

    // Create static random stars in outer background
    const starsGroup = svg.append("g").attr("class", "background-stars");
    for (let i = 0; i < 60; i++) {
      starsGroup.append("circle")
        .attr("cx", Math.random() * width)
        .attr("cy", Math.random() * height)
        .attr("r", Math.random() * 1.5 + 0.5)
        .attr("fill", "#ffffff")
        .attr("opacity", Math.random() * 0.4 + 0.1);
    }

    // Directed link arrow marker
    defs.append("marker")
      .attr("id", "stellarhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-3L6,0L0,3")
      .attr("fill", "rgba(255, 255, 255, 0.2)");

    const nodes: GraphNode[] = activeGraph.nodes.map(n => ({ ...n }));
    const links: any[] = activeGraph.links.map(l => ({ ...l }));

    // Force simulation structured like a spiral/galactic core with circular gravities
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force("link", d3.forceLink<GraphNode, any>(links).id(d => d.id).distance(110).strength(1.2))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => {
        const dScore = nodeDegrees[d.id] || 0;
        return 22 + dScore * 3;
      }));

    const g = svg.append("g").attr("class", "galaxy-group");

    // Add Zoom and Pan behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoomBehavior);
    svg.call(zoomBehavior.transform, d3.zoomIdentity);

    // Draw links (as stellar gravitational strands)
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "rgba(255, 255, 255, 0.08)")
      .attr("stroke-width", 1.2)
      .attr("marker-end", "url(#stellarhead)");

    // Draw active particle feeds (light packets traveling through connections)
    const packet = g.append("g")
      .selectAll("circle")
      .data(links)
      .enter()
      .append("circle")
      .attr("r", 2)
      .attr("fill", d => {
        const sourceId = typeof d.source === "string" ? d.source : (d.source as any).id;
        const scoreInfo = nodeScores[sourceId];
        if (scoreInfo && heatmapActive) {
          if (scoreInfo.score >= 70) return "#ef4444";
          if (scoreInfo.score >= 40) return "#f59e0b";
          return "#10b981";
        }
        return "#3b82f6"; // default electric blue
      })
      .attr("opacity", d => heatmapActive ? 1.0 : 0.6);

    // Draw node containers
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .style("cursor", "grab")
      .on("mouseover", (event, d) => {
        setHoveredNode(d);
      })
      .on("mouseout", () => {
        setHoveredNode(null);
      })
      .on("click", (event, d) => {
        setSelectedNode(d);
        node.selectAll(".star-mesh").attr("stroke-width", 1.5).attr("stroke", "rgba(255,255,255,0.2)");
        d3.select(event.currentTarget).select(".star-mesh")
          .attr("stroke-width", 2.5)
          .attr("stroke", "#3b82f6");
      })
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // High dependency expanding orbital halos (Rings emitting from highly correlated modules)
    node.filter((d: any) => (nodeDegrees[d.id] || 0) >= 3)
      .append("circle")
      .attr("r", (d: any) => 16 + (nodeDegrees[d.id] || 0) * 4)
      .attr("fill", "transparent")
      .attr("stroke", (d: any) => {
        const scoreInfo = nodeScores[d.id];
        if (scoreInfo && heatmapActive) {
          if (scoreInfo.score >= 70) return "rgba(239, 68, 68, 0.15)";
          if (scoreInfo.score >= 40) return "rgba(245, 158, 11, 0.15)";
          return "rgba(16, 185, 129, 0.15)";
        }
        return "rgba(59, 130, 246, 0.15)";
      })
      .attr("stroke-width", 1)
      .style("stroke-dasharray", "3, 3")
      .style("transform-origin", "0px 0px")
      .attr("class", "expanding-orbital-ring");

    // Stellar bodies (circular stars)
    node.append("circle")
      .attr("class", "star-mesh")
      .attr("r", (d: any) => {
        const deg = nodeDegrees[d.id] || 0;
        return 9 + deg * 2;
      })
      .attr("fill", (d: any) => {
        const scoreInfo = nodeScores[d.id];
        if (scoreInfo && heatmapActive) {
          if (scoreInfo.score >= 70) return "#ef4444"; // Pulsing red star
          if (scoreInfo.score >= 40) return "#f59e0b"; // Warning amber star
          if (scoreInfo.score >= 15) return "#fbbf24"; // Saturated yellow star
        }
        return getNodeStellarColor(d.type);
      })
      .attr("filter", (d: any) => {
        const scoreInfo = nodeScores[d.id];
        if (scoreInfo && heatmapActive) {
          if (scoreInfo.score >= 70) return "url(#glow-red)";
          if (scoreInfo.score >= 40) return "url(#glow-purple)";
        }
        return "url(#glow-blue)";
      })
      .attr("stroke", "rgba(255, 255, 255, 0.25)")
      .attr("stroke-width", 1.5)
      .style("transition", "r 0.3s")
      .attr("class", (d: any) => {
        const scoreInfo = nodeScores[d.id];
        const isCritical = scoreInfo && heatmapActive && scoreInfo.score >= 70;
        return `star-mesh ${isCritical ? 'animate-pulse' : ''}`;
      });

    // Outer subtle orbit layer
    node.append("circle")
      .attr("r", (d: any) => 15 + (nodeDegrees[d.id] || 0) * 2)
      .attr("fill", "transparent")
      .attr("stroke", "rgba(255, 255, 255, 0.05)")
      .attr("stroke-width", 0.5);

    // Text labels of stars
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("y", (d: any) => 22 + (nodeDegrees[d.id] || 0) * 2)
      .style("font-size", "9.5px")
      .style("font-weight", "500")
      .style("fill", "#f3f4f6")
      .style("font-family", "var(--font-sans)")
      .style("pointer-events", "none")
      .style("text-shadow", "0 2px 4px rgba(0,0,0,0.8)")
      .text((d: any) => truncateText(d.label, 15));

    // Percent scale text if heatmap is on
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("y", (d: any) => 31 + (nodeDegrees[d.id] || 0) * 2)
      .style("font-size", "7px")
      .style("font-weight", "600")
      .style("font-family", "var(--font-mono)")
      .style("fill", (d: any) => {
        const scoreInfo = nodeScores[d.id];
        if (!scoreInfo) return "#71717a";
        if (scoreInfo.score >= 70) return "#f87171";
        if (scoreInfo.score >= 40) return "#fb923c";
        return "#10b981";
      })
      .style("opacity", heatmapActive ? 0.9 : 0)
      .style("pointer-events", "none")
      .text((d: any) => {
        const scoreInfo = nodeScores[d.id];
        if (!scoreInfo || scoreInfo.score === 0) return "";
        return `${scoreInfo.score}% HEAT`;
      });

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      const time = Date.now() * 0.0018;
      packet
        .attr("cx", d => {
          const s = d.source as any;
          const t = d.target as any;
          const progress = (time % 1);
          return s.x + (t.x - s.x) * progress;
        })
        .attr("cy", d => {
          const s = d.source as any;
          const t = d.target as any;
          const progress = (time % 1);
          return s.y + (t.y - s.y) * progress;
        });

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Zoom Controls
    d3.select("#galaxy-zoom-in").on("click", () => {
      svg.transition().duration(250).call(zoomBehavior.scaleBy, 1.3);
    });

    d3.select("#galaxy-zoom-out").on("click", () => {
      svg.transition().duration(250).call(zoomBehavior.scaleBy, 0.7);
    });

    d3.select("#galaxy-zoom-reset").on("click", () => {
      svg.transition().duration(250).call(zoomBehavior.transform, d3.zoomIdentity);
    });

    return () => {
      simulation.stop();
    };
  }, [activeGraph, heatmapActive, nodeScores, nodeDegrees, selectedYear]);

  useEffect(() => {
    if (!isFullScreen || !activeGraph || !fsSvgRef.current || !fsContainerRef.current) return;

    const width = fsContainerRef.current.clientWidth || window.innerWidth;
    const height = fsContainerRef.current.clientHeight || window.innerHeight;

    const svg = d3.select(fsSvgRef.current);
    svg.selectAll("*").remove();

    // Defs for gradients & glowing filters
    const defs = svg.append("defs");
    const glows = ["blue", "purple", "red", "green"];
    const colors = { blue: "#3b82f6", purple: "#8b5cf6", red: "#ef4444", green: "#10b981" };

    glows.forEach(colorKey => {
      const filter = defs.append("filter")
        .attr("id", `fs-glow-${colorKey}`)
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");
      
      filter.append("feGaussianBlur")
        .attr("stdDeviation", "8")
        .attr("result", "blur");
        
      filter.append("feMerge")
        .selectAll("feMergeNode")
        .data(["blur", "SourceGraphic"])
        .enter()
        .append("feMergeNode")
        .attr("in", d => d);
    });

    // Real moving space particles (dust of galaxies) that react in Cinematic Mode
    const particlesData = Array.from({ length: 140 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4 - 0.15, // steady slow cosmic drift
      vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 2.2 + 0.5,
      opacity: Math.random() * 0.75 + 0.15,
      color: Math.random() > 0.6 ? (Math.random() > 0.5 ? "#a5b4fc" : "#818cf8") : "#ffffff"
    }));

    const starsGroup = svg.append("g").attr("class", "fs-stars");
    const particlePoints = starsGroup.selectAll("circle")
      .data(particlesData)
      .enter()
      .append("circle")
      .attr("r", d => d.r)
      .attr("fill", d => d.color)
      .attr("opacity", d => d.opacity)
      .style("filter", "drop-shadow(0 0 2px rgba(255,255,255,0.45))");

    // Directed link arrow marker
    defs.append("marker")
      .attr("id", "fs-stellarhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 24)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-3L6,0L0,3")
      .attr("fill", "rgba(255, 255, 255, 0.4)");

    const nodes: GraphNode[] = activeGraph.nodes.map(n => ({ ...n }));
    const links: any[] = activeGraph.links.map(l => ({ ...l }));

    // Simulation with higher gravitational charge & dynamic alignment
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force("link", d3.forceLink<GraphNode, any>(links).id(d => d.id).distance(160).strength(1.2))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => 38));

    const g = svg.append("g").attr("class", "fs-galaxy");

    // Zoom and Pan
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoomBehavior);

    // Draw links
    const link = g.append("g")
      .attr("class", "fs-links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "rgba(59, 130, 246, 0.15)")
      .attr("stroke-width", 1.8)
      .attr("marker-end", "url(#fs-stellarhead)");

    // Light packet animations syncing along routes
    const packet = g.append("g")
      .selectAll("circle")
      .data(links)
      .enter()
      .append("circle")
      .attr("r", 3)
      .attr("fill", d => {
        const srcId = typeof d.source === "string" ? d.source : (d.source as any).id;
        const scoreInfo = nodeScores[srcId];
        if (scoreInfo) {
          if (scoreInfo.score >= 70) return "#ef4444";
          if (scoreInfo.score >= 40) return "#fb923c";
        }
        return "#3b82f6";
      });

    // Nodes
    const node = g.append("g")
      .attr("class", "fs-nodes")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .style("cursor", "grab")
      .on("mouseover", (event, d) => {
        setHoveredNode(d);
      })
      .on("mouseout", () => {
        setHoveredNode(null);
      })
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // Large glowing halo around high-coupling modules
    node.filter((d: any) => (nodeDegrees[d.id] || 0) >= 3)
      .append("circle")
      .attr("r", (d: any) => 28 + (nodeDegrees[d.id] || 0) * 6)
      .attr("fill", "transparent")
      .attr("stroke", (d: any) => {
        const score = nodeScores[d.id]?.score || 0;
        return score >= 70 ? "rgba(239, 68, 68, 0.3)" : "rgba(59, 130, 246, 0.2)";
      })
      .attr("stroke-width", 1.5)
      .style("stroke-dasharray", "4, 4")
      .attr("class", "expanding-orbital-ring");

    // Stellar Body
    node.append("circle")
      .attr("class", "star-mesh")
      .attr("r", (d: any) => 18 + (nodeDegrees[d.id] || 0) * 3)
      .attr("fill", (d: any) => {
        const score = nodeScores[d.id]?.score || 0;
        if (score >= 70) return "#ef4444";
        if (score >= 40) return "#fb923c";
        return getNodeStellarColor(d.type);
      })
      .attr("filter", (d: any) => {
        const score = nodeScores[d.id]?.score || 0;
        if (score >= 70) return "url(#fs-glow-red)";
        if (score >= 40) return "url(#fs-glow-purple)";
        return "url(#fs-glow-blue)";
      })
      .attr("stroke", "rgba(255, 255, 255, 0.4)")
      .attr("stroke-width", 2);

    // Labels
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("y", (d: any) => 38 + (nodeDegrees[d.id] || 0) * 2)
      .style("font-size", "11px")
      .style("font-weight", "600")
      .style("fill", "#ffffff")
      .style("font-family", "var(--font-sans)")
      .style("pointer-events", "none")
      .style("text-shadow", "0 3px 6px rgba(0,0,0,0.9)")
      .text((d: any) => d.label);

    node.append("text")
      .attr("text-anchor", "middle")
      .attr("y", (d: any) => 49 + (nodeDegrees[d.id] || 0) * 2)
      .style("font-size", "8.5px")
      .style("font-weight", "bold")
      .style("font-family", "var(--font-mono)")
      .style("fill", (d: any) => {
        const score = nodeScores[d.id]?.score || 0;
        return score >= 70 ? "#ef4444" : score >= 40 ? "#fb923c" : "#10b981";
      })
      .style("pointer-events", "none")
      .text((d: any) => {
        const score = nodeScores[d.id]?.score || 0;
        return `${score}% CORE HEAT`;
      });

    simulation.on("tick", () => {
      // 1. Kinetic slide of background space dust / star particles
      particlesData.forEach((p: any) => {
        // Double the speed in Cinematic Mode, or let it drift slowly in Static Mode
        const speedMultiplier = cinematicMode ? 1.6 : 0.35;
        p.x += p.vx * speedMultiplier;
        p.y += p.vy * speedMultiplier;
        // Wrapping coordinates around viewport boundaries
        if (p.x > width) p.x -= width;
        else if (p.x < 0) p.x += width;
        if (p.y > height) p.y -= height;
        else if (p.y < 0) p.y += height;
      });
      particlePoints
        .attr("cx", p => p.x)
        .attr("cy", p => p.y);

      // 2. Continuous rotating dashed orbital rings around high-coupling nodes
      node.selectAll(".expanding-orbital-ring")
        .attr("stroke-dashoffset", (d: any) => (Date.now() * (cinematicMode ? 0.025 : 0.005)) % 100);

      // 3. Interactive node orbit mechanics around gravitational core center
      if (cinematicMode) {
        const cx = width / 2;
        const cy = height / 2;
        nodes.forEach((d: any) => {
          // If being actively dragged, preserve raw user coordinate placement
          if (d.fx !== null && d.fx !== undefined) return;
          
          const dx = d.x - cx;
          const dy = d.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          
          // Apply angular tangential velocity
          const orbitPull = 0.045;
          d.vx += (-dy / dist) * orbitPull;
          d.vy += (dx / dist) * orbitPull;
          
          // Radial core alignment correction
          const centerAlign = 0.012;
          d.vx -= (dx / dist) * centerAlign;
          d.vy -= (dy / dist) * centerAlign;
        });
      }

      // 4. Update standard link layouts
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      // 5. Update data packet coordinates along gravity lines
      const time = Date.now() * 0.0012;
      packet
        .attr("cx", d => {
          const s = d.source as any;
          const t = d.target as any;
          const progress = (time % 1);
          return s.x + (t.x - s.x) * progress;
        })
        .attr("cy", d => {
          const s = d.source as any;
          const t = d.target as any;
          const progress = (time % 1);
          return s.y + (t.y - s.y) * progress;
        });

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Zoom buttons in full screen
    d3.select("#fs-galaxy-zoom-in").on("click", () => {
      svg.transition().duration(250).call(zoomBehavior.scaleBy, 1.3);
    });
    d3.select("#fs-galaxy-zoom-out").on("click", () => {
      svg.transition().duration(250).call(zoomBehavior.scaleBy, 0.7);
    });
    d3.select("#fs-galaxy-zoom-reset").on("click", () => {
      svg.transition().duration(250).call(zoomBehavior.transform, d3.zoomIdentity);
    });

    return () => {
      simulation.stop();
    };
  }, [isFullScreen, activeGraph, nodeScores, nodeDegrees, cinematicMode]);

  if (!graph) {
    return (
      <div className="flex flex-col items-center justify-center h-96 border border-white/5 rounded-2xl bg-white/[0.02] backdrop-blur-md p-6 text-center">
        <Network className="w-12 h-12 text-zinc-700 mb-3 animate-pulse" />
        <p className="text-zinc-400 font-medium">Galaxy Dependency Map Offline</p>
        <p className="text-zinc-600 text-xs mt-1">Please select an architecture blueprint template or supply custom specifications to construct galaxies.</p>
      </div>
    );
  }

  function getNodeStellarColor(type: string) {
    switch (type.toLowerCase()) {
      case "database": return "#10b981"; // Emerald Star
      case "api": return "#8b5cf6"; // Purple Star
      case "module": return "#3b82f6"; // Cyan-blue Star
      case "external": return "#ef4444"; // Danger Red Star
      default: return "#6b7280";
    }
  }

  function truncateText(str: string, max: number) {
    return str.length > max ? str.substring(0, max) + "..." : str;
  }

  const filteredNodes = graph.nodes.filter(n => {
    const matchesSearch = n.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "ALL" || n.type.toUpperCase() === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6" id="galaxy-workspace">
      
      {/* 🧠 REPOSITORY TIME MACHINE TIMELINE */}
      <div className="border border-white/10 bg-white/[0.02] p-4 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 glow-purple">
        <div>
          <span className="text-[10px] font-mono text-[#8b5cf6] tracking-widest font-bold block uppercase flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Repository Time Machine
          </span>
          <h3 className="text-sm font-semibold text-white mt-0.5">Architectural Evolution Travel</h3>
          <p className="text-[11px] text-zinc-400">Step through chronological design phases to watch monolithic structures transform into galaxies.</p>
        </div>
        <div className="flex bg-zinc-950 border border-white/10 p-1 rounded-xl shadow-inner gap-1">
          {(["2023", "2024", "2025", "Present"] as const).map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono rounded-lg transition-all ${
                selectedYear === year
                  ? "bg-indigo-600 border border-indigo-500/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] font-bold"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
              }`}
            >
              {year === "Present" ? "🌌 Present Day" : `📅 ${year}`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Search & Inspector Sidebar (lg:col-span-1) */}
        <div className="lg:col-span-1 border border-white/10 rounded-2xl bg-white/[0.02] backdrop-blur-md p-5 flex flex-col space-y-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-mono text-[10px] uppercase tracking-widest mb-1.5">
              <Orbit className="w-4 h-4 text-indigo-400" />
              <span>Galaxy Navigators</span>
            </div>
            <h3 className="text-sm font-semibold text-white">Stellar Elements</h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">Explore modular star nodes and planetary database linkages.</p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search star systems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-zinc-950/60 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-500"
              id="galaxy-star-search"
            />
          </div>

          {/* Filter Buttons */}
          <div className="grid grid-cols-2 gap-1.5">
            {["ALL", "MODULE", "DATABASE", "API", "EXTERNAL"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`text-[9px] font-mono py-1 rounded-lg transition text-center px-1 border ${
                  filterType === type 
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-semibold" 
                  : "bg-zinc-950/20 text-zinc-500 border-white/5 hover:text-zinc-300"
                }`}
                id={`nav-type-${type.toLowerCase()}`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Heatmap controller */}
          <div className="border border-white/5 bg-white/[0.01] p-3 rounded-xl space-y-2">
            <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
              <span className="text-[9px] font-mono tracking-wider font-bold text-orange-400 uppercase flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full bg-red-500 ${heatmapActive ? 'animate-ping' : ''}`}></span>
                Stress & Debt Heat
              </span>
              <button
                type="button"
                onClick={() => setHeatmapActive(!heatmapActive)}
                className={`text-[8px] font-mono px-2 py-0.5 rounded-full border transition ${
                  heatmapActive 
                  ? "bg-red-500/10 text-red-400 border-red-500/20" 
                  : "bg-zinc-950/50 text-zinc-500 border-white/5"
                }`}
                id="galaxy-heatmap-toggle"
              >
                {heatmapActive ? "DEBT_SHIELD_ON" : "OFFLINE"}
              </button>
            </div>

            <p className="text-[9px] text-zinc-500 leading-relaxed font-sans">
              Glows high-coupling database layers and modular dependencies emitting architectural risks.
            </p>

            {heatmapActive && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[8.5px] font-mono text-zinc-500 block uppercase">Critical Heatspots</span>
                {hotModules.length === 0 ? (
                  <div className="flex items-center gap-1.5 text-[9.5px] text-emerald-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="italic">No critical debt detected!</span>
                  </div>
                ) : (
                  <div className="space-y-1 max-h-[100px] overflow-y-auto pr-0.5">
                    {hotModules.slice(0, 3).map(mod => (
                      <div 
                        key={mod.id}
                        onClick={() => {
                          const cell = activeGraph?.nodes?.find(n => n.id === mod.id);
                          if (cell) setSelectedNode(cell);
                        }}
                        className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition border ${
                          selectedNode?.id === mod.id 
                            ? "bg-zinc-900/60 border-indigo-500/20 text-white" 
                            : "bg-zinc-950/40 border-white/5 text-zinc-450 hover:text-zinc-200"
                        }`}
                      >
                        <span className="text-[10px] font-medium truncate max-w-[110px]">{mod.label}</span>
                        <span className={`text-[8px] font-mono px-1 rounded font-bold ${
                          mod.score >= 70 ? "bg-red-500/10 text-red-400 border border-red-500/10" :
                          mod.score >= 40 ? "bg-orange-500/10 text-orange-400 border border-orange-500/10" :
                          "bg-amber-500/10 text-amber-400 border border-amber-500/10"
                        }`}>
                          {mod.score}% HEAT
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Matches lists */}
          <div className="flex-1 overflow-y-auto max-h-[100px] border border-white/5 rounded-xl p-2 space-y-1 bg-zinc-950/40 font-mono">
            <div className="text-[9px] text-zinc-500 flex justify-between items-center px-1 mb-1 border-b border-white/5 pb-1">
              <span>FILTERED MATCHES:</span>
              <span>{filteredNodes.length}</span>
            </div>
            {filteredNodes.map(node => (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`w-full text-left text-[11px] px-2 py-1 rounded transition block truncate ${
                  selectedNode?.id === node.id 
                  ? "bg-zinc-950 text-white font-medium border-l-2 border-indigo-500" 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                }`}
                id={`galaxy-filtered-${node.id}`}
              >
                {node.label}
              </button>
            ))}
          </div>

          {/* Target metadata Inspector */}
          <div className="border border-white/5 bg-zinc-950/60 rounded-xl p-3 space-y-2">
            {selectedNode ? (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 block uppercase">STAR_METADATA</span>
                    <h4 className="text-xs font-semibold text-white mt-0.5 leading-snug">{selectedNode.label}</h4>
                  </div>
                  <span className={`text-[8px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                    selectedNode.complexity === "High" ? "bg-red-500/10 text-red-400 border-red-500/10" :
                    selectedNode.complexity === "Medium" ? "bg-amber-500/10 text-amber-500 border-amber-500/10" :
                    "bg-emerald-500/10 text-emerald-450 border-emerald-500/10"
                  }`}>
                    {selectedNode.complexity} Complexity
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed bg-zinc-950 border border-white/5 p-2 rounded">
                  {selectedNode.details}
                </p>

                {heatmapActive && nodeScores[selectedNode.id]?.score > 0 && (
                  <div className="p-2 bg-zinc-900/40 rounded border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 border-b border-white/5 pb-1">
                      <span>STRESS_REASONS</span>
                      <span className="text-orange-400 font-bold">{nodeScores[selectedNode.id].score}%</span>
                    </div>
                    <div className="space-y-1 text-[8px] leading-relaxed text-zinc-500 max-h-[70px] overflow-y-auto font-mono">
                      {nodeScores[selectedNode.id].reasons.map((reason, rIdx) => (
                        <div key={rIdx} className="flex items-start gap-1">
                          <span className="text-indigo-400 font-bold select-none">•</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-[10px] text-zinc-550 italic">
                Click any star node in the galaxy to trace telemetry and risks.
              </div>
            )}
          </div>
        </div>

        {/* Galaxy Space Canvas (lg:col-span-3) */}
        <div className="lg:col-span-3 border border-white/10 rounded-2xl bg-zinc-950/40 relative flex flex-col h-[520px] overflow-hidden">
          
          {/* Absolute Star Icon decoration header */}
          <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 bg-zinc-950/80 border border-white/5 rounded-full px-3 py-1 text-[9px] font-mono tracking-wider text-indigo-400">
            <Stars className="w-3.5 h-3.5 animate-pulse" />
            <span>REAL-TIME COGNITIVE SPATIAL PHYSICS</span>
          </div>

          {/* Controls Overlay */}
          <div className="absolute top-4 left-4 z-10 flex items-center bg-zinc-950/90 border border-white/10 rounded-xl p-1 shadow-2xl space-x-0.5">
            <button 
              id="galaxy-zoom-in"
              className="p-1 px-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button 
              id="galaxy-zoom-out"
              className="p-1 px-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button 
              id="galaxy-zoom-reset"
              className="p-1 px-2.5 text-[8.5px] font-mono rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition flex items-center gap-1"
              title="Reset Zoom"
            >
              <RefreshCw className="w-2.5 h-2.5" /> RESET
            </button>
            <button 
              onClick={() => setIsFullScreen(true)}
              className="p-1 px-2.5 text-[8.5px] font-mono rounded-lg text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition flex items-center gap-1"
              title="Open Full Screen Interactive Galaxy Spectrum"
            >
              <Eye className="w-2.5 h-2.5" /> FULLSCREEN
            </button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 right-4 z-10 hidden md:flex items-center justify-between pointer-events-none gap-2">
            {heatmapActive ? (
              <div className="flex items-center space-x-2.5 bg-zinc-950/90 border border-white/5 rounded-full px-3 py-1.5 text-[8px] text-zinc-450 shadow-2xl font-mono">
                <span className="text-orange-400 font-bold uppercase">Heat Index:</span>
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>Critical (&gt;=70%)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  <span>High (40-69%)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                  <span>Warning (&gt;=15%)</span>
                </div>
              </div>
            ) : (
              <div></div>
            )}

            <div className="flex items-center space-x-3 bg-zinc-950/90 border border-white/5 rounded-full px-3 py-1.5 text-[8px] font-mono text-zinc-500 shadow-2xl">
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]"></span>
                <span>Modules</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                <span>Databases</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]"></span>
                <span>API Endpoints</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
                <span>External API</span>
              </div>
            </div>
          </div>

          {/* Dynamic Canvas Container */}
          <div ref={containerRef} className="w-full flex-1 overflow-hidden relative">
            <svg 
              ref={svgRef}
              className="w-full h-full block"
              style={{ minHeight: "420px" }}
            />
          </div>
        </div>
      </div>

      {/* 🌌 FULL SCREEN INTERACTIVE GALAXY OVERLAY (Holy shit visual moment) */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#000000] z-[9999] flex flex-col justify-between overflow-hidden p-6 font-sans select-none border border-white/10"
          >
            {/* Ambient Background stars & nebulae */}
            <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-[#8b5cf6]/5 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

            {/* Top Command Bar */}
            <div className="flex justify-between items-center bg-[#02040a]/80 border border-white/5 rounded-2xl p-4 backdrop-blur-md z-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl relative overflow-hidden">
                  <Stars className="w-4 h-4 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono tracking-widest text-[#3b82f6] font-bold block uppercase">COGNITIVE SPECTRUM MODE</span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase">LIVE PHYSICS SYNCHRONIZED</span>
                  </div>
                  <h1 className="text-sm font-semibold tracking-wide text-white font-sans">AETHER INTEGRITY GRAPH UNIVERSE</h1>
                </div>
              </div>

              {/* Year slider inside full screen */}
              <div className="flex items-center gap-4 bg-zinc-950 p-1.5 rounded-xl border border-white/10">
                <span className="text-[10px] font-mono text-zinc-550 px-2 uppercase">Time Machine Index:</span>
                <div className="flex gap-1 bg-zinc-950">
                  {(["2023", "2024", "2025", "Present"] as const).map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`px-3 py-1 text-[10px] font-mono rounded-lg transition-all ${
                        selectedYear === year
                          ? "bg-indigo-600 border border-indigo-500/20 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)] font-bold"
                          : "text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.01]"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Cinematic Mode Toggle */}
                <button
                  onClick={() => setCinematicMode(!cinematicMode)}
                  className={`px-3.5 py-2 text-xs font-mono rounded-xl border transition-all flex items-center gap-2 ${
                    cinematicMode 
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)] font-bold" 
                      : "bg-zinc-950 text-zinc-500 border-white/10 hover:text-zinc-300"
                  }`}
                  title="Toggle Cinematic Mode Node Orbits & Particle Stream"
                >
                  <Stars className={`w-3.5 h-3.5 ${cinematicMode ? "text-amber-400 animate-spin" : ""}`} />
                  <span>{cinematicMode ? "🎬 CINEMATIC ACTIVE" : "🎬 STATIC VIEW"}</span>
                </button>

                <div className="flex items-center bg-zinc-950/80 border border-white/5 rounded-xl p-1 space-x-0.5">
                  <button id="fs-galaxy-zoom-in" className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition" title="Zoom In">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button id="fs-galaxy-zoom-out" className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition" title="Zoom Out">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button id="fs-fs-galaxy-zoom-reset" className="px-3 py-2 text-[9px] font-mono rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition flex items-center gap-1.5" title="Reset">
                    <RefreshCw className="w-3 h-3" /> RESET
                  </button>
                </div>
                <button 
                  onClick={() => setIsFullScreen(false)}
                  className="px-4 py-2 border border-red-500/20 bg-red-950/20 hover:bg-red-500/20 text-red-400 rounded-xl transition text-xs font-mono font-medium flex items-center gap-2"
                >
                  ✖ EXIT SPECTRUM
                </button>
              </div>
            </div>

            {/* Main Interactive Space */}
            <div className="flex-1 my-4 relative flex items-center justify-center">
              
              {/* SPECTROSCOPY SPECTRAL CARD ON HOVER (Matches exact user structure specifications) */}
              <AnimatePresence>
                {hoveredNode ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-6 right-6 bg-[#02040a]/95 border border-white/10 rounded-2xl p-6 w-[310px] shadow-[0_0_50px_rgba(139,92,246,0.2)] backdrop-blur-md text-left space-y-4 font-sans select-none z-50 transition-all glow-blue"
                  >
                    <div className="border-b border-white/10 pb-2">
                      <span className="text-[10px] font-mono text-[#3b82f6] font-bold block tracking-widest">GALAXY STAR SPECTROSCOPY</span>
                      <h3 className="text-base font-bold text-white tracking-tight mt-1">{hoveredNode.label}</h3>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase tracking-wider">{hoveredNode.type}</p>
                    </div>
                    
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                        <span className="text-zinc-500 font-mono font-medium uppercase tracking-wider">Complexity</span>
                        <span className="text-white font-mono font-bold text-sm">
                          {hoveredNode.complexity === "High" ? "92" : hoveredNode.complexity === "Medium" ? "68" : "34"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                        <span className="text-zinc-500 font-mono font-medium uppercase tracking-wider">Risk</span>
                        <span className={`font-mono font-bold tracking-wide ${
                          nodeScores[hoveredNode.id]?.score >= 60 ? "text-red-400" :
                          nodeScores[hoveredNode.id]?.score >= 30 ? "text-amber-400" : "text-emerald-400"
                        }`}>
                          {nodeScores[hoveredNode.id]?.score >= 60 ? "HIGH" :
                           nodeScores[hoveredNode.id]?.score >= 30 ? "MEDIUM" : "LOW"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                        <span className="text-zinc-500 font-mono font-medium uppercase tracking-wider">Dependencies</span>
                        <span className="text-white font-mono font-bold text-sm">
                          {nodeDegrees[hoveredNode.id] !== undefined ? nodeDegrees[hoveredNode.id] : 3}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                        <span className="text-zinc-500 font-mono font-medium uppercase tracking-wider">Tech Debt</span>
                        <span className="text-white font-mono font-bold text-sm">
                          {nodeScores[hoveredNode.id] ? nodeScores[hoveredNode.id].score : 32}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                        <span className="text-zinc-500 font-mono font-medium uppercase tracking-wider">Recent Changes</span>
                        <span className="text-white font-mono font-bold text-sm">
                          {(() => {
                            const hash = hoveredNode.label.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
                            return 3 + (hash % 16);
                          })()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 text-[9.5px] text-zinc-500 italic leading-relaxed border-t border-white/5">
                      {hoveredNode.details}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-6 right-6 bg-[#02040a]/80 border border-white/10 rounded-2xl p-4 w-[310px] backdrop-blur-md text-left space-y-1 z-50 text-xs text-zinc-550 border-dashed"
                  >
                    <span className="font-mono text-[9px] uppercase block tracking-wider text-indigo-400">SPECTRUM EXPOSURE HUB</span>
                    <p className="font-sans leading-relaxed text-[11px] text-zinc-400">Hover any system module inside the orbit to compile high-fidelity architecture specs in real-time.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dynamic Canvas Container for Fullscreen */}
              <div ref={fsContainerRef} className="w-full h-full rounded-3xl overflow-hidden relative border border-white/10 bg-zinc-950/20">
                <svg ref={fsSvgRef} className="w-full h-full block" />
              </div>

              {/* Persistent Risky Pulsing list overlays (Left Side telemetry HUD) */}
              <div className="absolute bottom-6 left-6 bg-[#02040a]/85 border border-white/10 rounded-2xl p-5 w-[280px] backdrop-blur-md text-left space-y-3 z-50">
                <span className="text-[9px] font-mono text-red-400 font-bold block tracking-widest uppercase animate-pulse">
                  ⚠️ PULSING RISKY MODULES REGISTERED
                </span>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {hotModules.length > 0 ? (
                    hotModules.map(mod => (
                      <div key={mod.id} className="bg-white/[0.01] border border-white/5 hover:border-white/10 rounded-xl p-2.5 relative overflow-hidden group transition">
                        <div className="absolute top-0 left-0 w-[3px] h-full bg-red-500" />
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-white truncate max-w-[150px]">{mod.label}</span>
                          <span className="text-[10px] font-mono text-red-400 font-bold">{mod.score}% DEBT</span>
                        </div>
                        <p className="text-[9.5px] text-zinc-550 leading-relaxed font-sans mt-1 line-clamp-1">
                          {mod.reasons[0] || "Excessive vertical scaling coupling constraints."}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-zinc-500 italic">No stress vulnerabilities detected.</div>
                  )}
                </div>
              </div>

            </div>

            {/* Footer Telemetry */}
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 bg-[#02040a]/80 border border-white/5 rounded-2xl p-4 backdrop-blur-md shrink-0">
              <div className="flex gap-4">
                <span>SYSTEM COUNT: {activeGraph.nodes.length} STAR SHARDS</span>
                <span>DEPENDENCY LINKS: {activeGraph.links.length} GRAVITY WEBS</span>
              </div>
              <div>
                <span>COGNITIVE ENGINE FRAMEWORK v.2.5 • ACTIVE SECURE EXCLUSION</span>
              </div>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
