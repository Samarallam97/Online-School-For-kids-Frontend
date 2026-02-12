
import api from './api';


export interface ProfileDto {
    id: string;
    fullName: string;
    email: string;
    role: string;
    profilePictureUrl?: string;
    phone?: string;
    country: string;
    bio?: string;
    createdAt: string;
    isFirstLogin: boolean;
    paymentMethods?: PaymentMethod[];
    notificationPreferences?: NotificationPreferences;



    // Student & Parent
    learningGoals?: string;
    enrolledCourses?: number;
    achievements?: number;
    totalHoursLearned?: number;

    // Parent
    childrenCount?: number;

    // ContentCreator-specific
    isVerifiedCreator?: boolean;
    expertise?: string[];
    totalCourses?: number;
    totalStudents?: number;
    totalRevenue?: number;
    averageRating?: number;
    socialLinks?: any;
    payoutSettings?: any;

    // Specialist-specific
    professionalTitle?: string;
    specializations?: string[];
    certifications?: any[];
    yearsOfExperience?: number;
    availability?: any[];
    hourlyRate?: number;
    sessionRates?: any;
    rating?: number;
    studentsHelped?: number;
}

export interface NotificationPreferences {
    progressUpdates: boolean;
    weeklyReports: boolean;
    achievementAlerts: boolean;
    paymentReminders: boolean;
}

export interface PaymentMethod {
    id: string;
    type: string; // vodafone_cash, instapay, fawry, bank_account
    displayInfo: string; // Display text for the payment method
    isDefault: boolean;
    // Legacy card fields (for backward compatibility)
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
}


export interface UploadProfilePictureResponse {
  profilePictureUrl: string;
  message: string;
}

export interface PublicProfileDto {
  id: string;
  fullName: string;
  role: string;
  profilePictureUrl?: string;
  bio?: string;
  country?: string;
  joinedDate?: string;
  enrolledCourses: number;
  achievements: number;
  totalHoursLearned: number;
  recentAchievements?: Array<{
    name: string;
    earnedDate: string;
  }>;
  enrolledCoursesList?: Array<{
    name: string;
    instructor: string;
    progress?: number;
  }>;
}

export const userService = {


    getProfile: async (): Promise<ProfileDto> => {
        const response = await api.get('/User/me');
        return response.data;
    },


    updateProfile: async (data: Partial<ProfileDto>): Promise<ProfileDto> => {
        const response = await api.put('/User/profile', data);
        return response.data;
    },

    getNotificationPreferences: async (): Promise<NotificationPreferences> => {
        const response = await api.get('/User/notifications');
        return response.data;
    },

    updateNotificationPreferences: async (
        preferences: NotificationPreferences
    ): Promise<NotificationPreferences> => {
        const response = await api.put('/User/notifications', preferences);
        return response.data;
    },

    getPaymentMethods: async (): Promise<PaymentMethod[]> => {
        const response = await api.get('/User/payment-methods');
        return response.data;
    },

    addPaymentMethod: async (paymentMethodData: {
        type: 'vodafone_cash' | 'instapay' | 'fawry' | 'bank_account';
        // Vodafone Cash
        phoneNumber?: string;
        // Instapay
        instapayId?: string;
        // Fawry
        referenceNumber?: string;
        // Bank Account
        accountHolderName?: string;
        bankName?: string;
        accountNumber?: string;
        iban?: string;
    }): Promise<PaymentMethod> => {
        const response = await api.post('/User/payment-methods', paymentMethodData);
        return response.data;
    },

    setDefaultPaymentMethod: async (paymentMethodId: string): Promise<void> => {
        await api.put(`/User/payment-methods/${paymentMethodId}/default`);
    },

    removePaymentMethod: async (paymentMethodId: string): Promise<void> => {
        await api.delete(`/User/payment-methods/${paymentMethodId}`);
    },
    uploadProfilePicture: async (formData: FormData): Promise<UploadProfilePictureResponse> => {
    const response = await api.post('/User/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProfilePicture: async (): Promise<void> => {
    await api.delete('/User/profile-picture');
  },

    getPublicProfile: async (userId: string): Promise<PublicProfileDto> => {
    const response = await api.get(`/User/${userId}/public-profile`);
    return response.data;
  },
}