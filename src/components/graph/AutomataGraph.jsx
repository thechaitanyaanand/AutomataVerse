import { useEffect, useRef, useCallback } from 'react';
import cytoscape from 'cytoscape';

export default function AutomataGraph({
  nodes = [], edges = [], activeStates = new Set(), activeEdge = null,
  onNodeClick, onNodeDoubleClick, className = '', height = '500px',
}) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  const initCy = useCallback(() => {
    if (!containerRef.current) return;
    if (cyRef.current) cyRef.current.destroy();

    const elements = [];
    for (const node of nodes) {
      elements.push({
        data: { id: node.id, label: node.label || node.id, isStart: node.isStart || false, isAccept: node.isAccept || false },
        position: node.position || { x: 200, y: 200 }
      });
    }

    const edgeMap = new Map();
    for (const edge of edges) {
      const key = `${edge.source}->${edge.target}`;
      if (!edgeMap.has(key)) edgeMap.set(key, { ...edge, symbols: [edge.symbol] });
      else edgeMap.get(key).symbols.push(edge.symbol);
    }
    for (const [, edge] of edgeMap) {
      elements.push({ data: { id: edge.id, source: edge.source, target: edge.target, label: edge.symbols.join(', ') } });
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#081410',
            'border-color': '#E8459B',
            'border-width': 2,
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-family': '"DM Sans", sans-serif',
            'font-size': '14px',
            'color': '#F0FFF4',
            'width': 60,
            'height': 60,
            'text-outline-width': 0,
            'overlay-padding': '6px',
          }
        },
        {
          selector: 'node[?isAccept]',
          style: { 'border-width': 5, 'border-color': '#E8459B', 'background-color': '#1a0a14' }
        },
        {
          selector: 'node[?isStart]',
          style: { 'border-color': '#34D399' }
        },
        {
          selector: 'node.active',
          style: {
            'background-color': '#E8459B',
            'border-color': '#F584BF',
            'border-width': 3,
            'color': '#FFFFFF',
            'shadow-blur': 25,
            'shadow-color': '#E8459B',
            'shadow-opacity': 0.6,
          }
        },
        {
          selector: 'node.accepted',
          style: { 'background-color': '#34D399', 'border-color': '#6EE7B7', 'shadow-blur': 25, 'shadow-color': '#34D399', 'shadow-opacity': 0.6 }
        },
        {
          selector: 'node.rejected',
          style: { 'background-color': '#EF4444', 'border-color': '#F87171', 'shadow-blur': 25, 'shadow-color': '#EF4444', 'shadow-opacity': 0.6 }
        },
        {
          selector: 'edge',
          style: {
            'width': 2.5,
            'line-color': '#1A3828',
            'target-arrow-color': '#1A3828',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-family': '"JetBrains Mono", monospace',
            'font-size': '12px',
            'color': '#94B8A0',
            'text-background-opacity': 1,
            'text-background-color': '#040A06',
            'text-background-padding': '4px',
            'text-border-opacity': 0,
            'edge-text-rotation': 'autorotate',
            'arrow-scale': 1.3,
          }
        },
        {
          selector: 'edge[source = target]',
          style: { 'curve-style': 'loop', 'loop-direction': '-45deg', 'loop-sweep': '90deg' }
        },
        {
          selector: 'edge.active',
          style: { 'line-color': '#34D399', 'target-arrow-color': '#34D399', 'width': 3.5, 'z-index': 10 }
        },
      ],
      layout: { name: 'preset' },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      minZoom: 0.3,
      maxZoom: 3,
    });

    if (onNodeClick) cy.on('tap', 'node', (e) => onNodeClick(e.target.id()));
    if (onNodeDoubleClick) cy.on('dbltap', 'node', (e) => onNodeDoubleClick(e.target.id()));
    cy.nodes().grabify();
    cyRef.current = cy;
  }, [nodes, edges, onNodeClick, onNodeDoubleClick]);

  useEffect(() => {
    initCy();
    return () => { if (cyRef.current) cyRef.current.destroy(); };
  }, [initCy]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.nodes().removeClass('active accepted rejected');
    cy.edges().removeClass('active');
    for (const stateId of activeStates) {
      const node = cy.getElementById(stateId);
      if (node.length) node.addClass('active');
    }
    if (activeEdge) {
      const edgeEls = cy.edges().filter(e => e.data('source') === activeEdge.source && e.data('target') === activeEdge.target);
      edgeEls.addClass('active');
    }
  }, [activeStates, activeEdge]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border bg-void/50 ${className}`}>
      <div ref={containerRef} style={{ height, width: '100%' }} />
      {nodes.length > 0 && (
        <div className="absolute top-4 left-4 flex items-center gap-3 text-xs text-text-muted bg-void/70 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-border">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-emerald inline-block" /> Start</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-flora inline-block" /> Accept</span>
        </div>
      )}
    </div>
  );
}
