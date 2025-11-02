import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Calendar as CalendarIcon, 
  Plane, 
  Video, 
  Brain, 
  Cloud, 
  BookOpen, 
  GraduationCap, 
  ClipboardList,
  LogOut,
  Clock,
  DollarSign,
  Award,
  Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Layout = ({ children, user, onLogout }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/team', icon: Users, label: 'Team' },
    { path: '/projects', icon: FolderKanban, label: 'Projects' },
    { path: '/calendar', icon: CalendarIcon, label: 'Calendar' },
    { path: '/attendance', icon: Clock, label: 'Attendance' },
    { path: '/leave', icon: Plane, label: 'Leave' },
    { path: '/content', icon: Video, label: 'Content' },
    { path: '/training', icon: Award, label: 'Training' },
    { path: '/ai-lab', icon: Brain, label: 'AI Lab' },
    { path: '/cloud', icon: Cloud, label: 'Cloud' },
    { path: '/research', icon: BookOpen, label: 'Research' },
    { path: '/academy', icon: GraduationCap, label: 'Academy' },
    { path: '/subscriptions', icon: Key, label: 'Subscriptions' },
    { path: '/finance', icon: DollarSign, label: 'Finance', adminOnly: true },
    { path: '/planner', icon: ClipboardList, label: 'Planner' },
  ];

  return (
    <div className="flex h-screen" style={{ background: '#0a0a0a' }}>
      {/* Sidebar */}
      <aside className="w-64 border-r border-[rgba(255,215,0,0.1)] glass-effect p-4">
        <div className="mb-8">
          <img 
            src="https://customer-assets.emergentagent.com/job_25d84bc8-5cd6-4672-913d-7856f1b8c2dc/artifacts/7ukgfyx7_snr%20logo%20png.jpg"
            alt="SNR"
            className="w-16 h-16 mx-auto mb-3 rounded-lg"
          />
          <h2 className="text-xl font-bold text-center snr-gradient bg-clip-text text-transparent">SNR</h2>
          <p className="text-xs text-center text-gray-400 mt-1">{user?.name}</p>
          <p className="text-xs text-center text-yellow-500 font-semibold">{user?.role}</p>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            // Hide Finance from non-admin users
            if (item.adminOnly && user.role !== 'Admin') return null;
            
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'sidebar-active text-yellow-500'
                    : 'text-gray-400 hover:text-white hover:bg-[rgba(255,215,0,0.05)]'
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full border-[rgba(255,215,0,0.3)] text-yellow-500 hover:bg-[rgba(255,215,0,0.1)]"
            data-testid="logout-button"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
