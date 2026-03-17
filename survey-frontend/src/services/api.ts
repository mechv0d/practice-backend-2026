import axios from 'axios';
import { 
  User, 
  LoginData, 
  RegisterData, 
  Survey, 
  CreateSurveyData, 
  UpdateSurveyData,
  CreateQuestionData,
  UpdateQuestionData,
  SubmitResponseData,
  ApiSubmitResponseData,
  SurveyResults,
  TextAnswersResult,
  SurveyListResponse,
  SurveyListParams
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      config: {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        data: error.config?.data,
      }
    });

    // Log validation errors specifically
    if (error.response?.status === 422 && error.response?.data?.errors) {
      console.error('Validation Errors:', error.response.data.errors);
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (data: RegisterData) => {
    const response = await api.post('/register', data);
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await api.post('/login', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/user');
    return response.data.data.user;
  },
};

export const surveysAPI = {
  getMySurveys: async (params?: SurveyListParams): Promise<SurveyListResponse> => {
    const response = await api.get('/surveys', { params });
    return response.data;
  },

  getSurvey: async (id: number): Promise<Survey> => {
    const response = await api.get(`/surveys/${id}`);
    return response.data.data.survey;
  },

  createSurvey: async (data: CreateSurveyData): Promise<Survey> => {
    const response = await api.post('/surveys', data);
    return response.data.data.survey;
  },

  updateSurvey: async (id: number, data: UpdateSurveyData): Promise<Survey> => {
    const response = await api.put(`/surveys/${id}`, data);
    return response.data.data.survey;
  },

  publishSurvey: async (id: number): Promise<Survey> => {
    const response = await api.post(`/surveys/${id}/publish`);
    return response.data.data.survey;
  },

  closeSurvey: async (id: number): Promise<Survey> => {
    const response = await api.post(`/surveys/${id}/close`);
    return response.data.data.survey;
  },

  getSurveyForm: async (id: number): Promise<Survey> => {
    const response = await api.get(`/surveys/${id}/form`);
    return response.data.data.survey;
  },

  submitResponse: async (id: number, data: ApiSubmitResponseData): Promise<void> => {
    await api.post(`/surveys/${id}/responses`, data);
  },

  getSurveyResults: async (id: number): Promise<SurveyResults> => {
    const response = await api.get(`/surveys/${id}/results`);
    return response.data.data;
  },

  exportResults: async (id: number): Promise<any> => {
    const response = await api.get(`/surveys/${id}/results/export`);
    return response.data.data;
  },

  getTextAnswers: async (surveyId: number, questionId: number, page: number, search?: string): Promise<TextAnswersResult> => {
    const params: any = { page, limit: 100 };
    if (search) params.search = search;
    const response = await api.get(`/surveys/${surveyId}/text-answers/${questionId}`, { params });
    return response.data.data;
  },

  deleteSurvey: async (id: number): Promise<void> => {
    await api.delete(`/surveys/${id}`);
  },
};

export const questionsAPI = {
  createQuestion: async (surveyId: number, data: CreateQuestionData): Promise<any> => {
    const response = await api.post(`/surveys/${surveyId}/questions`, data);
    return response.data;
  },

  updateQuestion: async (id: number, data: UpdateQuestionData): Promise<any> => {
    const response = await api.put(`/questions/${id}`, data);
    return response.data;
  },

  deleteQuestion: async (id: number): Promise<void> => {
    await api.delete(`/questions/${id}`);
  },
};

export const optionsAPI = {
  createOption: async (questionId: number, text: string): Promise<any> => {
    const response = await api.post(`/questions/${questionId}/options`, { text });
    return response.data;
  },

  updateOption: async (id: number, text: string): Promise<any> => {
    const response = await api.put(`/options/${id}`, { text });
    return response.data;
  },

  deleteOption: async (id: number): Promise<void> => {
    await api.delete(`/options/${id}`);
  },
};
