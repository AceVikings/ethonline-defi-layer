import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/30">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <nav className="flex justify-between items-center mb-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">DeFlow</span>
          </div>
          <div className="flex gap-6 items-center">
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition">Features</a>
            <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition">How It Works</a>
            <a href="#nodes" className="text-slate-600 hover:text-slate-900 transition">Nodes</a>
            <Link 
              to="/app" 
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-lg font-medium hover:shadow-md transition shadow-sm"
            >
              Launch App
            </Link>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto text-center mt-32">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-slate-800 via-blue-600 to-violet-600 bg-clip-text text-transparent">
            Build DeFi Strategies
            <br />
            Like Connecting Blocks
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto">
            Node-based workflow engine for DeFi. Compose strategies with visual nodes, 
            execute trustlessly via Lit Protocol, optimize with AI agents.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/app" 
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-lg font-semibold text-lg hover:shadow-lg transition shadow-md"
            >
              Start Building
            </Link>
            <a 
              href="#how-it-works" 
              className="px-8 py-4 bg-white text-slate-800 rounded-lg font-semibold text-lg hover:bg-slate-50 transition border border-slate-200 shadow-sm"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Feature Cards */}
        <div id="features" className="grid md:grid-cols-3 gap-6 mt-32 max-w-6xl mx-auto">
          <div className="p-8 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Node-Based</h3>
            <p className="text-slate-600">
              Compose complex DeFi strategies by connecting reusable node blocks. Swap, lend, transfer, and automate with AI.
            </p>
          </div>

          <div className="p-8 bg-white border border-slate-200 rounded-xl hover:border-violet-300 hover:shadow-md transition">
            <div className="w-12 h-12 bg-violet-50 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Trustless Execution</h3>
            <p className="text-slate-600">
              Execute via Lit Protocol Vincent abilities with PKP-based delegation. No custody, full control, transparent.
            </p>
          </div>

          <div className="p-8 bg-white border border-slate-200 rounded-xl hover:border-cyan-300 hover:shadow-md transition">
            <div className="w-12 h-12 bg-cyan-50 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">AI-Powered</h3>
            <p className="text-slate-600">
              ASI agents generate strategies, detect market crashes, and suggest optimal workflows based on real-time data.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="mt-32 max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-800">How It Works</h2>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Compose Your Strategy</h3>
                <p className="text-slate-600">
                  Drag and drop nodes on the visual canvas. Connect swap nodes, Aave lending, token transfers, 
                  AI decision nodes, and conditionals to build your workflow.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Simulate & Validate</h3>
                <p className="text-slate-600">
                  The orchestrator runs a dry-run simulation, checking balances, gas costs, approvals, and slippage. 
                  See estimated outcomes before signing.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Execute with PKPs</h3>
                <p className="text-slate-600">
                  Approve the workflow and Vincent Runner executes it using Lit Protocol PKPs with scoped delegation. 
                  Track every step in real-time.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Monitor & Optimize</h3>
                <p className="text-slate-600">
                  ASI agents monitor markets and propose re-entry or hedge strategies based on your policies. 
                  Full audit trail and exportable history.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Node Catalog Preview */}
        <div id="nodes" className="mt-32 max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-slate-800">Available Nodes</h2>
          <p className="text-center text-slate-600 mb-16 max-w-2xl mx-auto">
            Each node is a reusable ability with typed inputs, outputs, and validation
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Swap Node', desc: 'DEX token swaps', color: 'from-blue-500 to-violet-500' },
              { name: 'Aave V3 Node', desc: 'Lend, borrow, supply', color: 'from-violet-500 to-fuchsia-500' },
              { name: 'Transfer Node', desc: 'ERC-20 transfers', color: 'from-cyan-500 to-blue-500' },
              { name: 'AI Node', desc: 'ASI-driven decisions', color: 'from-emerald-500 to-teal-500' },
              { name: 'If/Else Node', desc: 'Conditional branching', color: 'from-amber-500 to-orange-500' },
              { name: 'Oracle Node', desc: 'Price & market data', color: 'from-rose-500 to-pink-500' },
            ].map((node) => (
              <div key={node.name} className="p-6 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-md transition">
                <div className={`w-10 h-10 bg-gradient-to-br ${node.color} rounded-lg mb-3 shadow-sm`}></div>
                <h4 className="font-bold text-slate-800 mb-1">{node.name}</h4>
                <p className="text-sm text-slate-600">{node.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center">
          <div className="max-w-3xl mx-auto p-12 bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-100 rounded-2xl">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Ready to Build?</h2>
            <p className="text-slate-600 mb-8">
              Start composing your first DeFi strategy with DeFlow today
            </p>
            <Link 
              to="/app" 
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-lg font-semibold text-lg hover:shadow-lg transition shadow-md"
            >
              Launch App
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-32 pt-12 border-t border-slate-200 text-center text-slate-500">
          <p className="mb-4">Built with Lit Protocol Vincent, ASI Alliance, and Avail</p>
          <div className="flex gap-6 justify-center">
            <a href="#" className="hover:text-slate-800 transition">Docs</a>
            <a href="#" className="hover:text-slate-800 transition">GitHub</a>
            <a href="#" className="hover:text-slate-800 transition">Discord</a>
          </div>
          <p className="mt-8 text-sm">© 2025 DeFlow. Open source.</p>
        </footer>
      </div>
    </div>
  );
}
