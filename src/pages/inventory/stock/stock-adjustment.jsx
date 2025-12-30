import { useState, useMemo, useRef } from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Table from '@/components/shared/table/Table';
import { toast } from 'react-toastify';
import { useMedicines } from '../../../context/MedicinesContext';
import Footer from '@/components/shared/Footer';

const StockAdjustment = () => {
  const { medicines, adjustStock } = useMedicines();
  console.log("Medicines", medicines);
  const [selected, setSelected] = useState({ medIdx: null, varIdx: null, selectedMedicine: null });
  const [adjustQty, setAdjustQty] = useState(0);
  const [type, setType] = useState('in');
  const [reason, setReason] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const printRef = useRef();

  const handleSelect = (medIdx, varIdx, medicine, variation) => {
    setSelected({ medIdx, varIdx, selectedMedicine: medicine, selectedVariation: variation });
    setAdjustQty(0);
    setType('in');
    setReason('');
    setShowModal(true);
  };

  const handleApply = () => {
    setConfirming(true);
  };

  const handleConfirm = async () => {
    if (!adjustQty || !reason.trim()) {
      toast.error('Please fill all fields.');
      setConfirming(false);
      return;
    }

    setIsSubmitting(true);

    try {
      // Get variation ID - either from variation or use medicine ID
      const variationId = selected.selectedVariation
        ? selected.selectedVariation.id || selected.selectedVariation.sku
        : selected.selectedMedicine.id;

      if (!variationId) {
        toast.error('Unable to identify medicine variation.');
        setIsSubmitting(false);
        setConfirming(false);
        return;
      }

      const adjustmentData = {
        variation_id: variationId,
        stock_type: type, // 'in' or 'out'
        quantity: parseInt(adjustQty),
        reason: reason.trim()
      };

      console.log('Sending stock adjustment request:', adjustmentData);

      const result = await adjustStock(adjustmentData);

      if (result.success) {
        toast.success('Stock adjusted successfully!');

        // Close modals and reset form
        setConfirming(false);
        setShowModal(false);
        setSelected({ medIdx: null, varIdx: null, selectedMedicine: null });
        setAdjustQty(0);
        setReason('');
        setType('in');
      } else {
        toast.error(result.error || 'Failed to adjust stock. Please try again.');
      }
    } catch (error) {
      console.error('Stock adjustment error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
      setConfirming(false);
    }
  };

  // Transform medicines data for table
  const tableData = useMemo(() => {
    const flattenedData = [];
    medicines.forEach((medicine, medIdx) => {
      // Handle medicines with variations
      if (medicine.variations && medicine.variations.length > 0) {
        medicine.variations.forEach((variation, varIdx) => {
          flattenedData.push({
            id: `${medicine.name || medicine.medicineName}-${variation.sku}`,
            medIdx,
            varIdx,
            name: medicine.name || medicine.medicineName,
            brand: medicine.brand,
            sku: variation.sku,
            quantity: parseInt(variation.stock) || 0,
            unit: variation.unit || 'units',
            price: parseFloat(variation.price) || 0,
            actions: { medIdx, varIdx, medicine, variation }
          });
        });
      } else {
        // Handle medicines without variations (use main medicine data)
        flattenedData.push({
          id: `${medicine.name || medicine.medicineName}-${medicine.sku || medicine.id}`,
          medIdx,
          varIdx: 0,
          name: medicine.name || medicine.medicineName,
          brand: medicine.brand,
          sku: medicine.sku || medicine.id,
          quantity: parseInt(medicine.qnty) || parseInt(medicine.stock) || 0,
          unit: medicine.unit || 'units',
          price: parseFloat(medicine.price) || 0,
          actions: { medIdx, varIdx: 0, medicine, variation: null }
        });
      }
    });
    return flattenedData;
  }, [medicines]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const printHTML = `
      <html>
        <head>
          <title>Stock Adjustment Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>Stock Adjustment Report</h2>
          <table>
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Brand</th>
                <th>SKU</th>
                <th>Current Stock</th>
                <th>Price/ Unit</th>
              </tr>
            </thead>
            <tbody>
              ${tableData.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.brand}</td>
                  <td>${item.sku}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const columns = [
    {
      accessorKey: 'id',
      header: ({ table }) => {
        const checkboxRef = useRef(null);
        return (
          <input
            type="checkbox"
            className="custom-table-checkbox"
            ref={checkboxRef}
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        );
      },
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="custom-table-checkbox"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      meta: { headerClassName: 'width-30' },
    },
    {
      accessorKey: 'name',
      header: () => 'Medicine Name',
      cell: ({ getValue }) => (
        <div className="fw-bold">{getValue()}</div>
      )
    },
    {
      accessorKey: 'brand',
      header: () => 'Brand',
      cell: ({ getValue }) => (
        <span className="badge bg-info">{getValue()}</span>
      ),
    },
    {
      accessorKey: 'sku',
      header: () => 'SKU',
      cell: ({ getValue }) => (
        <code className="text-primary">{getValue()}</code>
      ),
    },
    {
      accessorKey: 'quantity',
      header: () => 'Current Stock',
      cell: ({ getValue, row }) => {
        const quantity = getValue();
        const unit = row.original.unit;
        const stockStatus = quantity === 0 ? 'danger' : quantity < 20 ? 'warning' : 'success';
        return (
          <div>
            <span className={`badge bg-${stockStatus}`}>
              {quantity}
            </span>
            <br />
            <small className='text-muted'>
              In stock
            </small>
          </div>
        );
      }
    },
    {
      accessorKey: 'price',
      header: () => 'Price/ Unit',
      cell: ({ getValue }) => (
        <strong>₹{getValue()}</strong>
      ),
    },
    {
      accessorKey: 'actions',
      header: () => "Actions",
      cell: ({ row }) => (
        <div className="hstack gap-2">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => handleSelect(
              row.original.medIdx,
              row.original.varIdx,
              row.original.actions.medicine,
              row.original.actions.variation
            )}
          >
            Adjust Stock
          </button>
        </div>
      ),
      meta: { headerClassName: 'text-end' }
    },
  ];

  return (
    <>
      <PageHeader />
      <div className="main-content">
        <div className="row">
          <Table
            data={tableData}
            columns={columns}
            onPrint={handlePrint}
            showPrint={true}
            printRef={printRef}
            cardHeader={<h5 class="card-title mb-0">Stock List</h5>}
            emptyMessage="No medicines found for stock adjustment."
          />

          {/* Modal for adjustment */}
          {showModal && selected.selectedMedicine && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="card" style={{ maxWidth: 400, width: '90%', padding: 24 }}>
                <div className="modal-content">
                  <div className='d-flex justify-content-between align-items-center mb-3'>
                    <h5>
                    Adjust Stock for: {selected.selectedMedicine.name || selected.selectedMedicine.medicineName}
                    {selected.selectedVariation ? ` (SKU: ${selected.selectedVariation.sku})` : ` (SKU: ${selected.selectedMedicine.sku || selected.selectedMedicine.id})`}
                    </h5>
                    <button className="btn-close" onClick={() => setShowModal(false)} style={{ position: 'relative', bottom: "30px", right: "0px" }}></button>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                      <option value="in">Stock In</option>
                      <option value="out">Stock Out</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Quantity *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={adjustQty}
                      onChange={e => setAdjustQty(e.target.value)}
                      placeholder="Enter quantity"
                      min="1"
                      required
                    />
                    {!adjustQty && <small className="text-muted">Please enter a valid quantity</small>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Reason *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      placeholder="Reason for adjustment"
                      required
                    />
                    {!reason.trim() && <small className="text-muted">Please provide a reason for this adjustment</small>}
                  </div>

                  {/* Current Stock Info */}
                  <div className="mb-3">
                    <div className="alert alert-info">
                      <strong>Current Stock:</strong> {
                        selected.selectedVariation
                          ? (selected.selectedVariation.stock || 0)
                          : (selected.selectedMedicine.qnty || selected.selectedMedicine.stock || 0)
                      }  units
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    <button
                      className="btn btn-success"
                      onClick={handleApply}
                      disabled={!adjustQty || !reason.trim()}
                    >
                      Apply
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Dialog */}
          {confirming && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="card" style={{ maxWidth: 350, width: '90%', padding: 20 }}>
                <div className="card-body">
                  <h5>Confirm Adjustment</h5>
                  <p>Are you sure you want to {type === 'in' ? 'add' : 'remove'} <b>{adjustQty}</b> units {type === 'in' ? 'to' : 'from'} stock?</p>
                  <div className="d-flex gap-2 mt-3">
                    <button
                      className="btn btn-primary"
                      onClick={handleConfirm}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Processing...
                        </>
                      ) : (
                        'Yes, Confirm'
                      )}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setConfirming(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default StockAdjustment; 