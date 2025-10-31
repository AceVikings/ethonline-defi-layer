import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  BackgroundVariant,
  Panel,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { apiClient } from "../lib/apiClient";
import { POPULAR_TOKENS } from "../config/tokens";
import { showToast } from "../lib/toast";
import { getTokensForChain, findTokenByAddress } from "../config/tokens";
import { AIWorkflowBuilder } from "../components/AIWorkflowBuilder";
import { WorkflowCreationModal } from "../components/WorkflowCreationModal";
import { useNotification } from "@blockscout/app-sdk";

// Utility function to detect and show transaction notifications
// Custom node component with dynamic handles based on node type
const CustomNode = ({ data }: any) => {
  const nodeType =
    NODE_TYPES.find((n) => n.type === data.type) || NODE_TYPES[0];
  const isTrigger = data.type === "trigger";
  const isCondition = data.type === "condition";
  const isMCP = data.type === "mcp";

  return (
    <div
      className={`bg-white rounded-lg shadow-lg border-2 border-gray-300 hover:border-orange-400 transition-all min-w-[200px]`}
    >
      {/* Standard input handle (all nodes except trigger and MCP) */}
      {!isTrigger && !isMCP && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-orange-500"
          id="input"
        />
      )}

      <div
        className={`bg-gradient-to-br ${nodeType.color} px-4 py-2 rounded-t-lg text-white`}
      >
        <div className="font-semibold text-sm">{data.label}</div>
      </div>

      <div className="px-4 py-3 bg-white rounded-b-lg">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {nodeType.label}
        </div>
        <div className="text-xs text-gray-600">{nodeType.description}</div>
        {data.config && Object.keys(data.config).length > 0 && (
          <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
            {Object.keys(data.config).length} configuration
            {Object.keys(data.config).length !== 1 ? "s" : ""}
          </div>
        )}
        {isMCP && (
          <div className="text-xs font-semibold text-cyan-600 mt-2 pt-2 border-t border-cyan-200">
            Connect to AI node MCP input
          </div>
        )}
      </div>

      {/* Output handles - condition node has two (true/false), MCP has right output, others have bottom */}
      {isCondition ? (
        <>
          <Handle
            type="source"
            position={Position.Left}
            id="true"
            className="w-3 h-3 !bg-green-500"
            style={{ left: "-6px", top: "50%" }}
          />
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-green-600 bg-white px-1 rounded pointer-events-none">
            TRUE
          </div>

          <Handle
            type="source"
            position={Position.Right}
            id="false"
            className="w-3 h-3 !bg-red-500"
            style={{ right: "-6px", top: "50%" }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-600 bg-white px-1 rounded pointer-events-none">
            FALSE
          </div>
        </>
      ) : isMCP ? (
        // MCP nodes output from the right side to connect to AI's left MCP input
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-cyan-500"
          id="mcp-output"
        />
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-orange-500"
          id="output"
        />
      )}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// Node types that users can add to their workflow
const NODE_TYPES = [
  {
    type: "trigger",
    label: "Trigger",
    icon: "trigger",
    color: "from-yellow-400 to-orange-500",
    description: "Start the workflow execution",
  },
  {
    type: "swap",
    label: "Token Swap",
    icon: "swap",
    color: "from-blue-400 to-blue-600",
    description: "Exchange tokens on DEX",
  },
  {
    type: "aave",
    label: "Aave Protocol",
    icon: "aave",
    color: "from-purple-400 to-purple-600",
    description: "Supply or borrow assets",
  },
  {
    type: "transfer",
    label: "Token Transfer",
    icon: "transfer",
    color: "from-green-400 to-green-600",
    description: "Send tokens to address",
  },
  {
    type: "condition",
    label: "Conditional",
    icon: "condition",
    color: "from-pink-400 to-pink-600",
    description: "If/else branching logic",
  },
  {
    type: "ai",
    label: "ASI:One",
    icon: "ai",
    color: "from-indigo-400 to-indigo-600",
    description: "ASI:One AI with agent connections",
  },
];

// Configuration Components for each node type
const TriggerConfig = ({
  config,
  onUpdate,
  workflowId,
  openTxToast,
  executionState,
  setExecutionState,
}: {
  config: any;
  onUpdate: (config: any) => void;
  workflowId?: string;
  openTxToast: (chainId: string, txHash: string) => Promise<void>;
  executionState: {
    triggering: boolean;
    executionId: string | null;
    executionData: any;
    showLogs: boolean;
  };
  setExecutionState: React.Dispatch<React.SetStateAction<{
    triggering: boolean;
    executionId: string | null;
    executionData: any;
    showLogs: boolean;
  }>>;
}) => {
  const triggerType = config.triggerType || "manual";
  const shownTxHashes = useRef<Set<string>>(new Set());
  const hasShownCompletion = useRef(false);
  const pollRef = useRef<number | null>(null);
  
  // Destructure execution state for easier access
  const { triggering, executionId, executionData, showLogs } = executionState;

  // Poll for execution updates
  useEffect(() => {
    if (!executionId || !triggering) return;

    // Guard: only create one interval per execution
    if (pollRef.current) return;

    // Poll every 3 seconds to reduce load and avoid rapid spamming
    pollRef.current = window.setInterval(async () => {
      try {
        const response = await apiClient.getExecutionDetails(executionId);
        setExecutionState(prev => ({ ...prev, executionData: response.execution }));

        // Stop polling if execution is complete or failed
        if (
          response.execution.status === "completed" ||
          response.execution.status === "failed"
        ) {
          setExecutionState(prev => ({ ...prev, triggering: false }));
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }

          if (response.execution.status === "completed") {
            // Only show completion toast once
            if (!hasShownCompletion.current) {
              hasShownCompletion.current = true;
              showToast.success("Workflow execution completed!");
            }

            // Extract and show transaction notifications
            if (response.execution.steps && response.execution.steps.length > 0) {
              response.execution.steps.forEach((step: any) => {
                // Check if step has a txHash (in output.txHash or output.swapTxHash)
                const txHash = step.output?.txHash || step.output?.swapTxHash;
                const chainId = step.output?.chainId?.toString();

                if (txHash && chainId && !shownTxHashes.current.has(txHash)) {
                  shownTxHashes.current.add(txHash);
                  openTxToast(chainId, txHash).catch((err) => {
                    console.error('Failed to show transaction notification:', err);
                  });
                }

                // Also check for transactions array (for nodes with multiple txs)
                if (step.output?.transactions && Array.isArray(step.output.transactions)) {
                  step.output.transactions.forEach((tx: any) => {
                    if (tx.hash && tx.chainId && !shownTxHashes.current.has(tx.hash)) {
                      shownTxHashes.current.add(tx.hash);
                      openTxToast(tx.chainId.toString(), tx.hash).catch((err) => {
                        console.error('Failed to show transaction notification:', err);
                      });
                    }
                  });
                }
              });
            }
          } else {
            showToast.error("Workflow execution failed");
          }
        }
      } catch (error) {
        console.error("Failed to fetch execution details:", error);
      }
    }, 3000); // Poll every 3 seconds

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [executionId, triggering, openTxToast]);

  const handleManualTrigger = async () => {
    if (!workflowId) {
      showToast.warning("Please save the workflow before triggering");
      return;
    }

    setExecutionState({
      triggering: true,
      executionId: null,
      executionData: null,
      showLogs: true,
    });
    shownTxHashes.current.clear(); // Reset shown tx hashes for new execution
    hasShownCompletion.current = false; // Reset completion flag

    try {
      const response = await apiClient.executeWorkflow(workflowId);
      setExecutionState(prev => ({ ...prev, executionId: response.executionId }));
      showToast.success("Workflow execution started!");
      console.log("Execution response:", response);
    } catch (error: any) {
      const errorMsg = error.message || "Failed to trigger workflow";

      // Check if it's a configuration error
      if (errorMsg.includes("missing required configuration")) {
        showToast.error(
          "Please configure all nodes and save the workflow before executing"
        );
      } else {
        showToast.error(errorMsg);
      }

      console.error("Execution error:", error);
      setExecutionState(prev => ({ ...prev, triggering: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      case "running":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return (
          <svg
            className="w-4 h-4 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "failed":
        return (
          <svg
            className="w-4 h-4 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "running":
        return (
          <svg
            className="animate-spin h-4 w-4 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Trigger Type
        </label>
        <select
          value={triggerType}
          onChange={(e) => onUpdate({ ...config, triggerType: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        >
          <option value="manual">Manual</option>
          <option value="scheduled">Scheduled</option>
          <option value="price">Price Alert</option>
          <option value="event">Event-based</option>
        </select>
      </div>

      {triggerType === "manual" && (
        <div className="pt-2 space-y-2">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-semibold mb-1">
                  Remember to save before executing!
                </p>
                <p>
                  Configure all nodes, then click "Save Workflow" to persist
                  your changes before triggering execution.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleManualTrigger}
            disabled={triggering || !workflowId}
            className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {triggering ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Triggering...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Execute Workflow
              </>
            )}
          </button>
          {!workflowId && (
            <p className="text-xs text-amber-600 mt-2 text-center">
              Save workflow first to enable execution
            </p>
          )}

          {/* Execution Logs Viewer */}
          {showLogs && executionData && (
            <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-gray-700">
                    Execution Logs
                  </span>
                </div>
                <button
                  onClick={() => setExecutionState(prev => ({ ...prev, showLogs: false }))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto p-3 space-y-2 bg-gray-900 text-gray-100 font-mono text-xs">
                {/* Execution Status */}
                <div className="flex items-center gap-2 pb-2 border-b border-gray-700">
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`font-semibold ${
                      executionData.status === "completed"
                        ? "text-green-400"
                        : executionData.status === "failed"
                        ? "text-red-400"
                        : executionData.status === "running"
                        ? "text-blue-400"
                        : "text-gray-400"
                    }`}
                  >
                    {executionData.status.toUpperCase()}
                  </span>
                  {executionData.startedAt && (
                    <>
                      <span className="text-gray-600 mx-2">|</span>
                      <span className="text-gray-400">Started:</span>
                      <span className="text-gray-300">
                        {new Date(executionData.startedAt).toLocaleTimeString()}
                      </span>
                    </>
                  )}
                  {executionData.completedAt && (
                    <>
                      <span className="text-gray-600 mx-2">|</span>
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-gray-300">
                        {Math.round(
                          new Date(executionData.completedAt).getTime() -
                            new Date(executionData.startedAt).getTime()
                        )}
                        ms
                      </span>
                    </>
                  )}
                </div>

                {/* Execution Steps */}
                {executionData.steps && executionData.steps.length > 0 ? (
                  executionData.steps.map((step: any, index: number) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-700 pl-3 py-1"
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          {getStatusIcon(step.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`font-semibold ${getStatusColor(
                                step.status
                              )}`}
                            >
                              [{step.nodeType}]
                            </span>
                            <span className="text-gray-300">
                              {step.nodeLabel || step.nodeId}
                            </span>
                          </div>

                          {step.output && (
                            <div className="bg-gray-800 rounded p-2 mt-1 text-xs">
                              <div className="text-gray-400 mb-1">Output:</div>
                              <pre className="text-green-400 whitespace-pre-wrap">
                                {JSON.stringify(step.output, null, 2)}
                              </pre>
                            </div>
                          )}

                          {step.error && (
                            <div className="bg-red-900/30 border border-red-700 rounded p-2 mt-1 text-xs">
                              <div className="text-red-400 font-semibold mb-1">
                                Error:
                              </div>
                              <pre className="text-red-300 whitespace-pre-wrap">
                                {step.error}
                              </pre>
                            </div>
                          )}

                          {step.completedAt && step.startedAt && (
                            <div className="text-gray-500 text-xs mt-1">
                              Duration:{" "}
                              {Math.round(
                                new Date(step.completedAt).getTime() -
                                  new Date(step.startedAt).getTime()
                              )}
                              ms
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    {triggering
                      ? "Waiting for execution to start..."
                      : "No execution steps yet"}
                  </div>
                )}

                {/* Overall Error */}
                {executionData.error && (
                  <div className="bg-red-900/30 border border-red-700 rounded p-3 mt-2">
                    <div className="text-red-400 font-semibold mb-1">
                      Workflow Error:
                    </div>
                    <pre className="text-red-300 whitespace-pre-wrap text-xs">
                      {executionData.error}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {triggerType === "scheduled" && (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Interval
          </label>
          <input
            type="text"
            value={config.interval || ""}
            onChange={(e) => onUpdate({ ...config, interval: e.target.value })}
            placeholder="e.g., every 1 hour"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
          />
        </div>
      )}

      {triggerType === "price" && (
        <>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Token
            </label>
            <input
              type="text"
              value={config.token || ""}
              onChange={(e) => onUpdate({ ...config, token: e.target.value })}
              placeholder="ETH, BTC, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Target Price ($)
            </label>
            <input
              type="number"
              value={config.targetPrice || ""}
              onChange={(e) =>
                onUpdate({ ...config, targetPrice: e.target.value })
              }
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>
        </>
      )}
    </div>
  );
};

const SwapConfig = ({
  config,
  onUpdate,
}: {
  config: any;
  onUpdate: (config: any) => void;
}) => {
  const chain = config.chain || "base";
  const availableTokens = getTokensForChain(chain);

  // Track whether user is using custom address
  const [fromTokenMode, setFromTokenMode] = useState<"preset" | "custom">(
    () => {
      return config.fromToken && !findTokenByAddress(chain, config.fromToken)
        ? "custom"
        : "preset";
    }
  );
  const [toTokenMode, setToTokenMode] = useState<"preset" | "custom">(() => {
    return config.toToken && !findTokenByAddress(chain, config.toToken)
      ? "custom"
      : "preset";
  });

  // When chain changes, reset token selections
  const handleChainChange = (newChain: string) => {
    onUpdate({
      ...config,
      chain: newChain,
      fromToken: "",
      toToken: "",
      fromTokenDecimals: "18",
    });
    setFromTokenMode("preset");
    setToTokenMode("preset");
  };

  // Handle from token selection
  const handleFromTokenChange = (value: string) => {
    if (value === "custom") {
      setFromTokenMode("custom");
      onUpdate({ ...config, fromToken: "", fromTokenDecimals: "18" });
    } else {
      const token = availableTokens.find((t) => t.address === value);
      if (token) {
        onUpdate({
          ...config,
          fromToken: token.address,
          fromTokenDecimals: token.decimals.toString(),
        });
      }
    }
  };

  // Handle to token selection
  const handleToTokenChange = (value: string) => {
    if (value === "custom") {
      setToTokenMode("custom");
      onUpdate({ ...config, toToken: "" });
    } else {
      onUpdate({ ...config, toToken: value });
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Chain
        </label>
        <select
          value={chain}
          onChange={(e) => handleChainChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        >
          <optgroup label="Mainnets">
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
            <option value="arbitrum">Arbitrum</option>
            <option value="optimism">Optimism</option>
            <option value="base">Base</option>
            <option value="bnb">BNB Chain</option>
            <option value="avalanche">Avalanche</option>
            <option value="celo">Celo</option>
          </optgroup>
          <optgroup label="Testnets">
            <option value="sepolia">Sepolia</option>
            <option value="basesepolia">Base Sepolia</option>
            <option value="arbitrumsepolia">Arbitrum Sepolia</option>
            <option value="optimismsepolia">Optimism Sepolia</option>
            <option value="avalanchefuji">Avalanche Fuji</option>
            <option value="polygonmumbai">Polygon Mumbai</option>
          </optgroup>
        </select>
      </div>

      {/* From Token */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          From Token
        </label>
        {fromTokenMode === "preset" ? (
          <div className="space-y-2">
            <select
              value={config.fromToken || ""}
              onChange={(e) => handleFromTokenChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
            >
              <option value="">Select a token...</option>
              {availableTokens.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol} - {token.name}
                </option>
              ))}
              <option value="custom">🔧 Custom Address</option>
            </select>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={config.fromToken || ""}
              onChange={(e) =>
                onUpdate({ ...config, fromToken: e.target.value })
              }
              placeholder="0x..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none font-mono"
            />
            <button
              type="button"
              onClick={() => {
                setFromTokenMode("preset");
                onUpdate({ ...config, fromToken: "", fromTokenDecimals: "18" });
              }}
              className="text-xs text-orange-600 hover:text-orange-700"
            >
              ← Back to popular tokens
            </button>
          </div>
        )}
      </div>

      {/* To Token */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          To Token
        </label>
        {toTokenMode === "preset" ? (
          <div className="space-y-2">
            <select
              value={config.toToken || ""}
              onChange={(e) => handleToTokenChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
            >
              <option value="">Select a token...</option>
              {availableTokens.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol} - {token.name}
                </option>
              ))}
              <option value="custom">🔧 Custom Address</option>
            </select>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={config.toToken || ""}
              onChange={(e) => onUpdate({ ...config, toToken: e.target.value })}
              placeholder="0x..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none font-mono"
            />
            <button
              type="button"
              onClick={() => {
                setToTokenMode("preset");
                onUpdate({ ...config, toToken: "" });
              }}
              className="text-xs text-orange-600 hover:text-orange-700"
            >
              ← Back to popular tokens
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Amount
        </label>
        <input
          type="text"
          value={config.amount || ""}
          onChange={(e) => onUpdate({ ...config, amount: e.target.value })}
          placeholder="0.00"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Amount in human-readable format (e.g., 0.1)
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          From Token Decimals
        </label>
        <input
          type="number"
          value={config.fromTokenDecimals || "18"}
          onChange={(e) =>
            onUpdate({ ...config, fromTokenDecimals: e.target.value })
          }
          placeholder="18"
          min="0"
          max="18"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
          disabled={fromTokenMode === "preset" && config.fromToken}
        />
        <p className="text-xs text-gray-500 mt-1">
          {fromTokenMode === "preset" && config.fromToken
            ? "Auto-filled from selected token"
            : "Usually 18 for most tokens, 6 for USDC"}
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Slippage (%)
        </label>
        <input
          type="number"
          value={config.slippage || "0.5"}
          onChange={(e) => onUpdate({ ...config, slippage: e.target.value })}
          placeholder="0.5"
          step="0.1"
          min="0.1"
          max="5"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Maximum price movement tolerance
        </p>
      </div>
    </div>
  );
};

const AaveConfig = ({
  config,
  onUpdate,
}: {
  config: any;
  onUpdate: (config: any) => void;
}) => {
  const action = config.action || "supply";
  const chain = config.chain || "base";

  // Common Aave tokens per chain
  const aaveTokens: Record<string, string[]> = {
    base: ["USDC", "WETH", "cbETH", "USDbC"],
    basesepolia: ["USDC", "WETH", "DAI"],
    ethereum: ["USDC", "WETH", "USDT", "DAI", "WBTC", "LINK"],
    sepolia: ["USDC", "WETH", "DAI", "LINK"],
    polygon: ["USDC", "WETH", "WMATIC", "USDT", "DAI", "WBTC"],
    arbitrum: ["USDC", "WETH", "USDT", "DAI", "WBTC", "LINK"],
    arbitrumsepolia: ["USDC", "WETH", "DAI"],
    optimism: ["USDC", "WETH", "USDT", "DAI", "WBTC", "LINK"],
    optimismsepolia: ["USDC", "WETH", "DAI"],
    avalanche: ["USDC", "WAVAX", "WETH", "USDT", "DAI", "WBTC"],
    avalanchefuji: ["USDC", "WAVAX", "WETH"],
  };

  const availableTokens = aaveTokens[chain] || [];

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Chain
        </label>
        <select
          value={chain}
          onChange={(e) => onUpdate({ ...config, chain: e.target.value, asset: "" })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        >
          <optgroup label="Mainnets">
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
            <option value="arbitrum">Arbitrum</option>
            <option value="optimism">Optimism</option>
            <option value="base">Base</option>
            <option value="bnb">BNB Chain</option>
            <option value="avalanche">Avalanche</option>
          </optgroup>
          <optgroup label="Testnets">
            <option value="sepolia">Sepolia</option>
            <option value="basesepolia">Base Sepolia</option>
            <option value="arbitrumsepolia">Arbitrum Sepolia</option>
            <option value="optimismsepolia">Optimism Sepolia</option>
            <option value="avalanchefuji">Avalanche Fuji</option>
            <option value="polygonmumbai">Polygon Mumbai</option>
          </optgroup>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Action
        </label>
        <select
          value={action}
          onChange={(e) => onUpdate({ ...config, action: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        >
          <option value="supply">Supply</option>
          <option value="borrow">Borrow</option>
          <option value="withdraw">Withdraw</option>
          <option value="repay">Repay</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Asset
        </label>
        <select
          value={config.asset || ""}
          onChange={(e) => onUpdate({ ...config, asset: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        >
          <option value="">Select token...</option>
          {availableTokens.map((token) => (
            <option key={token} value={token}>
              {token}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Available Aave V3 tokens on {chain}
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Amount
        </label>
        <input
          type="text"
          value={config.amount || ""}
          onChange={(e) => onUpdate({ ...config, amount: e.target.value })}
          placeholder="0.00"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>

      {(action === "borrow" || action === "repay") && (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Interest Rate Mode
          </label>
          <select
            value={config.interestRateMode || 2}
            onChange={(e) =>
              onUpdate({ ...config, interestRateMode: parseInt(e.target.value) })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
          >
            <option value={1}>Stable Rate</option>
            <option value={2}>Variable Rate</option>
          </select>
        </div>
      )}

      {action === "supply" && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="useAsCollateral"
            checked={config.useAsCollateral || false}
            onChange={(e) =>
              onUpdate({ ...config, useAsCollateral: e.target.checked })
            }
            className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
          />
          <label
            htmlFor="useAsCollateral"
            className="text-xs font-semibold text-gray-700"
          >
            Use as collateral
          </label>
        </div>
      )}
    </div>
  );
};

const TransferConfig = ({
  config,
  onUpdate,
}: {
  config: any;
  onUpdate: (config: any) => void;
}) => {
  const [selectedChain, setSelectedChain] = useState(
    config.chain || "basesepolia"
  );
  const [selectedToken, setSelectedToken] = useState(config.token || "");

  const chains = [
    { id: "basesepolia", name: "Base Sepolia" },
    { id: "sepolia", name: "Sepolia" },
  ];

  const tokens =
    POPULAR_TOKENS[selectedChain as keyof typeof POPULAR_TOKENS] || [];

  const handleChainChange = (chain: string) => {
    setSelectedChain(chain);
    setSelectedToken(""); // Reset token when chain changes
    onUpdate({ ...config, chain, token: "" });
  };

  const handleTokenChange = (tokenAddress: string) => {
    setSelectedToken(tokenAddress);
    const token = tokens.find((t) => t.address === tokenAddress);
    onUpdate({
      ...config,
      token: tokenAddress,
      tokenSymbol: token?.symbol,
      tokenDecimals: token?.decimals,
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Chain
        </label>
        <select
          value={selectedChain}
          onChange={(e) => handleChainChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        >
          {chains.map((chain) => (
            <option key={chain.id} value={chain.id}>
              {chain.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Token
        </label>
        <select
          value={selectedToken}
          onChange={(e) => handleTokenChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        >
          <option value="">Select a token</option>
          {tokens.map((token) => (
            <option key={token.address} value={token.address}>
              {token.symbol} - {token.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Or enter custom token address below
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Custom Token Address (optional)
        </label>
        <input
          type="text"
          value={selectedToken}
          onChange={(e) => {
            setSelectedToken(e.target.value);
            onUpdate({ ...config, token: e.target.value });
          }}
          placeholder="0x... or use dropdown above"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none font-mono"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Recipient Address
        </label>
        <input
          type="text"
          value={config.recipient || config.to || ""}
          onChange={(e) => onUpdate({ ...config, recipient: e.target.value, to: e.target.value })}
          placeholder="0x..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none font-mono"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Amount
        </label>
        <input
          type="text"
          value={config.amount || ""}
          onChange={(e) => onUpdate({ ...config, amount: e.target.value })}
          placeholder="0.00"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-500">
          {selectedToken && tokens.find((t) => t.address === selectedToken)
            ? `Amount in ${
                tokens.find((t) => t.address === selectedToken)?.symbol
              }`
            : "Enter amount to transfer"}
        </p>
      </div>

      {config.token && config.recipient && config.amount && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-800">
            <span className="font-semibold">Preview:</span> Transfer{" "}
            {config.amount} {config.tokenSymbol || "tokens"} to{" "}
            {config.recipient.slice(0, 6)}...{config.recipient.slice(-4)}
          </p>
        </div>
      )}
    </div>
  );
};

const ConditionConfig = ({
  config,
  onUpdate,
}: {
  config: any;
  onUpdate: (config: any) => void;
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Left Value
        </label>
        <input
          type="text"
          value={config.leftValue || ""}
          onChange={(e) => onUpdate({ ...config, leftValue: e.target.value })}
          placeholder="e.g., balance, price"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Operator
        </label>
        <select
          value={config.operator || ">"}
          onChange={(e) => onUpdate({ ...config, operator: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        >
          <option value=">">Greater than (&gt;)</option>
          <option value="<">Less than (&lt;)</option>
          <option value="===">Equal to (===)</option>
          <option value=">=">Greater or equal (&gt;=)</option>
          <option value="<=">Less or equal (&lt;=)</option>
          <option value="!==">Not equal (!==)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Right Value
        </label>
        <input
          type="text"
          value={config.rightValue || ""}
          onChange={(e) => onUpdate({ ...config, rightValue: e.target.value })}
          placeholder="e.g., 1000, 0.5"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <span className="font-semibold">Preview:</span> If{" "}
          {config.leftValue || "..."} {config.operator || ">"}{" "}
          {config.rightValue || "..."} then TRUE branch, else FALSE branch
        </p>
      </div>
    </div>
  );
};

const AIConfig = ({
  config,
  onUpdate,
}: {
  config: any;
  onUpdate: (config: any) => void;
}) => {
  // Preset agents
  const PRESET_AGENTS = [
    {
      name: "None",
      address: "",
      description: "No agent connection"
    },
    {
      name: "Blockscout MCP Agent",
      address: "agent1qfwanzm7l94lcd57p9zsl25y4p6clssp8xjjrd0f8f6nc9r3rx8h6978x2r",
      description: "Real-time blockchain data (balances, transactions, NFTs)"
    },
    {
      name: "Custom",
      address: "custom",
      description: "Enter custom agent address"
    }
  ];

  const selectedPreset = PRESET_AGENTS.find(a => a.address === config.agentAddress) 
    || (config.agentAddress ? PRESET_AGENTS[2] : PRESET_AGENTS[0]);
  const isCustom = selectedPreset.address === "custom";

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Prompt
          <span className="ml-2 text-indigo-600 font-normal">(ASI:One AI)</span>
        </label>
        <textarea
          value={config.prompt || ""}
          onChange={(e) => onUpdate({ ...config, prompt: e.target.value })}
          placeholder="Analyze the previous transaction results and provide insights..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          System Prompt (Optional)
        </label>
        <textarea
          value={config.systemPrompt || ""}
          onChange={(e) =>
            onUpdate({ ...config, systemPrompt: e.target.value })
          }
          placeholder="You are a helpful DeFi analyst that provides clear insights..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Temperature
          </label>
          <input
            type="number"
            value={config.temperature || 0.7}
            onChange={(e) =>
              onUpdate({ ...config, temperature: parseFloat(e.target.value) })
            }
            min="0"
            max="1"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Max Tokens
          </label>
          <input
            type="number"
            value={config.maxTokens || 500}
            onChange={(e) =>
              onUpdate({ ...config, maxTokens: parseInt(e.target.value) })
            }
            min="50"
            max="2000"
            step="50"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Connect to Agent
          <span className="ml-2 text-gray-500 font-normal">(Optional)</span>
        </label>
        <select
          value={selectedPreset.address}
          onChange={(e) => {
            const selected = PRESET_AGENTS.find(a => a.address === e.target.value);
            if (selected && selected.address !== "custom") {
              onUpdate({ ...config, agentAddress: selected.address });
            } else {
              onUpdate({ ...config, agentAddress: "" });
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
        >
          {PRESET_AGENTS.map((agent) => (
            <option key={agent.address} value={agent.address}>
              {agent.name}
            </option>
          ))}
        </select>
        {selectedPreset.description && (
          <p className="mt-1 text-xs text-gray-500">
            {selectedPreset.description}
          </p>
        )}
      </div>

      {isCustom && (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Custom Agent Address
          </label>
          <input
            type="text"
            value={config.agentAddress || ""}
            onChange={(e) =>
              onUpdate({ ...config, agentAddress: e.target.value })
            }
            placeholder="agent1qf..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:outline-none font-mono"
          />
        </div>
      )}

      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
        <p className="text-xs text-indigo-800">
          💡 Connect to Agentverse agents to access real-time blockchain data, DeFi strategies, and more capabilities.
        </p>
      </div>
    </div>
  );
};

// Render appropriate config component based on node type
const NodeConfigPanel = ({
  nodeType,
  config,
  onUpdate,
  workflowId,
  openTxToast,
  executionState,
  setExecutionState,
}: {
  nodeType: string;
  config: any;
  onUpdate: (config: any) => void;
  workflowId?: string;
  openTxToast: (chainId: string, txHash: string) => Promise<void>;
  executionState: {
    triggering: boolean;
    executionId: string | null;
    executionData: any;
    showLogs: boolean;
  };
  setExecutionState: React.Dispatch<React.SetStateAction<{
    triggering: boolean;
    executionId: string | null;
    executionData: any;
    showLogs: boolean;
  }>>;
}) => {
  switch (nodeType) {
    case "trigger":
      return (
        <TriggerConfig
          config={config}
          onUpdate={onUpdate}
          workflowId={workflowId}
          openTxToast={openTxToast}
          executionState={executionState}
          setExecutionState={setExecutionState}
        />
      );
    case "swap":
      return <SwapConfig config={config} onUpdate={onUpdate} />;
    case "aave":
      return <AaveConfig config={config} onUpdate={onUpdate} />;
    case "transfer":
      return <TransferConfig config={config} onUpdate={onUpdate} />;
    case "condition":
      return <ConditionConfig config={config} onUpdate={onUpdate} />;
    case "ai":
      return <AIConfig config={config} onUpdate={onUpdate} />;
    default:
      return (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 text-center">
          No configuration available for this node type
        </div>
      );
  }
};

export default function WorkflowBuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { openTxToast } = useNotification();
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [showNodePalette, setShowNodePalette] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showAIBuilder, setShowAIBuilder] = useState(false);
  const [showCreationModal, setShowCreationModal] = useState(false);
  
  // Lift execution state to parent level to persist across node selection changes
  const [executionState, setExecutionState] = useState<{
    triggering: boolean;
    executionId: string | null;
    executionData: any;
    showLogs: boolean;
  }>({
    triggering: false,
    executionId: null,
    executionData: null,
    showLogs: false,
  });

  useEffect(() => {
    console.log(id);
    if (id && id !== "new") {
      loadWorkflow(id);
    } else if (id === "new") {
      // Show creation modal when creating a new workflow
      setShowCreationModal(true);
    }
  }, [id]);

  const loadWorkflow = async (workflowId: string) => {
    try {
      const response = await apiClient.getWorkflow(workflowId);
      const workflow = response.workflow;
      setWorkflowName(workflow.name);
      setWorkflowDescription(workflow.description || "");

      // Convert stored nodes to React Flow format
      const flowNodes = workflow.nodes.map((node: any) => ({
        id: node.id,
        type: "custom",
        position: {
          x: node.position?.x || 0,
          y: node.position?.y || 0,
        },
        data: {
          label: node.label,
          type: node.type,
          config: node.config || {},
        },
      }));

      // Convert stored edges to React Flow format
      const flowEdges = workflow.edges.map((edge: any) => ({
        id: edge.id,
        source: edge.from,
        target: edge.to,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#f97316", strokeWidth: 2 },
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (error) {
      console.error("Failed to load workflow:", error);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find((n) => n.id === params.source);

      // Determine edge style based on connection type
      const edgeStyle = sourceNode?.data.type === "mcp"
        ? { stroke: "#06b6d4", strokeWidth: 2 } // Cyan for MCP connections
        : { stroke: "#f97316", strokeWidth: 2 }; // Orange for regular connections

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            animated: true,
            style: edgeStyle,
          },
          eds
        )
      );
    },
    [setEdges, nodes]
  );

  const addNode = useCallback(
    (type: string) => {
      const nodeType = NODE_TYPES.find((n) => n.type === type);
      if (!nodeType) return;

      // Check if trying to add a trigger when one already exists
      if (type === "trigger") {
        const existingTrigger = nodes.find(
          (node) => node.data.type === "trigger"
        );
        if (existingTrigger) {
          showToast.warning("Only one trigger node is allowed per workflow");
          return;
        }
      }

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: "custom",
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 400 + 100,
        },
        data: {
          label: nodeType.label,
          type: type,
          config: {},
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes, nodes]
  );

  // Handle AI-generated workflow
  const handleAIWorkflowGenerated = useCallback(
    (workflow: { nodes: any[]; edges: any[] }, explanation: string) => {
      console.log("📥 Receiving AI-generated workflow:", workflow);
      console.log("💬 Explanation:", explanation);

      // Convert AI nodes to React Flow format
      if (workflow.nodes && workflow.nodes.length > 0) {
        const flowNodes = workflow.nodes.map((node: any) => ({
          id: node.id,
          type: "custom",
          position: node.position || { x: 0, y: 0 },
          data: {
            label: node.data?.label || node.label || "Node",
            type: node.data?.type || node.type || "trigger",
            config: node.data?.config || node.config || {},
          },
        }));

        // Convert AI edges to React Flow format
        const flowEdges = (workflow.edges || []).map((edge: any) => ({
          id: edge.id,
          source: edge.source || edge.from,
          target: edge.target || edge.to,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#f97316", strokeWidth: 2 },
        }));

        setNodes(flowNodes);
        setEdges(flowEdges);

        showToast.success("AI workflow applied! You can now edit it manually.");
      }
    },
    [setNodes, setEdges]
  );

  // Handle drag and drop from palette
  const onDragStart = useCallback(
    (event: React.DragEvent, nodeType: string) => {
      event.dataTransfer.setData("application/reactflow", nodeType);
      event.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      const nodeType = NODE_TYPES.find((n) => n.type === type);

      if (!nodeType) return;

      // Check if trying to add a trigger when one already exists
      if (type === "trigger") {
        const existingTrigger = nodes.find(
          (node) => node.data.type === "trigger"
        );
        if (existingTrigger) {
          showToast.warning("Only one trigger node is allowed per workflow");
          return;
        }
      }

      // Get the React Flow viewport bounds
      const reactFlowBounds = (
        event.target as HTMLElement
      ).getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: "custom",
        position,
        data: {
          label: nodeType.label,
          type: type,
          config: {},
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes, nodes]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const updateNodeLabel = useCallback(
    (nodeId: string, newLabel: string) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, label: newLabel } }
            : node
        )
      );
      if (selectedNode?.id === nodeId) {
        setSelectedNode({
          ...selectedNode,
          data: { ...selectedNode.data, label: newLabel },
        });
      }
    },
    [setNodes, selectedNode]
  );

  const updateNodeConfig = useCallback(
    (nodeId: string, newConfig: any) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, config: newConfig } }
            : node
        )
      );
      if (selectedNode?.id === nodeId) {
        setSelectedNode({
          ...selectedNode,
          data: { ...selectedNode.data, config: newConfig },
        });
      }
    },
    [setNodes, selectedNode]
  );

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            edge.source !== selectedNode.id && edge.target !== selectedNode.id
        )
      );
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  const saveWorkflow = async () => {
    if (!workflowName.trim()) {
      showToast.warning("Please enter a workflow name");
      return;
    }

    setSaving(true);
    try {
      // Convert React Flow nodes back to our format
      const workflowNodes = nodes.map((node) => ({
        id: node.id,
        type: node.data.type,
        label: node.data.label,
        position: {
          x: node.position.x,
          y: node.position.y,
        },
        config: node.data.config || {},
      }));

      // Convert React Flow edges back to our format
      const workflowEdges = edges.map((edge) => ({
        id: edge.id,
        from: edge.source,
        to: edge.target,
        sourceHandle: edge.sourceHandle || 'output',
        targetHandle: edge.targetHandle || 'input',
      }));

      const workflowData = {
        name: workflowName,
        description: workflowDescription,
        nodes: workflowNodes,
        edges: workflowEdges,
        isActive: false,
      };

      console.log(
        "💾 Saving workflow data:",
        JSON.stringify(workflowData, null, 2)
      );

      if (id && id !== "new") {
        await apiClient.updateWorkflow(id, workflowData);
        showToast.success("Workflow updated successfully!");
      } else {
        const response = await apiClient.createWorkflow(workflowData);
        showToast.success("Workflow created successfully!");
        // Update URL to use the new workflow ID instead of 'new'
        navigate(`/workflow/${response.workflow._id}`, { replace: true });
      }
    } catch (error) {
      console.error("Failed to save workflow:", error);
      showToast.error("Failed to save workflow. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-amber-50 via-orange-50/40 to-slate-100 flex flex-col overflow-hidden">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 shadow-sm z-10 flex-shrink-0">
        <div className="max-w-full px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/app")}
                className="text-gray-600 hover:text-gray-900 transition"
                title="Back to Dashboard"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <div>
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="text-2xl font-black text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-2"
                  placeholder="Workflow Name"
                />
                <input
                  type="text"
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  className="block text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-2 mt-1"
                  placeholder="Add description..."
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{nodes.length}</span> nodes •{" "}
                <span className="font-semibold">{edges.length}</span>{" "}
                connections
              </div>
              <button
                onClick={() => setShowAIBuilder(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg hover:from-blue-500 hover:to-blue-400 transition shadow-md hover:shadow-lg"
              >
                Build with AI
              </button>
              <button
                onClick={() => setShowNodePalette(!showNodePalette)}
                className={`px-4 py-2 font-semibold rounded-lg transition ${
                  showNodePalette
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {showNodePalette ? "Hide" : "Show"} Node Palette
              </button>
              <button
                onClick={saveWorkflow}
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Workflow"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Node Palette Sidebar */}
        {showNodePalette && (
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto shadow-lg">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-black text-gray-900 mb-2">
                  Add Nodes
                </h2>
                <p className="text-sm text-gray-600">
                  Drag or click to add nodes to your workflow
                </p>
              </div>
              <div className="space-y-3">
                {NODE_TYPES.map((nodeType) => {
                  const isTrigger = nodeType.type === "trigger";
                  const hasTrigger = nodes.some(
                    (node) => node.data.type === "trigger"
                  );
                  const isDisabled = isTrigger && hasTrigger;

                  return (
                    <div
                      key={nodeType.type}
                      draggable={!isDisabled}
                      onDragStart={(e) =>
                        !isDisabled && onDragStart(e, nodeType.type)
                      }
                      onClick={() => !isDisabled && addNode(nodeType.type)}
                      className={`group relative overflow-hidden bg-white border-2 rounded-xl transition-all duration-200 ${
                        isDisabled
                          ? "border-gray-200 opacity-50 cursor-not-allowed"
                          : "border-gray-200 hover:border-orange-400 hover:shadow-xl cursor-move"
                      }`}
                    >
                      {/* Gradient background accent */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${nodeType.color} opacity-0 group-hover:opacity-5 transition-opacity duration-200`}
                      />

                      {/* Disabled overlay */}
                      {isDisabled && (
                        <div className="absolute inset-0 bg-gray-50/80 flex items-center justify-center z-10">
                          <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded shadow-sm">
                            Already Added
                          </span>
                        </div>
                      )}

                      <div className="relative p-4 flex items-start gap-4">
                        {/* Icon badge */}
                        <div
                          className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${nodeType.color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-200`}
                        >
                          <span className="text-lg font-black text-white">
                            {nodeType.type.slice(0, 2).toUpperCase()}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 mb-1 text-sm group-hover:text-orange-600 transition-colors">
                            {nodeType.label}
                          </h3>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {nodeType.description}
                          </p>
                        </div>

                        {/* Drag indicator */}
                        <div className="flex-shrink-0 text-gray-300 group-hover:text-orange-400 transition-colors">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 8h16M4 16h16"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Bottom accent line */}
                      <div
                        className={`h-1 bg-gradient-to-r ${nodeType.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200`}
                      />
                    </div>
                  );
                })}
              </div>

              {nodes.length === 0 && (
                <div className="mt-8 p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-orange-900 font-bold mb-1">
                        Get Started
                      </p>
                      <p className="text-xs text-orange-800 leading-relaxed">
                        Drag nodes onto the canvas or click to add them to your
                        workflow
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* React Flow Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
            defaultEdgeOptions={{
              type: "smoothstep",
              animated: true,
              style: { stroke: "#f97316", strokeWidth: 2 },
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={16}
              size={1}
              color="#d1d5db"
            />
            <Controls className="bg-white border-2 border-gray-200 rounded-lg shadow-lg" />
            <MiniMap
              className="bg-white border-2 border-gray-200 rounded-lg shadow-lg"
              nodeColor={(node) => {
                const nodeType = NODE_TYPES.find(
                  (n) => n.type === node.data.type
                );
                return nodeType ? "#f97316" : "#94a3b8";
              }}
            />

            {/* Empty State Panel */}
            {nodes.length === 0 && (
              <Panel
                position="top-center"
                className="bg-white rounded-xl shadow-2xl p-8 border-2 border-gray-200 max-w-md"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl mx-auto mb-6 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                    DF
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">
                    Build Your First Workflow
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    Drag nodes from the sidebar onto the canvas or click to add
                    them to your DeFi automation workflow
                  </p>
                  <button
                    onClick={() => setShowNodePalette(true)}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-lg hover:shadow-xl transition-all duration-200 text-sm inline-flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Show Node Palette
                  </button>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {/* Properties Panel */}
        {selectedNode && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto shadow-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-900">Properties</h2>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Node Type
                  </label>
                  <div
                    className={`px-4 py-3 bg-gradient-to-br ${
                      NODE_TYPES.find((n) => n.type === selectedNode.data.type)
                        ?.color
                    } text-white rounded-lg font-semibold text-sm`}
                  >
                    {
                      NODE_TYPES.find((n) => n.type === selectedNode.data.type)
                        ?.label
                    }
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Node Name
                  </label>
                  <input
                    type="text"
                    value={selectedNode.data.label as string}
                    onChange={(e) =>
                      updateNodeLabel(selectedNode.id, e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition text-sm"
                    placeholder="Enter node name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Configuration
                  </label>
                  <NodeConfigPanel
                    nodeType={selectedNode.data.type as string}
                    config={selectedNode.data.config || {}}
                    onUpdate={(newConfig) =>
                      updateNodeConfig(selectedNode.id, newConfig)
                    }
                    workflowId={id !== "new" ? id : undefined}
                    openTxToast={openTxToast}
                    executionState={executionState}
                    setExecutionState={setExecutionState}
                  />
                </div>

                <button
                  onClick={deleteSelectedNode}
                  className="w-full px-4 py-3 bg-red-50 text-red-700 font-semibold rounded-lg hover:bg-red-100 transition border border-red-200 text-sm"
                >
                  Delete Node
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Workflow Builder Modal */}
      <AIWorkflowBuilder
        isOpen={showAIBuilder}
        onClose={() => setShowAIBuilder(false)}
        onWorkflowGenerated={handleAIWorkflowGenerated}
        currentWorkflow={nodes.length > 0 ? { nodes, edges } : null}
      />

      {/* Workflow Creation Choice Modal */}
      <WorkflowCreationModal
        isOpen={showCreationModal}
        onClose={() => {
          setShowCreationModal(false);
          // If user closes without choosing, they can still build manually
        }}
        onStartWithAI={() => {
          setShowCreationModal(false);
          setShowAIBuilder(true);
        }}
        onBuildManually={() => {
          setShowCreationModal(false);
          // Canvas is already empty and ready
        }}
      />
    </div>
  );
}
