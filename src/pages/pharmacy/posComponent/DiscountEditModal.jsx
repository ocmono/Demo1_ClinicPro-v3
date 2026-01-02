// components/DiscountEditModal.jsx
import { FaEdit, FaTimes, FaPercentage, FaRupeeSign } from 'react-icons/fa';

const DiscountEditModal = ({
  showDiscountEdit,
  setShowDiscountEdit,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  applyCartDiscount // New prop to apply the discount
}) => {
  if (!showDiscountEdit) return null;

  const handleApply = () => {
    // Validate discount value
    if (discountValue && parseFloat(discountValue) > 0) {
      applyCartDiscount && applyCartDiscount({
        type: discountType,
        value: parseFloat(discountValue)
      });
    }
    setShowDiscountEdit(false);
  };

  const handleCancel = () => {
    setShowDiscountEdit(false);
    // Optional: Reset values on cancel
    // setDiscountType('flat');
    // setDiscountValue('');
  };

  return (
    <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content">
          <div className="modal-header d-flex justify-content-between align-items-center bg-white" style={{ borderBottom: '1px solid #e5e7eb' }}>
            <h4 className="fw-bold d-flex align-items-center mb-0" style={{ color: '#2d3748' }}>
              <FaEdit className="me-2" />
              Edit Cart Discount
            </h4>
            <button 
              type="button" 
              className="btn-close"
              onClick={handleCancel}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label small fw-bold mb-2 d-flex align-items-center">
                Discount Type
              </label>
              <div className="btn-group w-100" role="group">
                <button
                  type="button"
                  className={`btn btn-sm ${discountType === 'flat' ? 'btn-primary' : 'btn-outline-primary'} d-flex align-items-center justify-content-center`}
                  onClick={() => setDiscountType('flat')}
                >
                  <FaRupeeSign className="me-1" size={12} />
                  Flat
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${discountType === 'percent' ? 'btn-primary' : 'btn-outline-primary'} d-flex align-items-center justify-content-center`}
                  onClick={() => setDiscountType('percent')}
                >
                  <FaPercentage className="me-1" size={12} />
                  Percent
                </button>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold mb-2 d-flex align-items-center">
                Discount Value
                {discountType === 'percent' && (
                  <span className="badge bg-warning text-dark ms-1">
                    Max 100%
                  </span>
                )}
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text">
                  {discountType === 'flat' ? <FaRupeeSign /> : <FaPercentage />}
                </span>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  max={discountType === 'percent' ? '100' : undefined}
                  step={discountType === 'percent' ? '1' : '0.01'}
                  value={discountValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (discountType === 'percent') {
                      // Ensure percentage doesn't exceed 100
                      if (parseFloat(value) <= 100) {
                        setDiscountValue(value);
                      }
                    } else {
                      setDiscountValue(value);
                    }
                  }}
                  placeholder={discountType === 'percent' ? '0-100' : '0.00'}
                />
              </div>
              {discountType === 'percent' && discountValue > 0 && (
                <div className="form-text text-info">
                  This will apply {discountValue}% discount on the total after quantity discounts
                </div>
              )}
              {discountType === 'flat' && discountValue > 0 && (
                <div className="form-text text-info">
                  This will deduct ₹{discountValue} from the total after quantity discounts
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary btn-sm"
              onClick={handleApply}
              disabled={!discountValue || parseFloat(discountValue) <= 0}
            >
              Apply Discount
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountEditModal;