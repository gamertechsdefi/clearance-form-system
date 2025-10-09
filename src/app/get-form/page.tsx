'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFormData } from "../../contexts/FormDataContext"

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

export default function GetForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    personalInfo: { firstName: '', lastName: '', email: '' },
    academicInfo: {
      institutionType: '',
      department: '',
      level: '',
      matricNumber: '',
      school: ''
    },
    clearanceInfo: {
      reason: '',
      dateNeeded: '',
      images: []
    },
  });
  const [formErrors, setFormErrors] = useState({ images: '', general: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const { setFormData: setContextFormData } = useFormData();

  // Update images array when institution type changes or on initial load
  useEffect(() => {
    if (formData.academicInfo.institutionType) {
      const imageCount = formData.academicInfo.institutionType === 'mapoly' ? 5 : 3;
      setFormData(prev => ({
        ...prev,
        clearanceInfo: {
          ...prev.clearanceInfo,
          images: Array(imageCount).fill(null)
        }
      }));
    }
  }, [formData.academicInfo.institutionType]);

  const validateStep = () => {
    const errors = { images: '', general: '' };
    let isValid = true;

    // Clear previous success message
    setSuccessMessage('');

    // Validate step 0 (Personal Information)
    if (step === 0) {
      if (!formData.personalInfo.firstName.trim()) {
        errors.general = 'First name is required.';
        isValid = false;
      } else if (!formData.personalInfo.lastName.trim()) {
        errors.general = 'Last name is required.';
        isValid = false;
      } else if (!formData.personalInfo.email.trim()) {
        errors.general = 'Email is required.';
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.personalInfo.email)) {
        errors.general = 'Please enter a valid email address.';
        isValid = false;
      }
    }

    // Validate step 1 (Academic Information)
    if (step === 1) {
      if (!formData.academicInfo.institutionType) {
        errors.general = 'Please select an institution type.';
        isValid = false;
      } else if (!formData.academicInfo.department) {
        errors.general = 'Please select a department.';
        isValid = false;
      } else if (!formData.academicInfo.level) {
        errors.general = 'Please select your level.';
        isValid = false;
      } else if (!formData.academicInfo.matricNumber.trim()) {
        errors.general = 'Matric number is required.';
        isValid = false;
      } else if (formData.academicInfo.institutionType === 'other' && !formData.academicInfo.school.trim()) {
        errors.general = 'School name is required for other institutions.';
        isValid = false;
      }
    }

    // Validate step 2 (Documents)
    if (step === 2) {
      if (!formData.clearanceInfo.reason) {
        errors.general = 'Please select a reason for clearance.';
        isValid = false;
      } else if (!formData.clearanceInfo.dateNeeded) {
        errors.general = 'Please select when you need the clearance.';
        isValid = false;
      } else {
        const allImagesUploaded = formData.clearanceInfo.images.every(image => image !== null);
        if (!allImagesUploaded) {
          errors.images = 'Please upload all required documents.';
          isValid = false;
        }
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep() && step < 2) {
      setSuccessMessage('Step completed successfully!');
      setTimeout(() => {
        setStep(step + 1);
        setSuccessMessage('');
      }, 500);
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const newImages = [...formData.clearanceInfo.images];
          newImages[index] = reader.result;
          
          setFormData(prev => ({
            ...prev,
            clearanceInfo: {
              ...prev.clearanceInfo,
              images: newImages
            }
          }));
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');

    setFormData(prev => {
      switch (section) {
        case 'personalInfo':
          return { ...prev, personalInfo: { ...prev.personalInfo, [field as keyof FormData['personalInfo']]: value } };
        case 'academicInfo':
          return { ...prev, academicInfo: { ...prev.academicInfo, [field as keyof FormData['academicInfo']]: value } };
        case 'clearanceInfo':
          return { ...prev, clearanceInfo: { ...prev.clearanceInfo, [field as keyof FormData['clearanceInfo']]: value } };
        default:
          return prev;
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) {
      router.push(`/get-form/generate?matricNumber=${formData.academicInfo.matricNumber}`);
    }
  };

  // Define steps configuration
  const steps = [
    {
      title: 'Personal Information',
      fields: (
        <>
          <input
            name="personalInfo.firstName"
            value={formData.personalInfo.firstName}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded mb-4 w-full"
            type="text"
            placeholder="First Name"
            required
          />
          <input
            name="personalInfo.lastName"
            value={formData.personalInfo.lastName}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded mb-4 w-full"
            type="text"
            placeholder="Last Name"
            required
          />
          <input
            name="personalInfo.email"
            value={formData.personalInfo.email}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded mb-4 w-full"
            type="email"
            placeholder="Email"
            required
          />
        </>
      ),
    },
    {
      title: 'Academic Information',
      fields: (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Institution Type</label>
            <select
              name="academicInfo.institutionType"
              value={formData.academicInfo.institutionType}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded w-full"
              required
            >
              <option value="">Select Institution Type</option>
              <option value="mapoly">ND in MAPOLY</option>
              <option value="other">ND in Other Schools</option>
            </select>
          </div>
          
          <select
            name="academicInfo.school"
            value={formData.academicInfo.school}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded mb-4 w-full"
            required
          >
            <option value="">Select School</option>
            <option value="School of Science">School of Science</option>
          </select>

          <select
            name="academicInfo.department"
            value={formData.academicInfo.department}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded mb-4 w-full"
            required
            disabled={!formData.academicInfo.institutionType}
          >
            <option value="">Select Department</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
          </select>
          <select
            name="academicInfo.level"
            value={formData.academicInfo.level}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded mb-4 w-full"
            required
          >
            <option value="">Select Level</option>
            <option value="100">ND 2</option>
            <option value="200">HND 2</option>
          </select>
          <input
            name="academicInfo.matricNumber"
            value={formData.academicInfo.matricNumber}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded mb-4 w-full"
            type="text"
            placeholder="Matriculation Number"
            required
          />
        </>
      ),
    },
    {
      title: 'Upload Required Documents',
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Clearance</label>
            <select
              name="clearanceInfo.reason"
              value={formData.clearanceInfo.reason}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select Reason for Clearance</option>
              <option value="Graduation">Graduation</option>
              <option value="Course Registration">Course Registration</option>
              <option value="Scholarship">Scholarship</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Needed</label>
            <input
              name="clearanceInfo.dateNeeded"
              value={formData.clearanceInfo.dateNeeded}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              type="date"
              required
            />
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Required Documents</h3>
            {formErrors.images && <p className="text-red-500 text-sm mb-4">{formErrors.images}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.clearanceInfo.images.map((_, index) => (
                <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {formData.clearanceInfo.images[index] ? (
                    <div className="relative h-40">
                      <img 
                        src={formData.clearanceInfo.images[index] as string} 
                        alt={`Uploaded document ${index + 1}`}
                        className="h-full w-full object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = [...formData.clearanceInfo.images];
                          newImages[index] = null;
                          setFormData(prev => ({
                            ...prev,
                            clearanceInfo: {
                              ...prev.clearanceInfo,
                              images: newImages
                            }
                          }));
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center -m-2 hover:bg-red-600"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label key={`label-${index}`} className="cursor-pointer block">
                      <div className="flex flex-col items-center justify-center h-40">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="mt-1 text-sm text-gray-600">
                          <span className="font-medium text-blue-600 hover:text-blue-500">
                            Upload a file
                          </span>
                          or drag and drop
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, PDF (max. 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/png, image/jpeg, application/pdf"
                        onChange={(e) => handleImageChange(e, index)}
                      />
                    </label>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Document {index + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg overflow-hidden">
          {/* Progress Bar */}
          <div className="px-6 pt-6">
            <div className="flex justify-between mb-2">
              {steps.map((_, index) => (
                <div
                  key={`step-${index}`}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                    index <= step ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              {steps[step].title}
            </h1>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {formErrors.general && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {formErrors.general}
              </div>
            )}

            <form onSubmit={step === steps.length - 1 ? handleSubmit : nextStep}>
              <div className="space-y-4">
                {steps[step].fields}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={step === 0}
                  className={`px-6 py-2 rounded-md ${
                    step === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  Previous
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ${
                    (step === 2 && !formData.clearanceInfo.images.every(image => image !== null)) || isLoading
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={(step === 2 && !formData.clearanceInfo.images.every(image => image !== null)) || isLoading}
                >
                  {isLoading ? 'Submitting...' : (step === steps.length - 1 ? 'Submit' : 'Next')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}