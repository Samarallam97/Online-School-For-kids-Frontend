import api from './api';
import { Achievement, Course } from './studentService';
import { NotificationPreferences } from './userService';

export enum ChildStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  EMAIL_NOT_VERIFIED = "email_not_verified",
}

export interface Child {
  id: string;
  name: string;
  age: number;
  avatar?: string;
  profilePictureUrl?: string;
  courses: number;
  status: ChildStatus
}

 export const parentService = {

 getLinkedChildren: async (): Promise<Child[]> => {
    const response = await api.get('/Parent/children');
    return response.data;
  },


  addChild: async (childData: { 
    name: string; 
    age: number; 
    email?: string 
  }): Promise<Child> => {
    const response = await api.post('/Parent/children', childData);
    return response.data;
  },

  removeChild: async (childId: string): Promise<void> => {
    await api.delete(`/Parent/children/${childId}`);
  },

  searchChildByEmail: async (email: string): Promise<{ 
    exists: boolean; 
    child?: any;
  }> => {
    const response = await api.get(`/Parent/search-child`, { 
      params: { email } 
    });
    return response.data;
  },

  sendChildLinkInvite: async (childId: string): Promise<void> => {
    await api.post(`/Parent/send-invite/${childId}`);
  },

  createAndLinkChild: async (childData: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    dateOfBirth: string;
    country: string;
  }): Promise<any> => {
    const response = await api.post('/Parent/create-child', childData);
    return response.data;
  },

  getChildProgress: async (childId: string): Promise<any> => {
    const response = await api.get(`/Parent/children/${childId}/progress`);
    return response.data;
  },

async getChildNotificationPreferences(childId: string): Promise<NotificationPreferences> {
  try {
    const response = await api.get(`/parent/children/${childId}/notifications`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch child notification preferences:', error);
    // Return default preferences if fetch fails
    return {
      progressUpdates: true,
      weeklyReports: true,
      achievementAlerts: true,
      paymentReminders: true,
    };
  }
},


async updateChildNotificationPreferences(
  childId: string,
  preferences: NotificationPreferences
): Promise<void> {
  const response = await api.put(
    `/parent/children/${childId}/notifications`,
    preferences
  );
  return response.data;
}
,

}