import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { usePatient } from '../../context/PatientContext';
import { useMedicines } from '../../context/MedicinesContext';
import { FaSearch, FaDownload, FaEye, FaShoppingCart, FaRupeeSign, FaCheckCircle, FaSyncAlt,FaReceipt,FaTimes} from 'react-icons/fa';

// Constants for API endpoints and configuration
const API_ENDPOINTS = {
  SALES_HISTORY: 'https://bkdemo1.clinicpro.cc/pos/sales-history',
  VARIATIONS: 'https://bkdemo1.clinicpro.cc/products/variations'
};

const STATUS_FILTERS = {
  ALL: 'all',
  PAID: 'paid',
  PENDING: 'pending',
  REFUNDED: 'refunded'
};

// Utility function to get date format from localStorage
const getDateFormat = () => {
  try {
    const dateTimeSettings = JSON.parse(localStorage.getItem('dateTimeSettings') || '{}');
    return dateTimeSettings.dateFormat || 'YYYY-MM-DD';
  } catch (error) {
    console.error('Error reading date format from localStorage:', error);
    return 'YYYY-MM-DD';
  }
};

// Utility function to format date based on user preference
const formatDate = (dateString, format = null) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  const dateFormat = format || getDateFormat();
  
  switch (dateFormat) {
    case 'DD/MM/YYYY':
      return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
    case 'MM/DD/YYYY':
      return date.toLocaleDateString('en-US'); // MM/DD/YYYY
    case 'YYYY-MM-DD':
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    default:
      return date.toLocaleDateString('en-US'); // Default to MM/DD/YYYY
  }
};

// Utility function to format datetime for display
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  const dateFormat = getDateFormat();
  const formattedDate = formatDate(dateString, dateFormat);
  
  // Get time format from localStorage
  try {
    const dateTimeSettings = JSON.parse(localStorage.getItem('dateTimeSettings') || '{}');
    const timeFormat = dateTimeSettings.timeFormat || '12h';
    
    if (timeFormat === '24h') {
      return `${formattedDate} ${date.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    } else {
      return `${formattedDate} ${date.toLocaleTimeString('en-US', { 
        hour: '2-digit',
        minute: '2-digit',
        hour12: true 
      })}`;
    }
  } catch (error) {
    console.error('Error reading time format from localStorage:', error);
    return `${formattedDate} ${date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit',
      hour12: true 
    })}`;
  }
};

const SalesHistory = () => {
  const [salesData, setSalesData] = useState([]);
  const [variationsData, setVariationsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState(STATUS_FILTERS.ALL);
  const [selectedSale, setSelectedSale] = useState(null);
  
  const { patients } = usePatient();
  const { medicines } = useMedicines();

  // Memoized maps for efficient data lookup
  const variationMap = useMemo(() => {
    const map = {};
    variationsData.forEach(v => { 
      if (v?.id) map[v.id] = v; 
    });
    return map;
  }, [variationsData]);
  
  const medicineMap = useMemo(() => {
    const map = {};
    medicines?.forEach(med => {
      med.variations?.forEach(v => { 
        if (v?.id) map[v.id] = med; 
      });
    });
    return map;
  }, [medicines]);

  const patientMap = useMemo(() => {
    const map = {};
    patients?.forEach(patient => {
      const key = patient.id || patient.patient_id;
      if (key) map[key] = patient;
    });
    return map;
  }, [patients]);

  // Data fetching with error handling
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [salesResponse, variationsResponse] = await Promise.all([
        fetch(API_ENDPOINTS.SALES_HISTORY, { headers }),
        fetch(API_ENDPOINTS.VARIATIONS, { headers })
      ]);

      if (!salesResponse.ok || !variationsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [salesData, variationsData] = await Promise.all([
        salesResponse.json(),
        variationsResponse.json()
      ]);

      setSalesData(Array.isArray(salesData) ? salesData : []);
      setVariationsData(Array.isArray(variationsData) ? variationsData : []);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setSalesData([]);
      setVariationsData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoized item details function
  const getItemDetails = useCallback((item) => {
    if (!item) return item;
    
    const variation = variationMap[item.product_variation_id];
    if (!variation) return item;

    const medicine = medicineMap[item.product_variation_id];
    
    return {
      ...item,
      ...variation,
      name: medicine?.name || variation.sku || item.name,
      brand: medicine?.brand,
      category: medicine?.category,
      medicine_type: medicine?.medicine_type,
    };
  }, [variationMap, medicineMap]);

  // Memoized statistics calculation
  const stats = useMemo(() => {
    const totalSales = salesData.length;
    const totalRevenue = salesData.reduce((sum, sale) => 
      sum + (parseFloat(sale.grand_total) || 0), 0);
    
    const paidOrders = salesData.filter(sale => {
      const totalPaid = sale.payment?.reduce((sum, p) => 
        sum + (parseFloat(p.paying_amt) || 0), 0);
      const grandTotal = parseFloat(sale.grand_total) || 0;
      return totalPaid >= grandTotal;
    }).length;

    const refundedOrders = salesData.filter(sale => 
      sale.status?.toLowerCase().includes('refund') || 
      sale.payment?.some(p => (parseFloat(p.paying_amt) || 0) < 0)
    ).length;

    return { totalSales, totalRevenue, paidOrders, refundedOrders };
  }, [salesData]);

  // Memoized status badge generator
  const getStatusBadge = useCallback((sale) => {
    const totalPaid = sale.payment?.reduce((sum, p) => 
      sum + (parseFloat(p.paying_amt) || 0), 0);
    const grandTotal = parseFloat(sale.grand_total) || 0;
    
    if (sale.status?.toLowerCase().includes('refund') || sale.payment?.some(p => (parseFloat(p.paying_amt) || 0) < 0)) {
      return <span className="badge bg-danger">Refunded</span>;
    }
    if (totalPaid >= grandTotal) {
      return <span className="badge bg-success">Paid</span>;
    } else if (totalPaid > 0) {
      return <span className="badge bg-info">Partial</span>;
    }
    return <span className="badge bg-warning">Pending</span>;
  }, []);

  // Memoized payment methods string
  const getPaymentMethods = useCallback((sale) => {
    return sale.payment?.map(p => p.method).filter(Boolean).join(', ') || 'N/A';
  }, []);

  // Memoized patient info lookup
  const getPatientInfo = useCallback((patientId) => {
    if (!patientId) return null;
    return patientMap[patientId];
  }, [patientMap]);

  // Memoized sales filtering
  const filteredSales = useMemo(() => {
    return salesData.filter(sale => {
      const matchesSearch = searchTerm === '' || 
        sale.invoice_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.patient_id?.toString().includes(searchTerm);

      if (!matchesSearch) return false;

      switch (filterStatus) {
        case STATUS_FILTERS.PAID: {
          const totalPaid = sale.payment?.reduce((sum, p) => 
            sum + (parseFloat(p.paying_amt) || 0), 0);
          const grandTotal = parseFloat(sale.grand_total) || 0;
          return totalPaid >= grandTotal;
        }
        
        case STATUS_FILTERS.PENDING: {
          const totalPaid = sale.payment?.reduce((sum, p) => 
            sum + (parseFloat(p.paying_amt) || 0), 0);
          const grandTotal = parseFloat(sale.grand_total) || 0;
          return totalPaid < grandTotal;
        }
        
        case STATUS_FILTERS.REFUNDED: {
          return sale.status?.toLowerCase().includes('refund') || 
                 sale.payment?.some(p => (parseFloat(p.paying_amt) || 0) < 0);
        }
        
        case STATUS_FILTERS.ALL:
        default:
          return true;
      }
    });
  }, [salesData, searchTerm, filterStatus]);

  // Memoized modal patient info
  const modalPatientInfo = useMemo(() => 
    selectedSale ? getPatientInfo(selectedSale.patient_id) : null,
    [selectedSale, getPatientInfo]
  );

  // Loading component
  const LoadingSpinner = () => (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-50 text-primary">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3">Loading Sales History...</p>
    </div>
  );

  // Statistics Cards Component
  const StatsCards = React.memo(({ stats }) => (
    <div className="row g-4 mb-4">
      {[
        { icon: FaShoppingCart, value: stats.totalSales, label: 'Total Sales', color: 'primary' },
        { icon: FaRupeeSign, value: `₹${stats.totalRevenue.toFixed(2)}`, label: 'Total Revenue', color: 'success' },
        { icon: FaCheckCircle, value: stats.paidOrders, label: 'Paid Orders', color: 'info' },
        { icon: FaSyncAlt, value: stats.refundedOrders, label: 'Refunded Orders', color: 'warning' }
      ].map((card, index) => (
        <div key={index} className="col-xl-3 col-md-6">
          <div className="card stat-card h-100 border-0 shadow-sm hover-shadow transition-all">
            <div className="card-body d-flex align-items-center">
              <div className={`bg-${card.color} bg-gradient rounded-3 d-flex align-items-center justify-content-center me-3`} style={{width: '60px', height: '60px'}}>
                <card.icon className="text-white fs-4" />
              </div>
              <div>
                <div className={`text-${card.color} fs-3 fw-bold`}>{card.value}</div>
                <div className="text-muted fw-semibold">{card.label}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  ));

  // Controls Section Component
  const ControlsSection = React.memo(({ searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => (

    <div className="card-body py-3">
    <div className="row g-2 align-items-center">
  
      {/* Search */}
      <div className="col-md-9">
        <div className="position-relative">
          <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
          <input
            type="text"
            className="form-control ps-5 py-2"
            placeholder="Search invoice / patient ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
  
      {/* Status Filter */}
      <div className="col-md-2">
        <select 
          className="form-select py-2"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value={STATUS_FILTERS.ALL}>All Status</option>
          <option value={STATUS_FILTERS.PAID}>Paid</option>
          <option value={STATUS_FILTERS.PENDING}>Pending</option>
          <option value={STATUS_FILTERS.REFUNDED}>Refunded</option>
        </select>
      </div>
  
      {/* Export Button */}
      <div className="col-md-1">
        <button className="btn btn-outline-secondary w-100 py-2">
          <FaDownload className="me-2" />
          Export
        </button>
      </div>
  
    </div>
  </div>
  ));

  // Sales Table Row Component
  const SalesTableRow = React.memo(({ sale, getPatientInfo, getStatusBadge, getPaymentMethods, onViewClick }) => {
    const patientInfo = getPatientInfo(sale.patient_id);
    
    return (
      <tr className="align-middle">
        <td className="px-3">
          <strong className="text-dark">#{sale.id}</strong>
        </td>
        <td className="px-3">
          <strong className="text-dark">#{sale.invoice_no}</strong>
        </td>
        <td className="px-3">
          <div>
            {patientInfo ? 
              `${patientInfo.first_name || ''} ${patientInfo.last_name || ''}`.trim() || `Patient #${sale.patient_id}` 
              : sale.patient_id || "Walk-in Customer"
            }
            {patientInfo && (
              <div className="text-muted small">ID: {sale.patient_id}</div>
            )}
          </div>
        </td>
        <td className="px-3">
          <div>
            <div className="fw-bold text-success">₹{sale.grand_total}</div>
            {sale.total_amount !== sale.grand_total && (
              <div className="text-muted small text-decoration-line-through">₹{sale.total_amount}</div>
            )}
          </div>
        </td>
        <td className="px-3">
          <div className="text-dark fw-medium text-uppercase">
            {getPaymentMethods(sale)}
          </div>
        </td>
        <td className="px-3">
          {getStatusBadge(sale)}
        </td>
        <td className="px-3">
          <span className="badge bg-light text-dark border">
            {sale.items?.length || 0} items
          </span>
        </td>
        <td className="px-3">
          <div>
            {formatDate(sale.created_at)}
            <div className="text-muted small">
              {formatDateTime(sale.created_at).split(' ')[1]} {/* Time only */}
            </div>
          </div>
        </td>
        <td className="px-3">
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onViewClick(sale)}
          >
            <FaEye className="me-1" />
            View
          </button>
        </td>
      </tr>
    );
  });

  // Sale Details Modal Component
  const SaleDetailsModal = React.memo(({ selectedSale, modalPatientInfo, getItemDetails, onClose }) => {
    if (!selectedSale) return null;

    return (
      <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <ModalHeader selectedSale={selectedSale} onClose={onClose} />
            <div className="modal-body" style={{maxHeight: '70vh', overflowY: 'auto'}}>
              <PatientInfoSection patientInfo={modalPatientInfo} selectedSale={selectedSale} />
              <PaymentSummarySection selectedSale={selectedSale} />
              <ItemsListSection selectedSale={selectedSale} getItemDetails={getItemDetails} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  });

  // Modal Sub-components
  const ModalHeader = React.memo(({ selectedSale, onClose }) => (
    <div className="modal-header bg-primary text-white rounded-top-3">
      <div>
        <h5 className="modal-title text-white">Invoice : #{selectedSale.invoice_no}</h5>
        <small className="text-white-50">{formatDateTime(selectedSale.created_at)}</small>
      </div>
      <button 
        type="button" 
        className="btn-close btn-close-white"
        onClick={onClose}
      ></button>
    </div>
  ));

  const PatientInfoSection = React.memo(({ patientInfo, selectedSale }) => (
    <div className="mb-4">
      <h6 className="border-bottom pb-2 mb-3 text-primary fw-semibold">Patient Information</h6>
      {patientInfo ? (
        <div className="row">
          <div className="col-md-6">
            <InfoRow label="Name:" value={patientInfo.name || 'N/A'} />
            <InfoRow label="Phone:" value={patientInfo.contact || 'N/A'} />
          </div>
          <div className="col-md-6">
            <InfoRow label="Email:" value={patientInfo.email || 'N/A'} />
            <InfoRow label="Address:" value={patientInfo.address || 'N/A'} />
          </div>
          {/* New row with all 4 fields in one line */}
          <div className="col-12">
            <div className="row">
              <div className="col-md-3">
                <InfoRow label="Blood Group:" value={patientInfo?.bloodGroup || 'N/A'} />
              </div>
              <div className="col-md-3">
                <InfoRow label="Weight:" value={patientInfo.weight ? `${patientInfo.weight} kg` : 'N/A'} />
              </div>
              <div className="col-md-3">
                <InfoRow label="Age:" value={patientInfo.age || 'N/A'} />
              </div>
              <div className="col-md-3">
                <InfoRow label="Gender:" value={patientInfo.gender || 'N/A'} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>{selectedSale.patient_id ? `Patient ID: ${selectedSale.patient_id}` : "Walk-in Customer"}</p>
      )}
    </div>
  ));

  const InfoRow = React.memo(({ label, value }) => (
    <div className="d-flex justify-content-between py-2 border-bottom">
      <span className="fw-semibold">{label}</span>
      <span>{value}</span>
    </div>
  ));

  const PaymentSummarySection = React.memo(({ selectedSale }) => (
    <div className="mb-4">
      <h6 className="border-bottom pb-2 mb-3 text-primary fw-semibold">Payment Summary</h6>
      <div>
        <InfoRow label="Total:" value={`₹${selectedSale.total_amount || '0.00'}`} />
        <InfoRow 
          label="Discount:" 
          value={`₹${(parseFloat(selectedSale.total_amount || 0) - parseFloat(selectedSale.grand_total || 0)).toFixed(2)}`} 
        />
        {selectedSale.payment?.map((payment, idx) => (
          <PaymentDetails key={idx} payment={payment} />
        ))}
        <div className="d-flex justify-content-between py-2 border-top border-2 mt-3 pt-3">
          <span className="fw-bold fs-5">Grand Total:</span>
          <span className="fw-bold fs-5 text-success">₹{selectedSale.grand_total || '0.00'}</span>
        </div>
      </div>
    </div>
  ));

  const PaymentDetails = React.memo(({ payment }) => (
    <div className="bg-light p-3 rounded mb-2 border-start border-primary">
      <InfoRow label="Method:" value={payment.method || 'N/A'} />
      <InfoRow 
        label="Received:" 
        value={`₹${Math.max(0, parseFloat(payment.paying_amt || 0) + parseFloat(payment.change || 0)).toFixed(2)}`} 
      />
      <InfoRow 
        label="Paid:" 
        value={`₹${Math.max(0, parseFloat(payment.paying_amt || 0)).toFixed(2)}`} 
      />
      <InfoRow label="Change:" value={`₹${payment.change || '0.00'}`} />
    </div>
  ));

  const ItemsListSection = React.memo(({ selectedSale, getItemDetails }) => (
    <div>
      <h6 className="border-bottom pb-2 mb-3 text-primary fw-semibold">Items ({selectedSale.items?.length || 0})</h6>
      <div style={{maxHeight: '300px', overflowY: 'auto'}}>
        {selectedSale.items?.map((item, idx) => (
          <ItemCard key={idx} item={item} getItemDetails={getItemDetails} />
        ))}
      </div>
    </div>
  ));

  const ItemCard = React.memo(({ item, getItemDetails }) => {
    const detailedItem = getItemDetails(item);
    
    return (
      <div className="bg-white p-3 mb-3 shadow-sm border rounded">
        <ItemHeader detailedItem={detailedItem} />
        <ItemSubDetails detailedItem={detailedItem} />
        <ItemInfoGrid detailedItem={detailedItem} />
      </div>
    );
  });

  const ItemHeader = React.memo(({ detailedItem }) => (
    <div className="d-flex justify-content-between align-items-center mb-2">
      <div>
        <div className="fw-bold fs-5 text-dark">{detailedItem?.name}</div>
        {detailedItem?.brand && (
          <div className="text-muted small">{detailedItem.brand}</div>
        )}
      </div>
      <div className="bg-success text-white px-3 py-2 rounded-pill fw-bold ">
        ₹{(
          parseFloat(detailedItem?.unit_price || detailedItem?.price || 0) *
          parseInt(detailedItem.quantity || 1)
        ).toFixed(2)}
      </div>
    </div>
  ));

  const ItemSubDetails = React.memo(({ detailedItem }) => (
    <div className="d-flex justify-content-between align-items-end text-muted small mb-2 pb-2 border-bottom">
      <span>
        ₹{detailedItem?.unit_price || detailedItem?.price} × {detailedItem.quantity} {detailedItem.unit || "units"}
      </span>
      {detailedItem.discounts?.length > 0 && (
        <div className="d-flex gap-2 ">
          {detailedItem.discounts.map((d, i) => (
            <span key={i} className="bg-warning bg-opacity-10 text-dark px-2 py-1 rounded-pill small border fw-bold">
              {d.type === "percent" ? `${d.value}%` : `₹${d.value}`}
              <span className="ms-1 text-dark gap-1">× {d.quantity}</span>
            </span>
          ))}
        </div>
      )}
      <span className="fw-semibold text-dark">
        Subtotal: ₹{detailedItem?.subtotal}
      </span>
    </div>
  ));

  const ItemInfoGrid = React.memo(({ detailedItem }) => (
    <div className="row small g-2 mt-2">
      {detailedItem.batch_code && (
        <InfoGridItem label="Batch" value={detailedItem.batch_code} />
      )}
      {detailedItem.sku && (
        <InfoGridItem label="SKU" value={detailedItem.sku} />
      )}
      {(detailedItem.expiry_date || detailedItem.mfg_date) && (
        <div className="col-md-3">
          <div className="text-uppercase text-muted small fw-bold">Expiry / Mfg</div>
          <div className="text-dark">
            {detailedItem.expiry_date && formatDate(detailedItem.expiry_date)} <br />
            {detailedItem.mfg_date && formatDate(detailedItem.mfg_date)}
          </div>
        </div>
      )}
      {detailedItem.stock !== undefined && (
        <InfoGridItem 
          label="Stock" 
          value={`${detailedItem.stock} ${detailedItem.unit}`} 
        />
      )}
    </div>
  ));

  const InfoGridItem = React.memo(({ label, value }) => (
    <div className="col-md-3">
      <div className="text-uppercase text-muted small fw-bold">{label}</div>
      <div className="text-dark">{value}</div>
    </div>
  ));

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <StatsCards stats={stats} />
      


      {/* Sales Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
        <ControlsSection 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-3 py-3">ID</th>
                  <th className="px-3 py-3">Invoice No</th>
                  <th className="px-3 py-3">Patient</th>
                  <th className="px-3 py-3">Amount</th>
                  <th className="px-3 py-3">Payment Method</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Items</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="text-center py-5">
                      <FaReceipt className="display-4 text-muted mb-2" />
                      <p className="text-muted mb-0">No sales records found</p>
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <SalesTableRow
                      key={sale.id}
                      sale={sale}
                      getPatientInfo={getPatientInfo}
                      getStatusBadge={getStatusBadge}
                      getPaymentMethods={getPaymentMethods}
                      onViewClick={setSelectedSale}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <SaleDetailsModal
        selectedSale={selectedSale}
        modalPatientInfo={modalPatientInfo}
        getItemDetails={getItemDetails}
        onClose={() => setSelectedSale(null)}
      />
    </div>
  );
};

export default SalesHistory;