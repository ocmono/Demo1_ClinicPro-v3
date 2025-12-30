import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../../contentApi/BookingProvider";
import { FiUserPlus, FiRefreshCw } from "react-icons/fi";
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import DoctorsTable from '../../../components/clinic/DoctorsTable';

const ListDoctors = () => {
  const { doctors, fetchDoctors } = useBooking();
  const navigate = useNavigate();

  // Fetch doctors on component mount
  useEffect(() => {
    console.log("useEffect triggered - doctors:", doctors);
    // Only fetch doctors once on component mount
    fetchDoctors();
  }, []); // Empty dependency array to run only once

  const handleRefresh = async () => {
    try {
      await fetchDoctors();
    } catch (error) {
      console.error("Failed to refresh doctors list:", error);
    }
  };

  return (
    <>
      <PageHeader>
        <div className="d-flex justify-content-end">
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary" onClick={handleRefresh}>
              <FiRefreshCw size={16} className="me-1" /> Refresh
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/users/add')}>
              <FiUserPlus size={16} className="me-1" /> Add Doctor
            </button>
          </div>
        </div>
      </PageHeader>

      <div className="main-content">
        <DoctorsTable />
      </div>

      <Footer />
    </>
  );
};

export default ListDoctors;