import React, { useState } from "react";
import { useParams } from "react-router-dom";
import ConfigureSpeciality from "./ConfigureSpecialty";
import LabTestTable from "./LabTestTable";
import { FiSettings, FiCalendar, FiUsers, FiActivity, FiDroplet } from "react-icons/fi";
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';

const ClinicConfigView = () => {
  const { specialityId } = useParams();
  const [activeTab, setActiveTab] = useState("diagnosis");

  const tabs = [
    { key: "diagnosis", label: "Diagnosis & Treatments", icon: <FiActivity /> },
            { key: "lab", label: "Lab Tests", icon: <FiDroplet /> },
  ];

  return (
    <>
      <PageHeader>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="mb-1 fw-bold">Clinic Configuration</h4>
            <p className="text-muted mb-0">Manage diagnosis, treatments, and lab tests</p>
          </div>
        </div>
      </PageHeader>
      
      <div className="main-content">
        <div className="card">
          <div className="card-header bg-light border-bottom">
            <ul className="nav nav-tabs nav-tabs-custom-style card-header-tabs" role="tablist">
              {tabs.map((tab) => (
                <li className="nav-item" role="presentation" key={tab.key}>
                  <button
                    className={`nav-link ${activeTab === tab.key ? "active" : ""}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    <span className="me-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="card-body">
            {activeTab === "diagnosis" && (
              <ConfigureSpeciality specialityId={specialityId} />
            )}
            {activeTab === "lab" && <LabTestTable specialityId={specialityId} />}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ClinicConfigView;
