/**
 * AI Workflow Builder Modal
 * 
 * Modal for creating and refining workflows using natural language
 * with ASI-powered AI assistance
 */

import { useState } from 'react';
import { generateWorkflowFromPrompt, refineWorkflow, type ConversationMessage } from '../lib/asiClient';
import { showToast } from '../lib/toast';

interface AIWorkflowBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkflowGenerated: (workflow: { nodes: any[]; edges: any[] }, explanation: string) => void;
  currentWorkflow?: { nodes: any[]; edges: any[] } | null;
}

export function AIWorkflowBuilder({ isOpen, onClose, onWorkflowGenerated, currentWorkflow }: AIWorkflowBuilderProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [currentExplanation, setCurrentExplanation] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast.error('Please enter a description');
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
          { role: 'user', content: prompt },
          {
            role: 'assistant',
            content: result.explanation || 'Workflow generated successfully',
            workflow: result.workflow,
          },
        ];
        
        setConversation(newConversation);
        setCurrentExplanation(result.explanation || '');
        setPrompt('');
        
        showToast.success(
          currentWorkflow ? 'Workflow refined successfully!' : 'Workflow generated successfully!'
        );
      } else {
        showToast.error(result.error || 'Failed to generate workflow');
      }
    } catch (error: any) {
      console.error('Error:', error);
      showToast.error(error.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (conversation.length > 0) {
      const lastMessage = conversation[conversation.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.workflow) {
        onWorkflowGenerated(lastMessage.workflow, lastMessage.content);
        handleClose();
      }
    }
  };

  const handleClose = () => {
    setPrompt('');
    setConversation([]);
    setCurrentExplanation('');
    onClose();
  };

  const handleStartOver = () => {
    setConversation([]);
    setCurrentExplanation('');
    setPrompt('');
  };

  if (!isOpen) return null;

  const hasWorkflow = conversation.length > 0 && conversation[conversation.length - 1].workflow;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-3xl">🤖</span>
              AI Workflow Builder
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Describe your DeFi workflow in natural language, powered by ASI Alliance
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Conversation History */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {conversation.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💭</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Start with a Prompt
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Describe what you want to do. For example:
              </p>
              <div className="mt-4 space-y-2 text-left max-w-lg mx-auto">
                <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300">
                  "Swap 100 USDC to ETH on Base and supply it to Aave"
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300">
                  "Create a yield farming strategy for my USDC"
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300">
                  "Set up arbitrage between Uniswap and 1inch"
                </div>
              </div>
            </div>
          ) : (
            conversation.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xl flex-shrink-0">
                      {message.role === 'user' ? '👤' : '🤖'}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      {message.workflow && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <div className="text-xs text-gray-400">
                            ✅ Workflow with {message.workflow.nodes?.length || 0} nodes generated
                          </div>
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
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-800">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🤖</span>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-sm text-gray-400">Generating workflow...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 border-t border-gray-700 bg-gray-850">
          <div className="flex gap-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder={
                conversation.length === 0
                  ? "Describe your workflow... (e.g., 'Swap ETH to USDC and supply to Aave')"
                  : "Refine the workflow... (e.g., 'Add slippage protection' or 'Use 1inch instead')"
              }
              className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 resize-none transition-all"
              rows={2}
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Thinking...</span>
                </>
              ) : conversation.length === 0 ? (
                <>
                  <span>✨</span>
                  <span>Generate</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Refine</span>
                </>
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-gray-500">
              Press <kbd className="px-2 py-1 bg-gray-700 rounded">Enter</kbd> to send, <kbd className="px-2 py-1 bg-gray-700 rounded">Shift+Enter</kbd> for new line
            </div>
            <div className="flex gap-2">
              {conversation.length > 0 && (
                <button
                  onClick={handleStartOver}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                >
                  Start Over
                </button>
              )}
              {hasWorkflow && (
                <button
                  onClick={handleApply}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-400 transition-all font-semibold flex items-center gap-2"
                >
                  <span>✓</span>
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
