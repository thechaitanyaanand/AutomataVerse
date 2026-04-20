import { useEffect, useRef, useCallback } from 'react';
import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';

cytoscape.use(edgehandles);

export default function AutomataGraph({
  nodes = [], edges = [], activeStates = new Set(), activeEdge = null,
  onNodeClick, onNodeDoubleClick, onBackgroundDoubleClick, onConnectEdge, onEdgeClick,
  className = '', height = '500px',
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

    // Group parallel edges to show combined labels
    const edgeMap = new Map();
    for (const edge of edges) {
      const key = `${edge.source}->${edge.target}`;
      if (!edgeMap.has(key)) edgeMap.set(key, { ...edge, symbols: [edge.symbol], ids: [edge.id] });
      else {
        edgeMap.get(key).symbols.push(edge.symbol);
        edgeMap.get(key).ids.push(edge.id);
      }
    }
    for (const [, edge] of edgeMap) {
      const allEmpty = edge.symbols.every(s => s === '_' || s === '');
      const label = allEmpty ? '?' : edge.symbols.join(', ');
      elements.push({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label,
          edgeIds: edge.ids,
          isEmpty: allEmpty,
        }
      });
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
          selector: 'edge[?isEmpty]',
          style: {
            'line-color': '#E8459B44',
            'target-arrow-color': '#E8459B44',
            'line-style': 'dashed',
            'color': '#E8459BAA',
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
        {
          selector: 'edge:hover',
          style: {
            'line-color': '#E8459B',
            'target-arrow-color': '#E8459B',
            'width': 3.5,
          }
        },
        // Edgehandles styles
        {
          selector: '.eh-handle',
          style: {
            'display': 'none', // Hide the handle, we use right-click drag now
            'opacity': 0,
            'width': 0,
            'height': 0
          }
        },
        {
          selector: '.eh-source',
          style: { 'border-width': 4, 'border-color': '#E8459B' }
        },
        {
          selector: '.eh-target',
          style: { 'border-width': 4, 'border-color': '#34D399' }
        },
        {
          selector: '.eh-preview, .eh-ghost-edge',
          style: {
            'background-color': '#E8459B',
            'line-color': '#E8459B',
            'target-arrow-color': '#E8459B',
            'source-arrow-color': '#E8459B'
          }
        },
        {
          selector: '.eh-ghost-edge.eh-preview-active',
          style: { 'opacity': 0 }
        }
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

    if (onEdgeClick) {
      cy.on('tap', 'edge', (e) => {
        const edgeEl = e.target;
        const edgeIds = edgeEl.data('edgeIds') || [edgeEl.id()];
        const source = edgeEl.data('source');
        const target = edgeEl.data('target');
        const currentLabel = edgeEl.data('label');
        onEdgeClick({ edgeIds, source, target, currentLabel });
      });
    }

    if (onBackgroundDoubleClick) {
      cy.on('dbltap', (e) => {
        if (e.target === cy) onBackgroundDoubleClick(e.position);
      });
    }

    if (onConnectEdge) {
      const eh = cy.edgehandles({ 
        snap: true, 
        hoverDelay: 50, 
        handleNodes: 'node',
        noEdgeEventsInDraw: true,
        disableBrowserContextMenu: true // Prevent right-click menu during connection
      });

      // Ctrl+Right-Click → instant self-loop; plain Right-Click drag → connect
      cy.on('cxttapstart', 'node', (e) => {
        if (e.originalEvent?.ctrlKey || e.originalEvent?.metaKey) {
          // Self-loop: immediately connect node to itself
          onConnectEdge(e.target.id(), e.target.id());
        } else {
          eh.start(e.target);
        }
      });

      cy.on('ehcomplete', (event, sourceNode, targetNode, addedEles) => {
        addedEles.remove();
        onConnectEdge(sourceNode.id(), targetNode.id());
      });
    }

    cy.nodes().grabify();
    cyRef.current = cy;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

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

  const isInteractive = !!(onBackgroundDoubleClick || onConnectEdge);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border bg-void/50 ${className}`}>
      <div ref={containerRef} style={{ height, width: '100%' }} />
      {nodes.length > 0 && (
        <div className="absolute top-4 left-4 flex items-center gap-3 text-xs text-text-muted bg-void/70 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-border">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-emerald inline-block" /> Start</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-flora inline-block" /> Accept</span>
        </div>
      )}
      {isInteractive && (
        <div className="absolute bottom-3 right-3 text-[10px] text-text-muted/50 bg-void/60 backdrop-blur-sm px-2 py-1 rounded-lg border border-border/30 pointer-events-none">
          Double-click → add state &nbsp;·&nbsp; Right-drag → connect &nbsp;·&nbsp; Ctrl+Right-click → self loop &nbsp;·&nbsp; Click edge → edit
        </div>
      )}
    </div>
  );
}
