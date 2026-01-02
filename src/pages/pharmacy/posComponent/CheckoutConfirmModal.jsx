import { FaCheckCircle, FaExclamationTriangle, FaFileInvoiceDollar, FaShoppingCart, FaUser, FaMoneyBillWave, FaExchangeAlt, FaQrcode, FaTimes } from 'react-icons/fa';
import QRCode from 'react-qr-code';
// import QRCode from 'qrcode.react'; 

const CheckoutConfirmModal = ({
  checkoutDialog,
  setCheckoutDialog,
  showQRCode,
  setShowQRCode,
  cart,
  customer,
  patients,
  paymentMethod,
  paymentDetails,
  roundOffEnabled,
  roundOff,
  roundedTotal,
  finalTotal,
  confirmCheckout,
  getPaymentIcon,
  upiId = 'suyashdhumal35@oksbi' // Add UPI ID prop
}) => {
  
  // Generate UPI payment link for modal
  const generateUPILink = (amount) => {
    const merchantName = "MediStore";
    const note = `Payment for medicines - Order ${Date.now()}`;
    
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`;
  };

  if (!checkoutDialog) return null;

  return (
    <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '650px' }}>
        <div className="modal-content">
          <div className="modal-header d-flex justify-content-between align-items-center bg-white" style={{ borderBottom: '1px solid #e5e7eb' }}>
            <h4 className="fw-bold d-flex align-items-center mb-0" style={{ color: '#2d3748' }}>
              <FaCheckCircle className="me-2" />
              Confirm Sale
            </h4>
            <button 
              type="button" 
              className="btn-close"
              onClick={() => {
                setCheckoutDialog(false);
                setShowQRCode(false);
              }}
            ></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className={showQRCode && paymentMethod === 'UPI' ? 'col-md-8' : 'col-12'}>
                <p className="d-flex align-items-center">
                  <FaExclamationTriangle className="me-2 text-warning" />
                  Are you sure you want to complete this sale?
                </p>
                <div className="alert alert-info">
                  <strong className="d-flex align-items-center">
                    <FaFileInvoiceDollar className="me-2" />
                    Sale Summary:
                  </strong>
                  <div className="mt-2">
                    <div className="d-flex align-items-center">
                      <FaShoppingCart className="me-2" />
                      Items: {cart.length}
                    </div>
                    <div className="d-flex align-items-center">
                      <FaUser className="me-2" />
                      Customer: {patients.find(p => p.id === customer)?.name || 'Unknown'}
                    </div>
                    <div className="d-flex align-items-center">
                      {getPaymentIcon(paymentMethod)}
                      Payment: {paymentMethod}
                    </div>
                    {paymentMethod === 'Cash' && paymentDetails.receivedAmount && (
                      <div className="d-flex align-items-center">
                        <FaMoneyBillWave className="me-2" />
                        Received: ₹{parseFloat(paymentDetails.receivedAmount).toFixed(2)}
                      </div>
                    )}
                    {paymentMethod === 'Cash' && paymentDetails.change > 0 && (
                      <div className="d-flex align-items-center">
                        <FaExchangeAlt className="me-2" />
                        Change: ₹{paymentDetails.change.toFixed(2)}
                      </div>
                    )}
                    {roundOffEnabled && Math.abs(roundOff) > 0.01 && (
                      <div className="d-flex align-items-center">
                        <FaMoneyBillWave className="me-2" />
                        Round Off: {roundOff > 0 ? '+' : ''}₹{roundOff.toFixed(2)}
                      </div>
                    )}
                    <div className="fw-bold mt-1 d-flex align-items-center">
                      <FaMoneyBillWave className="me-2" />
                      Total Amount: ₹{finalTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* UPI QR Code */}
              {showQRCode && paymentMethod === 'UPI' && (
                <div className="col-md-4 text-center border-start">
                  <h6 className="mb-3">
                    <FaQrcode className="me-2" />
                    Scan to Pay
                  </h6>
                  <div className="bg-light p-3 rounded border  ">
                    <div className="bg-white p-2 d-inline-block">
                      <QRCode
                        value={generateUPILink(finalTotal)} 
                        size={120}
                        level="M"
                        includeMargin={true}
                      />
                    </div>
                    <div className="mt-2">
                      <small className="text-muted d-block">
                        Amount: <strong>₹{finalTotal.toFixed(2)}</strong>
                      </small>
                      <small className="text-muted d-block">
                        UPI ID: <code>{upiId}</code>
                      </small>
                      <small className="text-success">
                        Scan with any UPI app
                      </small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary d-flex align-items-center"
              onClick={() => {
                setCheckoutDialog(false);
                setShowQRCode(false);
              }}
            >
              <FaTimes className="me-1" />
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-success d-flex align-items-center"
              onClick={confirmCheckout}
            >
              <FaCheckCircle className="me-1" />
              Confirm Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutConfirmModal;