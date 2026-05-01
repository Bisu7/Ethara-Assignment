import { useState, useEffect } from 'react';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!stats) return <div>Failed to load stats.</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-card-title">Total Projects</div>
          <div className="stat-card-value">{stats.total_projects}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Total Tasks</div>
          <div className="stat-card-value">{stats.total_tasks}</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'var(--accent-color)' }}>
          <div className="stat-card-title" style={{ color: 'var(--accent-color)' }}>Overdue Tasks</div>
          <div className="stat-card-value">{stats.overdue_tasks}</div>
        </div>
      </div>

      <h2>Tasks by Status</h2>
      <div className="dashboard-stats" style={{ marginTop: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-card-title">To Do</div>
          <div className="stat-card-value">{stats.tasks_by_status['Todo']}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">In Progress</div>
          <div className="stat-card-value">{stats.tasks_by_status['In Progress']}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Review</div>
          <div className="stat-card-value">{stats.tasks_by_status['Review']}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Done</div>
          <div className="stat-card-value">{stats.tasks_by_status['Done']}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
