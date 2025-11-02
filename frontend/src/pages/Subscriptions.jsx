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
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Subscriptions = ({ user, onLogout }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    platform: '',
    username: '',
    password: '',
    is_active: true,
    renewal_date: '',
    notes: '',
  });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(`${API}/subscriptions`);
      setSubscriptions(response.data);
    } catch (error) {
      toast.error('Failed to fetch subscriptions');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/subscriptions`, formData);
      toast.success('Subscription added successfully');
      setDialogOpen(false);
      setFormData({
        platform: '',
        username: '',
        password: '',
        is_active: true,
        renewal_date: '',
        notes: '',
      });
      fetchSubscriptions();
    } catch (error) {
      toast.error('Failed to add subscription');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        await axios.delete(`${API}/subscriptions/${id}`);
        toast.success('Subscription deleted');
        fetchSubscriptions();
      } catch (error) {
        toast.error('Failed to delete subscription');
      }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(`${API}/subscriptions/${id}`, {
        is_active: !currentStatus,
      });
      fetchSubscriptions();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" data-testid="subscriptions-title">
              Subscriptions
            </h1>
            <p className="text-base text-gray-400">Manage platform subscriptions and credentials</p>
          </div>

          {user.role === 'Admin' && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary" data-testid="add-subscription-button">
                  <Plus size={18} className="mr-2" />
                  Add Subscription
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)] text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Add Subscription</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Platform/Service Name</Label>
                    <Input
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      required
                      placeholder="e.g., Figma, Adobe CC, ChatGPT"
                      className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Username/Email</Label>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Password</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Renewal Date</Label>
                    <Input
                      type="date"
                      value={formData.renewal_date}
                      onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
                      className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    />
                  </div>
                  <Button type="submit" className="w-full btn-primary">
                    Add Subscription
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((sub) => (
            <Card key={sub.id} className="glass-effect border-[rgba(255,215,0,0.1)]" data-testid={`subscription-${sub.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white text-lg">{sub.platform}</CardTitle>
                  <div className="flex items-center space-x-2">
                    {sub.is_active ? (
                      <CheckCircle size={20} className="text-green-400" />
                    ) : (
                      <XCircle size={20} className="text-red-400" />
                    )}
                    {user.role === 'Admin' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(sub.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        sub.is_active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {sub.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {sub.username && (
                    <div>
                      <p className="text-xs text-gray-500">Username:</p>
                      <p className="text-sm text-white">{sub.username}</p>
                    </div>
                  )}
                  {sub.password && (
                    <div>
                      <p className="text-xs text-gray-500">Password:</p>
                      <p className="text-sm text-white font-mono">••••••••</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(sub.password);
                          toast.success('Password copied!');
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 p-0 h-auto"
                      >
                        Copy Password
                      </Button>
                    </div>
                  )}
                  {sub.renewal_date && (
                    <div>
                      <p className="text-xs text-gray-500">Renewal Date:</p>
                      <p className="text-sm text-white">
                        {new Date(sub.renewal_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {sub.notes && (
                    <div>
                      <p className="text-xs text-gray-500">Notes:</p>
                      <p className="text-sm text-gray-400">{sub.notes}</p>
                    </div>
                  )}
                  {user.role === 'Admin' && (
                    <Button
                      size="sm"
                      onClick={() => toggleStatus(sub.id, sub.is_active)}
                      className={`w-full mt-3 ${
                        sub.is_active
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white`}
                    >
                      {sub.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Subscriptions;
