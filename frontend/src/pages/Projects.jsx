import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Edit2, Users as UsersIcon } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Projects = ({ user, onLogout }) => {
  const [projects, setProjects] = useState({ todo: [], doing: [], done: [] });
  const [members, setMembers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'AI tools',
    assigned_members: [],
    deadline: '',
  });

  useEffect(() => {
    fetchProjects();
    fetchMembers();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      const grouped = {
        todo: response.data.filter((p) => p.status === 'todo'),
        doing: response.data.filter((p) => p.status === 'doing'),
        done: response.data.filter((p) => p.status === 'done'),
      };
      setProjects(grouped);
    } catch (error) {
      toast.error('Failed to fetch projects');
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setMembers(response.data);
    } catch (error) {
      console.error('Failed to fetch members');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`${API}/projects/${selectedProject.id}`, formData);
        toast.success('Project updated successfully');
      } else {
        await axios.post(`${API}/projects`, formData);
        toast.success('Project created successfully');
      }
      setDialogOpen(false);
      resetForm();
      fetchProjects();
    } catch (error) {
      toast.error('Failed to save project');
    }
  };

  const handleEdit = (project) => {
    setEditMode(true);
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      type: project.type,
      assigned_members: project.assigned_members || [],
      deadline: project.deadline || '',
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'AI tools',
      assigned_members: [],
      deadline: '',
    });
    setEditMode(false);
    setSelectedProject(null);
  };

  const moveProject = async (projectId, newStatus) => {
    try {
      await axios.put(`${API}/projects/${projectId}`, { status: newStatus });
      fetchProjects();
      toast.success('Project status updated');
    } catch (error) {
      toast.error('Failed to update project');
    }
  };

  const getMemberName = (memberId) => {
    const member = members.find((m) => m.id === memberId);
    return member ? member.name : 'Unknown';
  };

  const statusConfig = {
    todo: { title: 'To Do', color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
    doing: { title: 'In Progress', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' },
    done: { title: 'Completed', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[rgba(255,215,0,0.1)]">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1" data-testid="projects-title">
                Project Management
              </h1>
              <p className="text-sm text-gray-400">Track and manage all your projects</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="btn-primary" data-testid="create-project-button">
                  <Plus size={18} className="mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)] text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editMode ? 'Edit Project' : 'Create New Project'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Project Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                      data-testid="project-name-input"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                      data-testid="project-description-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Type</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)]">
                          <SelectItem value="AI tools" className="text-white">AI tools</SelectItem>
                          <SelectItem value="SaaS apps" className="text-white">SaaS apps</SelectItem>
                          <SelectItem value="Academy content" className="text-white">Academy content</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-300">Deadline</Label>
                      <Input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-300">Assign Team Members</Label>
                    <Select
                      value=""
                      onValueChange={(value) => {
                        const updatedMembers = formData.assigned_members.includes(value)
                          ? formData.assigned_members.filter((id) => id !== value)
                          : [...formData.assigned_members, value];
                        setFormData({ ...formData, assigned_members: updatedMembers });
                      }}
                    >
                      <SelectTrigger className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white">
                        <SelectValue placeholder="Select members" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)]">
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id} className="text-white">
                            {member.name} • {member.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.assigned_members.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.assigned_members.map((memberId) => (
                          <span
                            key={memberId}
                            className="text-xs px-3 py-1 rounded-full bg-[rgba(255,215,0,0.15)] text-yellow-400 cursor-pointer hover:bg-[rgba(255,215,0,0.25)] transition-colors"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                assigned_members: formData.assigned_members.filter((id) => id !== memberId),
                              });
                            }}
                          >
                            {getMemberName(memberId)} ✕
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button type="submit" className="w-full btn-primary" data-testid="submit-project-button">
                    {editMode ? 'Update Project' : 'Create Project'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="h-full flex gap-6">
            {Object.entries(statusConfig).map(([status, config]) => (
              <div key={status} className="flex-1 flex flex-col min-w-0">
                {/* Column Header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full" style={{ background: config.color }}></div>
                  <h3 className="font-semibold text-white">{config.title}</h3>
                  <span className="text-xs text-gray-500 px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.05)]">
                    {projects[status].length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {projects[status].map((project) => (
                    <Card
                      key={project.id}
                      className="glass-effect border-[rgba(255,215,0,0.1)] hover:border-[rgba(255,215,0,0.3)] transition-all"
                      data-testid={`project-${project.id}`}
                    >
                      <CardContent className="p-4">
                        {/* Project Header */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h4 className="font-semibold text-white text-sm leading-tight flex-1">
                            {project.name}
                          </h4>
                          <button
                            onClick={() => handleEdit(project)}
                            className="text-gray-400 hover:text-blue-400 transition-colors flex-shrink-0"
                            data-testid={`edit-project-${project.id}`}
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>

                        {/* Project Type */}
                        <div className="mb-3">
                          <span className="text-xs px-2 py-1 rounded bg-[rgba(255,255,255,0.05)] text-gray-400">
                            {project.type}
                          </span>
                        </div>

                        {/* Description */}
                        {project.description && (
                          <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                            {project.description}
                          </p>
                        )}

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                            <span>Progress</span>
                            <span className="font-medium">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-[rgba(255,255,255,0.05)] rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full snr-gradient transition-all"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Deadline */}
                        {project.deadline && (
                          <p className="text-xs text-gray-500 mb-3">
                            📅 {new Date(project.deadline).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        )}

                        {/* Assigned Members */}
                        {project.assigned_members && project.assigned_members.length > 0 && (
                          <div className="mb-3 pb-3 border-b border-[rgba(255,255,255,0.05)]">
                            <div className="flex items-center gap-1 mb-2">
                              <UsersIcon size={12} className="text-gray-500" />
                              <span className="text-xs text-gray-500">Team:</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {project.assigned_members.map((memberId, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-1 rounded-full bg-[rgba(255,215,0,0.1)] text-yellow-500 border border-[rgba(255,215,0,0.2)]"
                                >
                                  {getMemberName(memberId).split(' ')[0]}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Button */}
                        {status !== 'done' && (
                          <Button
                            size="sm"
                            onClick={() => moveProject(project.id, status === 'todo' ? 'doing' : 'done')}
                            className="w-full btn-primary text-xs"
                            data-testid={`move-project-${project.id}`}
                          >
                            {status === 'todo' ? '▶ Start Project' : '✓ Mark Complete'}
                          </Button>
                        )}

                        {status === 'done' && (
                          <div className="text-center py-2 bg-green-500/10 text-green-400 rounded text-xs font-medium">
                            ✓ Completed
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {projects[status].length === 0 && (
                    <div className="text-center py-12 text-gray-500 text-sm">
                      No projects in {config.title.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Projects;
