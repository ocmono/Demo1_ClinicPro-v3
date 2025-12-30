import React, { useEffect, useRef, useState } from "react";
import { useParams } from 'react-router-dom';
import { FiPrinter, FiEdit3, FiRefreshCw } from "react-icons/fi";
import "./VaccineView.css";
import EditVaccineModal from "./EditVaccineModal";
import { useVaccine } from "../../context/VaccineContext";

const VaccineViewPage = () => {
  const { id } = useParams();
  const { updateVaccine } = useVaccine();
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    const fetchVaccine = async () => {
      try {
        const res = await fetch(`https://bkdemo1.clinicpro.cc/vaccination/get-schedule/${id}`);
        if (!res.ok) throw new Error("Failed to fetch vaccine");
        const data = await res.json();
        setSelectedVaccine(data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchVaccine();
  }, [id]);

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
        <h4>Loading vaccine details...</h4>
      </div>
    );
  }

  return (
    <div className="prescription-view-wrapper">
      <div className="card prescription-view-card">
        <div className="prescription-view-header no-print">
          <h2 className="mb-3">Vaccine Details</h2>
          <div className="prescription-view-actions">
            <FiRefreshCw title="Refresh" className="prescription-icon" onClick={() => window.location.reload()} />
            <FiPrinter title="Print" className="prescription-icon" onClick={handlePrint} />
            <FiEdit3 title="Edit" className="prescription-icon" onClick={() => setEditModalOpen(true)} />
          </div>
        </div>

        <div ref={printRef}>
          <div className="prescription-info-box">
            <p><strong>Vaccine Name:</strong> {selectedVaccine.vaccine_name}</p>
            <p><strong>Age Group:</strong> {selectedVaccine.age_group}</p>
            <p><strong>Dose Number:</strong> {selectedVaccine.dose_number}</p>
            <p><strong>Description:</strong> {selectedVaccine.description || "—"}</p>
            <p><strong>Route of Administration:</strong> {selectedVaccine.route_of_administration || "—"}</p>
            <p><strong>Site:</strong> {selectedVaccine.site || "—"}</p>
            <p><strong>Min Age (Days):</strong> {selectedVaccine.min_age_days || "—"}</p>
            <p><strong>Max Age (Days):</strong> {selectedVaccine.max_age_days || "—"}</p>
            <p><strong>Repeat Interval (Days):</strong> {selectedVaccine.repeat_interval_days || "—"}</p>
            <p><strong>Mandatory:</strong> {selectedVaccine.mandatory ? "Yes" : "No"}</p>
            <p><strong>Active:</strong> {selectedVaccine.is_active ? "Yes" : "No"}</p>
            <p><strong>Created By:</strong> {selectedVaccine.created_by}</p>
          </div>
        </div>
      </div>

      {editModalOpen && (
        <EditVaccineModal
          vaccine={selectedVaccine}
          onClose={() => setEditModalOpen(false)}
          onSave={(updatedData) => {
            updateVaccine(updatedData);         // Update in context
            setSelectedVaccine(updatedData);    // Reflect change in local UI
            setEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default VaccineViewPage;
