// Shared mock data for inventory modules

export const mockProducts = [
  { id: 1, name: 'Paracetamol', sku: 'P-001', category: 'Analgesic', price: 10, stock: 100 },
  { id: 2, name: 'Ibuprofen', sku: 'I-002', category: 'Anti-inflammatory', price: 15, stock: 50 },
];

export const mockCategories = [
  { id: 1, name: 'Analgesic' },
  { id: 2, name: 'Anti-inflammatory' },
];

export const mockAttributes = [
  { id: 1, name: 'Size', values: ['500mg', '200mg'] },
  { id: 2, name: 'Form', values: ['Tablet', 'Capsule'] },
];

export const mockStockHistory = [
  { id: 1, product: 'Paracetamol', change: +50, reason: 'Restock', date: '2024-07-01' },
  { id: 2, product: 'Ibuprofen', change: -10, reason: 'Sale', date: '2024-07-02' },
];

export const mockSuppliers = [
  { id: 1, name: 'Acme Pharma', contact: 'John Doe', email: 'john@acme.com' },
  { id: 2, name: 'Global Meds', contact: 'Jane Smith', email: 'jane@globalmeds.com' },
];

export const mockPurchaseOrders = [
  { id: 1, supplier: 'Acme Pharma', date: '2024-07-01', status: 'Received', items: [ { product: 'Paracetamol', qty: 100 } ] },
  { id: 2, supplier: 'Global Meds', date: '2024-07-02', status: 'Pending', items: [ { product: 'Ibuprofen', qty: 50 } ] },
];

export const mockInventoryReports = [
  { id: 1, product: 'Paracetamol', stock: 100, value: 1000 },
  { id: 2, product: 'Ibuprofen', stock: 50, value: 750 },
]; 