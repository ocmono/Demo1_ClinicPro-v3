import React, { useState, useEffect } from 'react';

const StockAdjustmentModal = ({ open, onClose, onSubmit, medicine }) => {
  const [quantity, setQuantity] = useState(0);
  const [type, setType] = useState('in');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setQuantity(0);
      setType('in');
      setReason('');
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ type, quantity: Number(quantity), reason });
  };

  return (
    <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
      <div className="modal-content" style={{background:'#fff',padding:24,borderRadius:8,minWidth:320}}>
        <h3>Adjust Stock for {medicine?.name}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:12}}>
            <label>Type:</label>
            <select value={type} onChange={e => setType(e.target.value)} style={{marginLeft:8}}>
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
            </select>
          </div>
          <div style={{marginBottom:12}}>
            <label>Quantity:</label>
            <input type="number" value={quantity} min={1} onChange={e => setQuantity(e.target.value)} required style={{marginLeft:8}} />
          </div>
          <div style={{marginBottom:16}}>
            <label>Reason:</label>
            <input type="text" value={reason} onChange={e => setReason(e.target.value)} required placeholder="Reason for adjustment" style={{marginLeft:8}} />
          </div>
          <div style={{marginTop:16}}>
            <button type="submit">Submit</button>
            <button type="button" onClick={onClose} style={{marginLeft:8}}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal; 