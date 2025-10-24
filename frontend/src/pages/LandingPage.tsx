import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0b] via-[#18181b] to-[#0a0a0b]">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <nav className="flex justify-between items-center mb-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="text-2xl font-bold text-white">NodeFlow</span>
          </div>
          <div className="flex gap-6 items-center">
            <a href="#features" className="text-gray-400 hover:text-white transition">Features</a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition">How It Works</a>
            <a href="#nodes" className="text-gray-400 hover:text-white transition">Nodes</a>
            <Link 
              to="/app" 
              className="px-6 py-2.5 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-lg font-medium hover:opacity-90 transition"
            >
              Launch App
            </Link>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto text-center mt-32">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white via-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
            Build DeFi Strategies
            <br />
            Like Connecting Blocks
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Node-based workflow engine for DeFi. Compose strategies with visual nodes, 
            execute trustlessly via Lit Protocol, optimize with AI agents.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/app" 
              className="px-8 py-4 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-lg font-semibold text-lg hover:opacity-90 transition shadow-lg shadow-[#6366f1]/25"
            >
              Start Building
            </Link>
            <a 
              href="#how-it-works" 
              className="px-8 py-4 bg-[#27272a] text-white rounded-lg font-semibold text-lg hover:bg-[#3f3f46] transition"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Feature Cards */}
        <div id="features" className="grid md:grid-cols-3 gap-6 mt-32 max-w-6xl mx-auto">
          <div className="p-8 bg-[#18181b] border border-[#27272a] rounded-xl hover:border-[#6366f1]/50 transition">
            <div className="w-12 h-12 bg-[#6366f1]/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Node-Based</h3>
            <p className="text-gray-400">
              Compose complex DeFi strategies by connecting reusable node blocks. Swap, lend, transfer, and automate with AI.
            </p>
          </div>

          <div className="p-8 bg-[#18181b] border border-[#27272a] rounded-xl hover:border-[#8b5cf6]/50 transition">
            <div className="w-12 h-12 bg-[#8b5cf6]/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Trustless Execution</h3>
            <p className="text-gray-400">
              Execute via Lit Protocol Vincent abilities with PKP-based delegation. No custody, full control, transparent.
            </p>
          </div>

          <div className="p-8 bg-[#18181b] border border-[#27272a] rounded-xl hover:border-[#06b6d4]/50 transition">
            <div className="w-12 h-12 bg-[#06b6d4]/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#06b6d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI-Powered</h3>
            <p className="text-gray-400">
              ASI agents generate strategies, detect market crashes, and suggest optimal workflows based on real-time data.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="mt-32 max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">How It Works</h2>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Compose Your Strategy</h3>
                <p className="text-gray-400">
                  Drag and drop nodes on the visual canvas. Connect swap nodes, Aave lending, token transfers, 
                  AI decision nodes, and conditionals to build your workflow.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Simulate & Validate</h3>
                <p className="text-gray-400">
                  The orchestrator runs a dry-run simulation, checking balances, gas costs, approvals, and slippage. 
                  See estimated outcomes before signing.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Execute with PKPs</h3>
                <p className="text-gray-400">
                  Approve the workflow and Vincent Runner executes it using Lit Protocol PKPs with scoped delegation. 
                  Track every step in real-time.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-full flex items-center justify-center text-white font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Monitor & Optimize</h3>
                <p className="text-gray-400">
                  ASI agents monitor markets and propose re-entry or hedge strategies based on your policies. 
                  Full audit trail and exportable history.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Node Catalog Preview */}
        <div id="nodes" className="mt-32 max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Available Nodes</h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            Each node is a reusable ability with typed inputs, outputs, and validation
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Swap Node', desc: 'DEX token swaps', color: 'from-[#6366f1] to-[#8b5cf6]' },
              { name: 'Aave V3 Node', desc: 'Lend, borrow, supply', color: 'from-[#8b5cf6] to-[#ec4899]' },
              { name: 'Transfer Node', desc: 'ERC-20 transfers', color: 'from-[#06b6d4] to-[#06b6d4]' },
              { name: 'AI Node', desc: 'ASI-driven decisions', color: 'from-[#10b981] to-[#059669]' },
              { name: 'If/Else Node', desc: 'Conditional branching', color: 'from-[#f59e0b] to-[#d97706]' },
              { name: 'Oracle Node', desc: 'Price & market data', color: 'from-[#ef4444] to-[#dc2626]' },
            ].map((node) => (
              <div key={node.name} className="p-6 bg-[#18181b] border border-[#27272a] rounded-lg hover:border-[#6366f1]/30 transition">
                <div className={`w-10 h-10 bg-gradient-to-br ${node.color} rounded-lg mb-3`}></div>
                <h4 className="font-bold text-white mb-1">{node.name}</h4>
                <p className="text-sm text-gray-400">{node.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center">
          <div className="max-w-3xl mx-auto p-12 bg-gradient-to-br from-[#6366f1]/10 to-[#8b5cf6]/10 border border-[#6366f1]/20 rounded-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Build?</h2>
            <p className="text-gray-400 mb-8">
              Start composing your first DeFi strategy with NodeFlow today
            </p>
            <Link 
              to="/app" 
              className="inline-block px-8 py-4 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-lg font-semibold text-lg hover:opacity-90 transition shadow-lg shadow-[#6366f1]/25"
            >
              Launch App
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-32 pt-12 border-t border-[#27272a] text-center text-gray-500">
          <p className="mb-4">Built with Lit Protocol Vincent, ASI Alliance, and Avail</p>
          <div className="flex gap-6 justify-center">
            <a href="#" className="hover:text-white transition">Docs</a>
            <a href="#" className="hover:text-white transition">GitHub</a>
            <a href="#" className="hover:text-white transition">Discord</a>
          </div>
          <p className="mt-8 text-sm">© 2025 NodeFlow. Open source.</p>
        </footer>
      </div>
    </div>
  );
}
