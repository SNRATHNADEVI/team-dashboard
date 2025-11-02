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
import { Plus } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContentStudio = ({ user, onLogout }) => {
  const [contentItems, setContentItems] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    platform: 'YT',
    content_type: 'video',
    assigned_editor: '',
    scheduled_date: '',
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API}/content`);
      setContentItems(response.data);
    } catch (error) {
      toast.error('Failed to fetch content items');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/content`, formData);
      toast.success('Content item created successfully');
      setDialogOpen(false);
      setFormData({
        title: '',
        platform: 'YT',
        content_type: 'video',
        assigned_editor: '',
        scheduled_date: '',
      });
      fetchContent();
    } catch (error) {
      toast.error('Failed to create content item');
    }
  };

  const updateStatus = async (itemId, newStatus) => {
    try {
      await axios.put(`${API}/content/${itemId}`, { status: newStatus });
      fetchContent();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const groupedContent = {
    draft: contentItems.filter((item) => item.status === 'draft'),
    review: contentItems.filter((item) => item.status === 'review'),
    scheduled: contentItems.filter((item) => item.status === 'scheduled'),
    published: contentItems.filter((item) => item.status === 'published'),
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" data-testid="content-title">Content Studio</h1>
            <p className="text-base text-gray-400">Plan and manage content for YT, Instagram, LinkedIn</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary" data-testid="create-content-button">
                <Plus size={18} className="mr-2" />
                New Content
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)] text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Create Content Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label className="text-gray-300">Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    data-testid="content-title-input"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Platform</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) => setFormData({ ...formData, platform: value })}
                  >
                    <SelectTrigger className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)]">
                      <SelectItem value="YT" className="text-white">YouTube</SelectItem>
                      <SelectItem value="Insta" className="text-white">Instagram</SelectItem>
                      <SelectItem value="LinkedIn" className="text-white">LinkedIn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300">Content Type</Label>
                  <Select
                    value={formData.content_type}
                    onValueChange={(value) => setFormData({ ...formData, content_type: value })}
                  >
                    <SelectTrigger className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)]">
                      <SelectItem value="video" className="text-white">Video</SelectItem>
                      <SelectItem value="post" className="text-white">Post</SelectItem>
                      <SelectItem value="article" className="text-white">Article</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300">Assigned Editor</Label>
                  <Input
                    value={formData.assigned_editor}
                    onChange={(e) => setFormData({ ...formData, assigned_editor: e.target.value })}
                    placeholder="Dwaragesh, Karthi..."
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Scheduled Date</Label>
                  <Input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                  />
                </div>
                <Button type="submit" className="w-full btn-primary" data-testid="submit-content-button">
                  Create Content
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(groupedContent).map(([status, items]) => (
            <div key={status}>
              <h3 className="font-bold text-white text-lg mb-4 capitalize">
                {status} <span className="text-gray-500 text-sm">({items.length})</span>
              </h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <Card key={item.id} className="glass-effect border-[rgba(255,215,0,0.1)]" data-testid={`content-${item.id}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-base">{item.title}</CardTitle>
                      <div className="flex space-x-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded bg-[rgba(59,130,246,0.2)] text-blue-400">
                          {item.platform}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-[rgba(16,185,129,0.2)] text-green-400">
                          {item.content_type}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {item.assigned_editor && (
                        <p className="text-sm text-gray-400 mb-2">Editor: {item.assigned_editor}</p>
                      )}
                      {item.scheduled_date && (
                        <p className="text-sm text-gray-400 mb-3">
                          Due: {new Date(item.scheduled_date).toLocaleDateString()}
                        </p>
                      )}
                      {status !== 'published' && (
                        <Button
                          size="sm"
                          onClick={() =>
                            updateStatus(
                              item.id,
                              status === 'draft' ? 'review' : status === 'review' ? 'scheduled' : 'published'
                            )
                          }
                          className="btn-primary w-full"
                          data-testid={`update-content-${item.id}`}
                        >
                          {status === 'draft' ? 'Send to Review' : status === 'review' ? 'Schedule' : 'Publish'}
                        </Button>
                      )}
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

export default ContentStudio;
