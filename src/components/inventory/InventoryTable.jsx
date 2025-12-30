import React from 'react';

const InventoryTable = ({ medicines, onEdit, onDelete, onAdjust }) => {
  const today = new Date();
  const isLowStock = (stock) => stock < 20;
  const isExpiringSoon = (expiry) => {
    const exp = new Date(expiry);
    const diff = (exp - today) / (1000 * 60 * 60 * 24);
    return diff < 30;
  };
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th>Batch</th>
          <th>Expiry</th>
          <th>Stock</th>
          <th>Price</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {medicines.map((med) => (
          <tr key={med.id}>
            <td>{med.name}</td>
            <td>{med.category}</td>
            <td>{med.batch}</td>
            <td>
              {med.expiry}
              {isExpiringSoon(med.expiry) && (
                <span style={{ color: 'orange', marginLeft: 6 }} title="Expiring soon">⚠️</span>
              )}
            </td>
            <td>
              {med.stock}
              {isLowStock(med.stock) && (
                <span style={{ color: 'red', marginLeft: 6 }} title="Low stock">⚠️</span>
              )}
            </td>
            <td>{med.price}</td>
            <td>
              <button onClick={() => onEdit(med)}>Edit</button>
              <button onClick={() => onDelete(med.id)} style={{marginLeft: 8}}>Delete</button>
              <button onClick={() => onAdjust(med)} style={{marginLeft: 8}}>Stock Adjust</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default InventoryTable; 