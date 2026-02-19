
import api from './api';

export interface SocialLink {
    id: string;
    name: string;
    value: string;
}

export interface NotificationPreferences {
    
    // all except admin
    weeklyReports?: boolean;
    messages?: boolean;
    commentReplies?: boolean;

    // student , parent
    progressUpdates?: boolean;
    achievementAlerts?: boolean;
    paymentReminders?: boolean;

    // Creator
    courseEnrollments?: boolean;

    // Specialist
    newSessionBooking?: boolean;
    sessionCancellation?: boolean;
    sessionReminder?: boolean;

    // creator , specialist
    reviewNotifications?: boolean;
    payoutAlerts?: boolean;


    // [key: string]: boolean | undefined;
}

export interface PaymentMethod {
    id: string;
    type: string; // vodafone_cash, instapay, fawry, bank_account
    displayInfo: string;
    isDefault: boolean;
    // isVerified: boolean;
}

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
    socialLinks?: SocialLink;


    // Student & Parent
    learningGoals?: string;
    enrolledCourses?: number;
    achievements?: number;
    totalHoursLearned?: number;

    // Parent
    childrenCount?: number;

    // ContentCreator-specific
    isVerifiedCreator?: boolean;
    experiences?: WorkExperience[];
    totalCourses?: number;
    totalStudents?: number;
    totalRevenue?: number;
    averageRating?: number;



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


export interface UploadProfilePictureDto {
    profilePictureUrl: string;
    message: string;
}

export interface WorkExperience {
    id: string;
    title: string;
    place: string;
    startDate: string;
    endDate: string | null;
    isCurrentRole: boolean;
}

export interface PayoutDto {
    id: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    payoutSettingId: string;
    scheduledDate: string;
    processedDate?: string;
    currency: string;
    month: string;
    year: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  fileUrl?: string;
  fileName?: string;
}

export interface PublicProfileDto {
    id: string;
    fullName: string;
    role: string;
    profilePictureUrl?: string;
    bio?: string;
    country?: string;
    joinedDate?: string;
    enrolledCourses?: number;
    achievements?: number;
    totalHoursLearned?: number;
    recentAchievements?: Array<{
        name: string;
        earnedDate: string;
    }>;
    enrolledCoursesList?: Array<{
        name: string;
        instructor: string;
        progress?: number;
    }>;
    //TODO:: experience , social links
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
        type: 'card' | 'vodafone_cash' | 'instapay' | 'fawry' | 'bank_account'; // Added 'card'
        // Card
        cardNumber?: string;
        cardholderName?: string;
        expiryMonth?: number;
        expiryYear?: number;
        cvv?: string;
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

    // requestPayoutVerification: async (payoutSettingId: string): Promise<void> => {
    //     await api.post(`/User/payment-methods/${payoutSettingId}/request-verification`);
    // },

    uploadProfilePicture: async (formData: FormData): Promise<UploadProfilePictureDto> => {
        const response = await api.post('/User/profile-picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        let user = JSON.parse(localStorage.getItem("user"))
        user.profilePictureUrl = response.data.profilePictureUrl
        localStorage.setItem("user" , JSON.stringify(user))
        return response.data;
    },

    deleteProfilePicture: async (): Promise<void> => {
        await api.delete('/User/profile-picture');
    },
    getSocialLinks: async (): Promise<SocialLink[]> => {
        const response = await api.get('/User/social-links');
        return response.data;
    },

    addSocialLink: async (linkData: {
        name: string;
        value: string;
    }): Promise<SocialLink> => {
        const response = await api.post('/User/social-links', linkData);
        return response.data;
    },

    updateSocialLink: async (linkId: string, linkData: {
        name: string;
        value: string;
    }): Promise<SocialLink> => {
        const response = await api.put(`/User/social-links/${linkId}`, linkData);
        return response.data;
    },

    deleteSocialLink: async (linkId: string): Promise<void> => {
        await api.delete(`/User/social-links/${linkId}`);
    },

        // Get payout history
    getPayouts: async (params?: {
        status?: 'pending' | 'processing' | 'completed' | 'failed';
        limit?: number;
        offset?: number;
    }): Promise<{
        payouts: PayoutDto[];
        total: number;
        nextPayout?: PayoutDto;
    }> => {
        const response = await api.get('/User/payouts', { params });
        return response.data;
    },
    getExperiences: async (): Promise<WorkExperience[]> => {
        const response = await api.get('/User/experiences');
        return response.data;
    },

    addExperience: async (experienceData: Omit<WorkExperience, 'id'>): Promise<WorkExperience> => {
        const response = await api.post('/User/experiences', experienceData);
        return response.data;
    },

    updateExperience: async (experienceId: string, experienceData: Partial<WorkExperience>): Promise<WorkExperience> => {
        const response = await api.put(`/User/experiences/${experienceId}`, experienceData);
        return response.data;
    },

    deleteExperience: async (experienceId: string): Promise<void> => {
        await api.delete(`/User/experiences/${experienceId}`);
    },

  getCertifications: async (): Promise<Certification[]> => {
    const response = await api.get('/User/certifications');
    return response.data;
  },

  addCertification: async (data: {
    name: string;
    issuer: string;
    year: string;
    file?: File;
  }): Promise<Certification> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('issuer', data.issuer);
    formData.append('year', data.year);
    if (data.file) formData.append('file', data.file);
    const response = await api.post('/User/certifications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteCertification: async (certificationId: string): Promise<void> => {
    await api.delete(`/User/certifications/${certificationId}`);
  },

  downloadCertification: async (certificationId: string): Promise<Blob> => {
    const response = await api.get(
      `/User/certifications/${certificationId}/download`,
      { responseType: 'blob' }
    );
    return response.data;
  },

    getPublicProfile: async (userId: string): Promise<PublicProfileDto> => {
        const response = await api.get(`/User/${userId}/public-profile`);
        return response.data;
    },
}