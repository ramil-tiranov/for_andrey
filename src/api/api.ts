import axios from 'axios';

const API_URL = 'http://localhost:4000';

export const signupUser = async (
    email: string, 
    password: string, 
    companyName: string, 
    signature: string, 
    certificate: string
) => {
    return await axios.post(`${API_URL}/auth/signup`, {
        email,
        password,
        companyName,
        signatureBase64: signature,
        certificateBase64: certificate,
    });
};

export const loginUser = async (identifier: string, password: string) => {
    return await axios.post(`${API_URL}/auth/login`, { identifier, password });
};

export const submitFeedback = async (feedback: string, token: string) => {
    return await axios.post(`${API_URL}/feedback`, { feedback }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const getUserProfile = async (token: string) => {
    return await axios.get(`${API_URL}/profile`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};
