import React, { memo, useRef } from "react";
import { FiCalendar, FiClock, FiPrinter } from "react-icons/fi";

/* ---------- CONSTANTS ---------- */

const BORDER_COLORS = ['#4A6FA5', '#5BC0DE', '#20C997', '#F0AD4E', '#8E44AD'];

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-IN") : "—";

/* ---------- MAIN COMPONENT ---------- */

const PreviewPrescription = ({
  prescriptionData,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  if (!prescriptionData) return null;

  const {
    patient,
    doctor,
    symptoms = [],
    diagnosis = [],
    medicines = [],
    labTests = [],
    vaccines = [],
    image_urls = [],
    followUpDate,
    instructions,
    totals,
  } = prescriptionData;

  // Ref for the print content
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    // Create a print-friendly version
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${patient?.patientName || 'Patient'}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          @media print {
            body { margin: 0; padding: 20px; font-size: 12px; }
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            .table { font-size: 11px; }
            .container { max-width: 100% !important; }
            .card { border: 1px solid #ddd !important; }
            .border-left { border-left: 4px solid #4A6FA5 !important; }
            .text-muted { color: #6c757d !important; }
            .fw-semibold { font-weight: 600 !important; }
            .mb-3 { margin-bottom: 1rem !important; }
            .p-3 { padding: 1rem !important; }
            .rounded { border-radius: 0.375rem !important; }
          }
          @page { margin: 0.5cm; }
          body { font-family: Arial, sans-serif; }
          .header-section { border-bottom: 2px solid #4A6FA5; padding-bottom: 15px; margin-bottom: 20px; }
          .section-title { color: #4A6FA5; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px; }
          .table th { background-color: #f8f9fa; }
          .total-row { background-color: #f8f9fa; font-weight: bold; }
          .watermark { position: absolute; opacity: 0.1; font-size: 80px; transform: rotate(-45deg); z-index: -1; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="watermark">PRESCRIPTION</div>
          ${printContent}
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      {/* Print Modal - Hidden until printed */}
      <div className="d-none">
        <div ref={printRef}>
          <PrintVersion 
            prescriptionData={prescriptionData}
            patient={patient}
            doctor={doctor}
            symptoms={symptoms}
            diagnosis={diagnosis}
            medicines={medicines}
            labTests={labTests}
            vaccines={vaccines}
            image_urls={image_urls}
            followUpDate={followUpDate}
            instructions={instructions}
            totals={totals}
          />
        </div>
      </div>

      {/* Main Modal */}
      <div
        className="modal fade show d-block"
        style={{ background: "rgba(0,0,0,.45)" }}
      >
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content rounded-3 shadow-lg">

            {/* HEADER */}
            <Header patient={patient} onClose={onClose} />

            <div
              className="modal-body"
              style={{ maxHeight: "75vh", overflowY: "auto" }}
            >

              {/* PATIENT + DOCTOR */}
              <PatientDoctor
                patient={patient}
                doctor={doctor}
                followUpDate={followUpDate}
              />

              {/* SYMPTOMS + DIAGNOSIS */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="h-100 p-3 rounded border border-dashed">
                    <Section title="Symptoms">
                      {(() => {
                        const validSymptoms = symptoms.filter(
                          (s) => s.symptom && s.symptom.trim()
                        );
                        return validSymptoms.length
                          ? validSymptoms.map((s, i) => (
                              <SymptomCard key={i} data={s} index={i} />
                            ))
                          : <Empty />;
                      })()}
                    </Section>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="h-100 p-3 rounded border border-dashed">
                    <Section title="Diagnosis">
                      {(() => {
                        const validDiagnosis = diagnosis.filter(
                          (d) => d.diagnosis && d.diagnosis.trim()
                        );
                        return validDiagnosis.length
                          ? validDiagnosis.map((d, i) => (
                              <DiagnosisCard key={i} data={d} index={i} />
                            ))
                          : <Empty />;
                      })()}
                    </Section>
                  </div>
                </div>
              </div>

              {/* MEDICINES */}
              <div className="mb-4">
                <Section title="Medicines">
                  {medicines.length
                    ? <MedicineTable medicines={medicines} />
                    : <Empty />}
                </Section>
              </div>

              {/* LAB TESTS */}
              <div className="mb-4">
                <Section title="Lab Tests">
                  {labTests.length
                    ? <LabTestTable labTests={labTests} />
                    : <Empty />}
                </Section>
              </div>

              {/* VACCINES */}
              <div className="mb-4">
                <Section title="Vaccines">
                  {vaccines.length
                    ? <VaccineTable vaccines={vaccines} />
                    : <Empty />}
                </Section>
              </div>

              {/* INSTRUCTIONS + IMAGES */}
              <div className="row mb-4">
                {/* SPECIAL INSTRUCTIONS */}
                <div className="col-md-6">
                  <div className="h-100 p-3 rounded border border-dashed">
                    <Section title="Special Instructions">
                      {instructions ? (
                        <div className="alert alert-warning small mb-0" style={{ minHeight: 100 }}>
                          {instructions}
                        </div>
                      ) : (
                        <Empty />
                      )}
                    </Section>
                  </div>
                </div>

                {/* IMAGES */}
                <div className="col-md-6">
                  <div className="h-100 p-3 rounded border border-dashed">
                    <Section title="Images">
                      {image_urls.length ? (
                        <div className="row g-2">
                          {image_urls.map((img, i) => (
                            <div className="col-4" key={i}>
                              <img
                                src={img}
                                alt="Prescription"
                                className="img-fluid border rounded"
                                style={{
                                  width: "100%",
                                  height: 90,
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Empty />
                      )}
                    </Section>
                  </div>
                </div>
              </div>

              {/* BILLING */}
              <div className="mb-0">
                <BillingSummary totals={totals} />
              </div>
            </div>

            {/* FOOTER */}
            <Footer
              onClose={onClose}
              onSubmit={onSubmit}
              onPrint={handlePrint}
              isSubmitting={isSubmitting}
            />

          </div>
        </div>
      </div>
    </>
  );
};

/* ---------- PRINT VERSION ---------- */

const PrintVersion = memo(({
  prescriptionData,
  patient,
  doctor,
  symptoms,
  diagnosis,
  medicines,
  labTests,
  vaccines,
  image_urls,
  followUpDate,
  instructions,
  totals,
}) => {
  return (
    <div className="print-only">
      {/* Header for print */}
      <div className="header-section">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h1 className="h3 fw-bold text-primary">MEDICAL PRESCRIPTION</h1>
            <p className="text-muted mb-0">Appointment: {patient?.appointment_date} • {patient?.appointment_time}</p>
          </div>
          <div className="text-end">
            <p className="mb-1">Date: {new Date().toLocaleDateString("en-IN")}</p>
            <p className="mb-1">Prescription ID: {prescriptionData?.id || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Patient & Doctor Info */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card border-0">
            <div className="card-body">
              <h5 className="section-title">Patient Information</h5>
              <table className="table table-sm table-borderless">
                <tbody>
                  <tr>
                    <td width="30%" className="text-muted">Name:</td>
                    <td className="fw-semibold">{patient?.patientName || '—'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Age:</td>
                    <td>{patient?.patientAge || '—'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Phone:</td>
                    <td>{patient?.patientPhone || '—'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Source:</td>
                    <td>{patient?.source || '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0">
            <div className="card-body">
              <h5 className="section-title">Doctor Information</h5>
              <table className="table table-sm table-borderless">
                <tbody>
                  <tr>
                    <td width="30%" className="text-muted">Doctor:</td>
                    <td className="fw-semibold">{doctor?.name || '—'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Speciality:</td>
                    <td>
                      {Array.isArray(patient?.doctorSpeciality)
                        ? patient.doctorSpeciality.join(", ")
                        : patient?.doctorSpeciality || 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Follow-up Date:</td>
                    <td>{formatDate(followUpDate)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Symptoms & Diagnosis */}
      <div className="row mb-4">
        <div className="col-md-6">
          <h5 className="section-title">Symptoms</h5>
          {symptoms.filter(s => s.symptom?.trim()).length > 0 ? (
            symptoms.filter(s => s.symptom?.trim()).map((s, i) => (
              <div key={i} className="border-left p-3 mb-2">
                <div className="fw-semibold">{s.symptom}</div>
                {(s.frequency || s.duration) && (
                  <div className="text-muted small mt-1">
                    {s.frequency && <span className="me-3">Frequency: {s.frequency}</span>}
                    {s.duration && <span>Duration: {s.duration}</span>}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted small">No symptoms recorded</p>
          )}
        </div>

        <div className="col-md-6">
          <h5 className="section-title">Diagnosis</h5>
          {diagnosis.filter(d => d.diagnosis?.trim()).length > 0 ? (
            diagnosis.filter(d => d.diagnosis?.trim()).map((d, i) => (
              <div key={i} className="border-left p-3 mb-2">
                <div className="fw-semibold">{d.diagnosis}</div>
                {(d.date || d.duration) && (
                  <div className="text-muted small mt-1">
                    {d.date && <span className="me-3">Date: {formatDate(d.date)}</span>}
                    {d.duration && <span>Duration: {d.duration}</span>}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted small">No diagnosis recorded</p>
          )}
        </div>
      </div>

      {/* Medicines */}
      {medicines.length > 0 && (
        <div className="mb-4">
          <h5 className="section-title">Medicines</h5>
          <table className="table table-sm table-bordered">
            <thead className="table-light">
              <tr>
                <th width="5%">#</th>
                <th width="25%">Medicine</th>
                <th width="10%">Dose</th>
                <th width="15%">When</th>
                <th width="15%">Frequency</th>
                <th width="15%">Duration</th>
                <th width="15%">Notes</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((m, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <div className="fw-semibold">{m.medicine?.medicineName}</div>
                    <div className="text-muted small">SKU: {m.sku || "—"}</div>
                  </td>
                  <td><span className="badge bg-light text-dark">{m.dose}</span></td>
                  <td>{m.when}</td>
                  <td>{m.frequency}</td>
                  <td>{m.duration}</td>
                  <td className="small">{m.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lab Tests */}
      {labTests.length > 0 && (
        <div className="mb-4">
          <h5 className="section-title">Lab Tests</h5>
          <table className="table table-sm table-bordered">
            <thead className="table-light">
              <tr>
                <th width="5%">#</th>
                <th width="75%">Test Name</th>
                <th width="20%">Notes</th>
              </tr>
            </thead>
            <tbody>
              {labTests.map((lt, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <div className="fw-semibold">{lt.labTest?.medicineName}</div>
                    <div className="text-muted small">SKU: {lt.sku || "—"}</div>
                  </td>
                  <td className="small">{lt.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Vaccines */}
      {vaccines.length > 0 && (
        <div className="mb-4">
          <h5 className="section-title">Vaccines</h5>
          <table className="table table-sm table-bordered">
            <thead className="table-light">
              <tr>
                <th width="5%">#</th>
                <th width="75%">Vaccine Name</th>
                <th width="20%">Notes</th>
              </tr>
            </thead>
            <tbody>
              {vaccines.map((v, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <div className="fw-semibold">{v.vaccine?.medicineName}</div>
                    <div className="text-muted small">SKU: {v.sku || "—"}</div>
                  </td>
                  <td className="small">{v.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Special Instructions */}
      {instructions && (
        <div className="mb-4">
          <h5 className="section-title">Special Instructions</h5>
          <div className="alert alert-warning p-3">
            {instructions}
          </div>
        </div>
      )}

      {/* Billing Summary */}
      {totals && (
        <div className="mb-4">
          <h5 className="section-title">Billing Summary</h5>
          <table className="table table-sm table-bordered">
            <tbody>
              <tr>
                <td width="70%" className="text-muted">Medicines Total</td>
                <td width="30%" className="fw-semibold">₹ {(parseFloat(totals?.medicines) || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td className="text-muted">Lab Tests Total</td>
                <td className="fw-semibold">₹ {(parseFloat(totals?.labTests) || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td className="text-muted">Vaccines Total</td>
                <td className="fw-semibold">₹ {(parseFloat(totals?.vaccines) || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td className="text-muted">Consultation Fee</td>
                <td className="fw-semibold">₹ {(parseFloat(totals?.consultation) || 0).toFixed(2)}</td>
              </tr>
              <tr className="total-row">
                <td className="text-muted">Total Amount</td>
                <td className="fw-bold text-primary">
                  ₹ {(
                    (parseFloat(totals?.medicines) || 0) +
                    (parseFloat(totals?.labTests) || 0) +
                    (parseFloat(totals?.vaccines) || 0) +
                    (parseFloat(totals?.consultation) || 0)
                  ).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Footer for print */}
      <div className="mt-5 pt-4 border-top">
        <div className="row">
          <div className="col-md-6">
            <p className="mb-1">Doctor's Signature</p>
            <div className="border-bottom" style={{ width: '200px', height: '1px' }}></div>
          </div>
          <div className="col-md-6 text-end">
            <p className="mb-1">Patient's Signature</p>
            <div className="border-bottom" style={{ width: '200px', height: '1px', marginLeft: 'auto' }}></div>
          </div>
        </div>
        <div className="text-center mt-4 text-muted small">
          This is a computer-generated prescription. No physical signature is required.
        </div>
      </div>
    </div>
  );
});

/* ---------- HEADER ---------- */

const Header = memo(({ patient, onClose }) => (
  <div className="modal-header border-bottom bg-light">
    <div>
      <h5 className="mb-0 fw-semibold text-primary">Prescription Preview</h5>
      <small className="text-muted">
        <FiCalendar className="me-1" />
        Appointment • {patient?.appointment_date} • {patient?.appointment_time}
      </small>
    </div>
    <button className="btn-close" onClick={onClose} />
  </div>
));

/* ---------- PATIENT + DOCTOR ---------- */

const PatientDoctor = memo(({ patient, doctor, followUpDate }) => (
  <div className="row g-3 mb-4">
    <InfoBox title="Patient Details" icon="👤">
      <InfoRow label="Name" value={patient?.patientName} bold />
      <InfoRow label="Age" value={patient?.patientAge} />
      <InfoRow label="Phone" value={patient?.patientPhone} />
      <InfoRow label="Source" value={patient?.source} />
    </InfoBox>

    <InfoBox title="Doctor & Visit" icon="👨‍⚕️">
      <InfoRow label="Doctor" value={doctor?.name} bold />
      <InfoRow
        label="Speciality"
        value={
          Array.isArray(patient?.doctorSpeciality)
            ? patient.doctorSpeciality.join(", ")
            : patient?.doctorSpeciality || "N/A"
        }
      />
      <InfoRow label="Follow-up" value={formatDate(followUpDate)} />
    </InfoBox>
  </div>
));

/* ---------- INFO HELPERS ---------- */

const InfoBox = ({ title, children, icon }) => (
  <div className="col-md-6">
    <div className="border rounded p-3 h-100 shadow-sm">
      <h6 className="fw-semibold mb-3">
        {icon && <span className="me-2">{icon}</span>}
        {title}
      </h6>
      <div className="row small g-2">{children}</div>
    </div>
  </div>
);

const InfoRow = ({ label, value, bold }) => (
  <>
    <div className="col-4 text-muted mb-2">{label}</div>
    <div className={`col-8 mb-2 ${bold ? "fw-semibold" : ""}`}>
      {value || "—"}
    </div>
  </>
);

/* ---------- SYMPTOM & DIAGNOSIS CARDS ---------- */

const SymptomCard = ({ data, index }) => (
  <CardWrapper color={BORDER_COLORS[index % BORDER_COLORS.length]}>
    <div className="fw-semibold mb-2">{data.symptom}</div>
    <MetaRow>
      {data.frequency && (
        <Meta icon={<FiClock />} label="Frequency" value={data.frequency} />
      )}
      {data.duration && (
        <Meta
          icon={<FiCalendar />}
          label="Duration"
          value={`${data.duration} from ${formatDate(data.date)}`}
        />
      )}
    </MetaRow>
  </CardWrapper>
);

const DiagnosisCard = ({ data, index }) => (
  <CardWrapper color={BORDER_COLORS[index % BORDER_COLORS.length]}>
    <div className="fw-semibold mb-2">{data.diagnosis}</div>
    <MetaRow>
      {data.date && (
        <Meta icon={<FiCalendar />} label="Date" value={formatDate(data.date)} />
      )}
      {data.duration && (
        <Meta icon={<FiClock />} label="Duration" value={data.duration} />
      )}
    </MetaRow>
  </CardWrapper>
);

/* ---------- CARD HELPERS ---------- */

const CardWrapper = ({ color, children }) => (
  <div
    className="rounded p-3 mb-2 shadow-sm"
    style={{ borderLeft: `4px solid ${color}`, backgroundColor: "#fafbfc" }}
  >
    {children}
  </div>
);

const MetaRow = ({ children }) => (
  <div className="d-flex flex-wrap gap-2 small text-muted">{children}</div>
);

const Meta = ({ icon, label, value }) => (
  <div className="d-flex align-items-center gap-1">
    {icon}
    <span className="fw-medium">{label}:</span>
    <span>{value}</span>
  </div>
);

/* ---------- TABLES ---------- */

const MedicineTable = memo(({ medicines }) => (
  <SimpleTable
    headers={["#", "Medicine", "Dose", "When", "Frequency", "Duration", "Notes"]}
    rows={medicines.map((m, i) => ([
      i + 1,
      <>
        <div className="fw-semibold">{m.medicine?.medicineName}</div>
        <div className="text-muted small">SKU: {m.sku || "—"}</div>
      </>,
      <span className="badge bg-light text-dark border">{m.dose}</span>,
      m.when,
      m.frequency,
      m.duration,
      m.notes || "—",
    ]))}
  />
));

const LabTestTable = ({ labTests }) => (
  <SimpleTable
    headers={["#", "Lab Test", "Notes"]}
    rows={labTests.map((lt, i) => ([
      i + 1,
      <>
        <div className="fw-semibold">{lt.labTest?.medicineName}</div>
        <div className="text-muted small">SKU: {lt.sku || "—"}</div>
      </>,
      lt.notes || "—",
    ]))}
  />
);

const VaccineTable = ({ vaccines }) => (
  <SimpleTable
    headers={["#", "Vaccine", "Notes"]}
    rows={vaccines.map((v, i) => ([
      i + 1,
      <>
        <div className="fw-semibold">{v.vaccine?.medicineName}</div>
        <div className="text-muted small">SKU: {v.sku || "—"}</div>
      </>,
      v.notes || "—",
    ]))}
  />
);

/* ---------- GENERIC TABLE ---------- */

const SimpleTable = ({ headers, rows }) => (
  <div className="table-responsive border rounded shadow-sm">
    <table className="table align-middle mb-0">
      <thead className="small text-muted border-bottom table-light">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className={`${i === headers.length - 1 ? "text-end" : ""} py-2`}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-bottom">
            {row.map((cell, j) => (
              <td key={j} className={`${j === row.length - 1 ? "text-end" : ""} py-2 small`}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ---------- BILLING ---------- */

const BillingSummary = ({ totals }) => {
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toFixed(2);
  };

  const items = [
    { key: "medicines", label: "Medicines Total" },
    { key: "labTests", label: "Lab Tests Total" },
    { key: "vaccines", label: "Vaccines Total" },
  ];

  return (
    <Section title="Billing Summary">
      <div className="row small">
        {items.map((item) => (
          <React.Fragment key={item.key}>
            <div className="col-6 text-muted mb-2">{item.label}</div>
            <div className="col-6 fw-semibold mb-2">₹ {formatCurrency(totals?.[item.key])}</div>
          </React.Fragment>
        ))}
        <div className="col-6 text-muted mb-2">Consultation</div>
        <div className="col-6 fw-semibold mb-2">
          ₹ {formatCurrency(totals?.consultation)} ({totals?.paymentType || "cash"}){" "}
          {totals?.paymentStatus === "pending"
            ? <span className="badge bg-warning text-dark">Pending</span>
            : <span className="badge bg-success">Paid</span>}
        </div>
        <div className="col-12 mt-2 pt-2 border-top">
          <div className="d-flex justify-content-between">
            <span className="fw-bold">Total Amount:</span>
            <span className="fw-bold text-primary">
              ₹ {formatCurrency(
                (parseFloat(totals?.medicines) || 0) +
                (parseFloat(totals?.labTests) || 0) +
                (parseFloat(totals?.vaccines) || 0) +
                (parseFloat(totals?.consultation) || 0)
              )}
            </span>
          </div>
        </div>
      </div>
    </Section>
  );
};

/* ---------- FOOTER ---------- */

const Footer = ({ onClose, onSubmit, onPrint, isSubmitting }) => (
  <div className="modal-footer border-top bg-light">
    <button className="btn btn-outline-secondary" onClick={onClose}>
      Back
    </button>
    <button 
      className="btn btn-outline-primary d-flex align-items-center gap-2"
      onClick={onPrint}
    >
      <FiPrinter /> Print
    </button>
    <button 
      className="btn btn-primary" 
      onClick={onSubmit} 
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Submitting...
        </>
      ) : (
        "Confirm & Save"
      )}
    </button>
  </div>
);

/* ---------- HELPERS ---------- */

const Section = ({ title, children }) => (
  <div>
    <h6 className="fw-semibold mb-3 border-bottom pb-2">{title}</h6>
    {children}
  </div>
);

const Empty = () => (
  <div className="text-muted small p-3 text-center border rounded bg-light">
    No data available
  </div>
);

export default PreviewPrescription;