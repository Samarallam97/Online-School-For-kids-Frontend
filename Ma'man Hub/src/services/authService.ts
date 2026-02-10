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
}

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
    };
    
    localStorage.setItem('access_token', authData.accessToken);
    localStorage.setItem('refresh_token', authData.refreshToken);
    
    return authData;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/Auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/Auth/reset-password', { token, password });
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

  //TODO
  googleAuth: () => {
    // Redirect to backend OAuth endpoint
    window.location.href = `${api.defaults.baseURL}/Auth/google`;
  },

};

