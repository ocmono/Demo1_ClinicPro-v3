import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import UserProfileHeader from '@/components/clinic/UserProfileHeader';
import UserProfileContent from '@/components/clinic/UserProfileContent';
import { FiArrowLeft } from 'react-icons/fi';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  // console.log(`user ====================`, user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);

        // First try to get all users (using the working endpoint)
        const response = await fetch("https://bkdemo1.clinicpro.cc/users/user-list");

        if (response.ok) {
          const users = await response.json();
          const foundUser = Array.isArray(users) ? users.find(user => user.id == id) : null;

          if (foundUser) {
            setUser(foundUser);
          } else {
            console.error('User not found in list');
            setUser(null);
          }
        } else {
          throw new Error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <>
        <PageHeader>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h4 className="mb-1 fw-bold">User Profile</h4>
              <p className="text-muted mb-0">Loading user details...</p>
            </div>
          </div>
        </PageHeader>

        <div className="main-content">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading user profile...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <PageHeader>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-icon btn-light"
                onClick={() => navigate('/users')}
              >
                <FiArrowLeft />
              </button>
              <div>
                <h4 className="mb-1 fw-bold">User Not Found</h4>
                <p className="text-muted mb-0">The requested user could not be found.</p>
              </div>
            </div>
          </div>
        </PageHeader>

        <div className="main-content">
          <div className="text-center py-5">
            <p className="text-muted">User not found</p>
            <button
              className="btn btn-primary btn-sm mt-3"
              onClick={() => navigate('/users')}
            >
              <FiArrowLeft size={14} className="me-2" />
              Back to Users List
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <PageHeader>
        <UserProfileHeader user={user} />
      </PageHeader>
      <div className="main-content">
        <div className='row'>
          <UserProfileContent user={user} />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;