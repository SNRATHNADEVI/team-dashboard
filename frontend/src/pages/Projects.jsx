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
import { Plus, MoveRight, Edit, Users as UsersIcon } from 'lucide-react';

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
    } catch (error) {
      toast.error('Failed to update project');
    }
  };

  const getMemberName = (memberId) => {
    const member = members.find((m) => m.id === memberId);
    return member ? member.name : 'Unknown';
  };

  const KanbanColumn = ({ title, status, items, color }) => (
    <div className="flex-shrink-0 w-[350px]">
      <div className="mb-4 flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full" style={{ background: color }}></div>
        <h3 className="font-bold text-white text-lg">{title}</h3>
        <span className="text-sm text-gray-500">({items.length})</span>
      </div>
      <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
        {items.map((project) => (
          <Card key={project.id} className="kanban-card glass-effect border-[rgba(255,215,0,0.1)] w-full" data-testid={`project-${project.id}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-white text-base flex-1 break-words">{project.name}</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(project)}
                  className="text-blue-400 hover:text-blue-300 p-1 h-auto flex-shrink-0"
                  data-testid={`edit-project-${project.id}`}
                >
                  <Edit size={16} />
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-1">{project.type}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2 break-words">{project.description}</p>
              
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-[rgba(255,255,255,0.05)] rounded-full h-2">
                  <div
                    className="h-2 rounded-full snr-gradient"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Deadline */}
              {project.deadline && (
                <p className="text-xs text-gray-500 mb-3">
                  Due: {new Date(project.deadline).toLocaleDateString()}
                </p>
              )}
              
              {/* Assigned Members */}
              {project.assigned_members && project.assigned_members.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center space-x-1 mb-2">
                    <UsersIcon size={12} className="text-gray-500" />
                    <p className="text-xs text-gray-500">Assigned to:</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {project.assigned_members.map((memberId, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded bg-[rgba(255,215,0,0.1)] text-yellow-500 border border-[rgba(255,215,0,0.2)] break-words"
                      >
                        {getMemberName(memberId)}
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
                  className="btn-primary w-full"
                  data-testid={`move-project-${project.id}`}
                >
                  <MoveRight size={14} className="mr-1" />
                  {status === 'todo' ? 'Start' : 'Complete'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" data-testid="projects-title">Project Management</h1>
            <p className="text-base text-gray-400">Track and manage all your projects</p>
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
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    data-testid="project-description-input"
                  />
                </div>
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
                  <Label className="text-gray-300">Assign Team Members</Label>
                  <Select
                    value={formData.assigned_members[0] || ''}
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
                          {member.name} ({member.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.assigned_members.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.assigned_members.map((memberId) => (
                        <span
                          key={memberId}
                          className="text-xs px-2 py-1 rounded bg-[rgba(255,215,0,0.2)] text-yellow-500 cursor-pointer"
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
                <div>
                  <Label className="text-gray-300">Deadline</Label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                  />
                </div>
                <Button type="submit" className="w-full btn-primary" data-testid="submit-project-button">
                  {editMode ? 'Update Project' : 'Create Project'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4">
          <KanbanColumn title="To Do" status="todo" items={projects.todo} color="#6B7280" />
          <KanbanColumn title="In Progress" status="doing" items={projects.doing} color="#3B82F6" />
          <KanbanColumn title="Completed" status="done" items={projects.done} color="#10B981" />
        </div>
      </div>
    </Layout>
  );
};

export default Projects;
