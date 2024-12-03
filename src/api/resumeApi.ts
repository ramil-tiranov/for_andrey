// src/api/resumeApi.ts
export const fetchResumes = async () => {
    const response = await fetch('/api/resumes');
    return response.json();
  };
  
  export const submitResume = async (resumeData: any) => {
    const response = await fetch('/api/resumes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resumeData),
    });
    return response.json();
  };
  
  export const submitRating = async (resumeId: number, rating: number) => {
    const response = await fetch(`/api/resumes/${resumeId}/rating`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    });
    return response.json();
  };
  