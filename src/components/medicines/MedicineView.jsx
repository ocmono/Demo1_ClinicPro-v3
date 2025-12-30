import React from 'react';

const MedicineView = ({ medicine }) => {
  if (!medicine) return <div>No medicine selected.</div>;
  return (
    <div>
      <h3>Medicine Details</h3>
      <p><strong>Name:</strong> {medicine.name}</p>
      <p><strong>Brand:</strong> {medicine.brand}</p>
      <p><strong>Variations:</strong> {medicine.variations}</p>
    </div>
  );
};

export default MedicineView; 