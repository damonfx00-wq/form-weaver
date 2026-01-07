export type FieldType = 
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'password'
  | 'dropdown'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'file'
  | 'first_name'
  | 'last_name';

export interface FieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: FieldOption[];
  validationRules?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  pageNumber: number;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'inactive';
  fields: FormField[];
  settings: FormSettings;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormSettings {
  emailNotifications: boolean;
  redirectUrl?: string;
  thankYouMessage: string;
  expirationDate?: Date;
}

export interface FormResponse {
  id: string;
  formId: string;
  answers: Record<string, any>;
  files?: string[];
  submittedAt: Date;
}

export interface DashboardStats {
  totalForms: number;
  activeForms: number;
  inactiveForms: number;
  totalResponses: number;
}
