import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, HashRouter } from 'react-router-dom';
import {
  Users, Calendar, CheckSquare, TrendingUp, LogOut, Lock, User, Plus,
  Search, Edit2, ShieldAlert, Check, X, Clock, AlertCircle, RefreshCw, ChevronRight, Activity, CircleAlert
} from 'lucide-react';
import { api } from './services/api';

// ----------------------------------------------------
// ROUTE GUARDS
// ----------------------------------------------------

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = api.getToken();
  const user = api.getCurrentUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
};

// ----------------------------------------------------
// AUTHENTICATION COMPONENT (LOGIN / REGISTER)
// ----------------------------------------------------

const Login = () => {
  const navigate = useNavigate();
  const [roleMode, setRoleMode] = useState('MEMBER'); // 'MEMBER' or 'IT_HEAD'
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Clear credentials on mount
    api.logout();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (roleMode === 'IT_HEAD') {
        const data = await api.loginAdmin({ emailOrId, password, accessCode });
        navigate('/admin');
      } else {
        const data = await api.loginMember({ emailOrId, password });
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-gameDark">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gamePurple/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gameCyan/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg glass-panel-glow rounded-2xl p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-gamePurple/30 to-gameCyan/30 rounded-xl mb-3 border border-gameCyan/20">
            <span className="text-3xl text-gameCyan glow-text">⚡</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-gameCyan via-purple-400 to-gamePurple bg-clip-text text-transparent">
            TECHBIT 7.0
          </h1>
          <p className="text-xs text-gameAccent tracking-widest uppercase mt-1">IT Committee Attendance System</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex bg-gameBlue/50 p-1.5 rounded-xl mb-6 border border-white/5">
          <button
            type="button"
            onClick={() => { setRoleMode('MEMBER'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 ${roleMode === 'MEMBER'
              ? 'bg-gradient-to-r from-gameCyan to-gameElectric text-gameDark shadow-md'
              : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            MEMBER
          </button>
          <button
            type="button"
            onClick={() => { setRoleMode('IT_HEAD'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 ${roleMode === 'IT_HEAD'
              ? 'bg-gradient-to-r from-gamePurple to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            IT HEAD / ADMIN
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">
              {roleMode === 'IT_HEAD' ? 'Head Email / ID' : 'Email / Member ID'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                value={emailOrId}
                onChange={(e) => setEmailOrId(e.target.value)}
                placeholder={roleMode === 'IT_HEAD' ? 'e.g. alpha@techbit.com' : 'e.g. TB7-MEM-001'}
                className="w-full bg-gameDark/60 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-500 focus:border-gameCyan focus:outline-none focus:ring-1 focus:ring-gameCyan transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gameDark/60 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-500 focus:border-gameCyan focus:outline-none focus:ring-1 focus:ring-gameCyan transition-all"
              />
            </div>
          </div>

          {roleMode === 'IT_HEAD' && (
            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">
                Special Head Access Code
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <ShieldAlert className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  required
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Enter admin access key"
                  className="w-full bg-gameDark/60 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-500 focus:border-gamePurple focus:outline-none focus:ring-1 focus:ring-gamePurple transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold tracking-widest text-sm transition-all duration-300 uppercase ${roleMode === 'IT_HEAD'
              ? 'btn-cyber-purple'
              : 'btn-cyber-cyan'
              }`}
          >
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>

        <div className="text-center mt-6">
          <span className="text-xs text-slate-400">Need an account? </span>
          <button
            onClick={() => navigate('/register')}
            className="text-xs font-bold text-gameCyan hover:underline hover:text-cyan-300 transition-colors"
          >
            Register Here
          </button>
        </div>
      </div>
    </div>
  );
};

const Register = () => {
  const navigate = useNavigate();
  const [roleMode, setRoleMode] = useState('MEMBER'); // 'MEMBER' or 'IT_HEAD'
  const [formData, setFormData] = useState({
    name: '',
    member_id: '',
    email: '',
    password: '',
    class_year: 'First Year (Year 1)',
    committee_role: 'Developer',
    role: 'MEMBER',
    accessCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.registerMember(formData);
      navigate(data.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-gameDark">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gamePurple/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gameCyan/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-xl glass-panel-glow rounded-2xl p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-gamePurple/30 to-gameCyan/30 rounded-xl mb-3 border border-gameCyan/20">
            <span className="text-3xl text-gameCyan glow-text">⚡</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-gameCyan to-gamePurple bg-clip-text text-transparent">
            {roleMode === 'IT_HEAD' ? 'IT HEAD SIGNUP' : 'MEMBER SIGNUP'}
          </h2>
          <p className="text-xs text-gameAccent tracking-widest uppercase mt-1">TechBit 7.0 Committee</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex bg-gameBlue/50 p-1.5 rounded-xl mb-6 border border-white/5">
          <button
            type="button"
            onClick={() => {
              setRoleMode('MEMBER');
              setError('');
              setFormData({ ...formData, role: 'MEMBER', accessCode: '' });
            }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 ${roleMode === 'MEMBER'
              ? 'bg-gradient-to-r from-gameCyan to-gameElectric text-gameDark shadow-md'
              : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            MEMBER SIGNUP
          </button>
          <button
            type="button"
            onClick={() => {
              setRoleMode('IT_HEAD');
              setError('');
              setFormData({ ...formData, role: 'ADMIN' });
            }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 ${roleMode === 'IT_HEAD'
              ? 'bg-gradient-to-r from-gamePurple to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            IT HEAD SIGNUP
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Pradeep Kumar"
              className="w-full bg-gameDark/60 border border-white/10 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:border-gameCyan focus:outline-none focus:ring-1 focus:ring-gameCyan transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">
              {roleMode === 'IT_HEAD' ? 'Head / Admin ID' : 'Member ID'}
            </label>
            <input
              type="text"
              required
              value={formData.member_id}
              onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
              placeholder={roleMode === 'IT_HEAD' ? 'e.g. TB7-HEAD-03' : 'e.g. TB7-MEM-001'}
              className="w-full bg-gameDark/60 border border-white/10 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:border-gameCyan focus:outline-none focus:ring-1 focus:ring-gameCyan transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. pradeep@techbit.com"
              className="w-full bg-gameDark/60 border border-white/10 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:border-gameCyan focus:outline-none focus:ring-1 focus:ring-gameCyan transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Min 6 characters"
              className="w-full bg-gameDark/60 border border-white/10 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:border-gameCyan focus:outline-none focus:ring-1 focus:ring-gameCyan transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">
              Class / Academic Year
            </label>
            <select
              value={formData.class_year}
              onChange={(e) => setFormData({ ...formData, class_year: e.target.value })}
              className="w-full bg-gameDark/60 border border-white/10 rounded-xl py-3 px-4 text-slate-200 focus:border-gameCyan focus:outline-none focus:ring-1 focus:ring-gameCyan transition-all"
            >
              <option value="First Year (Year 1)">First Year (Year 1)</option>
              <option value="Second Year (Year 2)">Second Year (Year 2)</option>
              <option value="Third Year (Year 3)">Third Year (Year 3)</option>
              <option value="Senior (Year 4)">Senior (Year 4)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">
              Committee Role
            </label>
            <select
              value={formData.committee_role}
              onChange={(e) => setFormData({ ...formData, committee_role: e.target.value })}
              className="w-full bg-gameDark/60 border border-white/10 rounded-xl py-3 px-4 text-slate-200 focus:border-gameCyan focus:outline-none focus:ring-1 focus:ring-gameCyan transition-all"
            >
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
              <option value="Technical Lead">Technical Lead</option>
              <option value="Operations Coord">Operations Coord</option>
              <option value="Marketing Team">Marketing Team</option>
              <option value="Volunteer">Volunteer</option>
            </select>
          </div>

          {roleMode === 'IT_HEAD' && (
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">
                Special Head Access Code
              </label>
              <input
                type="password"
                required
                value={formData.accessCode}
                onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
                placeholder="Enter admin access key to authorize registration"
                className="w-full bg-gameDark/60 border border-white/10 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:border-gamePurple focus:outline-none focus:ring-1 focus:ring-gamePurple transition-all"
              />
            </div>
          )}

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold tracking-widest text-sm transition-all duration-300 uppercase ${roleMode === 'IT_HEAD'
                ? 'btn-cyber-purple'
                : 'btn-cyber-cyan'
                }`}
            >
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <span className="text-xs text-slate-400">Already registered? </span>
          <button
            onClick={() => navigate('/login')}
            className="text-xs font-bold text-gameCyan hover:underline hover:text-cyan-300 transition-colors"
          >
            Login Here
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// MEMBER DASHBOARD
// ----------------------------------------------------

const MemberDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      const data = await api.getProfile();
      setProfile(data);
    } catch (err) {
      setError(err.message || 'Failed to load member profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gameDark flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-gameCyan animate-spin" />
          <p className="text-sm text-slate-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gameDark flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel-glow rounded-2xl p-6 text-center">
          <CircleAlert className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-200">Load Failure</h3>
          <p className="text-sm text-slate-400 mt-1 mb-4">{error || 'Could not fetch profile'}</p>
          <button onClick={handleLogout} className="btn-cyber-cyan text-xs">Return to Login</button>
        </div>
      </div>
    );
  }

  const { user, stats, attendance } = profile;

  return (
    <div className="min-h-screen bg-gameDark pb-12">
      {/* Top Header */}
      <header className="border-b border-white/5 bg-gameNavy/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-gameCyan glow-text">⚡</span>
            <div>
              <h1 className="font-extrabold text-xl tracking-wider text-slate-100">TECHBIT 7.0</h1>
              <p className="text-[10px] text-gameAccent tracking-widest uppercase">Member Terminal</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 text-xs font-semibold tracking-wide transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Profile Card */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-gameCyan/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gameCyan/20 to-gamePurple/20 border border-gameCyan/20 flex items-center justify-center">
                <User className="w-8 h-8 text-gameCyan" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-100">{user.name}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="bg-gameBlue/50 border border-gameCyan/15 text-gameCyan text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                    {user.member_id}
                  </span>
                  <span className="bg-white/5 text-slate-300 text-[11px] px-2.5 py-0.5 rounded-full">
                    {user.committee_role}
                  </span>
                  <span className="bg-white/5 text-slate-300 text-[11px] px-2.5 py-0.5 rounded-full">
                    {user.class_year}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t border-white/5 md:border-t-0 pt-4 md:pt-0 flex flex-col md:items-end">
              <span className="text-xs text-slate-400">Account status</span>
              <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1.5 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ACTIVE MEMBER
              </span>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="glass-panel rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Meetings</span>
            <span className="text-3xl font-extrabold text-slate-200 mt-2">{stats.totalMeetings}</span>
          </div>
          <div className="glass-panel rounded-xl p-4 flex flex-col justify-between border-l-2 border-l-emerald-500">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Present</span>
            <span className="text-3xl font-extrabold text-emerald-300 mt-2">{stats.present}</span>
          </div>
          <div className="glass-panel rounded-xl p-4 flex flex-col justify-between border-l-2 border-l-orange-500">
            <span className="text-xs font-semibold text-orange-400 uppercase tracking-wide">Late</span>
            <span className="text-3xl font-extrabold text-orange-300 mt-2">{stats.late}</span>
          </div>
          <div className="glass-panel rounded-xl p-4 flex flex-col justify-between border-l-2 border-l-red-500">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Absent</span>
            <span className="text-3xl font-extrabold text-red-300 mt-2">{stats.absent}</span>
          </div>
          <div className="glass-panel rounded-xl p-4 flex flex-col justify-between border-l-2 border-l-slate-500">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Excused</span>
            <span className="text-3xl font-extrabold text-slate-300 mt-2">{stats.excused}</span>
          </div>
          <div className="glass-panel rounded-xl p-4 flex flex-col justify-between col-span-2 lg:col-span-1 bg-gradient-to-br from-gameNavy to-gameBlue">
            <span className="text-xs font-semibold text-gameCyan uppercase tracking-wide">Attendance</span>
            <span className="text-3xl font-extrabold text-gameCyan glow-text mt-2">
              {stats.percentage !== 'N/A' ? `${stats.percentage}%` : 'N/A'}
            </span>
          </div>
        </div>

        {/* History Table */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gameCyan" />
              Personal Attendance History
            </h3>
            <span className="text-xs text-slate-400">Total sessions marked: {attendance.length}</span>
          </div>

          <div className="overflow-x-auto">
            {attendance.length === 0 ? (
              <div className="py-12 text-center">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No attendance records found.</p>
                <p className="text-xs text-slate-500 mt-1">Attendance statistics will populate once an admin marks your presence in a meeting.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gameBlue/30 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-white/5">
                    <th className="px-6 py-4">Meeting Session</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {attendance.map((record) => (
                    <tr key={record.id} className="hover:bg-white/[2%] transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-200">{record.title}</td>
                      <td className="px-6 py-4 text-slate-400">{record.date}</td>
                      <td className="px-6 py-4 text-slate-400">{record.time}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${record.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          record.status === 'LATE' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                            record.status === 'ABSENT' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}>
                          {record.status === 'PRESENT' && <Check className="w-3.5 h-3.5" />}
                          {record.status === 'LATE' && <Clock className="w-3.5 h-3.5" />}
                          {record.status === 'ABSENT' && <X className="w-3.5 h-3.5" />}
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// ----------------------------------------------------
// ADMIN DASHBOARD
// ----------------------------------------------------

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'members', 'meetings', 'attendance_mark'

  // States
  const [summary, setSummary] = useState(null);
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedMeetingAttendance, setSelectedMeetingAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit Member Modal
  const [editingMember, setEditingMember] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '', member_id: '', email: '', class_year: '', committee_role: ''
  });

  // Create Meeting Modal
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [meetingFormData, setMeetingFormData] = useState({
    title: '', date: '', time: '', purpose: '', notes: ''
  });

  // Attendance Save Confirmation
  const [showSaveSummary, setShowSaveSummary] = useState(false);

  // Fetch initial data
  const fetchSummary = async () => {
    try {
      const sumData = await api.getAdminSummary();
      setSummary(sumData);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMembers = async (query = '') => {
    try {
      const data = await api.getMembers(query);
      setMembers(data);
    } catch (err) {
      setError('Failed to fetch members list');
    }
  };

  const fetchMeetings = async () => {
    try {
      const data = await api.getMeetings();
      setMeetings(data);
    } catch (err) {
      setError('Failed to fetch meetings');
    }
  };

  const initializeDashboard = async () => {
    setLoading(true);
    await Promise.all([fetchSummary(), fetchMembers(), fetchMeetings()]);
    setLoading(false);
  };

  useEffect(() => {
    initializeDashboard();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMembers(searchQuery);
  };

  // Logout
  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  // Members Management Actions
  const handleEditClick = (member) => {
    setEditingMember(member);
    setEditFormData({
      name: member.name,
      member_id: member.member_id,
      email: member.email,
      class_year: member.class_year,
      committee_role: member.committee_role
    });
  };

  const handleSaveMemberEdit = async (e) => {
    e.preventDefault();
    try {
      await api.updateMember(editingMember.id, editFormData);
      setEditingMember(null);
      fetchMembers(searchQuery);
    } catch (err) {
      alert(err.message || 'Failed to update member');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
    if (confirm(`Are you sure you want to set this member to ${nextStatus}?`)) {
      try {
        await api.toggleMemberStatus(id, nextStatus);
        fetchMembers(searchQuery);
      } catch (err) {
        alert(err.message || 'Failed to toggle member status');
      }
    }
  };

  // Meetings Management Actions
  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    try {
      await api.createMeeting(meetingFormData);
      setShowCreateMeeting(false);
      setMeetingFormData({ title: '', date: '', time: '', purpose: '', notes: '' });
      fetchMeetings();
      fetchSummary();
    } catch (err) {
      alert(err.message || 'Failed to create meeting');
    }
  };

  // Attendance marking Actions
  const openAttendanceMarker = async (meeting) => {
    try {
      setLoading(true);
      setSelectedMeeting(meeting);
      const data = await api.getMeetingAttendance(meeting.id);

      // Map members list. If status is null or undefined, default to 'PRESENT' to make marking quick
      const mapped = data.members.map(m => ({
        ...m,
        status: m.status || 'PRESENT'
      }));
      setSelectedMeetingAttendance(mapped);
      setActiveTab('attendance_mark');
    } catch (err) {
      alert(err.message || 'Failed to load attendance sheet');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAll = (status) => {
    const updated = selectedMeetingAttendance.map(item => ({
      ...item,
      status
    }));
    setSelectedMeetingAttendance(updated);
  };

  const handleMemberStatusChange = (userId, status) => {
    const updated = selectedMeetingAttendance.map(item => {
      if (item.user_id === userId) {
        return { ...item, status };
      }
      return item;
    });
    setSelectedMeetingAttendance(updated);
  };

  const handleSaveAttendance = async () => {
    try {
      const records = selectedMeetingAttendance.map(item => ({
        user_id: item.user_id,
        status: item.status
      }));
      await api.saveMeetingAttendance(selectedMeeting.id, records);
      setShowSaveSummary(false);
      setActiveTab('meetings');
      setSelectedMeeting(null);
      initializeDashboard();
    } catch (err) {
      alert(err.message || 'Failed to save attendance records');
    }
  };

  // Calculation for attendance summary of current meeting before save
  const currentMarkingSummary = () => {
    let present = 0, absent = 0, late = 0, excused = 0;
    selectedMeetingAttendance.forEach(a => {
      if (a.status === 'PRESENT') present++;
      else if (a.status === 'ABSENT') absent++;
      else if (a.status === 'LATE') late++;
      else if (a.status === 'EXCUSED') excused++;
    });
    return { present, absent, late, excused };
  };

  if (loading && activeTab !== 'attendance_mark') {
    return (
      <div className="min-h-screen bg-gameDark flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-gameCyan animate-spin" />
          <p className="text-sm text-slate-400">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gameDark flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 border-r border-white/5 bg-gameNavy/40 backdrop-blur-md flex flex-col shrink-0">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <span className="text-2xl text-gameCyan glow-text">⚡</span>
          <div>
            <h1 className="font-extrabold tracking-wider text-slate-100">TECHBIT 7.0</h1>
            <p className="text-[10px] text-gamePurple font-bold tracking-wider uppercase glow-text-purple">IT HEAD PORTAL</p>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => { setActiveTab('overview'); setSelectedMeeting(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'overview'
              ? 'bg-gradient-to-r from-gameCyan/20 to-gameCyan/5 border-l-4 border-gameCyan text-gameCyan'
              : 'text-slate-400 hover:bg-white/[2%] hover:text-slate-200'
              }`}
          >
            <Activity className="w-5 h-5" />
            Overview Dashboard
          </button>

          <button
            onClick={() => { setActiveTab('members'); setSelectedMeeting(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'members'
              ? 'bg-gradient-to-r from-gameCyan/20 to-gameCyan/5 border-l-4 border-gameCyan text-gameCyan'
              : 'text-slate-400 hover:bg-white/[2%] hover:text-slate-200'
              }`}
          >
            <Users className="w-5 h-5" />
            Committee Members
          </button>

          <button
            onClick={() => { setActiveTab('meetings'); setSelectedMeeting(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'meetings' || activeTab === 'attendance_mark'
              ? 'bg-gradient-to-r from-gameCyan/20 to-gameCyan/5 border-l-4 border-gameCyan text-gameCyan'
              : 'text-slate-400 hover:bg-white/[2%] hover:text-slate-200'
              }`}
          >
            <Calendar className="w-5 h-5" />
            Meeting History
          </button>
        </div>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 text-xs font-bold tracking-wide transition-all uppercase"
          >
            <LogOut className="w-4 h-4" />
            Terminate Session
          </button>
        </div>
      </nav>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="border-b border-white/5 bg-gameNavy/20 px-6 md:px-8 py-5 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-wide text-slate-200 capitalize">
            {activeTab === 'overview' && 'System Analytics'}
            {activeTab === 'members' && 'Member Directories'}
            {activeTab === 'meetings' && 'Committee Meetings'}
            {activeTab === 'attendance_mark' && 'Attendance Sheet'}
          </h2>
          <div className="text-xs text-slate-400 font-semibold bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            Admin Mode Active
          </div>
        </header>

        <main className="p-6 md:p-8 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && summary && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-panel rounded-2xl p-6">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold tracking-widest uppercase">Registered Members</span>
                    <Users className="w-5 h-5 text-gameCyan" />
                  </div>
                  <p className="text-4xl font-extrabold text-slate-100 mt-4">{summary.totalMembers}</p>
                </div>

                <div className="glass-panel rounded-2xl p-6">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold tracking-widest uppercase">Meetings Convened</span>
                    <Calendar className="w-5 h-5 text-gamePurple" />
                  </div>
                  <p className="text-4xl font-extrabold text-slate-100 mt-4">{summary.totalMeetings}</p>
                </div>

                <div className="glass-panel rounded-2xl p-6">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold tracking-widest uppercase">Average attendance</span>
                    <TrendingUp className="w-5 h-5 text-gameCyan" />
                  </div>
                  <p className="text-4xl font-extrabold text-gameCyan glow-text mt-4">
                    {summary.averagePercentage !== 'N/A' ? `${summary.averagePercentage}%` : 'N/A'}
                  </p>
                </div>

                <div className="glass-panel rounded-2xl p-6 bg-gradient-to-br from-gameNavy/50 to-gameBlue/30">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold tracking-widest uppercase">Latest Session</span>
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200 mt-3 truncate">
                    {summary.latestMeeting ? summary.latestMeeting.title : 'No sessions'}
                  </h4>
                  {summary.latestMeeting ? (
                    <div className="grid grid-cols-4 gap-1 mt-2 text-[10px] text-center font-bold">
                      <div className="bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded border border-emerald-500/10">
                        P:{summary.latestMeeting.stats.present}
                      </div>
                      <div className="bg-orange-500/10 text-orange-400 px-1 py-0.5 rounded border border-orange-500/10">
                        L:{summary.latestMeeting.stats.late}
                      </div>
                      <div className="bg-red-500/10 text-red-400 px-1 py-0.5 rounded border border-red-500/10">
                        A:{summary.latestMeeting.stats.absent}
                      </div>
                      <div className="bg-slate-500/10 text-slate-400 px-1 py-0.5 rounded border border-slate-500/10">
                        E:{summary.latestMeeting.stats.excused}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 mt-2">Create meeting to mark attendance.</p>
                  )}
                </div>
              </div>

              {/* Latest meeting visualization */}
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="font-bold text-lg text-slate-200 mb-4 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-gameCyan" />
                  Latest Session Attendance Summary
                </h3>
                {summary.latestMeeting ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                      <h4 className="text-base font-bold text-slate-200">{summary.latestMeeting.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">Convened on {summary.latestMeeting.date}</p>

                      <div className="space-y-3.5 mt-6">
                        {Object.entries(summary.latestMeeting.stats).map(([key, val]) => {
                          const maxVal = Math.max(...Object.values(summary.latestMeeting.stats), 1);
                          const pct = (val / maxVal) * 100;
                          const label = key.toUpperCase();
                          const colorClass =
                            label === 'PRESENT' ? 'bg-emerald-500' :
                              label === 'LATE' ? 'bg-orange-500' :
                                label === 'ABSENT' ? 'bg-red-500' : 'bg-slate-500';
                          return (
                            <div key={key}>
                              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-300">
                                <span>{label}</span>
                                <span>{val} member(s)</span>
                              </div>
                              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className={`h-full ${colorClass}`} style={{ width: `${pct}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="bg-gameBlue/20 rounded-xl p-5 border border-white/5 text-center flex flex-col justify-center items-center">
                      <TrendingUp className="w-10 h-10 text-gameCyan mb-2" />
                      <p className="text-sm font-semibold text-slate-300">Track All Events Attendance</p>
                      <p className="text-xs text-slate-500 mt-1 mb-4">You can easily update status, add new meetings, or edit prior attendance records.</p>
                      <button
                        onClick={() => setActiveTab('meetings')}
                        className="btn-outline-cyber text-xs flex items-center gap-1.5"
                      >
                        Manage Meetings <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500">
                    <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-2" />
                    <p className="text-sm">No meetings recorded in the system.</p>
                    <button
                      onClick={() => setShowCreateMeeting(true)}
                      className="btn-cyber-cyan text-xs mt-3 flex items-center gap-1.5 mx-auto"
                    >
                      <Plus className="w-4 h-4" /> Create First Meeting
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MEMBERS */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, ID, email, or role..."
                      className="w-full bg-gameNavy/40 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-slate-200 placeholder-slate-500 focus:border-gameCyan focus:outline-none transition-all"
                    />
                  </div>
                  <button type="submit" className="btn-outline-cyber text-sm px-5 py-2.5">
                    Search
                  </button>
                </form>
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); fetchMembers(''); }}
                    className="bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {/* Members Table */}
              <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  {members.length === 0 ? (
                    <div className="py-12 text-center text-slate-500">
                      <Users className="w-12 h-12 text-slate-700 mx-auto mb-2" />
                      <p className="text-sm">No members found matching the search criteria.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gameBlue/30 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-white/5">
                          <th className="px-6 py-4">Name / ID</th>
                          <th className="px-6 py-4">Contact Email</th>
                          <th className="px-6 py-4">Class Year</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {members.map((member) => (
                          <tr key={member.id} className="hover:bg-white/[2%] transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-200">{member.name}</p>
                              <p className="text-xs text-gameCyan font-semibold mt-0.5">{member.member_id}</p>
                            </td>
                            <td className="px-6 py-4 text-slate-300">{member.email}</td>
                            <td className="px-6 py-4 text-slate-400">{member.class_year}</td>
                            <td className="px-6 py-4">
                              <span className="bg-white/5 text-slate-300 px-2 py-0.5 rounded text-xs border border-white/5">
                                {member.committee_role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${member.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                {member.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="inline-flex gap-2">
                                <button
                                  onClick={() => handleEditClick(member)}
                                  className="p-2 text-slate-400 hover:text-gameCyan hover:bg-gameCyan/10 rounded-lg transition-all"
                                  title="Edit details"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(member.id, member.status)}
                                  className={`p-2 rounded-lg text-xs font-bold transition-all uppercase ${member.status === 'ACTIVE'
                                    ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                                    : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                                    }`}
                                >
                                  {member.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEETINGS */}
          {activeTab === 'meetings' && (
            <div className="space-y-6">
              {/* Top Row: Create Meeting button */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-400">Select any meeting below to view or edit attendee records.</p>
                <button
                  onClick={() => setShowCreateMeeting(true)}
                  className="btn-cyber-cyan text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Create New Meeting
                </button>
              </div>

              {/* Meetings List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {meetings.length === 0 ? (
                  <div className="col-span-2 py-16 text-center text-slate-500 glass-panel rounded-2xl">
                    <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-2" />
                    <p className="text-sm">No meetings recorded.</p>
                    <p className="text-xs text-slate-600 mt-1">Create a meeting and select it to start taking attendance.</p>
                  </div>
                ) : (
                  meetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="glass-panel hover:border-gameCyan/20 transition-all rounded-2xl p-6 flex flex-col justify-between group cursor-pointer hover:shadow-xl"
                      onClick={() => openAttendanceMarker(meeting)}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="font-bold text-lg text-slate-100 group-hover:text-gameCyan transition-colors">
                            {meeting.title}
                          </h3>
                          <span className="shrink-0 text-[11px] bg-gameCyan/10 text-gameCyan border border-gameCyan/20 font-bold px-2 py-0.5 rounded">
                            ID: {meeting.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 font-semibold">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gamePurple" />
                            {meeting.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gamePurple" />
                            {meeting.time}
                          </span>
                        </div>
                        {meeting.purpose && (
                          <p className="text-xs text-slate-300 mt-3.5 line-clamp-2">
                            <strong className="text-slate-400 uppercase text-[10px] tracking-wider block mb-0.5">Agenda</strong>
                            {meeting.purpose}
                          </p>
                        )}
                        {meeting.notes && (
                          <p className="text-xs text-slate-400 mt-3 line-clamp-2 italic border-l border-white/10 pl-2">
                            {meeting.notes}
                          </p>
                        )}
                      </div>

                      <div className="border-t border-white/5 mt-5 pt-4 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Organized by {meeting.creator_name}</span>
                        <span className="text-gameCyan font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Manage Attendance <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ATTENDANCE SHEET */}
          {activeTab === 'attendance_mark' && selectedMeeting && (
            <div className="space-y-6">
              {/* Back Header & Info */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 glass-panel rounded-2xl">
                <div>
                  <button
                    onClick={() => { setActiveTab('meetings'); setSelectedMeeting(null); }}
                    className="text-xs font-bold text-gameCyan hover:underline mb-2 block flex items-center gap-1"
                  >
                    ← Back to Meetings
                  </button>
                  <h3 className="font-extrabold text-xl text-slate-200">{selectedMeeting.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 flex gap-4">
                    <span><strong>Date:</strong> {selectedMeeting.date}</span>
                    <span><strong>Time:</strong> {selectedMeeting.time}</span>
                  </p>
                </div>

                {/* Bulk Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleMarkAll('PRESENT')}
                    className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-emerald-500/20"
                  >
                    Mark All Present
                  </button>
                  <button
                    onClick={() => handleMarkAll('ABSENT')}
                    className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-red-500/20"
                  >
                    Mark All Absent
                  </button>
                  <button
                    onClick={() => handleMarkAll('EXCUSED')}
                    className="bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-slate-500/20"
                  >
                    Mark All Excused
                  </button>
                </div>
              </div>

              {/* Members Sheet */}
              <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  {selectedMeetingAttendance.length === 0 ? (
                    <div className="py-16 text-center text-slate-500">
                      <Users className="w-12 h-12 text-slate-700 mx-auto mb-2" />
                      <p className="text-sm">No active members found to mark attendance.</p>
                      <p className="text-xs text-slate-600 mt-1">Please ensure you have active committee members registered first.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gameBlue/30 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-white/5">
                          <th className="px-6 py-4">Attendee Info</th>
                          <th className="px-6 py-4">Committee Role</th>
                          <th className="px-6 py-4 text-center">Status Selection</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {selectedMeetingAttendance.map((record) => (
                          <tr key={record.user_id} className="hover:bg-white/[1%] transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-200">{record.name}</p>
                              <p className="text-xs text-gameCyan font-semibold mt-0.5">{record.member_id}</p>
                            </td>
                            <td className="px-6 py-4 text-slate-400">{record.committee_role}</td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center items-center gap-1 sm:gap-2">
                                {[
                                  { value: 'PRESENT', label: 'Present', color: 'peer-checked:bg-emerald-500 peer-checked:text-gameDark border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' },
                                  { value: 'LATE', label: 'Late', color: 'peer-checked:bg-orange-500 peer-checked:text-gameDark border-orange-500/30 text-orange-400 hover:bg-orange-500/10' },
                                  { value: 'ABSENT', label: 'Absent', color: 'peer-checked:bg-red-500 peer-checked:text-white border-red-500/30 text-red-400 hover:bg-red-500/10' },
                                  { value: 'EXCUSED', label: 'Excused', color: 'peer-checked:bg-slate-500 peer-checked:text-white border-slate-500/30 text-slate-400 hover:bg-slate-500/10' }
                                ].map((opt) => (
                                  <label key={opt.value} className="cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`status-${record.user_id}`}
                                      value={opt.value}
                                      checked={record.status === opt.value}
                                      onChange={() => handleMemberStatusChange(record.user_id, opt.value)}
                                      className="sr-only peer"
                                    />
                                    <span className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold border transition-all inline-block text-center min-w-[70px] ${opt.color}`}>
                                      {opt.label}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Save Attendance Submit */}
              {selectedMeetingAttendance.length > 0 && (
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setShowSaveSummary(true)}
                    className="btn-cyber-cyan font-bold tracking-widest text-sm uppercase px-8 py-3.5"
                  >
                    Save Attendance Sheet
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: EDIT MEMBER DETAILS */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-panel-glow rounded-2xl p-6 relative">
            <h3 className="text-xl font-bold text-slate-100 mb-5">Edit Committee Member Details</h3>
            <form onSubmit={handleSaveMemberEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Full Name</label>
                <input
                  type="text" required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-gameDark border border-white/10 rounded-xl py-2 px-3 text-slate-200 text-sm focus:border-gameCyan focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Member ID</label>
                  <input
                    type="text" required
                    value={editFormData.member_id}
                    onChange={(e) => setEditFormData({ ...editFormData, member_id: e.target.value })}
                    className="w-full bg-gameDark border border-white/10 rounded-xl py-2 px-3 text-slate-200 text-sm focus:border-gameCyan focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Email Address</label>
                  <input
                    type="email" required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full bg-gameDark border border-white/10 rounded-xl py-2 px-3 text-slate-200 text-sm focus:border-gameCyan focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Class / Academic Year</label>
                  <select
                    value={editFormData.class_year}
                    onChange={(e) => setEditFormData({ ...editFormData, class_year: e.target.value })}
                    className="w-full bg-gameDark border border-white/10 rounded-xl py-2.5 px-3 text-slate-200 text-sm focus:border-gameCyan focus:outline-none"
                  >
                    <option value="First Year (Year 1)">First Year (Year 1)</option>
                    <option value="Second Year (Year 2)">Second Year (Year 2)</option>
                    <option value="Third Year (Year 3)">Third Year (Year 3)</option>
                    <option value="Senior (Year 4)">Senior (Year 4)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Committee Role</label>
                  <select
                    value={editFormData.committee_role}
                    onChange={(e) => setEditFormData({ ...editFormData, committee_role: e.target.value })}
                    className="w-full bg-gameDark border border-white/10 rounded-xl py-2.5 px-3 text-slate-200 text-sm focus:border-gameCyan focus:outline-none"
                  >
                    <option value="Developer">Developer</option>
                    <option value="Designer">Designer</option>
                    <option value="Technical Lead">Technical Lead</option>
                    <option value="Operations Coord">Operations Coord</option>
                    <option value="Marketing Team">Marketing Team</option>
                    <option value="Volunteer">Volunteer</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-cyber-cyan text-xs uppercase"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE MEETING */}
      {showCreateMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-panel-glow rounded-2xl p-6 relative">
            <h3 className="text-xl font-bold text-slate-100 mb-5">Create New Committee Meeting</h3>
            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Meeting Session Title</label>
                <input
                  type="text" required
                  placeholder="e.g. Sprint Planning Session"
                  value={meetingFormData.title}
                  onChange={(e) => setMeetingFormData({ ...meetingFormData, title: e.target.value })}
                  className="w-full bg-gameDark border border-white/10 rounded-xl py-2.5 px-3 text-slate-200 text-sm focus:border-gameCyan focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Date</label>
                  <input
                    type="date" required
                    value={meetingFormData.date}
                    onChange={(e) => setMeetingFormData({ ...meetingFormData, date: e.target.value })}
                    className="w-full bg-gameDark border border-white/10 rounded-xl py-2 px-3 text-slate-200 text-sm focus:border-gameCyan focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Time</label>
                  <input
                    type="time" required
                    value={meetingFormData.time}
                    onChange={(e) => setMeetingFormData({ ...meetingFormData, time: e.target.value })}
                    className="w-full bg-gameDark border border-white/10 rounded-xl py-2 px-3 text-slate-200 text-sm focus:border-gameCyan focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Session Purpose / Agenda</label>
                <textarea
                  placeholder="Review current milestones, backlog issues..."
                  value={meetingFormData.purpose}
                  onChange={(e) => setMeetingFormData({ ...meetingFormData, purpose: e.target.value })}
                  rows={2}
                  className="w-full bg-gameDark border border-white/10 rounded-xl py-2 px-3 text-slate-200 text-sm focus:border-gameCyan focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Administrative Notes (Optional)</label>
                <textarea
                  placeholder="Bring laptops, design mockups..."
                  value={meetingFormData.notes}
                  onChange={(e) => setMeetingFormData({ ...meetingFormData, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-gameDark border border-white/10 rounded-xl py-2 px-3 text-slate-200 text-sm focus:border-gameCyan focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowCreateMeeting(false)}
                  className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-cyber-cyan text-xs uppercase"
                >
                  Create Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SAVE ATTENDANCE SUMMARY CONFIRMATION */}
      {showSaveSummary && selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel-glow rounded-2xl p-6 text-center">
            <CheckSquare className="w-12 h-12 text-gameCyan mx-auto mb-3" />
            <h3 className="text-xl font-bold text-slate-200">Confirm Attendance Summary</h3>
            <p className="text-xs text-slate-400 mt-1 mb-6">Review the session records before committing to the database.</p>

            <div className="grid grid-cols-2 gap-3 mb-6 font-bold text-sm">
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-3 rounded-xl">
                <span className="block text-xs uppercase text-slate-500 font-semibold mb-0.5">Present</span>
                {currentMarkingSummary().present}
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 py-3 rounded-xl">
                <span className="block text-xs uppercase text-slate-500 font-semibold mb-0.5">Late</span>
                {currentMarkingSummary().late}
              </div>
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 py-3 rounded-xl">
                <span className="block text-xs uppercase text-slate-500 font-semibold mb-0.5">Absent</span>
                {currentMarkingSummary().absent}
              </div>
              <div className="bg-slate-500/10 border border-slate-500/20 text-slate-400 py-3 rounded-xl">
                <span className="block text-xs uppercase text-slate-500 font-semibold mb-0.5">Excused</span>
                {currentMarkingSummary().excused}
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowSaveSummary(false)}
                className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 px-5 py-2.5 rounded-xl text-xs font-bold uppercase transition-all"
              >
                Go Back
              </button>
              <button
                onClick={handleSaveAttendance}
                className="btn-cyber-cyan text-xs uppercase"
              >
                Save Attendance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------
// MAIN ROUTING
// ----------------------------------------------------

const MainApp = () => {
  const token = api.getToken();
  const user = api.getCurrentUser();
  const location = useLocation();

  // Root redirect logic
  if (location.pathname === '/') {
    if (!token || !user) {
      return <Navigate to="/login" replace />;
    }
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['MEMBER']}>
            <MemberDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
};

export default App;
