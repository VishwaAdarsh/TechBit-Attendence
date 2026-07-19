const API_URL = 'https://techbit-attendence.onrender.com';
const API_BASE_URL = `${API_URL}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('techbit_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }
  return data;
};

export const api = {
  // Authentication
  registerMember: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('techbit_token', data.token);
      localStorage.setItem('techbit_user', JSON.stringify(data.user));
    }
    return data;
  },

  loginMember: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/auth/login/member`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('techbit_token', data.token);
      localStorage.setItem('techbit_user', JSON.stringify(data.user));
    }
    return data;
  },

  loginAdmin: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/auth/login/admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('techbit_token', data.token);
      localStorage.setItem('techbit_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('techbit_token');
    localStorage.removeItem('techbit_user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('techbit_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem('techbit_token');
  },

  // Profile (includes stats/attendance for members)
  getProfile: async () => {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return await handleResponse(res);
  },

  // Admin: Stats Summary
  getAdminSummary: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/summary`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return await handleResponse(res);
  },

  // Admin: Members Management
  getMembers: async (searchQuery = '') => {
    const url = searchQuery
      ? `${API_BASE_URL}/admin/members?q=${encodeURIComponent(searchQuery)}`
      : `${API_BASE_URL}/admin/members`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return await handleResponse(res);
  },

  updateMember: async (id, memberData) => {
    const res = await fetch(`${API_BASE_URL}/admin/members/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(memberData)
    });
    return await handleResponse(res);
  },

  toggleMemberStatus: async (id, status) => {
    const res = await fetch(`${API_BASE_URL}/admin/members/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return await handleResponse(res);
  },

  // Admin: Meetings
  createMeeting: async (meetingData) => {
    const res = await fetch(`${API_BASE_URL}/admin/meetings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(meetingData)
    });
    return await handleResponse(res);
  },

  getMeetings: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/meetings`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return await handleResponse(res);
  },

  // Admin: Attendance
  getMeetingAttendance: async (meetingId) => {
    const res = await fetch(`${API_BASE_URL}/admin/meetings/${meetingId}/attendance`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return await handleResponse(res);
  },

  saveMeetingAttendance: async (meetingId, records) => {
    const res = await fetch(`${API_BASE_URL}/admin/meetings/${meetingId}/attendance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ records })
    });
    return await handleResponse(res);
  }
};
