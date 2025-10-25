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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border-2 border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-br from-amber-50 via-orange-50/40 to-slate-100 border-b-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-gray-900">Create New Workflow</h2>
              <p className="text-gray-600 mt-1 font-medium">
                Choose how you'd like to build your DeFi automation
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 transition-colors"
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
        </div>

        {/* Options */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Option */}
          <button
            onClick={onStartWithAI}
            className="group relative overflow-hidden bg-white border-2 border-gray-200 hover:border-blue-400 rounded-xl p-8 text-left transition-all duration-200 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1"
          >
            {/* Gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-200">
                <svg
                  className="w-8 h-8 text-white"
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
              <h3 className="text-2xl font-black text-gray-900 group-hover:text-white mb-3 transition-colors">
                Start with AI
              </h3>
              <p className="text-gray-600 group-hover:text-blue-50 text-sm leading-relaxed transition-colors">
                Describe your workflow in natural language and let AI generate the nodes and
                connections for you. Perfect for quick prototyping.
              </p>
              <div className="mt-6 inline-flex items-center text-sm text-blue-600 group-hover:text-white font-bold transition-colors">
                <span>Get Started</span>
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-200"
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
              </div>
            </div>
          </button>

          {/* Manual Option */}
          <button
            onClick={onBuildManually}
            className="group relative overflow-hidden bg-white border-2 border-gray-200 hover:border-orange-400 rounded-xl p-8 text-left transition-all duration-200 hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-1"
          >
            {/* Gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-200">
                <svg
                  className="w-8 h-8 text-white"
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
              <h3 className="text-2xl font-black text-gray-900 group-hover:text-white mb-3 transition-colors">
                Build Manually
              </h3>
              <p className="text-gray-600 group-hover:text-orange-50 text-sm leading-relaxed transition-colors">
                Start with a blank canvas and drag-and-drop nodes to create your workflow. Full
                control over every connection and configuration.
              </p>
              <div className="mt-6 inline-flex items-center text-sm text-orange-600 group-hover:text-white font-bold transition-colors">
                <span>Open Canvas</span>
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-200"
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
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t-2 border-gray-200">
          <p className="text-sm text-gray-600 text-center font-medium">
            💡 You can always switch between AI and manual editing at any time
          </p>
        </div>
      </div>
    </div>
  );
};
