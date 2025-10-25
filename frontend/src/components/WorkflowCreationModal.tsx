import React from 'react';

interface WorkflowCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartWithAI: () => void;
  onBuildManually: () => void;
}

export const WorkflowCreationModal: React.FC<WorkflowCreationModalProps> = ({
  isOpen,
  onClose,
  onStartWithAI,
  onBuildManually,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 border border-gray-800">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Create New Workflow</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-gray-400 mt-2">
            Choose how you'd like to build your DeFi workflow
          </p>
        </div>

        {/* Options */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* AI Option */}
          <button
            onClick={onStartWithAI}
            className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl p-8 text-left transition-all duration-300 border-2 border-transparent hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/20"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
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
              <h3 className="text-xl font-bold text-white mb-2">Start with AI</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Describe your workflow in natural language and let AI generate the nodes and
                connections for you. Perfect for quick prototyping.
              </p>
              <div className="mt-4 flex items-center text-xs text-blue-200 font-semibold">
                <span>Get Started</span>
                <svg
                  className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </button>

          {/* Manual Option */}
          <button
            onClick={onBuildManually}
            className="group relative overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-xl p-8 text-left transition-all duration-300 border-2 border-transparent hover:border-gray-500 hover:shadow-xl hover:shadow-gray-500/20"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Build Manually</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Start with a blank canvas and drag-and-drop nodes to create your workflow. Full
                control over every connection and configuration.
              </p>
              <div className="mt-4 flex items-center text-xs text-gray-300 font-semibold">
                <span>Open Canvas</span>
                <svg
                  className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-800 bg-gray-850 rounded-b-2xl">
          <p className="text-xs text-gray-500 text-center">
            You can always switch between AI and manual editing at any time
          </p>
        </div>
      </div>
    </div>
  );
};
