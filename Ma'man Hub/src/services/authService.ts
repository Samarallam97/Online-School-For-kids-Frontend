import api from './api';


export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: number; 
  dateOfBirth: Date;
  country: string;
  expertise?: string;
  portfolioUrl?: string;
  cvLink?: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface UserDto {
  id: string;
  fullName: string;
  role: string;
  email:string;
  profilePictureUrl?: string;
  isFirstLogin: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
  expiresAt: string;

   requires2FA?: boolean;   // ← add
  tempToken?: string;      // ← add
}

const ROLE_MAP: Record<number, string> = {
  1: 'Student',
  2: 'Parent',
  3: 'ContentCreator',
  4: 'Specialist',
};

export const authService = {

  register: async (data: RegisterData) => {
    const payload = {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      role: data.role,
      dateOfBirth: data.dateOfBirth,
      country: data.country,
      ...(data.expertise && { expertise: data.expertise }),
      ...(data.portfolioUrl && { portfolioUrl: data.portfolioUrl }),
      ...(data.cvLink && { cvLink: data.cvLink }),
    };

    const response = await api.post('/Auth/register', payload);
    return response.data;
  },

  resendVerification: async (email: string) => {
    const response = await api.post('/Auth/resend-verification', { email });
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.post('/Auth/verify-email', { token });
    return response.data;
  },

 login: async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post('/Auth/login', {
    email: data.email,
    password: data.password,
    rememberMe: data.rememberMe ?? false,
  });

  const authData: AuthResponse = {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
    user: response.data.user,
    expiresAt: response.data.expiresAt,
    requires2FA: response.data.requires2FA,   // ← add
    tempToken: response.data.tempToken,        // ← add
  };

  // Only store tokens when we have them (not during 2FA pending state)
  if (!authData.requires2FA) {
    localStorage.setItem('access_token', authData.accessToken);
    localStorage.setItem('refresh_token', authData.refreshToken);
  }

  return authData;
},
  forgotPassword: async (email: string) => {
    const response = await api.post('/Auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/Auth/reset-password', { token, newPassword });
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/Auth/logout');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },
  
  getCurrentUser: async (): Promise<UserDto> => {
    const response = await api.get('/User/me');
    return response.data;
  },

 googleAuth: () => {
    window.location.href = `${api.defaults.baseURL}/Auth/google`;
  },

  completeGoogleRegistration: async (
    data: CompleteGoogleRegistrationData
  ): Promise<AuthResponse> => {
    const response = await api.post('/Auth/google/complete-registration', {
      tempToken: data.tempToken,
      role: ROLE_MAP[data.role],
      dateOfBirth: data.dateOfBirth.toISOString(),
      country: data.country,
      ...(data.expertise    && { expertise: data.expertise }),
      ...(data.cvLink       && { cvLink: data.cvLink }),
      ...(data.portfolioUrl && { portfolioUrl: data.portfolioUrl }),
    });

    const authData: AuthResponse = response.data;
    localStorage.setItem('access_token', authData.accessToken);
    localStorage.setItem('refresh_token', authData.refreshToken);
    return authData;
  },

  verify2FA: async ({ tempToken, code }: { tempToken: string; code: string }) => {
  const { data } = await api.post("/auth/login/verify-2fa", { tempToken, code });
  if (data.accessToken) {
    localStorage.setItem('access_token', data.accessToken);
  }
  if (data.refreshToken) {
    localStorage.setItem('refresh_token', data.refreshToken);
  }
  return data;
},
setup2FA: async (): Promise<{ secret: string; qrUri: string }> => {
  const { data } = await api.post('/auth/setup');
  return data;
},

confirm2FA: async (payload: { secret: string; code: string }): Promise<void> => {
  await api.post('/auth/confirm-setup', payload);
},

disable2FA: async (payload: { code: string }): Promise<void> => {
  await api.post('/auth/disable', payload);
}
};

