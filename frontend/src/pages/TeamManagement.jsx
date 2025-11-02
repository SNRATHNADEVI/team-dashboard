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
import { UserPlus, Trash2, Edit } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const roles = ['Admin', 'COO', 'CTO', 'Project Manager', 'Tech', 'Design', 'AI', 'Cloud', 'Research', 'Content', 'Intern'];

const TeamManagement = ({ user, onLogout }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'Tech',
    email: '',
    contact: '',
    skillset: '',
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setMembers(response.data);
    } catch (error) {
      toast.error('Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        skillset: formData.skillset.split(',').map((s) => s.trim()).filter(Boolean),
      };

      if (editMode) {
        await axios.put(`${API}/users/${selectedMember.id}`, payload);
        toast.success('Member updated successfully');
      } else {
        await axios.post(`${API}/auth/register`, payload);
        toast.success('Member added successfully');
      }

      setDialogOpen(false);
      resetForm();
      fetchMembers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await axios.delete(`${API}/users/${memberId}`);
        toast.success('Member removed successfully');
        fetchMembers();
      } catch (error) {
        toast.error('Failed to remove member');
      }
    }
  };

  const handleEdit = (member) => {
    setEditMode(true);
    setSelectedMember(member);
    setFormData({
      username: member.username,
      password: '',
      name: member.name,
      role: member.role,
      email: member.email || '',
      contact: member.contact || '',
      skillset: member.skillset?.join(', ') || '',
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      role: 'Tech',
      email: '',
      contact: '',
      skillset: '',
    });
    setEditMode(false);
    setSelectedMember(null);
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" data-testid="team-title">Team Management</h1>
            <p className="text-base text-gray-400">Manage your team members and roles</p>
          </div>

          {user.role === 'Admin' && (
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="btn-primary" data-testid="add-member-button">
                  <UserPlus size={18} className="mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)] text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editMode ? 'Edit Member' : 'Add New Member'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Username</Label>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      disabled={editMode}
                      className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                      data-testid="member-username-input"
                    />
                  </div>
                  {!editMode && (
                    <div>
                      <Label className="text-gray-300">Password</Label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!editMode}
                        className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                        data-testid="member-password-input"
                      />
                    </div>
                  )}
                  <div>
                    <Label className="text-gray-300">Full Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                      data-testid="member-name-input"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Role</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)]">
                        {roles.map((role) => (
                          <SelectItem key={role} value={role} className="text-white">
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Contact</Label>
                    <Input
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Skills (comma separated)</Label>
                    <Input
                      value={formData.skillset}
                      onChange={(e) => setFormData({ ...formData, skillset: e.target.value })}
                      placeholder="Python, React, AI..."
                      className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    />
                  </div>
                  <Button type="submit" className="w-full btn-primary" data-testid="submit-member-button">
                    {editMode ? 'Update Member' : 'Add Member'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loading ? (
          <div className="text-gray-400">Loading team members...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <Card key={member.id} className="glass-effect border-[rgba(255,215,0,0.1)]" data-testid={`member-card-${member.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white text-lg">{member.name}</CardTitle>
                      <p className="text-sm text-yellow-500 font-semibold mt-1">{member.role}</p>
                    </div>
                    {user.role === 'Admin' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(member)}
                          className="text-blue-400 hover:text-blue-300"
                          data-testid={`edit-member-${member.id}`}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(member.id)}
                          className="text-red-400 hover:text-red-300"
                          data-testid={`delete-member-${member.id}`}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-400">
                      <span className="text-gray-500">Username:</span> {member.username}
                    </p>
                    {member.email && (
                      <p className="text-gray-400">
                        <span className="text-gray-500">Email:</span> {member.email}
                      </p>
                    )}
                    {member.contact && (
                      <p className="text-gray-400">
                        <span className="text-gray-500">Contact:</span> {member.contact}
                      </p>
                    )}
                    {member.skillset && member.skillset.length > 0 && (
                      <div>
                        <p className="text-gray-500 mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {member.skillset.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs rounded bg-[rgba(255,215,0,0.1)] text-yellow-500 border border-[rgba(255,215,0,0.2)]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TeamManagement;
