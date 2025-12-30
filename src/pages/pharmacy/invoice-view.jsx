import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import CardHeader from '@/components/shared/CardHeader';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
// Material UI imports
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Stack } from '@mui/material';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';
import emailjs from 'emailjs-com'; // npm install emailjs-com
// EmailJS config (replace with your own)
const EMAILJS_SERVICE_ID = 'your_service_id';
const EMAILJS_TEMPLATE_ID = 'your_template_id';
const EMAILJS_USER_ID = 'your_public_key';

// Mock data for detailed invoices
const mockInvoices = [
  {
    id: 1,
    invoiceId: 'INV-1001',
    date: '2024-06-01',
    customer: 'John Doe',
    paymentMethod: 'Cash',
    items: [
      { name: 'Paracetamol', sku: 'MED-001', qty: 2, price: 100 },
      { name: 'Ibuprofen', sku: 'MED-002', qty: 1, price: 150 }
    ],
    subtotal: 350,
    discountType: 'percent',
    discountValue: 0,
    discount: 0,
    total: 350
  },
  {
    id: 2,
    invoiceId: 'INV-1002',
    date: '2024-06-02',
    customer: 'Jane Smith',
    paymentMethod: 'Card',
    items: [
      { name: 'Amoxicillin', sku: 'MED-003', qty: 1, price: 200 }
    ],
    subtotal: 200,
    discountType: 'percent',
    discountValue: 0,
    discount: 0,
    total: 200
  },
  {
    id: 3,
    invoiceId: 'INV-1003',
    date: '2024-06-03',
    customer: 'Walk-in',
    paymentMethod: 'UPI',
    items: [
      { name: 'Cetirizine', sku: 'MED-004', qty: 3, price: 50 }
    ],
    subtotal: 150,
    discountType: 'percent',
    discountValue: 0,
    discount: 0,
    total: 150
  }
];

const getClinicDetails = () => {
  try {
    const saved = localStorage.getItem('clinicDetails');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const THEME_COLOR = '#1976d2'; // Default Material UI blue

const InvoiceView = () => {
  const { id } = useParams();
  // Find invoice by invoiceId (not numeric id)
  const invoice = mockInvoices.find(inv => inv.invoiceId === id || String(inv.id) === id);
  const printRef = useRef();
  const [returnModal, setReturnModal] = useState(false);
  const [returnQty, setReturnQty] = useState(invoice ? invoice.items.map(() => 0) : []);
  // Share modal state
  const [shareModal, setShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const clinic = getClinicDetails();
  const themeColor = clinic.themeColor || THEME_COLOR;
  const [notes, setNotes] = useState('');
  if (!invoice) return (
    <>
      <PageHeader />
      <div className="main-content">
        <div className="row">
          <div className="col-xxl-6 mx-auto mt-4">
            <div className="card stretch stretch-full">
              <CardHeader title="Invoice Not Found" />
              <div className="card-body">Invoice not found.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // PDF/Print helpers
  const handlePrint = () => {
    window.print();
  };
  const handleDownloadPDF = async () => {
    const input = document.getElementById('invoice-print-area');
    if (!input) return;
    // Temporarily show logo if hidden for print
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice-${invoice.invoiceId}.pdf`);
  };

  // Share modal handlers
  const handleShare = () => setShareModal(true);
  const handleShareSend = async () => {
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_USER_ID || EMAILJS_SERVICE_ID === 'your_service_id') {
      toast.warn('EmailJS credentials not set. Please update them in the code.');
      setShareModal(false);
      setShareEmail('');
      return;
    }
    setShareLoading(true);
    // Generate PDF as base64
    const input = document.getElementById('invoice-print-area');
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    const pdfBlob = pdf.output('blob');
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result.split(',')[1];
      // EmailJS send
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          to_email: shareEmail,
          invoice_id: invoice.invoiceId,
          message: 'Please find attached your invoice.',
          attachment: base64data,
        }, EMAILJS_USER_ID);
        toast.success('Invoice sent via Email!');
      } catch (err) {
        console.log('Failed to send email');
        // toast.error('Failed to send email.');
      } finally {
        setShareLoading(false);
        setShareModal(false);
        setShareEmail('');
      }
    };
    reader.readAsDataURL(pdfBlob);
  };

  const handleReturn = () => setReturnModal(true);
  const handleReturnQtyChange = (idx, qty) => {
    setReturnQty(prev => prev.map((q, i) => i === idx ? Number(qty) : q));
  };
  const handleReturnConfirm = () => {
    setReturnModal(false);
    alert('Return processed!');
  };
  return (
    <>
      <PageHeader>
        <h2 className="mb-0">Invoice #{invoice.invoiceId}</h2>
      </PageHeader>
      <div className="main-content">
        <div className="row">
          <div className="col-xxl-6 mx-auto mt-4">
            <div className="card stretch stretch-full">
              <CardHeader title={`Invoice #${invoice.invoiceId}`} />
              <div className="card-body" ref={printRef} id="invoice-print-area" style={{ fontFamily: 'Roboto, Arial, sans-serif', background: '#fff' }}>
                {/* Clinic Branding Header */}
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: `3px solid ${themeColor}`, marginBottom: 16, paddingBottom: 12, background: themeColor, color: '#fff', borderRadius: 8 }}>
                  {clinic.logo && <img src={clinic.logo} alt="Clinic Logo" style={{ height: 56, width: 56, objectFit: 'contain', marginRight: 16, borderRadius: 8, background: '#fff' }} />}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 22 }}>{clinic.name || 'Your Clinic Name'}</div>
                    <div style={{ fontSize: 15 }}>{clinic.address || 'Clinic address here'}</div>
                    <div style={{ fontSize: 13 }}>
                      {clinic.phone && <>Phone: {clinic.phone} &nbsp; </>}
                      {clinic.email && <>Email: {clinic.email} &nbsp; </>}
                      {clinic.website && <>Website: {clinic.website}</>}
                    </div>
                    {clinic.gst && <div style={{ fontSize: 13 }}>GST/Reg: {clinic.gst}</div>}
                  </div>
                </div>
                <div className="mb-2"><strong>Date:</strong> {invoice.date}</div>
                <div className="mb-2"><strong>Customer:</strong> {invoice.customer}</div>
                <div className="mb-2"><strong>Payment Method:</strong> {invoice.paymentMethod}</div>
                <div className="table-responsive mt-3">
                  <table className="table table-hover mb-0" style={{ borderCollapse: 'collapse', width: '100%', fontSize: 15 }}>
                    <thead>
                      <tr style={{ background: themeColor, color: '#fff' }}>
                        <th style={{ padding: 8, border: `1px solid ${themeColor}` }}>Item</th>
                        <th style={{ padding: 8, border: `1px solid ${themeColor}` }}>SKU</th>
                        <th style={{ padding: 8, border: `1px solid ${themeColor}` }}>Qty</th>
                        <th style={{ padding: 8, border: `1px solid ${themeColor}` }}>Price</th>
                        <th style={{ padding: 8, border: `1px solid ${themeColor}` }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: 8, border: `1px solid ${themeColor}` }}>{item.name}</td>
                          <td style={{ padding: 8, border: `1px solid ${themeColor}` }}>{item.sku}</td>
                          <td style={{ padding: 8, border: `1px solid ${themeColor}` }}>{item.qty}</td>
                          <td style={{ padding: 8, border: `1px solid ${themeColor}` }}>₹{item.price}</td>
                          <td style={{ padding: 8, border: `1px solid ${themeColor}` }}>₹{item.qty * item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2"><strong>Subtotal: ₹{invoice.subtotal}</strong></div>
                <div className="mt-2">Discount: {invoice.discountType === 'percent' ? `${invoice.discountValue}%` : `₹${invoice.discount}`}</div>
                <div className="mt-2"><strong>Total: ₹{invoice.total}</strong></div>
                {/* Notes Section */}
                <div className="mt-3" style={{ fontSize: 14 }}>
                  <strong>Notes:</strong> {notes || 'Thank you for your business!'}
                </div>
                {/* Payment Terms Section */}
                <div className="mt-2" style={{ fontSize: 13, color: '#555' }}>
                  <strong>Payment Terms:</strong> Payment due within 7 days unless otherwise agreed.
                </div>
                {/* Signature Area */}
                <div className="mt-4" style={{ minHeight: 40, borderTop: '1px dashed #bbb', marginTop: 32, paddingTop: 12, textAlign: 'right', fontSize: 14 }}>
                  <span>Authorized Signature</span>
                </div>
              </div>
              <Box className="card-footer d-flex gap-2" sx={{ p: 2, justifyContent: 'flex-end' }}>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" color="primary" onClick={handlePrint}>Print</Button>
                  <Button variant="outlined" color="primary" onClick={handleDownloadPDF}>Download PDF</Button>
                  <Button variant="outlined" color="secondary" onClick={handleShare}>Share via Email</Button>
                  <Button variant="warning" color="warning" onClick={handleReturn}>Process Return</Button>
                </Stack>
              </Box>
            </div>
            {/* Share Modal */}
            <Dialog open={shareModal} onClose={() => setShareModal(false)}>
              <DialogTitle>Share Invoice via Email</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Recipient Email"
                  type="email"
                  fullWidth
                  value={shareEmail}
                  onChange={e => setShareEmail(e.target.value)}
                  disabled={shareLoading}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShareModal(false)} disabled={shareLoading}>Cancel</Button>
                <Button onClick={handleShareSend} disabled={!shareEmail || shareLoading}>{shareLoading ? 'Sending...' : 'Send'}</Button>
              </DialogActions>
            </Dialog>
            {/* Return Modal */}
            {returnModal && (
              <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
                <div className="card modal-content" style={{background:'#fff',padding:24,borderRadius:8,minWidth:320}}>
                  <div className="card-header"><h4 className="mb-0">Process Return</h4></div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead><tr><th>Item</th><th>Sold Qty</th><th>Return Qty</th></tr></thead>
                        <tbody>
                          {invoice.items.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.name}</td>
                              <td>{item.qty}</td>
                              <td><input type="number" min={0} max={item.qty} value={returnQty[idx]} onChange={e => handleReturnQtyChange(idx, e.target.value)} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="d-flex gap-2 mt-3">
                      <Button variant="contained" color="success" onClick={handleReturnConfirm}>Confirm Return</Button>
                      <Button variant="outlined" color="secondary" onClick={() => setReturnModal(false)}>Cancel</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceView; 