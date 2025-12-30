// invoices.jsx
import { useState } from 'react';
import { saveAs } from 'file-saver';
import { FiMail } from 'react-icons/fi';
import { FaWhatsapp, FaFileInvoiceDollar, FaSearch, FaFilter, FaFileExport, FaCalendarAlt, FaUser, FaMoneyBillWave, FaCreditCard, FaCheckCircle, FaTimes, FaShare, FaEye, FaFilePdf } from 'react-icons/fa';
import { BiDownload, BiUpvote } from 'react-icons/bi';
import CardHeader from '@/components/shared/CardHeader';
import Pagination from '@/components/shared/Pagination';
import CardLoader from '@/components/shared/CardLoader';
import useCardTitleActions from '@/hooks/useCardTitleActions';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import dayjs from 'dayjs';

// Mock data for invoices
const mockInvoices = [
  {
    id: 1,
    date: '2024-06-01',
    customer: 'John Doe',
    items: 'Paracetamol x2, Ibuprofen x1',
    total: 350,
    paymentMethod: 'Cash',
    invoiceId: 'INV-1001',
    status: 'Paid'
  },
  {
    id: 2,
    date: '2024-06-02',
    customer: 'Jane Smith',
    items: 'Amoxicillin x1',
    total: 200,
    paymentMethod: 'Card',
    invoiceId: 'INV-1002',
    status: 'Paid'
  },
  {
    id: 3,
    date: '2024-06-03',
    customer: 'Walk-in',
    items: 'Cetirizine x3',
    total: 150,
    paymentMethod: 'UPI',
    invoiceId: 'INV-1003',
    status: 'Refunded'
  }
];

const paymentMethods = ['All', 'Cash', 'Card', 'UPI'];
const customers = ['All', ...Array.from(new Set(mockInvoices.map(inv => inv.customer)))];
const statusOptions = ['All', 'Paid', 'Refunded', 'Pending'];

const statusClass = status => {
  if (status === 'Paid') return 'badge bg-success';
  if (status === 'Refunded') return 'badge bg-warning text-dark';
  if (status === 'Pending') return 'badge bg-secondary';
  return 'badge bg-light text-dark';
};

const getPaymentIcon = (method) => {
  switch (method) {
    case 'Cash': return <FaMoneyBillWave className="me-1" />;
    case 'Card': return <FaCreditCard className="me-1" />;
    case 'UPI': return <FaShare className="me-1" />;
    default: return <FaMoneyBillWave className="me-1" />;
  }
};

const Invoices = () => {
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [customerFilter, setCustomerFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [shareModal, setShareModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();

  // Filter logic
  let filtered = mockInvoices.filter(sale =>
    (sale.customer.toLowerCase().includes(search.toLowerCase()) || 
     sale.date.includes(search) ||
     sale.invoiceId.toLowerCase().includes(search.toLowerCase())) &&
    (paymentFilter === 'All' || sale.paymentMethod === paymentFilter) &&
    (customerFilter === 'All' || sale.customer === customerFilter) &&
    (statusFilter === 'All' || sale.status === statusFilter) &&
    (!dateFrom || dayjs(sale.date).isAfter(dayjs(dateFrom).subtract(1, 'day'))) &&
    (!dateTo || dayjs(sale.date).isBefore(dayjs(dateTo).add(1, 'day')))
  );

  const exportToCSV = () => {
    const headers = ['Date', 'Customer', 'Total', 'Invoice ID', 'Payment Method', 'Status'];
    const rows = filtered.map(inv => [
      inv.date,
      inv.customer,
      inv.total,
      inv.invoiceId,
      inv.paymentMethod,
      inv.status
    ]);
    let csv = headers.join(',') + '\n' + rows.map(r => r.map(x => '"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `invoices_${dayjs().format('YYYY-MM-DD')}.csv`);
  };

  const handleShare = (type, invoice) => {
    setSelectedInvoice(invoice);
    if (type === 'email') {
      alert(`Invoice ${invoice.invoiceId} sent to ${invoice.customer} via Email (PDF attached).`);
    } else if (type === 'whatsapp') {
      alert(`Invoice ${invoice.invoiceId} sent to ${invoice.customer} via WhatsApp (PDF attached).`);
    }
    setShareModal(false);
  };

  const openShareModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShareModal(true);
  };

  if (isRemoved) return null;

  return (
    <>
      <PageHeader />
      
      <div className="container-fluid mt-3">
        <div className="row">
          <div className="col-12">
            <div className={`card shadow-sm border-0${isExpanded ? ' card-expand' : ''}${refreshKey ? ' card-loading' : ''}`}>
              <div className="card-header py-3 d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <h4 className="mb-0 text-white d-flex align-items-center">
                  <FaFileInvoiceDollar className="me-2" />
                  Pharmacy Invoices
                </h4>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline-light btn-sm d-flex align-items-center"
                    onClick={handleRefresh}
                  >
                    <BiUpvote className="me-1" />
                    Refresh
                  </button>
                  <button 
                    className="btn btn-outline-light btn-sm d-flex align-items-center"
                    onClick={exportToCSV}
                  >
                    <FaFileExport className="me-1" />
                    Export CSV
                  </button>
                </div>
              </div>
              
              <div className="card-body">
                {/* Search & Filters Section */}
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FaSearch className="text-muted" />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search invoices..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-2">
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FaUser className="text-muted" />
                      </span>
                      <select 
                        className="form-select border-start-0"
                        value={customerFilter}
                        onChange={e => setCustomerFilter(e.target.value)}
                      >
                        {customers.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-2">
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FaCreditCard className="text-muted" />
                      </span>
                      <select 
                        className="form-select border-start-0"
                        value={paymentFilter}
                        onChange={e => setPaymentFilter(e.target.value)}
                      >
                        {paymentMethods.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-2">
                    <select 
                      className="form-select"
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                    >
                      {statusOptions.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <div className="row g-2">
                      <div className="col-6">
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <FaCalendarAlt className="text-muted" />
                          </span>
                          <input
                            type="date"
                            className="form-control border-start-0"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                            placeholder="From"
                          />
                        </div>
                      </div>
                      <div className="col-6">
                        <input
                          type="date"
                          className="form-control"
                          value={dateTo}
                          onChange={e => setDateTo(e.target.value)}
                          placeholder="To"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoices Table */}
                <div className="table-responsive">
                  <table className="table table-hover table-striped align-middle">
                    <thead className="table-light">
                      <tr>
                        <th width="10%">Invoice ID</th>
                        <th width="12%">Date</th>
                        <th width="18%">Customer</th>
                        <th width="25%">Items</th>
                        <th width="10%">Total</th>
                        <th width="10%">Payment</th>
                        <th width="10%">Status</th>
                        <th width="15%">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center py-4">
                            <div className="text-muted">
                              <FaSearch className="display-4 d-block mb-2 mx-auto" />
                              No invoices found matching your criteria
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filtered.map(invoice => (
                          <tr key={invoice.id}>
                            <td>
                              <code className="text-primary">{invoice.invoiceId}</code>
                            </td>
                            <td>
                              <small className="text-muted">{invoice.date}</small>
                            </td>
                            <td>
                              <strong>{invoice.customer}</strong>
                            </td>
                            <td>
                              <small>{invoice.items}</small>
                            </td>
                            <td>
                              <span className="fw-bold text-success">₹{invoice.total}</span>
                            </td>
                            <td>
                              <span className="d-flex align-items-center">
                                {getPaymentIcon(invoice.paymentMethod)}
                                {invoice.paymentMethod}
                              </span>
                            </td>
                            <td>
                              <span className={statusClass(invoice.status)}>
                                {invoice.status}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <a 
                                  className="btn btn-primary btn-sm d-flex align-items-center"
                                  href={`/pharmacy/invoices/${invoice.invoiceId}`}
                                >
                                  <FaEye className="me-1" />
                                  View
                                </a>
                                <button
                                  className="btn btn-outline-primary btn-sm d-flex align-items-center"
                                  onClick={() => openShareModal(invoice)}
                                  title="Share Invoice"
                                >
                                  <FaShare className="me-1" />
                                  Share
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <small className="text-muted">
                    Showing {filtered.length} of {mockInvoices.length} invoices
                  </small>
                  <Pagination />
                </div>
              </div>
              
              <CardLoader refreshKey={refreshKey} />
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {shareModal && selectedInvoice && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header text-white" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <h5 className="modal-title d-flex align-items-center">
                  <FaShare className="me-2" />
                  Share Invoice
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShareModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="d-flex align-items-center">
                  <FaFileInvoiceDollar className="me-2 text-primary" />
                  Share <strong>{selectedInvoice.invoiceId}</strong> with customer
                </p>
                <div className="alert alert-info">
                  <strong>Invoice Details:</strong>
                  <div className="mt-2">
                    <div>Customer: {selectedInvoice.customer}</div>
                    <div>Amount: ₹{selectedInvoice.total}</div>
                    <div>Date: {selectedInvoice.date}</div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary d-flex align-items-center"
                  onClick={() => setShareModal(false)}
                >
                  <FaTimes className="me-1" />
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-success d-flex align-items-center"
                  onClick={() => handleShare('whatsapp', selectedInvoice)}
                >
                  <FaWhatsapp className="me-1" />
                  WhatsApp
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary d-flex align-items-center"
                  onClick={() => handleShare('email', selectedInvoice)}
                >
                  <FiMail className="me-1" />
                  Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Invoices;