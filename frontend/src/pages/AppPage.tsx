import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { apiClient } from '../lib/apiClient';
import { showToast } from '../lib/toast';

interface Workflow {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  nodes: any[];
  edges: any[];
  createdAt: string;
  updatedAt: string;
}

interface ExecutionHistory {
  _id: string;
  workflow: {
    _id: string;
    name: string;
  };
  status: 'success' | 'failed' | 'pending';
  startedAt: string;
  completedAt?: string;
  errorMessages?: string[];
}

export default function AppPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<ExecutionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [workflowsRes, executionsRes] = await Promise.all([
        apiClient.getWorkflows(),
        apiClient.getAllExecutions(),
      ]);
      setWorkflows(workflowsRes.workflows || []);
      setExecutions(executionsRes.executions || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkflows = workflows.filter((w) => {
    if (activeTab === 'active') return w.isActive;
    if (activeTab === 'inactive') return !w.isActive;
    return true;
  });

  const toggleWorkflowStatus = async (workflowId: string, currentStatus: boolean) => {
    try {
      await apiClient.patchWorkflow(workflowId, { isActive: !currentStatus });
      setWorkflows(workflows.map(w => 
        w._id === workflowId ? { ...w, isActive: !currentStatus } : w
      ));
      showToast.success(`Workflow ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Failed to toggle workflow status:', error);
      showToast.error('Failed to update workflow status');
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    // Use a custom confirmation instead of browser confirm
    const workflow = workflows.find(w => w._id === workflowId);
    if (!workflow) return;
    
    // For now, we'll proceed with deletion
    // TODO: Implement a custom modal confirmation
    try {
      await apiClient.deleteWorkflow(workflowId);
      setWorkflows(workflows.filter(w => w._id !== workflowId));
      showToast.success('Workflow deleted successfully');
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      showToast.error('Failed to delete workflow');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/40 to-slate-100">
        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                </div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">DeFlow</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <div className="text-gray-500">Connected</div>
                  <div className="font-mono text-xs text-gray-900">
                    {user?.ethAddress.slice(0, 6)}...{user?.ethAddress.slice(-4)}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-orange-600 transition"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                Workflows Dashboard
              </h1>
              <p className="text-gray-600">
                Manage and monitor your DeFi automation workflows
              </p>
            </div>
            <button
              onClick={() => navigate('/workflow/new')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-lg hover:shadow-lg transition transform hover:scale-105"
            >
              + Create Workflow
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Workflows Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-blue-100">Total Workflows</span>
                </div>
                <p className="text-4xl font-bold mb-1">{workflows.length}</p>
                <p className="text-xs text-blue-100">All time created</p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            </div>

            {/* Active Workflows Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-green-100">Active</span>
                </div>
                <p className="text-4xl font-bold mb-1">{workflows.filter(w => w.isActive).length}</p>
                <p className="text-xs text-green-100">Currently running</p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            </div>

            {/* Total Executions Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-purple-100">Executions</span>
                </div>
                <p className="text-4xl font-bold mb-1">{executions.length}</p>
                <p className="text-xs text-purple-100">Total runs</p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            </div>

            {/* Success Rate Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-6 text-white">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-orange-100">Success Rate</span>
                </div>
                <p className="text-4xl font-bold mb-1">
                  {executions.length > 0 
                    ? Math.round((executions.filter(e => e.status === 'success').length / executions.length) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-orange-100">
                  {executions.filter(e => e.status === 'success').length} of {executions.length} successful
                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            </div>
          </div>

          {/* Workflows Section */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-gray-900">Your Workflows</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${
                      activeTab === 'all'
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All ({workflows.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${
                      activeTab === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Active ({workflows.filter(w => w.isActive).length})
                  </button>
                  <button
                    onClick={() => setActiveTab('inactive')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${
                      activeTab === 'inactive'
                        ? 'bg-gray-200 text-gray-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Inactive ({workflows.filter(w => !w.isActive).length})
                  </button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-12 text-center text-gray-500">
                  Loading workflows...
                </div>
              ) : filteredWorkflows.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No workflows yet</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first workflow</p>
                  <button
                    onClick={() => navigate('/workflow/new')}
                    className="px-6 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition"
                  >
                    Create Workflow
                  </button>
                </div>
              ) : (
                filteredWorkflows.map((workflow) => (
                  <div key={workflow._id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{workflow.name}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              workflow.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {workflow.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{workflow.description || 'No description'}</p>
                        <div className="flex gap-6 text-sm text-gray-500">
                          <span>
                            <strong>{workflow.nodes.length}</strong> nodes
                          </span>
                          <span>
                            Created {new Date(workflow.createdAt).toLocaleDateString()}
                          </span>
                          <span>
                            Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleWorkflowStatus(workflow._id, workflow.isActive)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm ${
                            workflow.isActive
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {workflow.isActive ? 'Pause' : 'Activate'}
                        </button>
                        <button
                          onClick={() => navigate(`/workflow/${workflow._id}`)}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium text-sm hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteWorkflow(workflow._id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium text-sm hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Executions */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-black text-gray-900">Recent Executions</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {executions.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No executions yet
                </div>
              ) : (
                executions.slice(0, 10).map((execution) => (
                  <div key={execution._id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {execution.workflow?.name || 'Unknown Workflow'}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              execution.status === 'success'
                                ? 'bg-green-100 text-green-700'
                                : execution.status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {execution.status}
                          </span>
                        </div>
                        <div className="flex gap-6 text-sm text-gray-500">
                          <span>
                            Started {new Date(execution.startedAt).toLocaleString()}
                          </span>
                          {execution.completedAt && (
                            <span>
                              Completed {new Date(execution.completedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                        {execution.errorMessages && execution.errorMessages.length > 0 && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800 font-medium mb-1">Errors:</p>
                            <ul className="text-sm text-red-700 list-disc list-inside">
                              {execution.errorMessages.map((err, idx) => (
                                <li key={idx}>{err}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
