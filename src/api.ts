import { User, FamilyMember, MedicalReport, Doctor, NotificationItem, FitnessData, DietPlan } from './types';

const TOKEN_KEY = 'healthyfy_jwt_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errMessage = 'An unexpected error occurred';
    try {
      const errorData = await response.json();
      errMessage = errorData.error || errMessage;
    } catch {
      errMessage = response.statusText || errMessage;
    }
    throw new Error(errMessage);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.token);
    return res;
  },

  async register(data: { name: string; email: string; password: string; phone?: string; city?: string }): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async updateProfile(data: { name: string; phone: string; city: string; preferences: { medicationAlarms: boolean; hydrationAlerts: boolean; reportReadyAlerts: boolean; fitnessMilestones: boolean } }): Promise<{ user: User; preferences: typeof data.preferences }> {
    return request<{ user: User; preferences: typeof data.preferences }>('/api/auth/profile', { method: 'PUT', body: JSON.stringify(data) });
  },

  // Family Members
  async getFamily(): Promise<FamilyMember[]> {
    return request<FamilyMember[]>('/api/family');
  },

  async createFamilyMember(data: Partial<FamilyMember>): Promise<FamilyMember> {
    return request<FamilyMember>('/api/family', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateFamilyMember(id: string, data: Partial<FamilyMember>): Promise<FamilyMember> {
    return request<FamilyMember>(`/api/family/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteFamilyMember(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/family/${id}`, {
      method: 'DELETE',
    });
  },

  // Medical Reports & Records
  async getRecords(memberId?: string): Promise<MedicalReport[]> {
    const query = memberId ? `?memberId=${encodeURIComponent(memberId)}` : '';
    return request<MedicalReport[]>(`/api/records${query}`);
  },

  async saveRecord(report: Partial<MedicalReport>): Promise<MedicalReport> {
    return request<MedicalReport>('/api/records', {
      method: 'POST',
      body: JSON.stringify(report),
    });
  },

  async deleteRecord(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/records/${id}`, {
      method: 'DELETE',
    });
  },

  // AI Operations
  async analyzeReport(params: {
    reportType: string;
    reportText?: string;
    imageBase64?: string;
    imageMimeType?: string;
    memberId: string;
  }): Promise<MedicalReport> {
    return request<MedicalReport>('/api/ai/analyze-report', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async chatWithAi(message: string, memberId: string): Promise<{ reply: string }> {
    return request<{ reply: string }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, memberId }),
    });
  },

  async generateDiet(data: {
    age: number;
    goals: string;
    activityLevel: string;
    dietaryPreference: string;
    allergies: string;
    schedule: string;
    memberId: string;
  }): Promise<DietPlan> {
    return request<DietPlan>('/api/ai/generate-diet', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Doctors
  async getDoctors(params?: { specialty?: string; query?: string; availableToday?: boolean }): Promise<Doctor[]> {
    const q = new URLSearchParams();
    if (params?.specialty) q.append('specialty', params.specialty);
    if (params?.query) q.append('query', params.query);
    if (params?.availableToday) q.append('availableToday', 'true');
    return request<Doctor[]>(`/api/doctors?${q.toString()}`);
  },

  // Fitness
  async getFitness(): Promise<FitnessData> {
    return request<FitnessData>('/api/fitness');
  },

  async toggleFitnessSync(): Promise<{ syncEnabled: boolean; message: string }> {
    return request<{ syncEnabled: boolean; message: string }>('/api/fitness/toggle-sync', {
      method: 'POST',
    });
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    return request<NotificationItem[]>('/api/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'POST',
    });
  },

  async clearAllNotifications(): Promise<{ success: boolean }> {
    return request<{ success: boolean }>('/api/notifications/clear-all', { method: 'POST' });
  },

  async bookAppointment(data: { doctorId: string; date: string; slot: string }) {
    return request<{ id: string; doctorName: string; specialty: string; date: string; slot: string; status: string }>('/api/appointments', { method: 'POST', body: JSON.stringify(data) });
  },

  async getAppointments() {
    return request<Array<{ id: string; doctorName: string; specialty: string; date: string; slot: string; status: string }>>('/api/appointments');
  },
};
