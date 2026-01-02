import { FaFileMedical, FaCalendarAlt, FaStethoscope, FaPills, FaReceipt, FaTimes } from 'react-icons/fa';

const PrescriptionsModal = ({
  showPrescriptions,
  setShowPrescriptions,
  prescriptionLoading,
  patientPrescriptions,
  customer,
  patients,
  addPrescriptionToCart,
  addSingleMedicineFromPrescription,
  formatPrescriptionDate,
  formatDate
}) => {
  
  const formatMedicineTiming = (timing) => {
    if (!timing) return 'Not specified';
    
    const parts = timing.split('-');
    if (parts.length !== 3) return timing;
    
    const [morning, afternoon, night] = parts;
    const timings = [];
    
    if (morning === '1') timings.push('Morn');
    if (afternoon === '1') timings.push('Aft');
    if (night === '1') timings.push('Din');
    
    return timings.length > 0 ? timings.join(' - ') : 'Not specified';
  };

  const renderDiagnosis = (diagnosisData) => {
    if (!diagnosisData || diagnosisData.length === 0) {
      return <p>- Not specified</p>;
    }
    
    return (
      <ul className="list-unstyled mb-0">
        {diagnosisData.map((item, index) => (
          <li key={index} className="mb-1">
            - <strong>{item.diagnosis}</strong>
            {item.date && <span> (Date: {item.date})</span>}
            {item.duration && <span> • Duration: {item.duration}</span>}
          </li>
        ))}
      </ul>
    );
  };

  const renderSymptoms = (symptomsData) => {
    if (!symptomsData || symptomsData.length === 0) {
      return <p>- Not specified</p>;
    }
    
    return (
      <ul className="list-unstyled mb-0">
        {symptomsData.map((item, index) => (
          <li key={index} className="mb-1">
            - <strong>{item.symptom}</strong>
            {item.date && <span> (Date: {item.date})</span>}
            {item.duration && <span> • Duration: {item.duration}</span>}
            {item.severity && <span> • Severity: {item.severity}</span>}
            {item.frequency && <span> • Frequency: {item.frequency}</span>}
          </li>
        ))}
      </ul>
    );
  };

  if (!showPrescriptions) return null;

  return (
    <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content">
          <div className="modal-header  d-flex justify-content-between align-items-center bg-white" style={{ borderBottom: '1px solid #e5e7eb' }}>
            <h4 className="fw-bold d-flex align-items-center mb-0" style={{ color: '#2d3748' }}>
              <FaFileMedical className="me-2" />
              Patient Prescriptions
              {customer && (
                <span className="ms-2">- {patients.find(p => p.id === customer)?.name}</span>
              )}
            </h4>
            
            <button 
              type="button" 
              className="btn-close"
              onClick={() => setShowPrescriptions(false)}
            />
          </div>
          
          <div className="modal-body">
            {prescriptionLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading prescriptions...</p>
              </div>
            ) : patientPrescriptions.length === 0 ? (
              <div className="text-center py-5">
                <FaFileMedical className="display-4 text-muted mb-3" />
                <h5 className="text-muted">No prescriptions found</h5>
                <p className="text-muted">This patient has no previous prescriptions.</p>
              </div>
            ) : (
              <div className="row g-3">
                {patientPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="col-12">
                    <div className="card border-0 shadow-sm mb-1">
                      <div className="card-header bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                          <h6 className="mb-0 d-flex align-items-center">
                            <FaCalendarAlt className="me-2 text-primary" />
                            Appointment: {formatPrescriptionDate(prescription.appointment_date)} at {prescription.appointment_time}
                          </h6>
                          <small className="text-muted">
                            Prescription ID: #{prescription.id} • Created: {formatDate(prescription.created_at)}
                          </small>
                        </div>
                        
                        <button
                          className="btn btn-primary btn-sm d-flex align-items-center"
                          onClick={() => addPrescriptionToCart(prescription)}
                        >
                          <FaPills className="me-1" />
                          Add All to Cart
                        </button>
                      </div>
                      
                      <div className="card-body pb-0">
                        <div className="row">
                          <div className="col-md-4">
                            <h6 className="d-flex align-items-center">
                              <FaStethoscope className="me-2 text-info" />
                              Diagnosis
                            </h6>
                            {renderDiagnosis(prescription.diagnosis)}
                            
                            <h6 className="d-flex align-items-center mt-3">
                              <FaFileMedical className="me-2 text-warning" />
                              Symptoms
                            </h6>
                            {renderSymptoms(prescription.symptoms)}
                            
                            <h6 className="d-flex align-items-center mt-3">
                              <FaReceipt className="me-2 text-success" />
                              Instructions
                            </h6>
                            <p>{prescription.instructions || 'No specific instructions'}</p>
                          </div>
                          
                          <div className="col-md-8">
                            <h6 className="d-flex align-items-center">
                              <FaPills className="me-2 text-danger" />
                              Prescribed Medicines ({prescription.medicines?.length || 0})
                            </h6>
                            
                            {prescription.medicines?.length > 0 ? (
                              <div className="table-responsive">
                                <table className="table table-sm table-borderless">
                                  <thead>
                                    <tr>
                                      <th>Medicine</th>
                                      <th>Timing</th>
                                      <th>Notes</th>
                                      <th>Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {prescription.medicines.map((medicine, idx) => (
                                      <tr key={idx}>
                                        <td><strong>{medicine.medicine_name}</strong></td>
                                        <td>
                                          <span className="badge bg-info">
                                            {formatMedicineTiming(medicine.medicine_timing)}
                                          </span>
                                        </td>
                                        <td>
                                          <small className="text-muted">{medicine.notes || '-'}</small>
                                        </td>
                                        <td>
                                          <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => addSingleMedicineFromPrescription(medicine)}
                                            title="Add this medicine to cart"
                                          >
                                            <FaPills className="me-1" />
                                            Add to Cart
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-muted">No medicines prescribed</p>
                            )}
                            
                            {prescription.follow_up_date && (
                              <div className="mt-3 p-2 bg-light rounded">
                                <small className="text-muted d-flex align-items-center">
                                  <FaCalendarAlt className="me-1 text-warning" />
                                  <strong>Follow-up:</strong> {formatPrescriptionDate(prescription.follow_up_date)}
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setShowPrescriptions(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionsModal;