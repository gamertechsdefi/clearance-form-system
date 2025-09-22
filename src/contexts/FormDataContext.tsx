'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type FormData = {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  academicInfo: {
    institutionType: 'mapoly' | 'other' | '';
    department: string;
    level: string;
    matricNumber: string;
    school: string;
  };
  clearanceInfo: {
    reason: string;
    dateNeeded: string;
    images: (string | null)[];
  };
};

interface FormDataContextType {
  formData: FormData | null;
  setFormData: (data: FormData) => void;
  clearFormData: () => void;
}

const FormDataContext = createContext<FormDataContextType | undefined>(undefined);

export function FormDataProvider({ children }: { children: ReactNode }) {
  const [formData, setFormDataState] = useState<FormData | null>(null);

  const setFormData = (data: FormData) => {
    setFormDataState(data);
  };

  const clearFormData = () => {
    setFormDataState(null);
  };

  return (
    <FormDataContext.Provider value={{ formData, setFormData, clearFormData }}>
      {children}
    </FormDataContext.Provider>
  );
}

export function useFormData() {
  const context = useContext(FormDataContext);
  if (context === undefined) {
    throw new Error('useFormData must be used within a FormDataProvider');
  }
  return context;
}
