import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import './style/Profile.css';
import defaultProfileImage from './img/noimage.jpg'; // Добавляем default изображение
import { signData } from '../api/ncalayer-service';

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

const Profile: React.FC = () => {
  const { email } = useParams<{ email: string }>();
  const [resume, setResume] = useState<Resume | null>(null);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [contacts, setContacts] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [showSubmitRating, setShowSubmitRating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const navigate = useNavigate();

  const getToken = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).token : null;
  };

  // Load profile
  useEffect(() => {
    const fetchResume = async () => {
      const token = getToken();

      if (!email) {
        console.error('Email is required in the URL');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:4000/profile?email=${email}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const fetchedResume: Resume = response.data;
        setResume(fetchedResume);
        setFirstName(fetchedResume.firstName);
        setLastName(fetchedResume.lastName);
        setContacts(fetchedResume.contacts);
        setBio(fetchedResume.bio);
        setImagePreview(
          fetchedResume.profilePicture && fetchedResume.profilePicture !== "null" && fetchedResume.profilePicture !== ""
            ? `data:image/png;base64,${fetchedResume.profilePicture}`
            : defaultProfileImage // Если нет изображения профиля, используем defaultProfileImage
        );
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    fetchResume();
  }, [email]);

  // Handle rating selection
  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
    setShowSubmitRating(true);
  };

  // Submit the rating and sign the data
  const handleSubmitRating = async () => {
    if (rating === null) {
      setErrorMessage('Please select a rating.');
      return;
    }

    const feedback = `User rating: ${rating}`;
    try {
      const signedFeedback = await signData(feedback, 'rating');
      
      if (signedFeedback) {
        const token = getToken();

        await axios.post(
          'http://localhost:4000/profile/feedback/',
          { email, cms: signedFeedback, rating, feedback },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        setSuccessMessage('Rating submitted successfully!');
        setTimeout(() => setSuccessMessage(''), 10000);
      } else {
        setErrorMessage('Failed to sign the rating.');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      setErrorMessage('Error submitting rating. Please try again.');
    }
  };

  const handleSignData = async () => {
    if (!firstName || !lastName || !contacts || !bio) {
      setErrorMessage('Please fill in all fields.');
      setTimeout(() => setErrorMessage(''), 10000);
      return;
    }

    const dataToSign = `email: ${email}, firstName: ${firstName}, lastName: ${lastName}, bio: ${bio}, profilePicture: ${profileImage}, contacts: ${contacts}`;

    try {
      const signedData = await signData(dataToSign, 'resume_creation');
      if (signedData) {
        setSignature(signedData);
        setSuccessMessage('Data successfully signed!');
        setTimeout(() => setSuccessMessage(''), 10000);
      } else {
        setErrorMessage('Failed to sign data.');
        setTimeout(() => setErrorMessage(''), 10000);
      }
    } catch (error) {
      console.error('Error signing data:', error);
      setErrorMessage('Error signing data. Please try again.');
    }
  };

  const handleEdit = async () => {
    if (!firstName || !lastName || !contacts || !bio) {
      setErrorMessage('Please fill in all fields.');
      setTimeout(() => setErrorMessage(''), 10000);
      return;
    }

    if (!signature) {
      setErrorMessage('Please sign the data before saving.');
      setTimeout(() => setErrorMessage(''), 10000);
      return;
    }

    const updatedData = {
      email,
      firstName,
      lastName,
      contacts,
      bio,
      profilePicture: profileImage,
      cms: signature,
    };

    const token = getToken();

    try {
      const response = await axios.put('http://localhost:4000/profile/', updatedData, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('Profile updated:', response.data.message);
      setResume({ ...resume, firstName, lastName, contacts, bio } as Resume);
      setSuccessMessage('Profile successfully updated!');
      setTimeout(() => setSuccessMessage(''), 10000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Error updating profile. Please try again.');
      setTimeout(() => setErrorMessage(''), 10000);
    }
    setEditing(false);
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

  const handleNavigateBack = () => navigate('/admin');

  // New function for canceling edit
  const handleCancelEdit = () => {
    setEditing(false); // This will return to profile view
  };

  return (
    <>
      <NavBar />
      <div className="profile-container">
        <h1 className="profile-header">Резюме пользователя</h1>

        {editing ? (
          <div className="edit-form">
            <div className="input-group">
              <label>Имя</label>
              <input
                type="text"
                className="input-field"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
              />
            </div>
            <div className="input-group">
              <label>Фамилия</label>
              <input
                type="text"
                className="input-field"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
              />
            </div>
            <div className="input-group">
              <label>Номер телефона</label>
              <input
                type="text"
                className="input-field"
                value={contacts}
                onChange={(e) => setContacts(e.target.value)}
                placeholder="Contacts"
              />
            </div>
            <div className="input-group">
              <label>О себе</label>
              <textarea
                className="input-field"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio"
              />
            </div>
            <div className="input-group">
              <label>Image</label>
              <input type="file" onChange={handleImageChange} className="input-field" />
            </div>
            <button onClick={handleSignData} className="profile-button">Подписать данные</button>
            <button onClick={handleEdit} className="profile-button">Сохранить</button>
            <button onClick={handleCancelEdit} className="profile-button">Отмена</button>
          </div>
        ) : (
          <div className="profile-grid">
            <div className="profile-image-column">
              <img
                src={imagePreview || defaultProfileImage}
                alt="Profile"
                className="profile-image"
              />
              <button onClick={() => setEditing(true)} className="profile-button">Редактировать</button>
            </div>
            <div className="profile-info-column">
              <p className="profile-info"><strong>Имя:</strong> {firstName}</p>
              <p className="profile-info"><strong>Фамилия:</strong> {lastName}</p>
              <p className="profile-info"><strong>О себе:</strong> {bio}</p>
            </div>
            <div className="profile-contact-column">
              <p className="profile-info"><strong>Номер телефона:</strong> {contacts}</p>
              <p className="profile-info"><strong>Email:</strong> {email}</p>
            </div>
          </div>
        )}

        {!editing && (
          <div className="rating-section">
            <h3>Оцените этого пользователя:</h3>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${rating && rating >= star ? 'selected' : ''}`}
                  onClick={() => handleRatingClick(star)}
                >
                  ★
                </span>
              ))}
            </div>
            {showSubmitRating && (
              <button onClick={handleSubmitRating} className="profile-button">Отправить рейтинг</button>
            )}
          </div>
        )}

        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
      </div>
    </>
  );
};

export default Profile;
