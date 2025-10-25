import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { apiClient } from '../lib/apiClient';
import { showToast, CustomToaster } from '../lib/toast';

// Custom node component with dynamic handles based on node type
const CustomNode = ({ data }: any) => {
  const nodeType = NODE_TYPES.find(n => n.type === data.type) || NODE_TYPES[0];
  const isTrigger = data.type === 'trigger';
  const isCondition = data.type === 'condition';
  
  return (
    <div className={`bg-white rounded-lg shadow-lg border-2 border-gray-300 hover:border-orange-400 transition-all min-w-[200px]`}>
      {/* Input handle (all nodes except trigger) */}
      {!isTrigger && (
        <Handle 
          type="target" 
          position={Position.Top} 
          className="w-3 h-3 !bg-orange-500"
          id="input"
        />
      )}
      
      <div className={`bg-gradient-to-br ${nodeType.color} px-4 py-2 rounded-t-lg text-white`}>
        <div className="font-semibold text-sm">{data.label}</div>
      </div>
      
      <div className="px-4 py-3 bg-white rounded-b-lg">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{nodeType.label}</div>
        <div className="text-xs text-gray-600">{nodeType.description}</div>
        {data.config && Object.keys(data.config).length > 0 && (
          <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
            {Object.keys(data.config).length} configuration{Object.keys(data.config).length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      
      {/* Output handles - condition node has two (true/false), others have one */}
      {isCondition ? (
        <>
          <Handle 
            type="source" 
            position={Position.Left} 
            id="true"
            className="w-3 h-3 !bg-green-500"
            style={{ left: '-6px', top: '50%' }}
          />
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-green-600 bg-white px-1 rounded pointer-events-none">
            TRUE
          </div>
          
          <Handle 
            type="source" 
            position={Position.Right} 
            id="false"
            className="w-3 h-3 !bg-red-500"
            style={{ right: '-6px', top: '50%' }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-600 bg-white px-1 rounded pointer-events-none">
            FALSE
          </div>
        </>
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
    type: 'trigger',
    label: 'Trigger',
    icon: 'trigger',
    color: 'from-yellow-400 to-orange-500',
    description: 'Start the workflow execution',
  },
  {
    type: 'swap',
    label: 'Token Swap',
    icon: 'swap',
    color: 'from-blue-400 to-blue-600',
    description: 'Exchange tokens on DEX',
  },
  {
    type: 'aave',
    label: 'Aave Protocol',
    icon: 'aave',
    color: 'from-purple-400 to-purple-600',
    description: 'Supply or borrow assets',
  },
  {
    type: 'transfer',
    label: 'Token Transfer',
    icon: 'transfer',
    color: 'from-green-400 to-green-600',
    description: 'Send tokens to address',
  },
  {
    type: 'condition',
    label: 'Conditional',
    icon: 'condition',
    color: 'from-pink-400 to-pink-600',
    description: 'If/else branching logic',
  },
  {
    type: 'ai',
    label: 'AI Agent',
    icon: 'ai',
    color: 'from-indigo-400 to-indigo-600',
    description: 'AI-powered decision making',
  },
];

// Configuration Components for each node type
const TriggerConfig = ({ config, onUpdate }: { config: any; onUpdate: (config: any) => void }) => {
  const triggerType = config.triggerType || 'manual';
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Trigger Type</label>
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
      
      {triggerType === 'scheduled' && (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">Interval</label>
          <input
            type="text"
            value={config.interval || ''}
            onChange={(e) => onUpdate({ ...config, interval: e.target.value })}
            placeholder="e.g., every 1 hour"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
          />
        </div>
      )}
      
      {triggerType === 'price' && (
        <>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Token</label>
            <input
              type="text"
              value={config.token || ''}
              onChange={(e) => onUpdate({ ...config, token: e.target.value })}
              placeholder="ETH, BTC, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Target Price ($)</label>
            <input
              type="number"
              value={config.targetPrice || ''}
              onChange={(e) => onUpdate({ ...config, targetPrice: e.target.value })}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>
        </>
      )}
    </div>
  );
};

const SwapConfig = ({ config, onUpdate }: { config: any; onUpdate: (config: any) => void }) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">From Token</label>
        <input
          type="text"
          value={config.fromToken || ''}
          onChange={(e) => onUpdate({ ...config, fromToken: e.target.value })}
          placeholder="e.g., USDC"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">To Token</label>
        <input
          type="text"
          value={config.toToken || ''}
          onChange={(e) => onUpdate({ ...config, toToken: e.target.value })}
          placeholder="e.g., ETH"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Amount</label>
        <input
          type="text"
          value={config.amount || ''}
          onChange={(e) => onUpdate({ ...config, amount: e.target.value })}
          placeholder="0.00"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Slippage (%)</label>
        <input
          type="number"
          value={config.slippage || '0.5'}
          onChange={(e) => onUpdate({ ...config, slippage: e.target.value })}
          placeholder="0.5"
          step="0.1"
          min="0.1"
          max="5"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">DEX</label>
        <select
          value={config.dex || 'uniswap'}
          onChange={(e) => onUpdate({ ...config, dex: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        >
          <option value="uniswap">Uniswap</option>
          <option value="sushiswap">Sushiswap</option>
          <option value="1inch">1inch</option>
        </select>
      </div>
    </div>
  );
};

const AaveConfig = ({ config, onUpdate }: { config: any; onUpdate: (config: any) => void }) => {
  const action = config.action || 'supply';
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Action</label>
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
        <label className="block text-xs font-semibold text-gray-700 mb-2">Asset</label>
        <input
          type="text"
          value={config.asset || ''}
          onChange={(e) => onUpdate({ ...config, asset: e.target.value })}
          placeholder="e.g., USDC, ETH, DAI"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Amount</label>
        <input
          type="text"
          value={config.amount || ''}
          onChange={(e) => onUpdate({ ...config, amount: e.target.value })}
          placeholder="0.00"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>
      
      {action === 'supply' && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="useAsCollateral"
            checked={config.useAsCollateral || false}
            onChange={(e) => onUpdate({ ...config, useAsCollateral: e.target.checked })}
            className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
          />
          <label htmlFor="useAsCollateral" className="text-xs font-semibold text-gray-700">
            Use as collateral
          </label>
        </div>
      )}
    </div>
  );
};

const TransferConfig = ({ config, onUpdate }: { config: any; onUpdate: (config: any) => void }) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Token</label>
        <input
          type="text"
          value={config.token || ''}
          onChange={(e) => onUpdate({ ...config, token: e.target.value })}
          placeholder="e.g., USDC, ETH"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Recipient Address</label>
        <input
          type="text"
          value={config.recipient || ''}
          onChange={(e) => onUpdate({ ...config, recipient: e.target.value })}
          placeholder="0x..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none font-mono"
        />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Amount</label>
        <input
          type="text"
          value={config.amount || ''}
          onChange={(e) => onUpdate({ ...config, amount: e.target.value })}
          placeholder="0.00"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>
    </div>
  );
};

const ConditionConfig = ({ config, onUpdate }: { config: any; onUpdate: (config: any) => void }) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Left Value</label>
        <input
          type="text"
          value={config.leftValue || ''}
          onChange={(e) => onUpdate({ ...config, leftValue: e.target.value })}
          placeholder="e.g., balance, price"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Operator</label>
        <select
          value={config.operator || '>'}
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
        <label className="block text-xs font-semibold text-gray-700 mb-2">Right Value</label>
        <input
          type="text"
          value={config.rightValue || ''}
          onChange={(e) => onUpdate({ ...config, rightValue: e.target.value })}
          placeholder="e.g., 1000, 0.5"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>
      
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <span className="font-semibold">Preview:</span> If {config.leftValue || '...'} {config.operator || '>'} {config.rightValue || '...'} then TRUE branch, else FALSE branch
        </p>
      </div>
    </div>
  );
};

const AIConfig = ({ config, onUpdate }: { config: any; onUpdate: (config: any) => void }) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">System Prompt</label>
        <textarea
          value={config.systemPrompt || ''}
          onChange={(e) => onUpdate({ ...config, systemPrompt: e.target.value })}
          placeholder="You are a DeFi assistant..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none resize-none"
        />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">User Prompt Template</label>
        <textarea
          value={config.userPrompt || ''}
          onChange={(e) => onUpdate({ ...config, userPrompt: e.target.value })}
          placeholder="Analyze this data: {data}"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none resize-none"
        />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Output Format</label>
        <select
          value={config.outputFormat || 'text'}
          onChange={(e) => onUpdate({ ...config, outputFormat: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
        >
          <option value="text">Text</option>
          <option value="json">JSON</option>
          <option value="number">Number</option>
          <option value="boolean">Boolean</option>
        </select>
      </div>
      
      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-xs text-purple-800">
          Use <span className="font-mono bg-purple-100 px-1 rounded">{'{variable}'}</span> syntax to reference previous node outputs
        </p>
      </div>
    </div>
  );
};

// Render appropriate config component based on node type
const NodeConfigPanel = ({ nodeType, config, onUpdate }: { nodeType: string; config: any; onUpdate: (config: any) => void }) => {
  switch (nodeType) {
    case 'trigger':
      return <TriggerConfig config={config} onUpdate={onUpdate} />;
    case 'swap':
      return <SwapConfig config={config} onUpdate={onUpdate} />;
    case 'aave':
      return <AaveConfig config={config} onUpdate={onUpdate} />;
    case 'transfer':
      return <TransferConfig config={config} onUpdate={onUpdate} />;
    case 'condition':
      return <ConditionConfig config={config} onUpdate={onUpdate} />;
    case 'ai':
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
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showNodePalette, setShowNodePalette] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    if (id && id !== 'new') {
      loadWorkflow(id);
    }
  }, [id]);

  const loadWorkflow = async (workflowId: string) => {
    try {
      const response = await apiClient.getWorkflow(workflowId);
      const workflow = response.workflow;
      setWorkflowName(workflow.name);
      setWorkflowDescription(workflow.description || '');
      
      // Convert stored nodes to React Flow format
      const flowNodes = workflow.nodes.map((node: any) => ({
        id: node.id,
        type: 'custom',
        position: { x: node.x || 0, y: node.y || 0 },
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
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#f97316', strokeWidth: 2 },
      }));
      
      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (error) {
      console.error('Failed to load workflow:', error);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#f97316', strokeWidth: 2 },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const addNode = useCallback((type: string) => {
    const nodeType = NODE_TYPES.find(n => n.type === type);
    if (!nodeType) return;

    // Check if trying to add a trigger when one already exists
    if (type === 'trigger') {
      const existingTrigger = nodes.find(node => node.data.type === 'trigger');
      if (existingTrigger) {
        showToast.warning('Only one trigger node is allowed per workflow');
        return;
      }
    }

    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'custom',
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
  }, [setNodes, nodes]);

  // Handle drag and drop from palette
  const onDragStart = useCallback((event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const nodeType = NODE_TYPES.find(n => n.type === type);
      
      if (!nodeType) return;

      // Check if trying to add a trigger when one already exists
      if (type === 'trigger') {
        const existingTrigger = nodes.find(node => node.data.type === 'trigger');
        if (existingTrigger) {
          showToast.warning('Only one trigger node is allowed per workflow');
          return;
        }
      }

      // Get the React Flow viewport bounds
      const reactFlowBounds = (event.target as HTMLElement).getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: 'custom',
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

  const updateNodeLabel = useCallback((nodeId: string, newLabel: string) => {
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
  }, [setNodes, selectedNode]);

  const updateNodeConfig = useCallback((nodeId: string, newConfig: any) => {
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
  }, [setNodes, selectedNode]);

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id)
      );
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  const saveWorkflow = async () => {
    if (!workflowName.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    setSaving(true);
    try {
      // Convert React Flow nodes back to our format
      const workflowNodes = nodes.map((node) => ({
        id: node.id,
        type: node.data.type,
        label: node.data.label,
        x: node.position.x,
        y: node.position.y,
        config: node.data.config || {},
      }));

      // Convert React Flow edges back to our format
      const workflowEdges = edges.map((edge) => ({
        id: edge.id,
        from: edge.source,
        to: edge.target,
      }));

      const workflowData = {
        name: workflowName,
        description: workflowDescription,
        nodes: workflowNodes,
        edges: workflowEdges,
        isActive: false,
      };

      if (id && id !== 'new') {
        await apiClient.updateWorkflow(id, workflowData);
      } else {
        await apiClient.createWorkflow(workflowData);
      }

      navigate('/app');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Failed to save workflow. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/40 to-slate-100 flex flex-col">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="max-w-full px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/app')}
                className="text-gray-600 hover:text-gray-900 transition"
                title="Back to Dashboard"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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
                <span className="font-semibold">{nodes.length}</span> nodes • <span className="font-semibold">{edges.length}</span> connections
              </div>
              <button
                onClick={() => setShowNodePalette(!showNodePalette)}
                className={`px-4 py-2 font-semibold rounded-lg transition ${
                  showNodePalette
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showNodePalette ? '← Hide' : 'Show'} Nodes
              </button>
              <button
                onClick={saveWorkflow}
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Workflow'}
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
                <h2 className="text-xl font-black text-gray-900 mb-2">Add Nodes</h2>
                <p className="text-sm text-gray-600">Drag or click to add nodes to your workflow</p>
              </div>
              <div className="space-y-3">
                {NODE_TYPES.map((nodeType) => {
                  const isTrigger = nodeType.type === 'trigger';
                  const hasTrigger = nodes.some(node => node.data.type === 'trigger');
                  const isDisabled = isTrigger && hasTrigger;
                  
                  return (
                    <div
                      key={nodeType.type}
                      draggable={!isDisabled}
                      onDragStart={(e) => !isDisabled && onDragStart(e, nodeType.type)}
                      onClick={() => !isDisabled && addNode(nodeType.type)}
                      className={`group relative overflow-hidden bg-white border-2 rounded-xl transition-all duration-200 ${
                        isDisabled 
                          ? 'border-gray-200 opacity-50 cursor-not-allowed' 
                          : 'border-gray-200 hover:border-orange-400 hover:shadow-xl cursor-move'
                      }`}
                    >
                      {/* Gradient background accent */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${nodeType.color} opacity-0 group-hover:opacity-5 transition-opacity duration-200`} />
                      
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
                        <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${nodeType.color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-200`}>
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
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Bottom accent line */}
                    <div className={`h-1 bg-gradient-to-r ${nodeType.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200`} />
                  </div>
                  );
                })}
              </div>

              {nodes.length === 0 && (
                <div className="mt-8 p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-orange-900 font-bold mb-1">Get Started</p>
                      <p className="text-xs text-orange-800 leading-relaxed">
                        Drag nodes onto the canvas or click to add them to your workflow
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
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#f97316', strokeWidth: 2 },
            }}
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#d1d5db" />
            <Controls className="bg-white border-2 border-gray-200 rounded-lg shadow-lg" />
            <MiniMap
              className="bg-white border-2 border-gray-200 rounded-lg shadow-lg"
              nodeColor={(node) => {
                const nodeType = NODE_TYPES.find(n => n.type === node.data.type);
                return nodeType ? '#f97316' : '#94a3b8';
              }}
            />
            
            {/* Empty State Panel */}
            {nodes.length === 0 && (
              <Panel position="top-center" className="bg-white rounded-xl shadow-2xl p-8 border-2 border-gray-200 max-w-md">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl mx-auto mb-6 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                    DF
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">Build Your First Workflow</h3>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    Drag nodes from the sidebar onto the canvas or click to add them to your DeFi automation workflow
                  </p>
                  <button
                    onClick={() => setShowNodePalette(true)}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-lg hover:shadow-xl transition-all duration-200 text-sm inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Node Type</label>
                  <div className={`px-4 py-3 bg-gradient-to-br ${NODE_TYPES.find(n => n.type === selectedNode.data.type)?.color} text-white rounded-lg font-semibold text-sm`}>
                    {NODE_TYPES.find(n => n.type === selectedNode.data.type)?.label}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Node Name</label>
                  <input
                    type="text"
                    value={selectedNode.data.label as string}
                    onChange={(e) => updateNodeLabel(selectedNode.id, e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition text-sm"
                    placeholder="Enter node name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Configuration</label>
                  <NodeConfigPanel 
                    nodeType={selectedNode.data.type as string}
                    config={selectedNode.data.config || {}}
                    onUpdate={(newConfig) => updateNodeConfig(selectedNode.id, newConfig)}
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
    </div>
  );
}
