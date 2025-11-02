import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PersonalPlanner = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'startup',
    due_date: '',
    is_private: true,
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API}/personal-tasks?user_id=${user.id}`);
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/personal-tasks`, {
        ...formData,
        user_id: user.id,
      });
      toast.success('Task created successfully');
      setDialogOpen(false);
      setFormData({
        title: '',
        category: 'startup',
        due_date: '',
        is_private: true,
      });
      fetchTasks();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const toggleStatus = async (taskId, currentStatus) => {
    try {
      await axios.put(`${API}/personal-tasks/${taskId}`, {
        status: currentStatus === 'todo' ? 'done' : 'todo',
      });
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API}/personal-tasks/${taskId}`);
        toast.success('Task deleted successfully');
        fetchTasks();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const groupedTasks = {
    college: tasks.filter((t) => t.category === 'college'),
    startup: tasks.filter((t) => t.category === 'startup'),
    personal: tasks.filter((t) => t.category === 'personal'),
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" data-testid="planner-title">Personal Planner</h1>
            <p className="text-base text-gray-400">Manage college, startup, and personal tasks</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary" data-testid="create-task-button">
                <Plus size={18} className="mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)] text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Create Personal Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label className="text-gray-300">Task Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    data-testid="task-title-input"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)]">
                      <SelectItem value="college" className="text-white">College</SelectItem>
                      <SelectItem value="startup" className="text-white">Startup</SelectItem>
                      <SelectItem value="personal" className="text-white">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300">Due Date</Label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="private"
                    checked={formData.is_private}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_private: checked })}
                  />
                  <Label htmlFor="private" className="text-gray-300 cursor-pointer">
                    Keep this task private (hidden from team)
                  </Label>
                </div>
                <Button type="submit" className="w-full btn-primary" data-testid="submit-task-button">
                  Create Task
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(groupedTasks).map(([category, categoryTasks]) => (
            <div key={category}>
              <h3 className="font-bold text-white text-lg mb-4 capitalize">
                {category} <span className="text-gray-500 text-sm">({categoryTasks.length})</span>
              </h3>
              <div className="space-y-3">
                {categoryTasks.map((task) => (
                  <Card key={task.id} className="glass-effect border-[rgba(255,215,0,0.1)]" data-testid={`task-${task.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={task.status === 'done'}
                          onCheckedChange={() => toggleStatus(task.id, task.status)}
                          data-testid={`toggle-task-${task.id}`}
                        />
                        <div className="flex-1">
                          <p
                            className={`text-sm text-white ${
                              task.status === 'done' ? 'line-through opacity-60' : ''
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.due_date && (
                            <p className="text-xs text-gray-500 mt-1">
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </p>
                          )}
                          {task.is_private && (
                            <span className="text-xs px-2 py-1 rounded bg-[rgba(255,215,0,0.1)] text-yellow-500 inline-block mt-2">
                              Private
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(task.id)}
                          className="text-red-400 hover:text-red-300"
                          data-testid={`delete-task-${task.id}`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default PersonalPlanner;
