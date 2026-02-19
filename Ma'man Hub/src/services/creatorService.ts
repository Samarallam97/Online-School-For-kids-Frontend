import api from './api';



export interface CreatorCourse {
  id: string;
  title: string;
  thumbnail?: string;
  studentsCount: number;
  rating: number;
  category: string;
  isPublishedOnProfile: boolean;
}

export const creatorService = {

  // Courses
  getCreatorCourses: async (): Promise<CreatorCourse[]> => {
    const response = await api.get('/ContentCreator/courses');
    return response.data;
  },

  toggleCourseProfileVisibility: async (
    courseId: string,
    isPublishedOnProfile: boolean
  ): Promise<void> => {
    await api.put(`/ContentCreator/courses/${courseId}/profile-visibility`, {
      isPublishedOnProfile,
    });
  },

}