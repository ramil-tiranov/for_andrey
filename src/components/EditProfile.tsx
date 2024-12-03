import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../components/NavBar'; // Импортируем NavBar
import './style/Profile.css';
import defaultProfileImage from './img/вк ава.jpg';

interface Resume {
  _id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  profilePicture?: string;
  contacts: string;
}

const EditProfile: React.FC = () => {
  const { email } = useParams<{ email: string }>();
  const [resume, setResume] = useState<Resume | null>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [contacts, setContacts] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResume = async () => {
      const user = localStorage.getItem('user');
      const token = user ? JSON.parse(user).token : null;

      if (!email) {
        console.error('Email is required in the URL');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:4000/profile?email=${email}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const fetchedResume: Resume = response.data;
        setResume(fetchedResume);
        setFirstName(fetchedResume.firstName);
        setLastName(fetchedResume.lastName);
        setContacts(fetchedResume.contacts);
        setBio(fetchedResume.bio);
        setImagePreview(
          fetchedResume.profilePicture ? `data:image/png;base64,${fetchedResume.profilePicture}` : defaultProfileImage
        );
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
      }
    };

    fetchResume();
  }, [email]);

  const handleEdit = async () => {
    if (resume) {
      const updateData = {
        firstName,
        lastName,
        contacts,
        bio,
        profilePicture: profileImage,
      };

      const user = localStorage.getItem('user');
      const token = user ? JSON.parse(user).token : null;

      try {
        const response = await axios.put(`http://localhost:4000/profile/`, updateData, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        console.log(response.data.message);
        navigate(`/profile/${email}`);
      } catch (error) {
        console.error('Ошибка обновления профиля:', error);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String.split(',')[1]);
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setProfileImage(null);
    setImagePreview(defaultProfileImage);
  };

  return (
    <>
      <NavBar />
      <div className="profile-container">
        <h1 className="profile-header">Редактирование Профиля</h1>
        {resume && (
          <div className="edit-form">
            <input 
              type="text" 
              className="input-field" 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              placeholder="Имя" 
            />
            <input 
              type="text" 
              className="input-field" 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              placeholder="Фамилия" 
            />
            <input 
              type="text" 
              className="input-field" 
              value={contacts} 
              onChange={(e) => setContacts(e.target.value)} 
              placeholder="Контакты" 
            />
            <textarea 
              className="input-field" 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              placeholder="Биография" 
            />
            <input 
              type="file" 
              onChange={handleImageChange} 
              className="input-field" 
            />
            <button onClick={handleEdit} className="profile-button">Сохранить</button>
          </div>
        )}
      </div>
    </>
  );
};

export default EditProfile;
