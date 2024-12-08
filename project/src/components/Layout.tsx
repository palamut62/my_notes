import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  Menu,
  Home,
  KeyRound,
  FolderOpen,
  StickyNote,
  Archive,
  Trash2,
  LogOut,
  User,
  ChevronRight,
  X,
  Github,
  Twitter,
  Globe
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNoteStore } from '../store/noteStore';
import { usePasswordStore } from '../store/passwordStore';
import { useFileStore } from '../store/fileStore';
import ConfirmDialog from './ConfirmDialog';

interface LayoutProps {}

export default function Layout({}: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { notes, archivedNotes, trashedNotes } = useNoteStore();
  const { passwords } = usePasswordStore();
  const { files } = useFileStore();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    action: () => Promise<void>;
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSignOut = () => {
    setConfirmAction({
      action: async () => {
        await signOut();
        navigate('/login');
      },
      title: 'Sign Out',
      message: 'Are you sure you want to sign out? You will need to sign in again to access your data.'
    });
    setIsConfirmDialogOpen(true);
  };

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/passwords', icon: KeyRound, label: 'Passwords', count: passwords.length },
    { path: '/files', icon: FolderOpen, label: 'Files', count: files.length },
    { path: '/notes', icon: StickyNote, label: 'Notes', count: notes.length },
    { path: '/archive', icon: Archive, label: 'Archive', count: archivedNotes.length },
    { path: '/trash', icon: Trash2, label: 'Trash', count: trashedNotes.length },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-dark-200"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 bg-slate-900 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} hidden lg:block z-10`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-center">
            <img src="/logo.svg" alt="SecureVault Logo" className="h-8 w-8" />
            {isSidebarOpen && (
              <span className="ml-2 text-xl font-semibold text-emerald-400">SecureVault</span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center px-3 py-2 rounded-lg transition-colors
                  ${isActive(item.path)
                    ? 'bg-primary-900/20 text-primary-400'
                    : 'text-dark-400 hover:bg-dark-700/50 hover:text-dark-200'
                  }
                `}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {(isSidebarOpen || isMobileMenuOpen) && (
                  <>
                    <span className="ml-3">{item.label}</span>
                    {item.count !== undefined && (
                      <span className={`
                        ml-auto px-2 py-0.5 text-xs rounded-full
                        ${isActive(item.path)
                          ? 'bg-primary-800/30 text-primary-300'
                          : 'bg-dark-700 text-dark-300'
                        }
                      `}>
                        {item.count}
                      </span>
                    )}
                  </>
                )}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="p-3 mt-auto border-t border-dark-700">
            <Link
              to="/profile"
              className="flex items-center px-3 py-2 rounded-lg text-dark-400 hover:bg-dark-700/50 hover:text-dark-200"
            >
              <User className="h-5 w-5 shrink-0" />
              {(isSidebarOpen || isMobileMenuOpen) && (
                <span className="ml-3 truncate">
                  {user?.email}
                </span>
              )}
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full mt-1 flex items-center px-3 py-2 rounded-lg text-dark-400 hover:bg-dark-700/50 hover:text-dark-200"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {(isSidebarOpen || isMobileMenuOpen) && (
                <span className="ml-3">Sign Out</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Confirm Dialog */}
      {confirmAction && (
        <ConfirmDialog
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          onConfirm={confirmAction.action}
          title={confirmAction.title}
          message={confirmAction.message}
          type="warning"
          confirmText="Sign Out"
        />
      )}

      {/* Main Content */}
      <main className={`p-6 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
        <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm p-2 flex items-center justify-center gap-3 text-xs z-0">
          <a href="https://github.com/palamut62" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors">
            <Github size={16} />
          </a>
          <a href="https://twitter.com/palamut62" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors">
            <Twitter size={16} />
          </a>
          <span className="text-slate-600">•</span>
          <a href="https://www.umutcelik.online/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors">Help Center</a>
          <span className="text-slate-600">•</span>
          <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">Terms</a>
          <span className="text-slate-600">•</span>
          <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">Privacy</a>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400"> 2024 palamut62</span>
        </footer>
      </main>
    </div>
  );
}