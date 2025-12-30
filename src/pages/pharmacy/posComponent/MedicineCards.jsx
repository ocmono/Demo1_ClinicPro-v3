// components/MedicineCards.jsx
import { FaCartPlus, FaSearch } from 'react-icons/fa';

const MedicineCards = ({ paginated = [], onAddToCart }) => {
  // Ensure paginated is always an array
  const medicines = Array.isArray(paginated) ? paginated : [];

  return (
    <div className="row g-3">
      {medicines.map(medicine =>
        medicine.variations?.map((variation, idx) => (
          <MedicineCard 
            key={`${medicine.id}-${idx}`}
            medicine={medicine}
            variation={variation}
            variationIndex={idx}
            onAddToCart={onAddToCart}
          />
        ))
      )}

      {medicines.length === 0 && (
        <div className="col-12 text-center py-5">
          <div className="text-muted">
            <FaSearch className="display-4 d-block mb-2 mx-auto" />
            No medicines found matching your search
          </div>
        </div>
      )}
    </div>
  );
};

// Medicine Card Component
const MedicineCard = ({ medicine, variation, variationIndex, onAddToCart }) => (
  <div className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex">
    <div
      className={`flex-fill shadow-sm ${
        Number(variation?.stock || 0) <= 0 ? "border-danger" : "border-light"
      }`}
    >
      <div className="card-body d-flex flex-column">
        {/* Header */}
        <div className="d-flex justify-content-between mb-2">
          <h6 className="card-title text-primary mb-0">{medicine?.name || 'Unknown Medicine'}</h6>
          <StockBadge stock={variation?.stock} />
        </div>

        {/* Brand + Type */}
        <p className="card-text small text-muted mb-1">
          {medicine?.brand || 'No brand'}
          {medicine?.medicine_type && (
            <span className="ms-1 badge bg-light text-dark">
              {medicine.medicine_type}
            </span>
          )}
        </p>

        {/* SKU */}
        <p className="card-text small mb-1">
          <code className="text-primary">{variation?.sku || 'No SKU'}</code>
        </p>

        {/* Price and Add to Cart */}
        <div className="mt-auto d-flex justify-content-between align-items-center pt-2">
          <span className="fw-bold text-success">₹{variation?.price || '0.00'}</span>
          <button
            className="btn btn-primary btn-sm d-flex align-items-center"
            onClick={() => onAddToCart(medicine, variationIndex)}
            disabled={Number(variation?.stock || 0) <= 0}
          >
            <FaCartPlus className="me-1" />
            Add
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Stock Badge Component for Cards
const StockBadge = ({ stock }) => {
  const stockNumber = Number(stock || 0);
  return (
    <span
      className={`badge ${
        stockNumber > 10
          ? "bg-success"
          : stockNumber > 0
          ? "bg-warning"
          : "bg-danger"
      }`}
    >
      {stockNumber}
    </span>
  );
};

export default MedicineCards;