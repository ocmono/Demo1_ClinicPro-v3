import React, { useEffect, useRef, useState } from "react";
import { useParams } from 'react-router-dom';
import { FiPrinter, FiEdit3, FiRefreshCw } from "react-icons/fi";
import "./VaccineView.css";
import EditVaccinePatientModal from "./EditPatientVaccine";
import { useVaccine } from "../../context/VaccineContext";
import { useBooking } from "../../contentApi/BookingProvider";

const PatientVaccinePage = () => {
  const { id } = useParams();
  const { updateVaccine, editPatientVaccine, deletePatientVaccine, fetchPatientVaccines } = useVaccine();
  const { doctors } = useBooking();
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    const fetchVaccine = async () => {
      try {
        const res = await fetch(`https://bkdemo1.clinicpro.cc/vaccination/get-patient/${id}`);
        if (!res.ok) throw new Error("Failed to fetch vaccine");
        const data = await res.json();

        // Map doctor name
        const doctor = doctors.find(d => d.id === data.doctor_id);
        const vaccine = data.assigned_vaccines?.[0]; // First assigned vaccine

        data.doctor_name = doctor ? `${doctor.firstName} ${doctor.lastName}` : "—";
        data.vaccine_name = vaccine?.vaccine_name || "—";
        data.status = vaccine?.status || "—";

        setSelectedVaccine(data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchVaccine();
  }, [id, doctors]);

  const handlePrint = () => {
    if (!printRef.current) return;

    const printWindow = window.open("", "_blank", "width=800,height=700");
    const html = `
      <html>
        <head>
          <title>Print Vaccine Details</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background: #f9f9f9; }
          </style>
        </head>
        <body>
          <div id="print-root"></div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      const contentClone = printRef.current.cloneNode(true);
      printWindow.document.getElementById("print-root").appendChild(contentClone);
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  if (!selectedVaccine) {
    return (
      <div className="text-center pt-5 text-danger">
        <h4>Loading Patient vaccine details...</h4>
      </div>
    );
  }

  return (
    <div className="prescription-view-wrapper">
      <div className="card prescription-view-card">
        <div className="prescription-view-header no-print">
          <h2 className="mb-3">Patient Vaccine Details</h2>
          <div className="prescription-view-actions">
            <FiRefreshCw title="Refresh" className="prescription-icon" onClick={() => window.location.reload()} />
            <FiPrinter title="Print" className="prescription-icon" onClick={handlePrint} />
            <FiEdit3 title="Edit" className="prescription-icon" onClick={() => setEditModalOpen(true)} />
          </div>
        </div>

        <div ref={printRef}>
          <div className="prescription-info-box">
            <p><strong>Patient Name:</strong> {selectedVaccine.patient_name}</p>
            <p><strong>Date of Birth:</strong> {selectedVaccine.dob}</p>
            <p><strong>Gender:</strong> {selectedVaccine.gender}</p>
            <p><strong>Parent Name:</strong> {selectedVaccine.parent_name || "—"}</p>
            <p><strong>Contact No:</strong> {selectedVaccine.contact_number || "—"}</p>
            <p><strong>Address:</strong> {selectedVaccine.address || "—"}</p>
            <p><strong>Birth Weight:</strong> {selectedVaccine.birth_weight || "—"}</p>
            <p><strong>Registration Date:</strong> {selectedVaccine.registration_date || "—"}</p>
            <p><strong>Doctor Name:</strong> {selectedVaccine.doctor_name}</p>
            <p><strong>Vaccine Name:</strong> {selectedVaccine.vaccine_name}</p>
            <p><strong>Status:</strong> {selectedVaccine.status}</p>
            <p><strong>Notes:</strong> {selectedVaccine.notes || "—"}</p>
          </div>
        </div>
      </div>

      {editModalOpen && (
        <EditVaccinePatientModal
          vaccine={selectedVaccine}
          onClose={() => setEditModalOpen(false)}
          onSave={async (updatedData) => {
            await editPatientVaccine(updatedData);
            await fetchPatientVaccines();
            setSelectedVaccine(updatedData);
            setEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default PatientVaccinePage;
