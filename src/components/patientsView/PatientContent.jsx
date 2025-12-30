import React from 'react';

const PatientContent = ({ patient }) => {
  const mockPrescriptions = [
    {
      id: 'RX001',
      date: '2024-06-01',
      doctor: 'Dr. Smith',
      summary: 'Fever, Paracetamol',
    },
    {
      id: 'RX002',
      date: '2024-05-15',
      doctor: 'Dr. Jones',
      summary: 'Cough, Antibiotics',
    },
  ];

  return (
    <div className="patient-content">
      {/* Render patient details here */}
      <p>Name: {patient?.name}</p>
      <p>Email: {patient?.email}</p>
      {/* Add more patient fields as needed */}

      <div className="mt-4">
        <h5>Prescription History</h5>
        <div className="prescription-timeline">
          {mockPrescriptions.length === 0 ? (
            <p>No prescriptions found.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {mockPrescriptions.map((rx) => (
                <li key={rx.id} style={{ marginBottom: 16, borderLeft: '3px solid #007bff', paddingLeft: 12 }}>
                  <div><strong>Date:</strong> {rx.date}</div>
                  <div><strong>Doctor:</strong> {rx.doctor}</div>
                  <div><strong>Summary:</strong> {rx.summary}</div>
                  <a href={`/prescription/view/${rx.id}`} className="btn btn-sm btn-primary mt-1">View Details</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientContent; 