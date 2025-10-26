import { useState } from "react";
import {
  generateWorkflowFromPrompt,
  refineWorkflow,
  type ConversationMessage,
} from "../lib/asiClient";
import { showToast } from "../lib/toast";

// Node type colors and labels for preview
const NODE_TYPES_INFO: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  trigger: {
    label: "Trigger",
    color: "from-yellow-400 to-orange-500",
    icon: "TR",
  },
  swap: { label: "Token Swap", color: "from-blue-400 to-blue-600", icon: "SW" },
  aave: {
    label: "Aave Protocol",
    color: "from-purple-400 to-purple-600",
    icon: "AA",
  },
  transfer: {
    label: "Token Transfer",
    color: "from-green-400 to-green-600",
    icon: "TF",
  },
  condition: {
    label: "Conditional",
    color: "from-pink-400 to-pink-600",
    icon: "IF",
  },
  ai: { label: "ASI:One", color: "from-indigo-400 to-indigo-600", icon: "AI" },
  mcp: { label: "MCP Tool", color: "from-cyan-400 to-cyan-600", icon: "MC" },
};

interface AIWorkflowBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkflowGenerated: (
    workflow: { nodes: any[]; edges: any[] },
    explanation: string
  ) => void;
  currentWorkflow?: { nodes: any[]; edges: any[] } | null;
}

export function AIWorkflowBuilder({
  isOpen,
  onClose,
  onWorkflowGenerated,
  currentWorkflow,
}: AIWorkflowBuilderProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast.error("Please enter a description");
      return;
    }

    setIsGenerating(true);

    try {
      let result;

      if (currentWorkflow && conversation.length > 0) {
        // Refining existing workflow
        result = await refineWorkflow(prompt, currentWorkflow, conversation);
      } else {
        // Generating new workflow
        result = await generateWorkflowFromPrompt(prompt);
      }

      if (result.success && result.workflow) {
        // Add to conversation
        const newConversation: ConversationMessage[] = [
          ...conversation,
          { role: "user", content: prompt },
          {
            role: "assistant",
            content: result.explanation || "Workflow generated successfully",
            workflow: result.workflow,
          },
        ];

        setConversation(newConversation);
        setPrompt("");

        showToast.success(
          currentWorkflow
            ? "Workflow refined successfully!"
            : "Workflow generated successfully!"
        );
      } else {
        showToast.error(result.error || "Failed to generate workflow");
      }
    } catch (error: any) {
      console.error("Error:", error);
      showToast.error(error.message || "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (conversation.length > 0) {
      const lastMessage = conversation[conversation.length - 1];
      if (lastMessage.role === "assistant" && lastMessage.workflow) {
        onWorkflowGenerated(lastMessage.workflow, lastMessage.content);
        handleClose();
      }
    }
  };

  const handleClose = () => {
    setPrompt("");
    setConversation([]);
    onClose();
  };

  const handleStartOver = () => {
    setConversation([]);
    setPrompt("");
  };

  if (!isOpen) return null;

  const hasWorkflow =
    conversation.length > 0 && conversation[conversation.length - 1].workflow;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border-2 border-gray-200">
        {/* Header */}
        <div className="px-6 py-5 bg-linear-to-br from-amber-50 via-orange-50/40 to-slate-100 border-b-2 border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              AI Workflow Builder
            </h2>
            <p className="text-gray-600 text-sm mt-1 font-medium">
              Describe your DeFi workflow in natural language, powered by ASI
              Alliance
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-white/50"
            title="Close"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Conversation History */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gray-50">
          {conversation.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
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
              <h3 className="text-2xl font-black text-gray-900 mb-3">
                Start with a Prompt
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6 font-medium">
                Describe what you want to do. Here are some examples:
              </p>
              <div className="space-y-3 text-left max-w-lg mx-auto">
                <div className="bg-white border-2 border-gray-200 hover:border-blue-400 rounded-xl p-4 text-sm text-gray-700 transition-all hover:shadow-md cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                    </div>
                    <p className="flex-1 font-medium">
                      "Swap 100 USDC to ETH on Base and supply it to Aave"
                    </p>
                  </div>
                </div>
                <div className="bg-white border-2 border-gray-200 hover:border-blue-400 rounded-xl p-4 text-sm text-gray-700 transition-all hover:shadow-md cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                    <p className="flex-1 font-medium">
                      "Create a yield farming strategy for my USDC"
                    </p>
                  </div>
                </div>
                <div className="bg-white border-2 border-gray-200 hover:border-blue-400 rounded-xl p-4 text-sm text-gray-700 transition-all hover:shadow-md cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg
                        className="w-4 h-4 text-white"
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
                    <p className="flex-1 font-medium">
                      "Set up arbitrage between Uniswap and 1inch"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            conversation.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-md ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                      : "bg-white border-2 border-gray-200 text-gray-900"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                        message.role === "user"
                          ? "bg-white/20 text-white"
                          : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                      }`}
                    >
                      {message.role === "user" ? "You" : "AI"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {message.content}
                      </p>
                      {message.workflow && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="text-xs text-gray-500 mb-3 font-bold uppercase tracking-wider">
                            Generated Workflow (
                            {message.workflow.nodes?.length || 0} nodes)
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {message.workflow.nodes?.map(
                              (node: any, nodeIndex: number) => {
                                const nodeInfo = NODE_TYPES_INFO[node.type] || {
                                  label: node.type,
                                  color: "from-gray-400 to-gray-500",
                                  icon: "??",
                                };
                                return (
                                  <div
                                    key={nodeIndex}
                                    className="inline-flex items-center gap-1"
                                  >
                                    <div
                                      className={`inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-br ${nodeInfo.color} rounded-lg text-white text-xs font-bold shadow-md`}
                                    >
                                      <span className="font-black">
                                        {nodeInfo.icon}
                                      </span>
                                      <span>{nodeInfo.label}</span>
                                    </div>
                                    {nodeIndex <
                                      (message.workflow.nodes?.length || 0) -
                                        1 && (
                                      <svg
                                        className="w-4 h-4 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                          {message.workflow.nodes?.some(
                            (n: any) => n.type === "mcp"
                          ) && (
                            <div className="mt-3 p-3 bg-cyan-50 border-2 border-cyan-200 rounded-lg text-xs text-cyan-800 font-semibold">
                              ⚠️ MCP nodes require agent execution - they cannot
                              run standalone
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {isGenerating && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-5 py-4 bg-white border-2 border-gray-200 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-black">
                    AI
                  </div>
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></span>
                  </div>
                  <span className="text-sm text-gray-600 font-semibold">
                    Generating workflow...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 border-t-2 border-gray-200 bg-white">
          <div className="flex gap-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder={
                conversation.length === 0
                  ? "Describe your workflow... (e.g., 'Swap ETH to USDC and supply to Aave')"
                  : "Refine the workflow... (e.g., 'Add slippage protection' or 'Use 1inch instead')"
              }
              className="flex-1 bg-gray-50 text-gray-900 rounded-xl px-4 py-3 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all font-medium placeholder:text-gray-400"
              rows={2}
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Thinking...</span>
                </>
              ) : conversation.length === 0 ? (
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span>Generate</span>
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Refine</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-gray-500 font-medium">
              Press{" "}
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded font-semibold text-gray-700">
                Enter
              </kbd>{" "}
              to send,{" "}
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded font-semibold text-gray-700">
                Shift+Enter
              </kbd>{" "}
              for new line
            </div>
            <div className="flex gap-2">
              {conversation.length > 0 && (
                <button
                  onClick={handleStartOver}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100 font-semibold"
                >
                  Start Over
                </button>
              )}
              {hasWorkflow && (
                <button
                  onClick={handleApply}
                  className="px-6 py-2 bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-lg hover:from-orange-600 hover:to-amber-700 hover:shadow-lg transition-all font-bold flex items-center gap-2"
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Apply Workflow
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
