"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useStore } from "@/lib/store/context";
import type { LaunchRequirement, Product } from "@/lib/models/types";
import { STANDARD_DELIVERABLES } from "@/lib/models/types";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Handle,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Package,
  Megaphone,
  HandshakeIcon,
  Rocket,
  HeadphonesIcon,
  Link2,
  Shield,
  Zap,
  Filter,
  Maximize2,
  Layers,
} from "lucide-react";

const PILLARS = [
  { id: "product", label: "Product", prefix: "Product", icon: Package, color: "#8b5cf6", bgClass: "bg-purple-50", borderClass: "border-purple-200", textClass: "text-purple-700", accentClass: "bg-purple-500" },
  { id: "marketing", label: "Marketing", prefix: "Marketing", icon: Megaphone, color: "#3b82f6", bgClass: "bg-blue-50", borderClass: "border-blue-200", textClass: "text-blue-700", accentClass: "bg-blue-500" },
  { id: "sales", label: "Sales", prefix: "Sales", icon: HandshakeIcon, color: "#22c55e", bgClass: "bg-green-50", borderClass: "border-green-200", textClass: "text-green-700", accentClass: "bg-green-500" },
  { id: "delivery", label: "Delivery", prefix: "Delivery", icon: Rocket, color: "#f97316", bgClass: "bg-orange-50", borderClass: "border-orange-200", textClass: "text-orange-700", accentClass: "bg-orange-500" },
  { id: "support", label: "Support & Ops", prefix: "Support and Ops", icon: HeadphonesIcon, color: "#64748b", bgClass: "bg-slate-50", borderClass: "border-slate-200", textClass: "text-slate-700", accentClass: "bg-slate-500" },
];

function getPillar(deliverable: string) {
  if (deliverable.startsWith("Product") || deliverable === "Product Descriptions" || deliverable === "Product Pricing" || deliverable === "Product/Beta/MVP/GA") return PILLARS[0];
  if (deliverable.startsWith("Marketing")) return PILLARS[1];
  if (deliverable.startsWith("Sales")) return PILLARS[2];
  if (deliverable.startsWith("Delivery")) return PILLARS[3];
  if (deliverable.startsWith("Support")) return PILLARS[4];
  return PILLARS[0];
}

function friendlyName(deliverable: string): string {
  if (deliverable === "Product Descriptions") return "Descriptions";
  if (deliverable === "Product Pricing") return "Pricing";
  if (deliverable === "Product/Beta/MVP/GA") return "Beta / MVP / GA";
  return deliverable
    .replace(/^Product\s*[-–—]?\s*/, "")
    .replace(/^Marketing\s*[-–—]\s*/, "")
    .replace(/^Sales\s*[-–—]\s*/, "")
    .replace(/^Delivery\s*[-–—]\s*/, "")
    .replace(/^Support and Ops\s*[-–—]\s*/, "")
    .replace(/^Product\//, "");
}

interface ActivityNodeData {
  label: string;
  deliverable: string;
  pillarColor: string;
  pillarLabel: string;
  pillarIcon: React.ComponentType<{ className?: string }>;
  isComplete: boolean;
  isBlocker: boolean;
  isBlocked: boolean;
  owner: string;
  timeline: string;
  productName: string;
  [key: string]: unknown;
}

interface ProductHeaderNodeData {
  label: string;
  productName: string;
  ga: string;
  completePct: number;
  totalActivities: number;
  doneActivities: number;
  blockerCount: number;
  chainCount: number;
  [key: string]: unknown;
}

function ActivityNode({ data }: NodeProps<Node<ActivityNodeData>>) {
  const PillarIcon = data.pillarIcon;
  return (
    <div
      className={`rounded-lg border-2 shadow-md px-3 py-2 min-w-[180px] max-w-[220px] transition-all ${
        data.isBlocked
          ? "border-red-400 bg-red-50"
          : data.isBlocker
            ? "border-amber-400 bg-amber-50"
            : data.isComplete
              ? "border-green-400 bg-green-50"
              : "border-gray-300 bg-white"
      }`}
    >
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-gray-400 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-gray-400 !border-2 !border-white" />
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: data.pillarColor }}
        >
          <PillarIcon className="w-3 h-3 text-white" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: data.pillarColor }}>
          {data.pillarLabel}
        </span>
        <div className="ml-auto">
          {data.isComplete ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : data.isBlocker ? (
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          ) : data.isBlocked ? (
            <Shield className="w-4 h-4 text-red-400" />
          ) : (
            <Circle className="w-4 h-4 text-gray-300" />
          )}
        </div>
      </div>
      <div className="text-sm font-semibold text-gray-800 leading-tight mb-1">{data.label}</div>
      <div className="flex items-center gap-2 text-[10px] text-gray-500">
        {data.owner && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ backgroundColor: data.pillarColor + "20", color: data.pillarColor }}>
            {data.owner}
          </span>
        )}
        {data.timeline && <span>{data.timeline}</span>}
      </div>
      {data.isBlocked && (
        <div className="mt-1 text-[9px] font-bold text-red-600 uppercase tracking-wide">Blocked</div>
      )}
      {data.isBlocker && !data.isBlocked && (
        <div className="mt-1 text-[9px] font-bold text-amber-600 uppercase tracking-wide">Blocker</div>
      )}
    </div>
  );
}

function ProductHeaderNode({ data }: NodeProps<Node<ProductHeaderNodeData>>) {
  return (
    <div className="rounded-xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-lg px-5 py-3 min-w-[260px]">
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white" />
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white" />
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-500 text-white flex items-center justify-center shadow-md">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-gray-800 text-base">{data.productName}</div>
          <div className="text-xs text-gray-500">GA: {data.ga || "TBD"}</div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          {data.doneActivities}/{data.totalActivities}
        </span>
        <span className="flex items-center gap-1">
          <Link2 className="w-3.5 h-3.5 text-blue-500" />
          {data.chainCount} deps
        </span>
        {data.blockerCount > 0 && (
          <span className="flex items-center gap-1 text-amber-600 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            {data.blockerCount}
          </span>
        )}
      </div>
      <div className="mt-1.5 w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            data.completePct === 100 ? "bg-green-500" : data.completePct > 50 ? "bg-blue-500" : "bg-amber-500"
          }`}
          style={{ width: `${data.completePct}%` }}
        />
      </div>
    </div>
  );
}

const nodeTypes = {
  activityNode: ActivityNode,
  productHeader: ProductHeaderNode,
};

type ViewMode = "all" | "single";

export default function DependencyMapPage() {
  const { state, isLoaded } = useStore();
  const [filterMode, setFilterMode] = useState<"all" | "blockers" | "incomplete">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const getReqs = useCallback(
    (productId: string): LaunchRequirement[] => {
      if (state.launchRequirements[productId]) {
        return state.launchRequirements[productId];
      }
      return STANDARD_DELIVERABLES.map((d) => ({
        deliverable: d,
        owner: "",
        criticalPath: "",
        timeline: "",
        content: "",
        dependency: "",
        complete: false,
      }));
    },
    [state.launchRequirements],
  );

  const productData = useMemo(() => {
    return state.products.map((product) => {
      const reqs = getReqs(product.id);
      const isComplete = (r: LaunchRequirement) => !!r.complete;
      const chains = reqs
        .filter((r) => r.dependency)
        .map((r) => {
          const dep = reqs.find((d) => d.deliverable === r.dependency);
          const depDone = dep ? isComplete(dep) : true;
          return {
            deliverable: r.deliverable,
            dependsOn: r.dependency,
            isComplete: isComplete(r),
            depIsComplete: depDone,
            isBlocked: !depDone,
          };
        });
      const blockerDeliverables = new Set(
        reqs
          .filter((r) => reqs.some((other) => other.dependency === r.deliverable) && !isComplete(r))
          .map((r) => r.deliverable),
      );
      const blockers = reqs.filter((r) => blockerDeliverables.has(r.deliverable));
      const total = reqs.length;
      const done = reqs.filter(isComplete).length;
      const completePct = total > 0 ? Math.round((done / total) * 100) : 0;
      return { product, reqs, chains, blockers, blockerCount: blockers.length, completePct, done, total };
    });
  }, [state.products, getReqs]);

  const filteredProducts = useMemo(() => {
    let data = productData;
    if (viewMode === "single" && selectedProduct) {
      data = data.filter((d) => d.product.id === selectedProduct);
    }
    if (filterMode === "blockers") return data.filter((d) => d.blockerCount > 0);
    if (filterMode === "incomplete") return data.filter((d) => d.completePct < 100);
    return data;
  }, [productData, filterMode, viewMode, selectedProduct]);

  useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    if (viewMode === "single" && filteredProducts.length === 1) {
      const data = filteredProducts[0];
      const { product, reqs, chains, blockers } = data;
      const blockerSet = new Set(blockers.map((b) => b.deliverable));
      const blockedSet = new Set(chains.filter((c) => c.isBlocked).map((c) => c.deliverable));
      const involvedDeliverables = new Set<string>();
      chains.forEach((c) => {
        involvedDeliverables.add(c.deliverable);
        involvedDeliverables.add(c.dependsOn);
      });

      const relevantReqs = reqs.filter((r) => involvedDeliverables.has(r.deliverable));
      const pillarGroups: Record<string, LaunchRequirement[]> = {};
      relevantReqs.forEach((r) => {
        const p = getPillar(r.deliverable);
        if (!pillarGroups[p.id]) pillarGroups[p.id] = [];
        pillarGroups[p.id].push(r);
      });

      newNodes.push({
        id: `header-${product.id}`,
        type: "productHeader",
        position: { x: 50, y: 200 },
        data: {
          label: product.name,
          productName: product.name,
          ga: product.generally_available,
          completePct: data.completePct,
          totalActivities: data.total,
          doneActivities: data.done,
          blockerCount: data.blockerCount,
          chainCount: chains.length,
        },
        draggable: true,
      });

      const pillarOrder = PILLARS.map((p) => p.id);
      let colX = 400;
      pillarOrder.forEach((pillarId) => {
        const group = pillarGroups[pillarId];
        if (!group || group.length === 0) return;
        const pillar = PILLARS.find((p) => p.id === pillarId)!;
        let rowY = 50;
        group.forEach((r) => {
          const nodeId = `${product.id}::${r.deliverable}`;
          newNodes.push({
            id: nodeId,
            type: "activityNode",
            position: { x: colX, y: rowY },
            data: {
              label: friendlyName(r.deliverable),
              deliverable: r.deliverable,
              pillarColor: pillar.color,
              pillarLabel: pillar.label,
              pillarIcon: pillar.icon,
              isComplete: !!r.complete,
              isBlocker: blockerSet.has(r.deliverable),
              isBlocked: blockedSet.has(r.deliverable),
              owner: r.owner,
              timeline: r.timeline,
              productName: product.name,
            },
            draggable: true,
          });
          rowY += 110;
        });
        colX += 280;
      });

      chains.forEach((chain) => {
        const sourceId = `${product.id}::${chain.dependsOn}`;
        const targetId = `${product.id}::${chain.deliverable}`;
        newEdges.push({
          id: `edge-${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          animated: chain.isBlocked,
          style: {
            stroke: chain.isBlocked ? "#ef4444" : chain.isComplete && chain.depIsComplete ? "#22c55e" : "#94a3b8",
            strokeWidth: chain.isBlocked ? 3 : 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: chain.isBlocked ? "#ef4444" : chain.isComplete && chain.depIsComplete ? "#22c55e" : "#94a3b8",
          },
          label: chain.isBlocked ? "BLOCKED" : chain.isComplete && chain.depIsComplete ? "OK" : "",
          labelStyle: {
            fill: chain.isBlocked ? "#ef4444" : "#22c55e",
            fontWeight: 700,
            fontSize: 9,
          },
          labelBgStyle: {
            fill: chain.isBlocked ? "#fef2f2" : "#f0fdf4",
            fillOpacity: 0.9,
          },
        });
      });
    } else {
      let yOffset = 0;
      filteredProducts.forEach((data, prodIdx) => {
        const { product, reqs, chains, blockers } = data;
        const blockerSet = new Set(blockers.map((b) => b.deliverable));
        const blockedSet = new Set(chains.filter((c) => c.isBlocked).map((c) => c.deliverable));

        const headerNodeId = `header-${product.id}`;
        newNodes.push({
          id: headerNodeId,
          type: "productHeader",
          position: { x: 50, y: yOffset + 40 },
          data: {
            label: product.name,
            productName: product.name,
            ga: product.generally_available,
            completePct: data.completePct,
            totalActivities: data.total,
            doneActivities: data.done,
            blockerCount: data.blockerCount,
            chainCount: chains.length,
          },
          draggable: true,
        });

        const involvedDeliverables = new Set<string>();
        chains.forEach((c) => {
          involvedDeliverables.add(c.deliverable);
          involvedDeliverables.add(c.dependsOn);
        });

        if (involvedDeliverables.size === 0) {
          yOffset += 160;
          return;
        }

        const relevantReqs = reqs.filter((r) => involvedDeliverables.has(r.deliverable));

        let xPos = 400;
        let maxYInRow = 0;
        relevantReqs.forEach((r, rIdx) => {
          const pillar = getPillar(r.deliverable);
          const nodeId = `${product.id}::${r.deliverable}`;
          const row = Math.floor(rIdx / 4);
          const col = rIdx % 4;
          const nodeX = xPos + col * 250;
          const nodeY = yOffset + row * 120;

          newNodes.push({
            id: nodeId,
            type: "activityNode",
            position: { x: nodeX, y: nodeY },
            data: {
              label: friendlyName(r.deliverable),
              deliverable: r.deliverable,
              pillarColor: pillar.color,
              pillarLabel: pillar.label,
              pillarIcon: pillar.icon,
              isComplete: !!r.complete,
              isBlocker: blockerSet.has(r.deliverable),
              isBlocked: blockedSet.has(r.deliverable),
              owner: r.owner,
              timeline: r.timeline,
              productName: product.name,
            },
            draggable: true,
          });
          maxYInRow = Math.max(maxYInRow, nodeY);
        });

        newEdges.push({
          id: `header-link-${product.id}`,
          source: headerNodeId,
          target: `${product.id}::${relevantReqs[0].deliverable}`,
          style: { stroke: "#a5b4fc", strokeWidth: 1.5, strokeDasharray: "5 5" },
          animated: false,
        });

        chains.forEach((chain) => {
          const sourceId = `${product.id}::${chain.dependsOn}`;
          const targetId = `${product.id}::${chain.deliverable}`;
          newEdges.push({
            id: `edge-${sourceId}-${targetId}`,
            source: sourceId,
            target: targetId,
            animated: chain.isBlocked,
            style: {
              stroke: chain.isBlocked ? "#ef4444" : chain.isComplete && chain.depIsComplete ? "#22c55e" : "#94a3b8",
              strokeWidth: chain.isBlocked ? 3 : 2,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: chain.isBlocked ? "#ef4444" : chain.isComplete && chain.depIsComplete ? "#22c55e" : "#94a3b8",
            },
          });
        });

        yOffset = maxYInRow + 200;
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [filteredProducts, viewMode, setNodes, setEdges]);

  const totalBlockers = productData.reduce((s, d) => s + d.blockerCount, 0);
  const totalChains = productData.reduce((s, d) => s + d.chains.length, 0);
  const blockedChains = productData.reduce((s, d) => s + d.chains.filter((c) => c.isBlocked).length, 0);
  const productsAtRisk = productData.filter((d) => d.blockerCount > 0).length;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[100vw] mx-auto space-y-4">
      <div className="px-4">
        <h1 className="text-2xl font-bold">Dependency Map</h1>
        <p className="text-sm text-gray-500 mt-1">
          Interactive diagram of dependency chains and blockers across all product launch activities.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4">
        <SummaryCard
          icon={<Link2 className="w-5 h-5 text-blue-600" />}
          label="Total Dependencies"
          value={totalChains}
          bg="bg-blue-50"
          border="border-blue-200"
        />
        <SummaryCard
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          label="Blocked Chains"
          value={blockedChains}
          bg="bg-amber-50"
          border="border-amber-200"
          alert={blockedChains > 0}
        />
        <SummaryCard
          icon={<Shield className="w-5 h-5 text-red-600" />}
          label="Active Blockers"
          value={totalBlockers}
          bg="bg-red-50"
          border="border-red-200"
          alert={totalBlockers > 0}
        />
        <SummaryCard
          icon={<Zap className="w-5 h-5 text-orange-600" />}
          label="Products at Risk"
          value={productsAtRisk}
          sublabel={`of ${productData.length}`}
          bg="bg-orange-50"
          border="border-orange-200"
          alert={productsAtRisk > 0}
        />
      </div>

      <div className="flex items-center justify-between px-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("all")}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                viewMode === "all"
                  ? "bg-white text-gray-800 shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> All Products
            </button>
            <button
              onClick={() => {
                setViewMode("single");
                if (!selectedProduct && state.products.length > 0) {
                  setSelectedProduct(state.products[0].id);
                }
              }}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                viewMode === "single"
                  ? "bg-white text-gray-800 shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" /> Single Product
            </button>
          </div>
          {viewMode === "single" && (
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {state.products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <Filter className="w-3.5 h-3.5 text-gray-400 ml-2" />
          {(["all", "blockers", "incomplete"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                filterMode === mode
                  ? "bg-white text-gray-800 shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {mode === "all" ? "All" : mode === "blockers" ? "With Blockers" : "Incomplete"}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden mx-4 bg-white shadow-sm" style={{ height: "65vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          defaultEdgeOptions={{
            type: "smoothstep",
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#e2e8f0" gap={20} size={1} />
          <Controls className="!bg-white !border !border-gray-200 !rounded-lg !shadow-md" />
          <MiniMap
            className="!bg-gray-50 !border !border-gray-200 !rounded-lg"
            nodeColor={(node) => {
              if (node.type === "productHeader") return "#6366f1";
              const data = node.data as ActivityNodeData;
              if (data?.isBlocked) return "#ef4444";
              if (data?.isBlocker) return "#f59e0b";
              if (data?.isComplete) return "#22c55e";
              return "#94a3b8";
            }}
          />
          <Panel position="top-right">
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-sm text-xs space-y-1.5">
              <div className="font-semibold text-gray-700 mb-2">Legend</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600">Complete</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-gray-600">Blocker (incomplete, blocking others)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-600">Blocked (waiting on dependency)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-gray-600">Pending</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-red-500" />
                <span className="text-gray-600">Blocked edge (animated)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-green-500" />
                <span className="text-gray-600">Resolved edge</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-gray-400" />
                <span className="text-gray-600">Pending edge</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  sublabel,
  bg,
  border,
  alert,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sublabel?: string;
  bg: string;
  border: string;
  alert?: boolean;
}) {
  return (
    <div className={`rounded-xl border ${border} ${bg} p-4`}>
      <div className="flex items-center justify-between mb-2">
        {icon}
        {alert && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
      </div>
      <div className="text-2xl font-bold text-gray-800">
        {value}
        {sublabel && <span className="text-sm font-normal text-gray-400 ml-1">{sublabel}</span>}
      </div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}
