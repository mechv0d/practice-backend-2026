export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export type QuestionType = 'single_choice' | 'multiple_choice' | 'text';

export interface QuestionOption {
  id: number;
  text: string;
}

export interface Question {
  id: number | string;
  text: string;
  type: QuestionType;
  order: number;
  options?: QuestionOption[];
}

export type SurveyStatus = 'draft' | 'published' | 'closed';

export interface Survey {
  id: number;
  title: string;
  description: string;
  status: SurveyStatus;
  user_id: number;
  created_at: string;
  updated_at: string;
  questions?: Question[];
  _count?: {
    responses: number;
    questions?: number;
  };
}

export interface CreateSurveyData {
  title: string;
  description: string;
}

export interface UpdateSurveyData {
  title: string;
  description: string;
}

export interface CreateQuestionData {
  text: string;
  type: QuestionType;
  order: number;
  options?: string[];
}

export interface UpdateQuestionData {
  text: string;
  order: number;
  options?: string[];
}

export interface Answer {
  question_id: number;
  value: string | string[];
}

export interface SubmitResponseData {
  answers: Answer[];
}

export interface ResponseResult {
  question_id: number;
  question_text: string;
  question_type: QuestionType;
  options?: {
    id: number;
    text: string;
    count: number;
    percentage: number;
  }[];
  text_answers?: string[];
}

export interface SurveyResults {
  survey_id: number;
  survey_title: string;
  total_respondents: number;
  results: ResponseResult[];
}
