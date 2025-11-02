import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Plus, Upload, Award } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Training = ({ user, onLogout }) => {
  const [courses, setCourses] = useState([]);
  const [myProgress, setMyProgress] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    video_url: '',
    homework_tasks: '',
    kudos_reward: 10,
  });

  useEffect(() => {
    fetchCourses();
    fetchMyProgress();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API}/training/courses`);
      setCourses(response.data);
    } catch (error) {
      toast.error('Failed to fetch courses');
    }
  };

  const fetchMyProgress = async () => {
    try {
      const response = await axios.get(`${API}/training/progress?user_id=${user.id}`);
      setMyProgress(response.data);
    } catch (error) {
      console.error('Failed to fetch progress');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/training/courses`, {
        ...formData,
        homework_tasks: formData.homework_tasks.split(',').map((t) => t.trim()).filter(Boolean),
        kudos_reward: parseInt(formData.kudos_reward),
      });
      toast.success('Training course created successfully');
      setDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        instructor: '',
        video_url: '',
        homework_tasks: '',
        kudos_reward: 10,
      });
      fetchCourses();
    } catch (error) {
      toast.error('Failed to create course');
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await axios.post(`${API}/training/progress`, null, {
        params: {
          user_id: user.id,
          user_name: user.name,
          course_id: courseId,
        },
      });
      toast.success('Enrolled successfully');
      fetchMyProgress();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Enrollment failed');
    }
  };

  const handleSubmitHomework = async (progressId, homeworkUrl) => {
    try {
      await axios.put(`${API}/training/progress/${progressId}`, {
        progress: 100,
        homework_submitted: true,
        homework_url: homeworkUrl,
      });
      toast.success('Homework submitted! Kudos awarded!');
      fetchMyProgress();
    } catch (error) {
      toast.error('Failed to submit homework');
    }
  };

  const getProgressForCourse = (courseId) => {
    return myProgress.find((p) => p.course_id === courseId);
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" data-testid="training-title">
              Training Section
            </h1>
            <p className="text-base text-gray-400">Complete courses and earn kudos</p>
          </div>

          {user.role === 'Admin' && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary" data-testid="create-course-button">
                  <Plus size={18} className="mr-2" />
                  New Course
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)] text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Create Training Course</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
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
                    <Label className="text-gray-300">Video URL</Label>
                    <Input
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      placeholder="YouTube or Drive link"
                      className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Homework Tasks (comma separated)</Label>
                    <Textarea
                      value={formData.homework_tasks}
                      onChange={(e) => setFormData({ ...formData, homework_tasks: e.target.value })}
                      placeholder="Task 1, Task 2, Task 3"
                      className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Kudos Reward</Label>
                    <Input
                      type="number"
                      value={formData.kudos_reward}
                      onChange={(e) => setFormData({ ...formData, kudos_reward: e.target.value })}
                      className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    />
                  </div>
                  <Button type="submit" className="w-full btn-primary">
                    Create Course
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const progress = getProgressForCourse(course.id);
            const isEnrolled = !!progress;
            const isCompleted = progress?.completed;

            return (
              <Card key={course.id} className="glass-effect border-[rgba(255,215,0,0.1)]" data-testid={`course-${course.id}`}>
                <CardHeader>
                  <CardTitle className="text-white text-lg">{course.title}</CardTitle>
                  {course.instructor && (
                    <p className="text-sm text-gray-400">By {course.instructor}</p>
                  )}
                </CardHeader>
                <CardContent>
                  {course.description && (
                    <p className="text-sm text-gray-400 mb-4">{course.description}</p>
                  )}

                  {isEnrolled && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>{progress.progress}%</span>
                      </div>
                      <Progress value={progress.progress} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center space-x-2 mb-4">
                    <Award size={16} className="text-yellow-500" />
                    <span className="text-sm text-yellow-500 font-semibold">
                      {course.kudos_reward} Kudos
                    </span>
                  </div>

                  {course.video_url && (
                    <a
                      href={course.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:underline mb-3 block"
                    >
                      Watch Video
                    </a>
                  )}

                  {course.homework_tasks && course.homework_tasks.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Homework:</p>
                      <ul className="text-xs text-gray-400 space-y-1">
                        {course.homework_tasks.map((task, idx) => (
                          <li key={idx}>• {task}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!isEnrolled ? (
                    <Button
                      onClick={() => handleEnroll(course.id)}
                      className="w-full btn-primary"
                      data-testid={`enroll-${course.id}`}
                    >
                      Enroll Now
                    </Button>
                  ) : isCompleted ? (
                    <div className="text-center py-2 bg-green-500/20 text-green-400 rounded">
                      ✓ Completed
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        const homeworkUrl = prompt('Enter homework submission URL (Google Drive, etc):');
                        if (homeworkUrl) handleSubmitHomework(progress.id, homeworkUrl);
                      }}
                      className="w-full btn-primary"
                      data-testid={`submit-homework-${course.id}`}
                    >
                      <Upload size={16} className="mr-2" />
                      Submit Homework
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Training;
