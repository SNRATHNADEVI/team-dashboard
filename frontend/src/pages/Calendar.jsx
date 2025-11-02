import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Calendar = ({ user, onLogout }) => {
  const [events, setEvents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    event_type: 'startup',
    attendees: [],
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/calendar/events`);
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to fetch events');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/calendar/events`, formData);
      toast.success('Event created and synced to Google Calendar!');
      setDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        event_type: 'startup',
        attendees: [],
      });
      fetchEvents();
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  const getEventColor = (type) => {
    const colors = {
      startup: { bg: 'rgba(59, 130, 246, 0.2)', border: '#3B82F6', text: '#93C5FD' },
      content: { bg: 'rgba(16, 185, 129, 0.2)', border: '#10B981', text: '#6EE7B7' },
      academy: { bg: 'rgba(245, 158, 11, 0.2)', border: '#F59E0B', text: '#FCD34D' },
      personal: { bg: 'rgba(239, 68, 68, 0.2)', border: '#EF4444', text: '#FCA5A5' },
    };
    return colors[type] || colors.startup;
  };

  const todayEvents = events.filter((event) => {
    const eventDate = new Date(event.start_time);
    return eventDate.toDateString() === selectedDate.toDateString();
  });

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" data-testid="calendar-title">Calendar</h1>
            <p className="text-base text-gray-400">Manage your schedule and meetings</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary" data-testid="create-event-button">
                <Plus size={18} className="mr-2" />
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)] text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Create Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <Label className="text-gray-300">Event Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    data-testid="event-title-input"
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Start Time</Label>
                    <Input
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                      className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">End Time</Label>
                    <Input
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                      className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Event Type</Label>
                  <Select
                    value={formData.event_type}
                    onValueChange={(value) => setFormData({ ...formData, event_type: value })}
                  >
                    <SelectTrigger className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)]">
                      <SelectItem value="startup" className="text-white">Startup Meeting</SelectItem>
                      <SelectItem value="content" className="text-white">Content Creation</SelectItem>
                      <SelectItem value="academy" className="text-white">Academy Class</SelectItem>
                      <SelectItem value="personal" className="text-white">Personal/College</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full btn-primary" data-testid="submit-event-button">
                  Create Event
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass-effect border-[rgba(255,215,0,0.1)] lg:col-span-1">
            <CardContent className="p-6">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md"
                data-testid="calendar-component"
              />
              <div className="mt-6 space-y-2">
                <p className="text-sm font-semibold text-gray-300 mb-3">Event Types:</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-400">Startup Meetings</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-400">Content Creation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm text-gray-400">Academy Classes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-gray-400">Personal/College</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-[rgba(255,215,0,0.1)] lg:col-span-2">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Events for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              {todayEvents.length > 0 ? (
                <div className="space-y-3">
                  {todayEvents.map((event) => {
                    const colors = getEventColor(event.event_type);
                    return (
                      <div
                        key={event.id}
                        className="p-4 rounded-lg"
                        style={{
                          background: colors.bg,
                          borderLeft: `4px solid ${colors.border}`,
                        }}
                        data-testid={`event-${event.id}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white">{event.title}</h4>
                          <span className="text-xs px-2 py-1 rounded" style={{ background: colors.bg, color: colors.text }}>
                            {event.event_type}
                          </span>
                        </div>
                        {event.description && <p className="text-sm text-gray-400 mb-2">{event.description}</p>}
                        <p className="text-xs text-gray-500">
                          {new Date(event.start_time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -{' '}
                          {new Date(event.end_time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No events scheduled for this day</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;
