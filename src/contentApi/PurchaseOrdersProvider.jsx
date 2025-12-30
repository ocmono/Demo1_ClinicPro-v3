import React, { createContext, useContext, useState } from 'react';

const PurchaseOrdersContext = createContext();

export const PurchaseOrdersProvider = ({ children }) => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [idCounter, setIdCounter] = useState(1);

  const addPurchaseOrder = (order) => {
    setPurchaseOrders(prev => [...prev, { ...order, id: idCounter, status: 'Pending', receivedDate: null }]);
    setIdCounter(c => c + 1);
  };
  const receivePurchaseOrder = (id, receivedDate) => {
    setPurchaseOrders(prev => prev.map(po => po.id === id ? { ...po, status: 'Received', receivedDate } : po));
  };
  const deletePurchaseOrder = (id) => {
    setPurchaseOrders(prev => prev.filter(po => po.id !== id));
  };

  return (
    <PurchaseOrdersContext.Provider value={{ purchaseOrders, addPurchaseOrder, receivePurchaseOrder, deletePurchaseOrder }}>
      {children}
    </PurchaseOrdersContext.Provider>
  );
};

export const usePurchaseOrders = () => useContext(PurchaseOrdersContext); 