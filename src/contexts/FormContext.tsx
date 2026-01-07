import React, { createContext, useContext, useState, useCallback } from 'react';
import { Form, FormField, FormResponse, DashboardStats } from '@/types/form';

interface FormContextType {
  forms: Form[];
  currentForm: Form | null;
  responses: FormResponse[];
  stats: DashboardStats;
  createForm: (title: string, description?: string) => Form;
  updateForm: (formId: string, updates: Partial<Form>) => void;
  deleteForm: (formId: string) => void;
  setCurrentForm: (form: Form | null) => void;
  addField: (field: FormField) => void;
  updateField: (fieldId: string, updates: Partial<FormField>) => void;
  removeField: (fieldId: string) => void;
  reorderFields: (startIndex: number, endIndex: number) => void;
  toggleFormStatus: (formId: string) => void;
  submitResponse: (formId: string, answers: Record<string, any>, files?: string[]) => void;
  getFormById: (formId: string) => Form | undefined;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

// Mock data for demo
const mockForms: Form[] = [
  {
    id: '1',
    title: 'Customer Feedback Survey',
    description: 'Help us improve our services',
    status: 'active',
    fields: [
      { id: 'f1', type: 'first_name', label: 'First Name', required: true, pageNumber: 1 },
      { id: 'f2', type: 'last_name', label: 'Last Name', required: true, pageNumber: 1 },
      { id: 'f3', type: 'email', label: 'Email Address', required: true, pageNumber: 1 },
      { id: 'f4', type: 'radio', label: 'How satisfied are you?', required: true, pageNumber: 1, options: [
        { id: 'o1', label: 'Very Satisfied', value: 'very_satisfied' },
        { id: 'o2', label: 'Satisfied', value: 'satisfied' },
        { id: 'o3', label: 'Neutral', value: 'neutral' },
        { id: 'o4', label: 'Dissatisfied', value: 'dissatisfied' },
      ]},
      { id: 'f5', type: 'textarea', label: 'Additional Comments', required: false, pageNumber: 1 },
    ],
    settings: {
      emailNotifications: true,
      thankYouMessage: 'Thank you for your feedback!',
    },
    createdBy: '1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Event Registration',
    description: 'Register for our upcoming workshop',
    status: 'active',
    fields: [
      { id: 'f1', type: 'first_name', label: 'First Name', required: true, pageNumber: 1 },
      { id: 'f2', type: 'email', label: 'Email', required: true, pageNumber: 1 },
      { id: 'f3', type: 'phone', label: 'Phone Number', required: false, pageNumber: 1 },
    ],
    settings: {
      emailNotifications: true,
      thankYouMessage: 'You are registered!',
    },
    createdBy: '1',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    title: 'Job Application',
    description: 'Apply for a position at our company',
    status: 'inactive',
    fields: [],
    settings: {
      emailNotifications: true,
      thankYouMessage: 'Thank you for applying!',
    },
    createdBy: '1',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
];

const mockResponses: FormResponse[] = [
  { id: 'r1', formId: '1', answers: { f1: 'John', f2: 'Doe', f3: 'john@example.com', f4: 'satisfied', f5: 'Great service!' }, submittedAt: new Date('2024-01-16') },
  { id: 'r2', formId: '1', answers: { f1: 'Jane', f2: 'Smith', f3: 'jane@example.com', f4: 'very_satisfied', f5: '' }, submittedAt: new Date('2024-01-17') },
  { id: 'r3', formId: '2', answers: { f1: 'Bob', f2: 'bob@example.com', f3: '+1234567890' }, submittedAt: new Date('2024-01-21') },
];

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [forms, setForms] = useState<Form[]>(mockForms);
  const [currentForm, setCurrentForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>(mockResponses);

  const stats: DashboardStats = {
    totalForms: forms.length,
    activeForms: forms.filter(f => f.status === 'active').length,
    inactiveForms: forms.filter(f => f.status === 'inactive').length,
    totalResponses: responses.length,
  };

  const createForm = useCallback((title: string, description?: string): Form => {
    const newForm: Form = {
      id: Date.now().toString(),
      title,
      description,
      status: 'inactive',
      fields: [],
      settings: {
        emailNotifications: false,
        thankYouMessage: 'Thank you for your submission!',
      },
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setForms(prev => [...prev, newForm]);
    return newForm;
  }, []);

  const updateForm = useCallback((formId: string, updates: Partial<Form>) => {
    setForms(prev => prev.map(f => 
      f.id === formId ? { ...f, ...updates, updatedAt: new Date() } : f
    ));
    if (currentForm?.id === formId) {
      setCurrentForm(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
    }
  }, [currentForm]);

  const deleteForm = useCallback((formId: string) => {
    setForms(prev => prev.filter(f => f.id !== formId));
    if (currentForm?.id === formId) {
      setCurrentForm(null);
    }
  }, [currentForm]);

  const addField = useCallback((field: FormField) => {
    if (!currentForm) return;
    const updatedFields = [...currentForm.fields, field];
    updateForm(currentForm.id, { fields: updatedFields });
  }, [currentForm, updateForm]);

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    if (!currentForm) return;
    const updatedFields = currentForm.fields.map(f => 
      f.id === fieldId ? { ...f, ...updates } : f
    );
    updateForm(currentForm.id, { fields: updatedFields });
  }, [currentForm, updateForm]);

  const removeField = useCallback((fieldId: string) => {
    if (!currentForm) return;
    const updatedFields = currentForm.fields.filter(f => f.id !== fieldId);
    updateForm(currentForm.id, { fields: updatedFields });
  }, [currentForm, updateForm]);

  const reorderFields = useCallback((startIndex: number, endIndex: number) => {
    if (!currentForm) return;
    const result = Array.from(currentForm.fields);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    updateForm(currentForm.id, { fields: result });
  }, [currentForm, updateForm]);

  const toggleFormStatus = useCallback((formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (form) {
      updateForm(formId, { status: form.status === 'active' ? 'inactive' : 'active' });
    }
  }, [forms, updateForm]);

  const submitResponse = useCallback((formId: string, answers: Record<string, any>, files?: string[]) => {
    const newResponse: FormResponse = {
      id: Date.now().toString(),
      formId,
      answers,
      files,
      submittedAt: new Date(),
    };
    setResponses(prev => [...prev, newResponse]);
  }, []);

  const getFormById = useCallback((formId: string) => {
    return forms.find(f => f.id === formId);
  }, [forms]);

  return (
    <FormContext.Provider value={{
      forms,
      currentForm,
      responses,
      stats,
      createForm,
      updateForm,
      deleteForm,
      setCurrentForm,
      addField,
      updateField,
      removeField,
      reorderFields,
      toggleFormStatus,
      submitResponse,
      getFormById,
    }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};
