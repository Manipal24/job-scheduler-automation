import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState({ status: '', priority: '' });
  const [formData, setFormData] = useState({ taskName: '', payload: '{}', priority: 'Medium' });
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.priority) params.append('priority', filter.priority);
      const response = await axios.get(`${API_URL}/jobs?${params}`);
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = JSON.parse(formData.payload);
      await axios.post(`${API_URL}/jobs`, {
        taskName: formData.taskName,
        payload,
        priority: formData.priority
      });
      setFormData({ taskName: '', payload: '{}', priority: 'Medium' });
      fetchJobs();
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Invalid JSON in payload');
    } finally {
      setLoading(false);
    }
  };

  const handleRunJob = async (jobId) => {
    try {
      await axios.post(`${API_URL}/run-job/${jobId}`);
      setTimeout(fetchJobs, 500);
    } catch (error) {
      console.error('Error running job:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Job Scheduler Dashboard</h1>
        
        {/* Create Job Form */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Create New Job</h2>
          <form onSubmit={handleCreateJob} className="space-y-4">
            <input
              type="text"
              placeholder="Task Name"
              value={formData.taskName}
              onChange={(e) => setFormData({...formData, taskName: e.target.value})}
              required
              className="w-full bg-gray-700 p-2 rounded text-white"
            />
            <textarea
              placeholder="JSON Payload"
              value={formData.payload}
              onChange={(e) => setFormData({...formData, payload: e.target.value})}
              className="w-full bg-gray-700 p-2 rounded text-white h-20"
            />
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              className="w-full bg-gray-700 p-2 rounded text-white"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              Create Job
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 p-4 rounded-lg mb-8 flex gap-4">
          <select
            value={filter.status}
            onChange={(e) => setFilter({...filter, status: e.target.value})}
            className="bg-gray-700 p-2 rounded text-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filter.priority}
            onChange={(e) => setFilter({...filter, priority: e.target.value})}
            className="bg-gray-700 p-2 rounded text-white"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Jobs Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Task Name</th>
                <th className="p-4 text-left">Priority</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-t border-gray-700 hover:bg-gray-700">
                  <td className="p-4">{job.id}</td>
                  <td className="p-4">{job.taskName}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded ${
                      job.priority === 'High' ? 'bg-red-600' :
                      job.priority === 'Medium' ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}>
                      {job.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded ${
                      job.status === 'pending' ? 'bg-blue-600' :
                      job.status === 'running' ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="p-4 space-x-2">
                    {job.status === 'pending' && (
                      <button
                        onClick={() => handleRunJob(job.id)}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                      >
                        Run
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Job Detail Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Job Details</h2>
              <div className="space-y-2 mb-4">
                <p><strong>ID:</strong> {selectedJob.id}</p>
                <p><strong>Task:</strong> {selectedJob.taskName}</p>
                <p><strong>Priority:</strong> {selectedJob.priority}</p>
                <p><strong>Status:</strong> {selectedJob.status}</p>
                <p><strong>Payload:</strong></p>
                <pre className="bg-gray-700 p-2 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(JSON.parse(selectedJob.payload || '{}'), null, 2)}
                </pre>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded w-full"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
