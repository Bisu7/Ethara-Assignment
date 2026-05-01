import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'Todo', assignee_id: '', due_date: '' });

  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'Admin';

  const fetchProjectAndUsers = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get('/users')
      ]);
      setProject(projRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndUsers();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = { ...newTask };
      if (taskData.assignee_id === '') taskData.assignee_id = null;
      if (taskData.due_date === '') taskData.due_date = null;
      
      await api.post(`/projects/${id}/tasks`, taskData);
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', status: 'Todo', assignee_id: '', due_date: '' });
      fetchProjectAndUsers();
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchProjectAndUsers();
    } catch (error) {
      console.error("Failed to update task", error);
      alert("Failed to update task status. Check permissions.");
    }
  };

  if (loading) return <div>Loading project details...</div>;
  if (!project) return <div>Project not found</div>;

  const statuses = ['Todo', 'In Progress', 'Review', 'Done'];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{project.title}</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{project.description}</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowTaskModal(true)}>
            + Add Task
          </button>
        )}
      </div>

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card" style={{ width: '400px' }}>
            <h3>Add New Task</h3>
            <form onSubmit={handleCreateTask} style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  rows={2}
                />
              </div>
              <div className="form-group">
                <label>Assignee</label>
                <select 
                  value={newTask.assignee_id}
                  onChange={e => setNewTask({...newTask, assignee_id: e.target.value})}
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input 
                  type="date" 
                  value={newTask.due_date}
                  onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn-outline" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="board">
        {statuses.map(status => {
          const columnTasks = project.tasks.filter(t => t.status === status);
          
          return (
            <div key={status} className="board-column">
              <div className="board-column-header">
                {status}
                <span className="badge" style={{ background: '#eee' }}>{columnTasks.length}</span>
              </div>
              
              <div className="task-list">
                {columnTasks.map(task => (
                  <div key={task.id} className="task-card">
                    <div className="task-title">{task.title}</div>
                    {task.description && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        {task.description}
                      </p>
                    )}
                    <div className="task-meta">
                      <span>{users.find(u => u.id === task.assignee_id)?.full_name || 'Unassigned'}</span>
                      {task.due_date && (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: new Date(task.due_date) < new Date() ? 'var(--accent-color)' : 'inherit',
                          fontWeight: new Date(task.due_date) < new Date() ? '600' : 'normal'
                        }}>
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    {/* Simplified status mover */}
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {statuses.map(s => (
                        s !== status && (
                          <button 
                            key={s} 
                            onClick={() => updateTaskStatus(task.id, s)}
                            style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem', border: '1px solid #ddd', borderRadius: '4px', background: '#f5f5f5' }}
                          >
                            Move to {s}
                          </button>
                        )
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectDetail;
