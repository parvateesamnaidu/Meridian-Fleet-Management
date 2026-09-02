import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { buildGraphForCase } from '../services/graphService';
import { GraphNode } from '../types';
import {
  Network,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Clock,
} from 'lucide-react';

export const ContextGraphExplorer: React.FC = () => {
  const { currentDisruption } = useApp();
  const graphData = useMemo(() => buildGraphForCase(currentDisruption), [currentDisruption]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(graphData.nodes[0] || null);
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredNodes = useMemo(() => {
    if (filterType === 'ALL') return graphData.nodes;
    return graphData.nodes.filter((n) => n.type === filterType);
  }, [graphData, filterType]);

  const getNodeColor = (type: string, status?: string) => {
    if (status === 'CRITICAL_HOLD' || status === 'CRITICAL_ANOMALY') return '#f43f5e';
    if (type === 'Ambiguity' || status === 'IDENTITY_CONFLICT') return '#f59e0b';
    switch (type) {
      case 'Vessel':
        return '#06b6d4';
      case 'Disruption':
        return '#ec4899';
      case 'Voyage':
        return '#8b5cf6';
      case 'Port':
        return '#3b82f6';
      case 'Observation':
        return '#10b981';
      case 'Constraint':
        return '#eab308';
      case 'Policy':
        return '#14b8a6';
      default:
        return '#94a3b8';
    }
  };

  // Layout coordinates for clean circular & hierarchical display
  const positionedNodes = useMemo(() => {
    const total = filteredNodes.length;
    const centerX = 380;
    const centerY = 240;
    const radius = 170;

    return filteredNodes.map((n, i) => {
      // Pin Vessel and Disruption near center
      if (n.type === 'Vessel') return { ...n, x: centerX - 40, y: centerY };
      if (n.type === 'Disruption') return { ...n, x: centerX + 40, y: centerY };

      const angle = (i / total) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { ...n, x, y };
    });
  }, [filteredNodes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-sm font-bold font-mono text-slate-900 flex items-center gap-2 uppercase tracking-wide">
            <Network className="h-4 w-4 text-blue-600" />
            Context Property Graph Explorer: {currentDisruption.case_id}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Directed property graph slice assembling all connected entities, multi-source observations, and active policy constraints.
          </p>
        </div>

        {/* Node Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 font-medium">Filter:</span>
          <select
            id="graph-node-filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-1.5 text-slate-800 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Nodes ({graphData.nodes.length})</option>
            <option value="Vessel">Vessel</option>
            <option value="Disruption">Disruption</option>
            <option value="Observation">Observations</option>
            <option value="Constraint">Constraints</option>
            <option value="Ambiguity">Ambiguities / Conflicts</option>
            <option value="Policy">Policy</option>
          </select>
        </div>
      </div>

      {/* Main Canvas & Inspector View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SVG Graph Canvas */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden h-[480px] shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] opacity-15" />

          {/* SVG Canvas */}
          <svg className="w-full h-full relative z-10 select-none">
            {/* Edges */}
            {graphData.edges.map((edge, idx) => {
              const srcNode = positionedNodes.find((n) => n.id === edge.source);
              const tgtNode = positionedNodes.find((n) => n.id === edge.target);
              if (!srcNode || !tgtNode) return null;

              const isConflictEdge = edge.relationship.includes('CONFLICT') || edge.relationship.includes('HOLD');

              return (
                <g key={idx}>
                  <line
                    x1={srcNode.x}
                    y1={srcNode.y}
                    x2={tgtNode.x}
                    y2={tgtNode.y}
                    stroke={isConflictEdge ? '#f43f5e' : '#475569'}
                    strokeWidth={isConflictEdge ? 2 : 1.5}
                    strokeDasharray={edge.temporal ? '4 3' : undefined}
                  />
                  {/* Midpoint Label */}
                  <text
                    x={(srcNode.x! + tgtNode.x!) / 2}
                    y={(srcNode.y! + tgtNode.y!) / 2 - 4}
                    fill={isConflictEdge ? '#fda4af' : '#94a3b8'}
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {edge.relationship}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {positionedNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const color = getNodeColor(node.type, node.status);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  <circle
                    r={isSelected ? 20 : 16}
                    fill="#0f172a"
                    stroke={color}
                    strokeWidth={isSelected ? 3 : 1.5}
                    className="transition-all duration-200"
                  />
                  <circle r={6} fill={color} />
                  <text
                    y={26}
                    fill={isSelected ? '#f8fafc' : '#cbd5e1'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {node.label.length > 22 ? `${node.label.slice(0, 20)}…` : node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-400 bg-slate-900/90 px-2.5 py-1 rounded border border-slate-700">
            {positionedNodes.length} Nodes • {graphData.edges.length} Directed Relationships
          </div>
        </div>

        {/* Node Property Inspector */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between h-[480px] overflow-y-auto shadow-xs">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-blue-700 font-bold uppercase">{selectedNode.type} Node</span>
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded border font-semibold"
                    style={{
                      borderColor: getNodeColor(selectedNode.type, selectedNode.status),
                      color: getNodeColor(selectedNode.type, selectedNode.status),
                      backgroundColor: `${getNodeColor(selectedNode.type, selectedNode.status)}15`,
                    }}
                  >
                    {selectedNode.status || 'NORMAL'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 font-mono mt-1">{selectedNode.label}</h3>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5">ID: {selectedNode.id}</div>
              </div>

              {/* Properties Matrix */}
              <div>
                <span className="text-[11px] font-mono text-slate-700 font-bold block mb-2 uppercase">Property Dictionary:</span>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs font-mono">
                  {Object.entries(selectedNode.properties || {}).map(([k, v]) => (
                    <div key={k} className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-200/50 pb-1">
                      <span className="text-slate-500 font-medium">{k}:</span>
                      <span className="text-slate-900 font-semibold break-all">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected Relationships */}
              <div>
                <span className="text-[11px] font-mono text-slate-700 font-bold block mb-2 uppercase">Adjacent Edges:</span>
                <div className="space-y-1.5 text-xs font-mono">
                  {graphData.edges
                    .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                    .map((edge, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                        <span className="text-blue-600 font-bold">{edge.relationship}</span>: {edge.source} → {edge.target}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
              Click any node to inspect properties and provenance.
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500 flex justify-between">
            <span>Graph Version: 2.0 (Live)</span>
            <span className="text-emerald-700 font-bold">Strict Append-Only</span>
          </div>
        </div>
      </div>
    </div>
  );
};
