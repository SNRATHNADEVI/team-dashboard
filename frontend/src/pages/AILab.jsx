import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AILab = ({ user, onLogout }) => {
  const [aiProjects, setAIProjects] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dataset: '',
    assigned_engineers: [],
  });

  useEffect(() => {
    fetchAIProjects();
  }, []);

  const fetchAIProjects = async () => {
    try {
      const response = await axios.get(`${API}/ai-projects`);
      setAIProjects(response.data);
    } catch (error) {
      toast.error('Failed to fetch AI projects');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/ai-projects`, formData);
      toast.success('AI project created successfully');
      setDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        dataset: '',
        assigned_engineers: [],
      });
      fetchAIProjects();
    } catch (error) {
      toast.error('Failed to create AI project');
    }
  };

  const updateStatus = async (projectId, newStatus) => {
    try {
      await axios.put(`${API}/ai-projects/${projectId}`, { status: newStatus });
      fetchAIProjects();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" data-testid="ailab-title">AI Development Lab</h1>
            <p className="text-base text-gray-400">Manage AI models, datasets, and workflows</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary" data-testid="create-ai-project-button">
                <Plus size={18} className="mr-2" />
                New AI Project
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)] text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Create AI Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label className="text-gray-300">Project Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    data-testid="ai-project-name-input"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Dataset</Label>
                  <Input
                    value={formData.dataset}
                    onChange={(e) => setFormData({ ...formData, dataset: e.target.value })}
                    placeholder="Dataset name or path"
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                  />
                </div>
                <Button type="submit" className="w-full btn-primary" data-testid="submit-ai-project-button">
                  Create Project
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiProjects.map((project) => (
            <Card key={project.id} className="glass-effect border-[rgba(255,215,0,0.1)]" data-testid={`ai-project-${project.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white text-lg">{project.name}</CardTitle>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      project.status === 'deployed'
                        ? 'bg-green-500/20 text-green-400'
                        : project.status === 'testing'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {project.description && <p className="text-sm text-gray-400 mb-3">{project.description}</p>}
                {project.dataset && (
                  <p className="text-sm text-gray-400 mb-2">
                    <span className="text-gray-500">Dataset:</span> {project.dataset}
                  </p>
                )}
                {project.model_version && (
                  <p className="text-sm text-gray-400 mb-2">
                    <span className="text-gray-500">Model:</span> {project.model_version}
                  </p>
                )}
                {project.accuracy && (
                  <p className="text-sm text-gray-400 mb-3">
                    <span className="text-gray-500">Accuracy:</span> {project.accuracy}%
                  </p>
                )}
                {project.status !== 'deployed' && (
                  <Button
                    size="sm"
                    onClick={() =>
                      updateStatus(project.id, project.status === 'development' ? 'testing' : 'deployed')
                    }
                    className="btn-primary w-full"
                    data-testid={`update-ai-project-${project.id}`}
                  >
                    {project.status === 'development' ? 'Move to Testing' : 'Deploy'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AILab;
