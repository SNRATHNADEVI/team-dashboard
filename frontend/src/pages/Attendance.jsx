import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Clock, LogIn, LogOut, Calendar } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Attendance = ({ user, onLogout }) => {
  const [todayRecord, setTodayRecord] = useState(null);
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodayRecord();
    fetchSummary();
    fetchRecords();
  }, []);

  const fetchTodayRecord = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`${API}/attendance/records?user_id=${user.id}`);
      const todayRec = response.data.find((r) => r.date === today);
      setTodayRecord(todayRec || null);
    } catch (error) {
      console.error('Failed to fetch today record');
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${API}/attendance/summary?user_id=${user.id}`);
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch summary');
    }
  };

  const fetchRecords = async () => {
    try {
      const response = await axios.get(`${API}/attendance/records?user_id=${user.id}`);
      setRecords(response.data.slice(0, 10));
    } catch (error) {
      console.error('Failed to fetch records');
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/attendance/check-in`, {
        user_id: user.id,
        user_name: user.name,
      });
      toast.success('Checked in successfully');
      fetchTodayRecord();
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.post(`${API}/attendance/check-out`, {
        user_id: user.id,
        date: today,
      });
      toast.success(`Checked out successfully. Total hours: ${response.data.total_hours}`);
      fetchTodayRecord();
      fetchSummary();
      fetchRecords();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" data-testid="attendance-title">Attendance Tracker</h1>
          <p className="text-base text-gray-400">Track your daily check-in and check-out times</p>
        </div>

        {/* Today's Check-in/out */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="glass-effect border-[rgba(255,215,0,0.1)]">
            <CardHeader>
              <CardTitle className="text-white">Today's Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Check-in:</span>
                  <span className="text-white font-semibold">{todayRecord?.check_in ? formatTime(todayRecord.check_in) : 'Not checked in'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Check-out:</span>
                  <span className="text-white font-semibold">{todayRecord?.check_out ? formatTime(todayRecord.check_out) : 'Not checked out'}</span>
                </div>
                {todayRecord?.total_hours && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Hours:</span>
                    <span className="text-green-400 font-semibold">{todayRecord.total_hours}h</span>
                  </div>
                )}
                <div className="flex space-x-3 mt-4">
                  {!todayRecord?.check_in && (
                    <Button
                      onClick={handleCheckIn}
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      data-testid="check-in-button"
                    >
                      <LogIn size={16} className="mr-2" />
                      Check In
                    </Button>
                  )}
                  {todayRecord?.check_in && !todayRecord?.check_out && (
                    <Button
                      onClick={handleCheckOut}
                      disabled={loading}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      data-testid="check-out-button"
                    >
                      <LogOut size={16} className="mr-2" />
                      Check Out
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {summary && (
            <Card className="glass-effect border-[rgba(255,215,0,0.1)]">
              <CardHeader>
                <CardTitle className="text-white">Monthly Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Days:</span>
                    <span className="text-white font-semibold">{summary.total_days}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Present:</span>
                    <span className="text-green-400 font-semibold">{summary.present_days}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Leave:</span>
                    <span className="text-yellow-400 font-semibold">{summary.leave_days}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Hours:</span>
                    <span className="text-white font-semibold">{summary.total_hours_worked}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Avg Hours/Day:</span>
                    <span className="text-white font-semibold">{summary.average_hours_per_day}h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Records */}
        <Card className="glass-effect border-[rgba(255,215,0,0.1)]">
          <CardHeader>
            <CardTitle className="text-white">Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length > 0 ? (
              <div className="space-y-3">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,215,0,0.1)]"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">{new Date(record.date).toLocaleDateString()}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                          <span>In: {formatTime(record.check_in)}</span>
                          <span>Out: {formatTime(record.check_out)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            record.status === 'present'
                              ? 'bg-green-500/20 text-green-400'
                              : record.status === 'leave'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {record.status}
                        </span>
                        {record.total_hours && (
                          <p className="text-white font-semibold mt-2">{record.total_hours}h</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No attendance records</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Attendance;
