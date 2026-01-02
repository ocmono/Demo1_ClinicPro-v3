// components/PrintCartModal.jsx
import { useRef, useState } from 'react';
import { FaPrint, FaFilePdf, FaTimes, FaDownload, FaReceipt, FaInfoCircle } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PrintCartModal = ({
  showPrintModal,
  setShowPrintModal,
  cart,
  subtotal,
  discount,
  deliveryCharge,
  roundOff,
  roundedTotal,
  customer,
  patients,
  paymentMethod,
  paymentDetails
}) => {
  const printContentRef = useRef(null);
  const [printOption, setPrintOption] = useState('receipt'); // 'receipt', 'detailed', 'pdf'

  if (!showPrintModal) return null;

  // Format date
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;

  // Get customer info
  const customerInfo = patients.find(p => p.id === customer);
  const customerName = customerInfo?.name || 'Walk-in Customer';
  const customerPhone = customerInfo?.phone || 'N/A';

  // Print function
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const content = printContentRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>POS Receipt</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 10px; }
            .receipt { width: 80mm; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
            .store-name { font-size: 16px; font-weight: bold; }
            .store-address { font-size: 10px; margin: 5px 0; }
            .section { margin: 8px 0; }
            .section-title { font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 5px; }
            .table { width: 100%; border-collapse: collapse; }
            .table th { text-align: left; border-bottom: 1px dashed #000; padding: 3px 0; }
            .table td { padding: 3px 0; border-bottom: 1px dotted #ccc; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .total-row { font-weight: bold; border-top: 2px solid #000; padding-top: 5px; }
            .footer { margin-top: 20px; text-align: center; font-size: 10px; border-top: 1px dashed #000; padding-top: 10px; }
            .barcode { text-align: center; margin: 10px 0; }
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none; }
              .receipt { width: 100% !important; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            ${printOption === 'detailed' ? content : generateSimpleReceipt()}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 1000);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Generate simple receipt HTML
  const generateSimpleReceipt = () => {
    return `
      <div class="header">
        <div class="store-name">MEDISTORE PHARMACY</div>
        <div class="store-address">123 Medical Street, Health City</div>
        <div class="store-address">Phone: 9876543210 | GST: 27ABCDE1234F1Z5</div>
      </div>
      
      <div class="section">
        <div><strong>Invoice:</strong> ${invoiceNumber}</div>
        <div><strong>Date:</strong> ${formattedDate}</div>
        <div><strong>Customer:</strong> ${customerName}</div>
        <div><strong>Phone:</strong> ${customerPhone}</div>
      </div>
      
      <table class="table">
        <thead>
          <tr>
            <th>Item</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Price</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${cart.map(item => `
            <tr>
              <td>${item.medName}<br><small>${item.sku}</small></td>
              <td class="text-right">${item.qty}</td>
              <td class="text-right">₹${parseFloat(item.price).toFixed(2)}</td>
              <td class="text-right">₹${(item.qty * item.price).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="section">
        <div class="text-right">Subtotal: ₹${subtotal.toFixed(2)}</div>
        <div class="text-right">Discount: -₹${discount.toFixed(2)}</div>
        <div class="text-right">Delivery: ₹${deliveryCharge.toFixed(2)}</div>
        ${roundOff !== 0 ? `<div class="text-right">Round Off: ₹${roundOff.toFixed(2)}</div>` : ''}
        <div class="total-row text-right">GRAND TOTAL: ₹${roundedTotal.toFixed(2)}</div>
      </div>
      
      <div class="section">
        <div><strong>Payment:</strong> ${paymentMethod}</div>
        ${paymentMethod === 'Cash' ? `
          <div>Received: ₹${parseFloat(paymentDetails.receivedAmount || 0).toFixed(2)}</div>
          <div>Change: ₹${parseFloat(paymentDetails.change || 0).toFixed(2)}</div>
        ` : ''}
      </div>
      
      <div class="footer">
        <div>Thank you for your purchase!</div>
        <div>*** Goods once sold will not be taken back ***</div>
        <div>For medical advice, please consult your doctor</div>
        <div class="barcode">${invoiceNumber}</div>
      </div>
    `;
  };

  // Generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(16);
    doc.text("MEDISTORE PHARMACY", 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text("123 Medical Street, Health City", 105, 22, { align: 'center' });
    doc.text("Phone: 9876543210 | GST: 27ABCDE1234F1Z5", 105, 27, { align: 'center' });
    
    // Add invoice details
    doc.setFontSize(12);
    doc.text(`Invoice: ${invoiceNumber}`, 14, 40);
    doc.text(`Date: ${formattedDate}`, 14, 46);
    doc.text(`Customer: ${customerName}`, 14, 52);
    doc.text(`Phone: ${customerPhone}`, 14, 58);
    
    // Add table
    const tableColumn = ["Item", "Qty", "Price", "Total"];
    const tableRows = cart.map(item => [
      `${item.medName}\nSKU: ${item.sku}`,
      item.qty.toString(),
      `₹${parseFloat(item.price).toFixed(2)}`,
      `₹${(item.qty * item.price).toFixed(2)}`
    ]);
    
    doc.autoTable({
      startY: 65,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Add totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, 150, finalY, { align: 'right' });
    doc.text(`Discount: -₹${discount.toFixed(2)}`, 150, finalY + 6, { align: 'right' });
    doc.text(`Delivery: ₹${deliveryCharge.toFixed(2)}`, 150, finalY + 12, { align: 'right' });
    if (roundOff !== 0) {
      doc.text(`Round Off: ₹${roundOff.toFixed(2)}`, 150, finalY + 18, { align: 'right' });
    }
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`GRAND TOTAL: ₹${roundedTotal.toFixed(2)}`, 150, finalY + 28, { align: 'right' });
    
    // Add payment info
    doc.setFont(undefined, 'normal');
    doc.text(`Payment Method: ${paymentMethod}`, 14, finalY + 40);
    if (paymentMethod === 'Cash') {
      doc.text(`Received Amount: ₹${parseFloat(paymentDetails.receivedAmount || 0).toFixed(2)}`, 14, finalY + 46);
      doc.text(`Change Given: ₹${parseFloat(paymentDetails.change || 0).toFixed(2)}`, 14, finalY + 52);
    }
    
    // Add footer
    doc.text("Thank you for your purchase!", 105, finalY + 65, { align: 'center' });
    doc.text("*** Goods once sold will not be taken back ***", 105, finalY + 70, { align: 'center' });
    doc.text("For medical advice, please consult your doctor", 105, finalY + 75, { align: 'center' });
    
    // Save PDF
    doc.save(`Invoice-${invoiceNumber}.pdf`);
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header d-flex justify-content-between align-items-center bg-white" style={{ borderBottom: '1px solid #e5e7eb' }}>
            <h4 className="fw-bold d-flex align-items-center mb-0" style={{ color: '#2d3748' }}>
              <FaPrint className="me-2" />
              Print Cart / Receipt
            </h4>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowPrintModal(false)}
            ></button>
          </div>
          
          <div className="modal-body">
            {/* Print Options */}
            <div className="mb-4">
              <h6 className="mb-3">Select Print Format:</h6>
              <div className="btn-group w-100" role="group">
                <button
                  type="button"
                  className={`btn ${printOption === 'receipt' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setPrintOption('receipt')}
                >
                  <FaReceipt className="me-2" />
                  Simple Receipt
                </button>
                <button
                  type="button"
                  className={`btn ${printOption === 'detailed' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setPrintOption('detailed')}
                >
                  <FaFilePdf className="me-2" />
                  Detailed Bill
                </button>
                <button
                  type="button"
                  className={`btn ${printOption === 'pdf' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setPrintOption('pdf')}
                >
                  <FaDownload className="me-2" />
                  Download PDF
                </button>
              </div>
            </div>

            {/* Preview Section */}
            {printOption === 'detailed' && (
              <div className="border rounded p-3 bg-light" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <div ref={printContentRef}>
                  {/* Detailed Receipt Preview */}
                  <div className="text-center mb-3">
                    <h5 className="fw-bold">MEDISTORE PHARMACY</h5>
                    <p className="mb-1 small">123 Medical Street, Health City</p>
                    <p className="mb-1 small">Phone: 9876543210 | GST: 27ABCDE1234F1Z5</p>
                    <p className="mb-0 small">Email: info@medistore.com</p>
                  </div>
                  
                  <hr />
                  
                  <div className="row mb-2">
                    <div className="col">
                      <p className="mb-1"><strong>Invoice No:</strong> ${invoiceNumber}</p>
                      <p className="mb-1"><strong>Date:</strong> ${formattedDate}</p>
                    </div>
                    <div className="col">
                      <p className="mb-1"><strong>Customer:</strong> ${customerName}</p>
                      <p className="mb-1"><strong>Phone:</strong> ${customerPhone}</p>
                    </div>
                  </div>
                  
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Medicine Name</th>
                        <th>SKU</th>
                        <th className="text-center">Qty</th>
                        <th className="text-end">Unit Price</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.medName}</td>
                          <td><small>{item.sku}</small></td>
                          <td className="text-center">{item.qty}</td>
                          <td className="text-end">₹${parseFloat(item.price).toFixed(2)}</td>
                          <td className="text-end">₹${(item.qty * item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="5" className="text-end fw-bold">Subtotal:</td>
                        <td className="text-end fw-bold">₹${subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colSpan="5" className="text-end">Discount:</td>
                        <td className="text-end">-₹${discount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colSpan="5" className="text-end">Delivery Charge:</td>
                        <td className="text-end">₹${deliveryCharge.toFixed(2)}</td>
                      </tr>
                      {roundOff !== 0 && (
                        <tr>
                          <td colSpan="5" className="text-end">Round Off:</td>
                          <td className="text-end">₹${roundOff.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr className="table-primary">
                        <td colSpan="5" className="text-end fw-bold">GRAND TOTAL:</td>
                        <td className="text-end fw-bold">₹${roundedTotal.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                  
                  <div className="mt-3">
                    <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                    {paymentMethod === 'Cash' && (
                      <>
                        <p><strong>Received Amount:</strong> ₹${parseFloat(paymentDetails.receivedAmount || 0).toFixed(2)}</p>
                        <p><strong>Change:</strong> ₹${parseFloat(paymentDetails.change || 0).toFixed(2)}</p>
                      </>
                    )}
                    <p className="mt-3 text-center small text-muted">
                      *** Thank you for your purchase! ***<br />
                      *** Goods once sold will not be taken back ***<br />
                      For medical advice, please consult your doctor
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {printOption !== 'detailed' && (
              <div className="alert alert-info">
                <FaInfoCircle className="me-2" />
                {printOption === 'receipt' 
                  ? 'This will print a thermal printer-friendly receipt (80mm width).' 
                  : 'This will download a detailed PDF invoice.'}
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary d-flex align-items-center"
              onClick={() => setShowPrintModal(false)}
            >
              <FaTimes className="me-2" />
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-success d-flex align-items-center"
              onClick={printOption === 'pdf' ? generatePDF : handlePrint}
            >
              {printOption === 'pdf' ? (
                <>
                  <FaDownload className="me-2" />
                  Download PDF
                </>
              ) : (
                <>
                  <FaPrint className="me-2" />
                  Print {printOption === 'receipt' ? 'Receipt' : 'Bill'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintCartModal;