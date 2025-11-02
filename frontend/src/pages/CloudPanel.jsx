import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Activity } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CloudPanel = ({ user, onLogout }) => {
  const [services, setServices] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    environment: 'prod',
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/cloud-services`);
      setServices(response.data);
    } catch (error) {
      toast.error('Failed to fetch cloud services');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/cloud-services`, formData);
      toast.success('Service added successfully');
      setDialogOpen(false);
      setFormData({
        name: '',
        environment: 'prod',
      });
      fetchServices();
    } catch (error) {
      toast.error('Failed to add service');
    }
  };

  const updateStatus = async (serviceId, newStatus) => {
    try {
      await axios.put(`${API}/cloud-services/${serviceId}`, { status: newStatus });
      fetchServices();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" data-testid="cloud-title">Backend & Cloud Panel</h1>
            <p className="text-base text-gray-400">Monitor services, deployments, and uptime</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary" data-testid="add-service-button">
                <Plus size={18} className="mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)] text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Add Cloud Service</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label className="text-gray-300">Service Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    data-testid="service-name-input"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Environment</Label>
                  <Select
                    value={formData.environment}
                    onValueChange={(value) => setFormData({ ...formData, environment: value })}
                  >
                    <SelectTrigger className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)]">
                      <SelectItem value="prod" className="text-white">Production</SelectItem>
                      <SelectItem value="staging" className="text-white">Staging</SelectItem>
                      <SelectItem value="dev" className="text-white">Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full btn-primary" data-testid="submit-service-button">
                  Add Service
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="glass-effect border-[rgba(255,215,0,0.1)]" data-testid={`service-${service.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white text-lg">{service.name}</CardTitle>
                  <Activity
                    size={20}
                    className={service.status === 'online' ? 'text-green-400' : 'text-red-400'}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Status:</span>
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        service.status === 'online'
                          ? 'bg-green-500/20 text-green-400'
                          : service.status === 'offline'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {service.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Environment:</span>
                    <span className="text-sm text-white">{service.environment}</span>
                  </div>
                  {service.uptime && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Uptime:</span>
                      <span className="text-sm text-white">{service.uptime}</span>
                    </div>
                  )}
                  {service.last_deployment && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Last Deploy:</span>
                      <span className="text-sm text-white">
                        {new Date(service.last_deployment).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex space-x-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => updateStatus(service.id, service.status === 'online' ? 'offline' : 'online')}
                      className={`flex-1 ${
                        service.status === 'online'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white`}
                      data-testid={`toggle-service-${service.id}`}
                    >
                      {service.status === 'online' ? 'Stop' : 'Start'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default CloudPanel;
