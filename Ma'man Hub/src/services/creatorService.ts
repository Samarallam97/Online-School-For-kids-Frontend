import api from './api';

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

export const creatorService = {

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
        const response = await api.get('/ContentCreator/payouts', { params });
        return response.data;
    },
    getExperiences: async (): Promise<WorkExperience[]> => {
        const response = await api.get('/ContentCreator/experiences');
        return response.data;
    },

    addExperience: async (experienceData: Omit<WorkExperience, 'id'>): Promise<WorkExperience> => {
        const response = await api.post('/ContentCreator/experiences', experienceData);
        return response.data;
    },

    updateExperience: async (experienceId: string, experienceData: Partial<WorkExperience>): Promise<WorkExperience> => {
        const response = await api.put(`/ContentCreator/experiences/${experienceId}`, experienceData);
        return response.data;
    },

    deleteExperience: async (experienceId: string): Promise<void> => {
        await api.delete(`/ContentCreator/experiences/${experienceId}`);
    },
}