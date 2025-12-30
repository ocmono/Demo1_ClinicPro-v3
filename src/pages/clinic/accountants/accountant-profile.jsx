import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAccountant } from '../../../context/AccountantContext';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import AccountantProfileHeader from '@/components/clinic/AccountantProfileHeader';
import AccountantProfileContent from '@/components/clinic/AccountantProfileContent';

const AccountantProfile = () => {
  const { id } = useParams();
  const { accountants } = useAccountant();
  const [accountant, setAccountant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accountants.length > 0) {
      const foundAccountant = accountants.find(a => a.id == id);
      setAccountant(foundAccountant);
      setLoading(false);
    }
  }, [id, accountants]);

  if (loading) {
    return (
      <>
        <PageHeader>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h4 className="mb-1 fw-bold">Accountant Profile</h4>
              <p className="text-muted mb-0">Loading accountant details...</p>
            </div>
          </div>
        </PageHeader>

        <div className="main-content">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading accountant profile...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!accountant) {
    return (
      <>
        <PageHeader>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h4 className="mb-1 fw-bold">Accountant Not Found</h4>
              <p className="text-muted mb-0">The requested accountant could not be found.</p>
            </div>
          </div>
        </PageHeader>

        <div className="main-content">
          <div className="text-center py-5">
            <p className="text-muted">Accountant not found</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <PageHeader>
        <AccountantProfileHeader accountant={accountant} />
      </PageHeader>
      <div className="main-content">
        <div className='row'>
          <AccountantProfileContent accountant={accountant} />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AccountantProfile;