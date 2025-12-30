import React, { createContext, useContext, useState } from 'react';
import { useMedicines } from '../context/MedicinesContext';

const PharmacyContext = createContext();

export const PharmacyProvider = ({ children }) => {
  const [sales, setSales] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [invoiceIdCounter, setInvoiceIdCounter] = useState(1000);
  const { medicines, editMedicine } = useMedicines();

  const addSale = ({ items, customer, paymentMethod, subtotal, discount, discountType, discountValue, total }) => {
    const newId = invoiceIdCounter + 1;
    setInvoiceIdCounter(newId);
    const sale = {
      id: sales.length + 1,
      date: new Date().toISOString().slice(0, 10),
      items: items.map(i => `${i.medName} x${i.qty}` ).join(', '),
      subtotal,
      discount,
      discountType,
      discountValue,
      total,
      invoiceId: newId,
      customer,
      paymentMethod
    };
    setSales(prev => [...prev, sale]);
    const invoice = {
      id: newId,
      date: sale.date,
      customer,
      subtotal,
      discount,
      discountType,
      discountValue,
      total,
      items: items.map(i => ({ name: i.medName, sku: i.sku, qty: i.qty, price: i.price })),
      paymentMethod
    };
    setInvoices(prev => [...prev, invoice]);
    return newId;
  };

  const getInvoiceById = (id) => invoices.find(inv => String(inv.id) === String(id));

  const processReturn = (invoiceId, returnQtyArr) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;
      // Update returned quantities
      const newItems = inv.items.map((item, idx) => ({ ...item, returned: (item.returned || 0) + Number(returnQtyArr[idx] || 0) }));
      // Update inventory
      newItems.forEach((item, idx) => {
        if (Number(returnQtyArr[idx]) > 0) {
          const medIdx = medicines.findIndex(m => m.name === item.name);
          if (medIdx !== -1) {
            const med = { ...medicines[medIdx] };
            const varIdx = med.variations.findIndex(v => v.sku === item.sku);
            if (varIdx !== -1) {
              const v = { ...med.variations[varIdx] };
              v.quantity = String(Number(v.quantity) + Number(returnQtyArr[idx]));
              med.variations[varIdx] = v;
              editMedicine(medIdx, med);
            }
          }
        }
      });
      return { ...inv, items: newItems, returned: true };
    }));
    setSales(prev => prev.map(sale => sale.invoiceId === invoiceId ? { ...sale, returned: true } : sale));
  };

  return (
    <PharmacyContext.Provider value={{ sales, invoices, addSale, getInvoiceById, processReturn }}>
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => useContext(PharmacyContext); 