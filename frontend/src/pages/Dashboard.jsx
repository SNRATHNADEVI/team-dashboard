import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FolderKanban, CheckCircle, Clock } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats?user_id=${user.id}`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Projects', value: stats?.total_projects || 0, icon: FolderKanban, color: '#3B82F6' },
    { title: 'Total Tasks', value: stats?.total_tasks || 0, icon: CheckCircle, color: '#10B981' },
    { title: 'Team Members', value: stats?.total_members || 0, icon: Users, color: '#F59E0B' },
    { title: 'Kudos Balance', value: stats?.kudos_balance || 0, icon: Users, color: '#FFD700' },
  ];

  if (user.role !== 'Admin') {
    statCards.splice(2, 1, 
      { title: 'My Tasks', value: stats?.my_tasks || 0, icon: CheckCircle, color: '#8B5CF6' },
      { title: 'My Projects', value: stats?.my_projects || 0, icon: FolderKanban, color: '#EC4899' }
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" data-testid="dashboard-title">
            Welcome back, {user.name}
          </h1>
          <p className="text-base text-gray-400">Here's what's happening in your workspace</p>
        </div>

        {loading ? (
          <div className="text-gray-400">Loading stats...</div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <Card key={idx} className="stat-card bg-[rgba(255,255,255,0.03)]" data-testid={`stat-card-${idx}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg" style={{ background: `${stat.color}20` }}>
                          <Icon size={24} style={{ color: stat.color }} />
                        </div>
                        <div className="text-3xl font-bold text-white">{stat.value}</div>
                      </div>
                      <h3 className="text-sm text-gray-400">{stat.title}</h3>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Meetings */}
              {stats?.upcoming_meetings && stats.upcoming_meetings.length > 0 && (
                <Card className="glass-effect border-[rgba(255,215,0,0.1)]" data-testid="upcoming-meetings-card">
                  <CardHeader>
                    <CardTitle className="text-white">Upcoming Meetings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.upcoming_meetings.map((meeting) => (
                        <div
                          key={meeting.id}
                          className="p-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,215,0,0.1)]"
                        >
                          <h4 className="font-semibold text-white mb-1">{meeting.title}</h4>
                          <p className="text-sm text-gray-400 mb-2">{meeting.agenda}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                              {new Date(meeting.start_time).toLocaleString()}
                            </span>
                            <span className="px-2 py-1 rounded bg-[rgba(59,130,246,0.2)] text-blue-400">
                              {meeting.meeting_type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Assigned Tasks */}
              {stats?.assigned_tasks && stats.assigned_tasks.length > 0 && (
                <Card className="glass-effect border-[rgba(255,215,0,0.1)]" data-testid="assigned-tasks-card">
                  <CardHeader>
                    <CardTitle className="text-white">My Assigned Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.assigned_tasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,215,0,0.1)]"
                        >
                          <h4 className="font-semibold text-white mb-1">{task.title}</h4>
                          <p className="text-sm text-gray-400 mb-2">{task.description || 'No description'}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span
                              className={`px-2 py-1 rounded ${
                                task.priority === 'high'
                                  ? 'bg-red-500/20 text-red-400'
                                  : task.priority === 'medium'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}
                            >
                              {task.priority}
                            </span>
                            {task.due_date && (
                              <span className="text-gray-500">Due: {new Date(task.due_date).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Projects */}
              <Card className="glass-effect border-[rgba(255,215,0,0.1)]" data-testid="recent-projects-card">
                <CardHeader>
                  <CardTitle className="text-white">Recent Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.recent_projects?.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recent_projects.map((project) => (
                        <div
                          key={project.id}
                          className="p-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,215,0,0.1)]"
                        >
                          <h4 className="font-semibold text-white mb-1">{project.name}</h4>
                          <p className="text-sm text-gray-400 mb-2">{project.type}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Progress: {project.progress}%</span>
                            <span
                              className={`px-2 py-1 rounded ${
                                project.status === 'done'
                                  ? 'bg-green-500/20 text-green-400'
                                  : project.status === 'doing'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}
                            >
                              {project.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No recent projects</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Tasks Section */}
            {stats?.recent_tasks && stats.recent_tasks.length > 0 && (
              <Card className="glass-effect border-[rgba(255,215,0,0.1)] mt-6" data-testid="recent-tasks-card">
                <CardHeader>
                  <CardTitle className="text-white">All Recent Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recent_tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,215,0,0.1)]"
                      >
                        <h4 className="font-semibold text-white mb-1">{task.title}</h4>
                        <p className="text-sm text-gray-400 mb-2">{task.description || 'No description'}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={`px-2 py-1 rounded ${
                              task.priority === 'high'
                                ? 'bg-red-500/20 text-red-400'
                                : task.priority === 'medium'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-gray-500">{task.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
