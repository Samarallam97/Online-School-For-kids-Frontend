
import api from './api';

export interface Course {
  id: string;
  title: string;
  progress: number;
  instructor: string;
  thumbnail?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface AcceptInviteResponse {
  message: string;
  parentName?: string;
}

export interface ParentInfo {
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentProfilePictureUrl?: string;
  linkedSince?: string;
}

export const studentService = {

  // Get enrolled courses
  getEnrolledCourses: async (): Promise<Course[]> => {
    const response = await api.get('/Student/courses');
    return response.data;
  },

  // Get achievements
  getAchievements: async (): Promise<Achievement[]> => {
    const response = await api.get('/Student/achievements');
    return response.data;
  },

  acceptParentInvite: async (token: string): Promise<AcceptInviteResponse> => {
    const response = await api.post('/Student/accept-invite', { token });
    return response.data;
  },
    getLinkedParent: async (): Promise<ParentInfo | null> => {
    try {
      const response = await api.get('/Student/linked-parent');
      return response.data;
    } catch (error: any) {
      // If no parent is linked, return null
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  unlinkParent: async () => {
    const response = await api.delete('/Student/unlink-parent');
    return response.data;
  },

}