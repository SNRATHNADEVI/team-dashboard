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
import { Plus, Check, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LeaveManagement = ({ user, onLogout }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    reason: '',
    delegate_to: '',
  });

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const response = await axios.get(`${API}/leave-requests`);
      setLeaveRequests(response.data);
    } catch (error) {
      toast.error('Failed to fetch leave requests');
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/leave-requests`, {
        user_id: user.id,
        user_name: user.name,
        ...formData,
      });
      toast.success('Leave request submitted successfully');
      setDialogOpen(false);
      setFormData({
        start_date: '',
        end_date: '',
        reason: '',
        delegate_to: '',
      });
      fetchLeaveRequests();
    } catch (error) {
      toast.error('Failed to submit leave request');
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await axios.put(`${API}/leave-requests/${requestId}`, null, {
        params: { status: 'approved' },
      });
      toast.success('Leave request approved');
      fetchLeaveRequests();
    } catch (error) {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.put(`${API}/leave-requests/${requestId}`, null, {
        params: { status: 'rejected' },
      });
      toast.success('Leave request rejected');
      fetchLeaveRequests();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const myRequests = leaveRequests.filter((req) => req.user_id === user.id);
  const pendingRequests = leaveRequests.filter((req) => req.status === 'pending');

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" data-testid="leave-title">Leave Management</h1>
            <p className="text-base text-gray-400">Manage leave requests and approvals</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary" data-testid="apply-leave-button">
                <Plus size={18} className="mr-2" />
                Apply Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)] text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Apply for Leave</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleApplyLeave} className="space-y-4">
                <div>
                  <Label className="text-gray-300">Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    data-testid="leave-start-date"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    data-testid="leave-end-date"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Reason</Label>
                  <Textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    data-testid="leave-reason"
                  />
                </div>
                <Button type="submit" className="w-full btn-primary" data-testid="submit-leave-button">
                  Submit Request
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Requests */}
          <Card className="glass-effect border-[rgba(255,215,0,0.1)]">
            <CardHeader>
              <CardTitle className="text-white">My Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {myRequests.length > 0 ? (
                <div className="space-y-3">
                  {myRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,215,0,0.1)]"
                      data-testid={`my-leave-${request.id}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm text-gray-400">
                            {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            request.status === 'approved'
                              ? 'bg-green-500/20 text-green-400'
                              : request.status === 'rejected'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-white mb-2">{request.reason}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No leave requests</p>
              )}
            </CardContent>
          </Card>

          {/* Pending Approvals (Admin/COO only) */}
          {user.role === 'Admin' && (
            <Card className="glass-effect border-[rgba(255,215,0,0.1)]">
              <CardHeader>
                <CardTitle className="text-white">Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingRequests.length > 0 ? (
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,215,0,0.1)]"
                        data-testid={`pending-leave-${request.id}`}
                      >
                        <div className="mb-2">
                          <h4 className="font-semibold text-white">{request.user_name}</h4>
                          <p className="text-sm text-gray-400">
                            {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">{request.reason}</p>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            data-testid={`approve-leave-${request.id}`}
                          >
                            <Check size={14} className="mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReject(request.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            data-testid={`reject-leave-${request.id}`}
                          >
                            <X size={14} className="mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No pending requests</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LeaveManagement;
