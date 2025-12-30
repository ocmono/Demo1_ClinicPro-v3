import React from 'react';

const InventoryHeader = ({ onAdd }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
    <h2>Medicine Inventory</h2>
    <button onClick={onAdd}>Add Medicine</button>
  </div>
);

export default InventoryHeader; 