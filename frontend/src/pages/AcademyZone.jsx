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

const AcademyZone = ({ user, onLogout }) => {
  const [courses, setCourses] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API}/academy/courses`);
      setCourses(response.data);
    } catch (error) {
      toast.error('Failed to fetch courses');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/academy/courses`, formData);
      toast.success('Course created successfully');
      setDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        instructor: '',
      });
      fetchCourses();
    } catch (error) {
      toast.error('Failed to create course');
    }
  };

  const updateStatus = async (courseId, newStatus) => {
    try {
      await axios.put(`${API}/academy/courses/${courseId}`, { status: newStatus });
      fetchCourses();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" data-testid="academy-title">Academy Zone</h1>
            <p className="text-base text-gray-400">Manage SNR Academy courses and students</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary" data-testid="create-course-button">
                <Plus size={18} className="mr-2" />
                New Course
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)] text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Course</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label className="text-gray-300">Course Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    data-testid="course-title-input"
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
                  <Label className="text-gray-300">Instructor</Label>
                  <Input
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                  />
                </div>
                <Button type="submit" className="w-full btn-primary" data-testid="submit-course-button">
                  Create Course
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="glass-effect border-[rgba(255,215,0,0.1)]" data-testid={`course-${course.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white text-lg">{course.title}</CardTitle>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      course.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : course.status === 'completed'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {course.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {course.description && <p className="text-sm text-gray-400 mb-3">{course.description}</p>}
                {course.instructor && (
                  <p className="text-sm text-gray-400 mb-2">
                    <span className="text-gray-500">Instructor:</span> {course.instructor}
                  </p>
                )}
                <p className="text-sm text-gray-400 mb-4">
                  <span className="text-gray-500">Students:</span> {course.students_count}
                </p>
                {course.status !== 'completed' && (
                  <Button
                    size="sm"
                    onClick={() =>
                      updateStatus(course.id, course.status === 'draft' ? 'active' : 'completed')
                    }
                    className="btn-primary w-full"
                    data-testid={`update-course-${course.id}`}
                  >
                    {course.status === 'draft' ? 'Activate Course' : 'Mark Completed'}
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

export default AcademyZone;
