// components/MedicineCart.jsx
import { useState, useMemo } from 'react';
import { 
  FaShoppingCart, FaTrashAlt, FaTimes, FaMinus, FaPlus, 
  FaFileInvoiceDollar, FaMoneyBillWave, FaCreditCard,
  FaSave, FaKey, FaEdit, FaToggleOn, FaToggleOff,
  FaTag, FaCheckCircle, FaInfoCircle, FaTruck,
  FaTags, FaPrint, FaFilePdf, FaDownload, FaReceipt
} from 'react-icons/fa';
import { BiDownload, BiUpvote } from 'react-icons/bi';
import PrintCartModal from './PrintCartModal'; 

const MedicineCart = ({
  cart = [],
  currentDraftId,
  subtotal = 0,
  discount = 0,
  discountType = 'flat',
  discountValue = 0,
  deliveryCharge = 0,
  roundOffEnabled = true,
  roundOff = 0,
  roundedTotal = 0,
  paymentMethod = 'Cash',
  paymentMethods = ['Cash', 'Card', 'UPI', 'Gift Card'],
  paymentDetails = {},
  loading = false,
  customer,
  patients = [],

  // Functions
  removeFromCart,
  updateQty,
  clearCart,
  setShowDiscountEdit,
  setShowDeliveryChargeEdit,
  setRoundOffEnabled,
  setPaymentMethod,
  setShowDraftDialog,
  handleCheckout,
  getPaymentIcon,
  renderPaymentFields,
  renderCommonPaymentFields
}) => {
  
  // State for print modal
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Ensure cart is always an array
  const cartItems = Array.isArray(cart) ? cart : [];

  // Calculate discount for a single item
  const calculateItemDiscount = (item) => {
    if (!item || !item.discounts || !Array.isArray(item.discounts)) return 0;
    
    const quantity = item.qty || 0;
    const price = parseFloat(item.price) || 0;
    
    // Get applicable discounts
    const applicableDiscounts = item.discounts.filter(discount => 
      discount && 
      discount.quantity && 
      quantity >= discount.quantity
    );
    
    if (applicableDiscounts.length === 0) return 0;
    
    // Get the best discount (highest quantity threshold)
    const bestDiscount = applicableDiscounts.sort((a, b) => b.quantity - a.quantity)[0];
    
    if (bestDiscount.type === 'flat') {
      // Apply flat discount per set
      const discountMultiplier = Math.floor(quantity / bestDiscount.quantity);
      return bestDiscount.value * discountMultiplier;
    }
    
    if (bestDiscount.type === 'percent') {
      // Apply percent discount on total
      const total = price * quantity;
      return (total * bestDiscount.value) / 100;
    }
    
    return 0;
  };

  // Calculate total item-level discounts
  const calculateTotalItemDiscounts = () => {
    if (!cartItems.length) return 0;
    
    return cartItems.reduce((total, item) => {
      return total + calculateItemDiscount(item);
    }, 0);
  };

  // Calculate cart-level discount
  const calculateCartDiscount = (discountedSubtotal) => {
    if (!discountValue || discountValue <= 0) return 0;
    
    if (discountType === 'flat') {
      return Math.min(parseFloat(discountValue), discountedSubtotal);
    }
    
    if (discountType === 'percent') {
      return (discountedSubtotal * parseFloat(discountValue)) / 100;
    }
    
    return 0;
  };

  // Calculate all values in proper order using useMemo for optimization
  const {
    originalSubtotal,
    totalItemDiscounts,
    subtotalAfterItemDiscounts,
    cartDiscount,
    totalAfterCartDiscount,
    totalAfterDelivery,
    calculatedRoundOff,
    finalTotal
  } = useMemo(() => {
    // Original subtotal without any discounts
    const originalSubtotal = cartItems.reduce((total, item) => {
      const quantity = item?.qty || 0;
      const price = parseFloat(item?.price) || 0;
      return total + (price * quantity);
    }, 0);

    // Item-level discounts
    const totalItemDiscounts = calculateTotalItemDiscounts();
    const subtotalAfterItemDiscounts = originalSubtotal - totalItemDiscounts;

    // Cart-level discount
    const cartDiscount = calculateCartDiscount(subtotalAfterItemDiscounts);
    const totalAfterCartDiscount = subtotalAfterItemDiscounts - cartDiscount;

    // Delivery charge
    const delivery = parseFloat(deliveryCharge) || 0;
    const totalAfterDelivery = totalAfterCartDiscount + delivery;

    // Round off
    const calculatedRoundOff = roundOffEnabled ? Math.round(totalAfterDelivery) - totalAfterDelivery : 0;
    const finalTotal = totalAfterDelivery + calculatedRoundOff;

    return {
      originalSubtotal,
      totalItemDiscounts,
      subtotalAfterItemDiscounts,
      cartDiscount,
      totalAfterCartDiscount,
      delivery,
      totalAfterDelivery,
      calculatedRoundOff,
      finalTotal
    };
  }, [cartItems, discountType, discountValue, deliveryCharge, roundOffEnabled]);

  return (
    <>
      <div className="card shadow-sm border-0 h-100">
        <div className="card-header py-3 d-flex justify-content-between align-items-center bg-white" style={{ borderBottom: '1px solid #e5e7eb' }}>
          <h4 className="fw-bold d-flex align-items-center" style={{ color: '#2d3748' }}>
            {/* <FaShoppingCart className="me-2" /> */}
            Cart
            {cartItems.length > 0 && (
              <span className="badge bg-primary text-white rounded-pill ms-2 px-2 py-1" style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </span>
            )}
            {currentDraftId && (
              <span className="badge bg-warning text-dark ms-2">
                Draft
              </span>
            )}
          </h4>
          {cartItems.length > 0 && (
            <div className="d-flex align-items-center gap-2">
              {/* Print Button */}
              <button 
                className="btn btn-light-brand successAlertMessage d-flex align-items-center"
                onClick={() => setShowPrintModal(true)}
                title="Print cart/receipt"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                }}
              >
                <FaPrint className="me-2" style={{ fontSize: '14px' }} />
                Print
              </button>
              
              <button 
                className="btn btn-light-brand successAlertMessage d-flex align-items-center"
                onClick={clearCart}
                title="Clear entire cart"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                }}
              >
                <FaTrashAlt className="me-2" style={{ fontSize: '14px' }} />
                Clear All
              </button>
            </div>
          )}
        </div>
        
        <div className="card-body d-flex flex-column pt-3">
          {/* Cart Items as Cards */}
          <div className="flex-grow-1" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {cartItems.length === 0 ? (
              <div className="text-center text-muted mt-5 py-5">
                <FaShoppingCart className="display-4 d-block mb-3 mx-auto" />
                <p>Your cart is empty</p>
                <small>Add medicines from the list to get started</small>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <CartItemCard 
                  key={idx}
                  item={item}
                  index={idx}
                  onRemove={removeFromCart}
                  onUpdateQty={updateQty}
                  calculateItemDiscount={calculateItemDiscount}
                />
              ))
            )}
          </div>

          {/* Cart Summary */}
          <div className="border-top pt-3 mt-1">
            <CartSummary 
              originalSubtotal={originalSubtotal}
              totalItemDiscounts={totalItemDiscounts}
              subtotalAfterItemDiscounts={subtotalAfterItemDiscounts}
              cartDiscount={cartDiscount}
              discountType={discountType}
              discountValue={discountValue}
              deliveryCharge={deliveryCharge}
              totalAfterDelivery={totalAfterDelivery}
              roundOffEnabled={roundOffEnabled}
              roundOff={calculatedRoundOff}
              finalTotal={finalTotal}
              onEditDiscount={() => setShowDiscountEdit && setShowDiscountEdit(true)}
              onEditDeliveryCharge={() => setShowDeliveryChargeEdit && setShowDeliveryChargeEdit(true)}
              onToggleRoundOff={() => setRoundOffEnabled && setRoundOffEnabled(!roundOffEnabled)}
            />

            {/* Payment Method Selection */}
            <PaymentMethodSection 
              paymentMethod={paymentMethod}
              paymentMethods={paymentMethods}
              onPaymentMethodChange={setPaymentMethod}
              getPaymentIcon={getPaymentIcon}
            />

            {/* Payment Method Specific Fields */}
            {renderPaymentFields && renderPaymentFields(finalTotal)}
            
            {/* Common Payment Fields */}
            {renderCommonPaymentFields && renderCommonPaymentFields()}

            {/* Action Buttons */}
            <div className="row g-2 mt-3">
              <div className="col-6">
                <button
                  className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center"
                  onClick={() => setShowDraftDialog && setShowDraftDialog(true)}
                  disabled={cartItems.length === 0 || !customer}
                  style={{ height: '45px' }}
                >
                  <FaSave className="me-2" />
                  Save Draft
                </button>
              </div>
              <div className="col-6">
                <button
                  className="btn btn-success w-100 fw-bold d-flex align-items-center justify-content-center"
                  onClick={() => handleCheckout && handleCheckout(finalTotal)}
                  disabled={loading || cartItems.length === 0 || !customer}
                  style={{ 
                    height: '45px', 
                    fontSize: '1rem'
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                    <span style={{ fontSize: '14px' }}>
                      <FaCreditCard className="me-2" />
                      Checkout ₹{finalTotal.toFixed(2)}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Keyboard Shortcuts Info */}
            <div className="mt-2">
              <small className="text-muted">
                <FaKey className="me-1" />
                Shortcuts: Ctrl+S (Save Draft) • Ctrl+O (Open Drafts) • Ctrl+Enter (Checkout) • Ctrl+P (Print)
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Print Cart Modal */}
      <PrintCartModal
        showPrintModal={showPrintModal}
        setShowPrintModal={setShowPrintModal}
        cart={cartItems}
        subtotal={originalSubtotal}
        discount={cartDiscount}
        deliveryCharge={deliveryCharge}
        roundOff={calculatedRoundOff}
        roundedTotal={finalTotal}
        customer={customer}
        patients={patients}
        paymentMethod={paymentMethod}
        paymentDetails={paymentDetails}
      />
    </>
  );
};

// Cart Item Card Component
const CartItemCard = ({ item, index, onRemove, onUpdateQty, calculateItemDiscount }) => {
  const getApplicableDiscounts = (item) => {
    if (!item || !item.discounts || !Array.isArray(item.discounts)) return [];
    
    return item.discounts.filter(discount => 
      discount && 
      discount.quantity && 
      (item.qty || 0) >= discount.quantity
    );
  };

  const getBestDiscount = (item) => {
    const applicableDiscounts = getApplicableDiscounts(item);
    if (applicableDiscounts.length === 0) return null;
    
    return applicableDiscounts.sort((a, b) => b.quantity - a.quantity)[0];
  };

  const calculateFinalPrice = (item) => {
    const quantity = item.qty || 0;
    const price = parseFloat(item.price) || 0;
    const discountAmount = calculateItemDiscount ? calculateItemDiscount(item) : 0;
    
    return (price * quantity) - discountAmount;
  };

  const getDiscountMultiplier = (item) => {
    const bestDiscount = getBestDiscount(item);
    if (!bestDiscount) return 0;
    
    const quantity = item.qty || 0;
    const discountQuantity = bestDiscount.quantity || 1;
    return Math.floor(quantity / discountQuantity);
  };

  const applicableDiscounts = getApplicableDiscounts(item);
  const bestDiscount = getBestDiscount(item);
  const hasDiscounts = applicableDiscounts.length > 0;
  const discountAmount = calculateItemDiscount ? calculateItemDiscount(item) : 0;
  const finalPrice = calculateFinalPrice(item);
  const discountMultiplier = getDiscountMultiplier(item);

  return (
    <div className="card mb-3 border">
      <div className="card-body" style={{padding:  '10px 15px'}}>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="flex-grow-1">
            <h6 className="card-title mb-1 text-primary">{item?.medName || 'Unknown Item'}</h6>
            <p className="card-text mb-1 small text-muted">
              {item?.brand || 'No brand'} • <code>{item?.sku || 'No SKU'}</code>
              {item?.medicine_type && (
                <span className="ms-2">
                  {item.medicine_type}
                </span>
              )}
            </p>
            <p className="card-text mb-0">
              <strong className="text-success">₹{item?.price || '0.00'}</strong> each
            </p>
          </div>
          <button
            onClick={() => onRemove && onRemove(index)}
            className="btn btn-outline-danger rounded-circle p-0"
            style={{ width: '30px', height: '30px' }}
          >
            <FaTimes className="remove-icon" />
          </button>
        </div>
        
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <QuantityControl 
              quantity={item?.qty || 0}
              onDecrease={() => onUpdateQty && onUpdateQty(index, (item?.qty || 0) - 1)}
              onIncrease={() => {
                const currentQty = item?.qty || 0;
                const availableStock = item?.stock || 0;
                
                // Only increase if current quantity is less than available stock
                if (currentQty < availableStock) {
                  onUpdateQty && onUpdateQty(index, currentQty + 1);
                }
              }}
              variation={item?.variation}
            />

            {/* Discount Badge */}
            {item?.discounts?.length > 0 && (
              <div className="discount-badge">
                <span className="badge bg-success d-flex align-items-center">
                  <FaTag size={10} className="me-1" />
                  {(() => {
                    const showDiscount = bestDiscount || item.discounts[0];
                    return (
                      <>
                        Buy {showDiscount.quantity} get{' '}
                        {showDiscount.type === 'flat'
                          ? `₹${showDiscount.value} off`
                          : `${showDiscount.value}% off`
                        }
                      </>
                    );
                  })()}
                  {discountMultiplier > 1 && (
                    <span className="ms-1">×{discountMultiplier}</span>
                  )}
                </span>
              </div>
            )}
          </div>
          
          <div className="text-end">
            {hasDiscounts && discountMultiplier > 0 ? (
              <>
                <div className="d-flex align-items-center justify-content-end">
                  <span className="text-decoration-line-through text-muted me-2 small">
                    ₹{((item?.price || 0) * (item?.qty || 0)).toFixed(2)}
                  </span>
                  <strong className="text-success">
                    ₹{finalPrice.toFixed(2)}
                  </strong>
                </div>
                <small className="text-success">
                  Saved: ₹{discountAmount.toFixed(2)}
                </small>
              </>
            ) : (
              <>
                <strong className="text-primary d-block">
                  ₹{((item?.price || 0) * (item?.qty || 0)).toFixed(2)}
                </strong>
                <small className="text-muted">
                  Regular price
                </small>
              </>
            )}
          </div>
        </div>
        {/* Stock Limit Warning */}
        {item?.variation?.stock > 0 && item?.qty >= item.variation.stock && (
          <div className="mt-2 p-2 rounded" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeaa7' }}>
            <div className="small text-warning d-flex align-items-center">
              <FaInfoCircle className="me-1" size={12} />
              <strong>Stock Limit Reached!</strong> 
              <span className="ms-1">
                Only {item.variation.stock} {item.variation.unit || 'unit'}(s) available.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Quantity Control Component with Stock Limit
const QuantityControl = ({ 
  quantity = 0, 
  onDecrease, 
  onIncrease, 
  variation 
}) => {
  const maxQuantity = variation?.stock || 0;
  const unit = variation?.unit || 'unit';
  const canIncrease = maxQuantity === 0 || quantity < maxQuantity;
  
  return (
    <div 
      className="d-flex align-items-center justify-content-center rounded-pill"
      style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        width: '100px',
        height: '34px'
      }}
    >
      <button
        className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-0"
        style={{
          width: '22px',
          height: '22px',
        }}
        onClick={onDecrease}
        disabled={quantity <= 1}
      >
        <FaMinus size={10} />
      </button>
      
      <span 
        className="mx-2 fw-semibold"
        style={{ minWidth: '22px', textAlign: 'center', fontSize: '13px' }}
      >
        {quantity}
        {maxQuantity > 0 && (
          <small 
            className="d-block text-muted" 
            style={{ fontSize: '8px', lineHeight: '1' }}
          >
            /{maxQuantity}
          </small>
        )}
      </span>
      
      <button
        className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-0"
        style={{
          width: '22px',
          height: '22px',
        }}
        onClick={onIncrease}
        disabled={!canIncrease}
        title={!canIncrease ? `Only ${maxQuantity} ${unit}(s) available in stock` : ''}
      >
        <FaPlus size={10} />
      </button>
    </div>
  );
};

// Updated Cart Summary Component with Delivery Charge
const CartSummary = ({
  originalSubtotal = 0,
  totalItemDiscounts = 0,
  subtotalAfterItemDiscounts = 0,
  cartDiscount = 0,
  discountType = 'flat',
  discountValue = 0,
  deliveryCharge = 0,
  totalAfterDelivery = 0,
  roundOffEnabled = true,
  roundOff = 0,
  finalTotal = 0,
  onEditDiscount,
  onEditDeliveryCharge,
  onToggleRoundOff
}) => {
  return (
    <div className="mb-2">
      {/* Original Subtotal */}
      <div className="row g-2 mb-1">
        <div className="col-8 text-muted d-flex align-items-center">
          Original Subtotal:
        </div>
        <div className="col-4 text-end">₹{originalSubtotal.toFixed(2)}</div>
      </div>
      {/* Subtotal after item discounts */}
      <div className="row g-2 mb-2 pb-1 border-bottom">
        <div className="col-8 text-muted d-flex align-items-center fw-semibold">
          Subtotal after quantity discounts:
        </div>
        <div className="col-4 text-end fw-bold text-primary">
          ₹{subtotalAfterItemDiscounts.toFixed(2)}
        </div>
      </div>

      {/* Cart-level Discount */}
      <div className="row g-2 mb-1">
        <div className="col-8 text-muted d-flex align-items-center">
          <FaTags className="me-1 text-warning" />
          Cart Discount:
          <button
            className="btn btn-outline-primary btn-sm ms-2 d-flex align-items-center"
            onClick={onEditDiscount}
            style={{ padding: '2px 6px', fontSize: '0.7rem' }}
            title="Edit cart discount"
          >
            <FaEdit size={10} />
          </button>
        </div>
        <div className="col-4 text-end text-danger">
          {cartDiscount > 0 ? `-₹${cartDiscount.toFixed(2)}` : '-₹0.00'}
        </div>
      </div>

      {/* Delivery Charge */}
      <div className="row g-2 mb-1">
        <div className="col-8 text-muted d-flex align-items-center">
          <FaTruck className="me-1 text-secondary" />
          Delivery Charge:
          <button
            className="btn btn-outline-primary btn-sm ms-2 d-flex align-items-center"
            onClick={onEditDeliveryCharge}
            style={{ padding: '2px 6px', fontSize: '0.7rem' }}
            title="Edit delivery charge"
          >
            <FaEdit size={10} />
          </button>
        </div>
        <div className="col-4 text-end text-dark">
          +₹{deliveryCharge}
        </div>
      </div>

      {/* Round Off */}
      <div className="row g-2 pb-1 border-bottom">
        <div className="col-8 text-muted d-flex align-items-center">
          <FaMoneyBillWave className="me-1 text-info" />
          Round Off:
          <button
            className="btn btn-link p-0 ms-2"
            onClick={onToggleRoundOff}
            title={roundOffEnabled ? "Disable round off" : "Enable round off"}
          >
            {roundOffEnabled ? (
              <FaToggleOn className="text-success" size={20} />
            ) : (
              <FaToggleOff className="text-muted" size={20} />
            )}
          </button>
        </div>
        <div className={`col-4 text-end ${roundOff > 0 ? 'text-success' : roundOff < 0 ? 'text-danger' : 'text-muted'}`}>
          {roundOff > 0 ? '+' : ''}₹{roundOff.toFixed(2)}
        </div>
      </div>

      {/* Final Total */}
      <div className="row g-1 border-bottom">
        <div className="col-8 text-dark d-flex align-items-center fw-bold fs-6">
          <BiUpvote className="me-1 text-success" />
          Total Amount:
        </div>
        <div className="col-4 text-end fw-bold fs-4 text-success">
          ₹{finalTotal.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

// Payment Method Section Component
const PaymentMethodSection = ({ paymentMethod, paymentMethods = [], onPaymentMethodChange, getPaymentIcon }) => (
  <div className="mb-3">
    <label className="form-label small fw-bold mb-2 d-flex align-items-center">
      <FaCreditCard className="me-1 text-primary" />
      Payment Method
    </label>
    <div className="row g-2">
      {paymentMethods.map(method => (
        <div key={method} className="col-3">
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="paymentMethod"
              id={`payment-${method}`}
              value={method}
              checked={paymentMethod === method}
              onChange={(e) => onPaymentMethodChange && onPaymentMethodChange(e.target.value)}
            />
            <label 
              className="form-check-label d-flex align-items-center small fw-bold" 
              htmlFor={`payment-${method}`}
            >
              {getPaymentIcon && getPaymentIcon(method)}
              {method}
            </label>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default MedicineCart;