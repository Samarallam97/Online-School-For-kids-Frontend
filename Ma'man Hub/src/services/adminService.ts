import api from './api';

export interface AdminSecuritySettingsDto {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
}

export interface AdminActivityLogDto {
  id: string;
  action: string;
  target: string;
  targetType?: string;
  performedAt: string;
  ipAddress?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const adminService = {

  getSecuritySettings: async (): Promise<AdminSecuritySettingsDto> => {
    const response = await api.get('/Admin/security-settings');
    return response.data;
  },

  updateSecuritySettings: async (data: AdminSecuritySettingsDto): Promise<AdminSecuritySettingsDto> => {
    const response = await api.put('/Admin/security-settings', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordDto): Promise<void> => {
    await api.put('/Admin/change-password', data);
  },

  getActivityLog: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{ activities: AdminActivityLogDto[]; total: number }> => {
    const response = await api.get('/Admin/activity-log', { params });
    return response.data;
  },
};