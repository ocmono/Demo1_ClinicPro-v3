import React, { useRef, useState, useEffect, forwardRef } from "react";
import { useParams } from "react-router-dom";
import { FiPrinter, FiEdit3, FiRefreshCw, FiMail, FiShare2 } from "react-icons/fi";
import { toast } from "react-toastify";
import EditPrescriptionModal from "./EditPrescriptionModal";
import { usePrescription } from "../../contentApi/PrescriptionProvider";
import { usePatient } from "../../context/PatientContext";
import { useBooking } from "../../contentApi/BookingProvider";
import "./PrescriptionView.css";
import { QRCodeSVG } from 'qrcode.react';
import PrescriptionHeader from "./PrescriptionHeader";
import PageHeader from "../shared/pageHeader/PageHeader";
import { useAuth } from '../../contentApi/AuthContext';

function formatCustomDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;

  const day = d.getDate();
  const month = d.getMonth() + 1; // Months are 0-based
  const year = d.getFullYear();

  // 🔹 Return in D/M/YYYY format (no padding, no names)  
  return `${day}/${month}/${year}`;
}

const PrescriptionViewPage = forwardRef(({ hideHeader = false, prescription: propPrescription, isPrintMode = false }, ref) => {
  const { id } = useParams();
  const { user, role } = useAuth();
  const { allPrescriptions } = usePrescription();
  const { patients } = usePatient();
  const { doctors } = useBooking();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [prescription, setPrescription] = useState(propPrescription);
  const [clinicDetails, setClinicDetails] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    const fetchClinicDetails = async () => {
      try {
        const response = await fetch("https://bkdemo1.clinicpro.cc/clinic-details/get-details");
        const data = await response.json();
        console.log("Data found", data);
        if (data.success && data.data) {
          setClinicDetails(data.data);
        } else {
          setClinicDetails(data);
        }
      } catch (error) {
        console.error("Failed to fetch clinic details:", error);
      }
    };

    fetchClinicDetails();
  }, []);

  const patientLookup = patients.reduce((acc, patient) => {
    acc[patient.id] = patient;
    return acc;
  }, {});

  const doctorLookup = doctors.reduce((acc, doctor) => {
    acc[doctor.id] = doctor;
    return acc;
  }, {});

  const prescriptionId = prescription?.id || prescription?._id;

  // Helper functions to get names
  const getPatientNameById = (patientId) => {
    const patient = patientLookup[patientId];
    if (!patient) return 'Unknown Patient';

    if (patient.user) {
      return `${patient.user.firstName || ''} ${patient.user.lastName || ''}`.trim() || 'Unknown Patient';
    }
    return patient.name || 'Unknown Patient';
  };

  const getPatientEmailById = (patientId) => {
    const patient = patientLookup[patientId];
    if (!patient) return '';

    if (patient.user) {
      return patient.user.email || '';
    }
    return patient.email || '';
  };

  const getPatientPhoneById = (patientId) => {
    const patient = patientLookup[patientId];
    if (!patient) return 'No phone';

    if (patient.user) {
      return patient.user.phone || 'No phone';
    }
    return patient.phone || patient.contact || 'No phone';
  };

  const getDoctorNameById = (doctorId) => {
    const doctor = doctorLookup[doctorId];
    if (!doctor) return 'Unknown Doctor';

    if (doctor.firstName && doctor.lastName) {
      return `${doctor.firstName} ${doctor.lastName}`;
    }
    return doctor.name || 'Unknown Doctor';
  };

  const getDoctorSpecialtyById = (doctorId) => {
    const doctor = doctorLookup[doctorId];
    if (!doctor) return '';

    return doctor.drSpeciality || doctor.specialty || '';
  };

  const getDoctorSignatureById = (doctorId) => {
    const doctor = doctorLookup[doctorId];
    if (!doctor) return null;
    if (doctor.sign && doctor.sign.url) return doctor.sign.url;
    return null;
  };

  // Find the prescription using the id from URL
  // useEffect(() => {
  //   if (!propPrescription && id && allPrescriptions.length > 0) {
  //     const foundPrescription = allPrescriptions.find(
  //       p => String(p.id) === id || String(p._id) === id
  //     );
  //     if (foundPrescription) {
  //       setPrescription(foundPrescription);
  //     } else {
  //       toast.error("Prescription not found");
  //     }
  //   }
  // }, [id, allPrescriptions, propPrescription]);
  // console.log("Prescription Data", prescription);
  useEffect(() => {
    if (propPrescription) {
      setPrescription(propPrescription);
    } else if (id && allPrescriptions.length > 0) {
      const found = allPrescriptions.find(
        p => String(p.id) === id || String(p._id) === id
      );
      setPrescription(found || null);
    }
  }, [id, allPrescriptions, propPrescription]);
  console.log("Prescription Data", prescription);

  if (!prescription) {
    return (
      <div className="text-center mt-5 text-danger">
        <h4>Prescription not found.</h4>
      </div>
    );
  }

  // Extract IDs from prescription
  const patientId = prescription.patient_id || prescription.patientId;
  const doctorId = prescription.doctor_id || prescription.doctorId;

  // Get patient and doctor information using helper functions
  const patientName = prescription.patient_name || getPatientNameById(patientId);
  const patientEmail = prescription.patient_email || getPatientEmailById(patientId);
  const patientPhone = prescription.patient_phone || getPatientPhoneById(patientId);
  const doctorName = prescription.doctor_name || getDoctorNameById(doctorId);
  const doctorSpecialty = prescription.doctor_specialty || getDoctorSpecialtyById(doctorId);

  const {
    patient_name,
    patient_email,
    patient_phone,
    doctor_name,
    appointment_date,
    symptoms,
    diagnosis,
    follow_up_date,
    medicines,
    vaccines,
    lab_tests,
    signature,
    instructions,
    attachments,
  } = prescription;

  const handlePrint = () => {
    if (!printRef.current) {
      alert("Print content not ready.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=800,height=700");
    const html = `
      <html>
        <head>
          <title>Print Prescription</title>
          <style>
            body {
              font-family: sans-serif;
              padding: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
            }
            th {
              background: #f9f9f9;
            }
          </style>
        </head>
        <body>
          <div id="print-root"></div>
        </body>
      </html>
    `;

    printWindow.document.open();
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

  const handleShareEmail = () => {
    if (!patientEmail) {
      toast.error("No patient email available.");
      return;
    }
    const subject = encodeURIComponent("Your Prescription from Clinic");
    const body = encodeURIComponent(`Dear ${patientName || "Patient"},\n\nPlease find your prescription details below.\n\nPrescription ID: #${prescriptionId}\nDoctor: ${doctorName}\nAppointment Date: ${appointment_date}\n\nThank you.`);
    window.open(`mailto:${patientEmail}?subject=${subject}&body=${body}`);
  };

  const handleShareWhatsApp = () => {
    if (!patientPhone) {
      toast.error("No patient phone available.");
      return;
    }
    const message = encodeURIComponent(`Dear ${patientName || "Patient"}, your prescription (ID: #${prescriptionId}) from Dr. ${doctorName} is ready. Please contact the clinic for details.`);
    window.open(`https://wa.me/${patientPhone}?text=${message}`);
  };

  return (
    <>
      {!(hideHeader || isPrintMode) && (
        <PageHeader>
          <PrescriptionHeader />
        </PageHeader>
      )}
      <div className={`prescription-view ${isPrintMode ? 'print-mode' : ''}`}>
        <div className="prescription-view-wrapper">
          <div className={`card prescription-view-card ${isPrintMode ? 'no-shadow' : ''}`}>
            {!isPrintMode && (
              <div className="prescription-view-header no-print">
                <h2>Prescription Preview</h2>
                <div className="prescription-view-actions">
                  <FiRefreshCw
                    className="prescription-icon"
                    title="Refresh"
                    onClick={() => window.location.reload()}
                  />
                  <FiPrinter
                    className="prescription-icon"
                    title="Print Prescription"
                    onClick={handlePrint}
                  />
                  <FiMail
                    className="prescription-icon"
                    title="Share via Email"
                    onClick={handleShareEmail}
                  />
                  <FiShare2
                    className="prescription-icon"
                    title="Share via WhatsApp"
                    onClick={handleShareWhatsApp}
                  />
                  {role?.toLowerCase() !== 'receptionist' && (
                    <FiEdit3
                      className="prescription-icon"
                      title="Edit Prescription"
                      onClick={() => setEditModalOpen(true)}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Attach the ref here for PDF export */}
            <div ref={ref || printRef}>
              {/* Modern Prescription Layout */}
              <div style={{ background: '#fff', padding: 24, marginBottom: 20 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  {clinicDetails && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      {clinicDetails.logo && (
                        <img
                          src={clinicDetails.logo}
                          alt={clinicDetails.name || 'Clinic Logo'}
                          style={{ height: 50, objectFit: 'contain' }}
                        />
                      )}
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>{clinicDetails.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{clinicDetails.address}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          {clinicDetails.phone} | {clinicDetails.email}
                        </div>
                      </div>
                    </div>
                  )}
                  <div style={{ textAlign: 'right', fontSize: 12, color: '#64748b' }}>
                    <div><strong>ID:</strong> #{prescriptionId}</div>
                    <div><strong>Date:</strong> {formatCustomDate(appointment_date) || new Date().toLocaleDateString()}</div>
                  </div>
                </div>

                {/* {clinicDetails && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    {clinicDetails.logo && (
                      <img
                        src={clinicDetails.logo}
                        alt={clinicDetails.name || 'Clinic Logo'}
                        style={{ height: 50, objectFit: 'contain' }}
                      />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>{clinicDetails.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{clinicDetails.address}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {clinicDetails.phone} | {clinicDetails.email}
                      </div>
                    </div>
                  </div>
                )} */}

                <div style={{ height: 1, background: '#eef2f7', margin: '12px 0 20px' }} />

                {/* Doctor / Patient Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #eef2f7', borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Doctor #{doctorId}</div>
                    <div style={{ fontWeight: 600 }}>Dr. {doctorName}</div>
                    {doctorSpecialty && <div style={{ fontSize: 12, color: '#64748b' }}>{doctorSpecialty}</div>}
                    {follow_up_date && (
                      <div style={{ marginTop: 6, fontSize: 12 }}><strong>Follow-up:</strong> {formatCustomDate(follow_up_date)}</div>
                    )}
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #eef2f7', borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Patient #{patientId}</div>
                    <div style={{ fontWeight: 600 }}>{patientName}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{patientEmail || '—'}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}> +91 {patientPhone || '—'}</div>
                  </div>
                </div>

                {/* Symptoms / Diagnosis */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
                  <div style={{ border: '1px dashed #e2e8f0', borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Symptoms</div>
                    <div style={{ fontSize: 13 }}>
                      {Array.isArray(symptoms) && symptoms.length > 0 ? (
                        <ul style={{ paddingLeft: 18, margin: 0 }}>
                          {symptoms.map((s, idx) => (
                            <li key={idx}>
                              <strong>{s.symptom}</strong>
                              {s.severity && ` • ${s.severity}`}
                              {s.frequency && ` • ${s.frequency}`}
                              {s.duration && ` • ${s.duration}`}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span>No symptoms recorded</span>
                      )}
                    </div>
                  </div>
                  <div style={{ border: '1px dashed #e2e8f0', borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Diagnosis</div>
                    <div style={{ fontSize: 13 }}>
                      {Array.isArray(diagnosis) && diagnosis.length > 0 ? (
                        <ul style={{ paddingLeft: 18, margin: 0 }}>
                          {diagnosis.map((d, idx) => (
                            <li key={idx}>
                              <strong>{d.diagnosis}</strong>
                              {d.duration && ` • ${d.duration}`}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span>No diagnosis recorded</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Medicines Table */}
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Medicines</div>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', background: '#f1f5f9', color: '#0f172a', padding: '10px 12px', borderTopLeftRadius: 8, borderBottom: '1px solid #e2e8f0' }}>Medicine</th>
                        <th style={{ textAlign: 'left', background: '#f1f5f9', color: '#0f172a', padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>Dose/Timing</th>
                        {/* <th style={{ textAlign: 'left', background: '#f1f5f9', color: '#0f172a', padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>Frequency</th>
                        <th style={{ textAlign: 'left', background: '#f1f5f9', color: '#0f172a', padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>Duration</th> */}
                        <th style={{ textAlign: 'left', background: '#f1f5f9', color: '#0f172a', padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(medicines || []).map((med, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '12px', borderBottom: '1px solid #eef2f7' }}>{med.medicine_name || med.medicine?.name || 'Unnamed'}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #eef2f7' }}>{med.dose} • {med.when}</td>
                          {/* <td style={{ padding: '12px', borderBottom: '1px solid #eef2f7' }}>{med.frequency || '—'}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #eef2f7' }}>{med.duration || '—'}</td> */}
                          <td style={{ padding: '12px', borderBottom: '1px solid #eef2f7' }}>{med.notes || '—'}</td>
                        </tr>
                      ))}
                      {(!medicines || medicines.length === 0) && (
                        <tr>
                          <td colSpan="3" style={{ padding: '12px', color: '#64748b', textAlign: 'center', borderBottom: '1px solid #eef2f7' }}>No medicines added</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Vaccines Table */}
                {Array.isArray(vaccines) && vaccines.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Vaccines</div>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', background: '#f1f5f9', color: '#0f172a', padding: '10px 12px', borderTopLeftRadius: 8, borderBottom: '1px solid #e2e8f0' }}>Vaccine</th>
                          <th style={{ textAlign: 'left', background: '#f1f5f9', color: '#0f172a', padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>Dose/Date</th>
                          <th style={{ textAlign: 'left', background: '#f1f5f9', color: '#0f172a', padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vaccines.map((v, idx) => (
                          <tr key={idx}>
                            <td style={{ padding: '12px', borderBottom: '1px solid #eef2f7' }}>{v.vaccine_name || v.vaccine?.name || v.name || 'Unnamed'}</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #eef2f7' }}>{v.dose || v.vaccine_dose || v.date || '—'}</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #eef2f7' }}>{v.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Lab Tests Table */}
                {Array.isArray(lab_tests) && lab_tests.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Lab Tests</div>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', background: '#f1f5f9', color: '#0f172a', padding: '10px 12px', borderTopLeftRadius: 8, borderBottom: '1px solid #e2e8f0' }}>Test</th>
                          <th style={{ textAlign: 'left', background: '#f1f5f9', color: '#0f172a', padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>Result/Status</th>
                          <th style={{ textAlign: 'left', background: '#f1f5f9', color: '#0f172a', padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lab_tests.map((t, idx) => (
                          <tr key={idx}>
                            <td style={{ padding: '12px', borderBottom: '1px solid #eef2f7' }}>{t.test_name || t.test?.name || t.name || 'Unnamed'}</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #eef2f7' }}>{t.test_type || '—'}</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #eef2f7' }}>{t.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Medicine Instructions */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Instructions</div>
                  {instructions && (
                    <p style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{instructions}</p>
                  )}
                </div>

                {/* Signature & QR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 }}>
                  <div>
                    {(signature || getDoctorSignatureById(doctorId)) && (
                      <div>
                        <img src={signature || getDoctorSignatureById(doctorId)} alt="Doctor's Signature" style={{ maxWidth: 160, maxHeight: 64 }} />
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: '#64748b' }}>Dr. {doctorName}</div>
                  </div>
                  {prescriptionId && (
                    <div style={{ background: '#fff', display: 'inline-block', padding: 8, borderRadius: 8, border: '1px solid #eee' }}>
                      <QRCodeSVG value={`https://demo.clinicpro.cc/prescription/view/${prescriptionId}`} size={96} bgColor="#fff" fgColor="#000" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {editModalOpen && (
            <EditPrescriptionModal
              prescription={prescription}
              onClose={() => setEditModalOpen(false)}
              onSave={() => window.location.reload()}
            />
          )}
        </div>
      </div>
    </>
  );
});

export default PrescriptionViewPage;