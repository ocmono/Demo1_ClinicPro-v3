// components/MedicineTable.jsx
import { FaCartPlus, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const MedicineTable = ({
  paginated = [],
  sortConfig,
  onSort,
  getSortIcon,
  onAddToCart
}) => {
  // Ensure paginated is always an array
  const medicines = Array.isArray(paginated) ? paginated : [];

  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped align-middle">
        <thead className="table-light">
          <tr>
            <th width="3%">
              <SortableHeader 
                label="ID"
                sortKey="id"
                sortConfig={sortConfig}
                onSort={onSort}
                getSortIcon={getSortIcon}
              />
            </th>
            <th width="20%">
              <SortableHeader 
                label="Medicine"
                sortKey="name"
                sortConfig={sortConfig}
                onSort={onSort}
                getSortIcon={getSortIcon}
              />
            </th>
            <th width="20%">
              <SortableHeader 
                label="Brand"
                sortKey="brand"
                sortConfig={sortConfig}
                onSort={onSort}
                getSortIcon={getSortIcon}
              />
            </th>
            <th width="20%">SKU</th>
            <th width="10%">
              <SortableHeader 
                label="Price"
                sortKey="price"
                sortConfig={sortConfig}
                onSort={onSort}
                getSortIcon={getSortIcon}
              />
            </th>
            <th width="9%">
              <SortableHeader 
                label="Stock"
                sortKey="stock"
                sortConfig={sortConfig}
                onSort={onSort}
                getSortIcon={getSortIcon}
              />
            </th>
            <th width="8%">Status</th>
            <th width="10%">Action</th>
          </tr>
        </thead>
        <tbody>
          {medicines.map(medicine => 
            medicine.variations?.map((variation, idx) => (
              <MedicineTableRow 
                key={`${medicine.id}-${idx}`}
                medicine={medicine}
                variation={variation}
                variationIndex={idx}
                onAddToCart={onAddToCart}
              />
            ))
          )}
          
          {medicines.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center py-4">
                <div className="text-muted">
                  <FaSort className="display-4 d-block mb-2 mx-auto" />
                  No medicines found matching your search
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Sortable Header Component
const SortableHeader = ({ label, sortKey, sortConfig, onSort, getSortIcon }) => (
  <div 
    className="d-flex align-items-center cursor-pointer"
    onClick={() => onSort(sortKey)}
    style={{ cursor: 'pointer' }}
  >
    {label}
    <span className="ms-1">
      {getSortIcon ? getSortIcon(sortKey) : <FaSort className="text-muted" />}
    </span>
  </div>
);

// Medicine Table Row Component
const MedicineTableRow = ({ medicine, variation, variationIndex, onAddToCart }) => (
  <tr className={Number(variation?.stock || 0) <= 0 ? 'table-danger' : ''}>
    <td>
      <small className="text-muted">#{medicine?.id || 'N/A'}</small>
    </td>
    <td>
      <div>
        <strong>{medicine?.name || 'Unknown Medicine'}</strong>
        {medicine?.medicine_type && (
          <small className="d-block text-muted">
            {medicine.medicine_type}
          </small>
        )}
      </div>
    </td>
    <td>{medicine?.brand || 'No brand'}</td>
    <td>
      <code className="text-primary">{variation?.sku || 'No SKU'}</code>
    </td>
    <td>
      <span className="fw-bold text-success">₹{variation?.price || '0.00'}</span>
    </td>
    <td>
      <StockBadge stock={variation?.stock} unit={variation?.unit} />
    </td>
    <td>
      <StatusBadge status={variation?.status} />
    </td>
    <td>
      <button
        className="btn btn-primary btn-sm d-flex align-items-center"
        onClick={() => onAddToCart(medicine, variationIndex)}
        disabled={Number(variation?.stock || 0) <= 0}
        title="Add to cart"
      >
        <FaCartPlus className="me-1" />
        Add
      </button>
    </td>
  </tr>
);

// Stock Badge Component
const StockBadge = ({ stock, unit }) => {
  const stockNumber = Number(stock || 0);
  return (
    <span className={`badge ${
      stockNumber > 10 ? 'bg-success' : 
      stockNumber > 0 ? 'bg-warning' : 'bg-danger'
    }`}>
      {stockNumber} {unit || 'units'}
    </span>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => (
  <span className={`badge ${status ? 'bg-success' : 'bg-secondary'}`}>
    {status ? 'Active' : 'Inactive'}
  </span>
);

export default MedicineTable;