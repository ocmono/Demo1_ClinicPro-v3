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
      <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
        <thead style={{ backgroundColor: '#fafbfc' }}>
          <tr>
            <th width="3%" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', padding: '10px 15px', borderBottom: '1px solid #e9ecef' }}>
              <SortableHeader 
                label="ID"
                sortKey="id"
                sortConfig={sortConfig}
                onSort={onSort}
                getSortIcon={getSortIcon}
              />
            </th>
            <th width="20%" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', padding: '10px 15px', borderBottom: '1px solid #e9ecef' }}>
              <SortableHeader 
                label="Medicine"
                sortKey="name"
                sortConfig={sortConfig}
                onSort={onSort}
                getSortIcon={getSortIcon}
              />
            </th>
            <th width="20%" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', padding: '10px 15px', borderBottom: '1px solid #e9ecef' }}>
              <SortableHeader 
                label="Brand"
                sortKey="brand"
                sortConfig={sortConfig}
                onSort={onSort}
                getSortIcon={getSortIcon}
              />
            </th>
            <th width="20%" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', padding: '10px 15px', borderBottom: '1px solid #e9ecef' }}>SKU</th>
            <th width="10%" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', padding: '10px 15px', borderBottom: '1px solid #e9ecef' }}>
              <SortableHeader 
                label="Price"
                sortKey="price"
                sortConfig={sortConfig}
                onSort={onSort}
                getSortIcon={getSortIcon}
              />
            </th>
            <th width="9%" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', padding: '10px 15px', borderBottom: '1px solid #e9ecef' }}>
              <SortableHeader 
                label="Stock"
                sortKey="stock"
                sortConfig={sortConfig}
                onSort={onSort}
                getSortIcon={getSortIcon}
              />
            </th>
            <th width="8%" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', padding: '10px 15px', borderBottom: '1px solid #e9ecef' }}>Status</th>
            <th width="10%" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', padding: '10px 15px', borderBottom: '1px solid #e9ecef' }}>Action</th>
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
                <div className="text-muted" style={{ fontSize: '13px' }}>
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
    style={{ cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
  >
    {label}
    <span className="ms-1" style={{ fontSize: '10px' }}>
      {getSortIcon ? getSortIcon(sortKey) : <FaSort className="text-muted" />}
    </span>
  </div>
);

// Medicine Table Row Component
const MedicineTableRow = ({ medicine, variation, variationIndex, onAddToCart }) => (
  <tr 
    className={Number(variation?.stock || 0) <= 0 ? 'table-danger' : ''}
    style={{ 
      borderBottom: '1px solid #f0f0f0',
      fontSize: '13px'
    }}
  >
    <td style={{ padding: '12px 15px' }}>
      <small className="text-muted" style={{ fontSize: '12px' }}>#{medicine?.id || 'N/A'}</small>
    </td>
    <td style={{ padding: '12px 15px' }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#2d3748' }}>
          {medicine?.name || 'Unknown Medicine'}
        </div>
        {medicine?.medicine_type && (
          <small className="d-block text-muted" style={{ fontSize: '11px', marginTop: '2px' }}>
            {medicine.medicine_type}
          </small>
        )}
      </div>
    </td>
    <td style={{ padding: '12px 15px', fontSize: '13px', color: '#4a5568' }}>
      {medicine?.brand || 'No brand'}
    </td>
    <td style={{ padding: '12px 15px' }}>
      <code className="text-primary" style={{ fontSize: '12px', backgroundColor: 'transparent', padding: 0, color: '#3182ce' }}>
        {variation?.sku || 'No SKU'}
      </code>
    </td>
    <td style={{ padding: '12px 15px' }}>
      <span className="fw-bold text-success" style={{ fontSize: '13px', fontWeight: '600' }}>
        ₹{variation?.price || '0.00'}
      </span>
    </td>
    <td style={{ padding: '12px 15px' }}>
      <StockBadge stock={variation?.stock}  />
    </td>
    <td style={{ padding: '12px 15px' }}>
      <StatusBadge status={variation?.status} />
    </td>
    <td style={{ padding: '12px 15px' }}>
      <button
        className="btn btn-light btn-sm d-flex align-items-center"
        onClick={() => onAddToCart(medicine, variationIndex)}
        disabled={Number(variation?.stock || 0) <= 0}
        title="Add to cart"
        style={{ fontSize: '12px', padding: '4px 10px' }}
      >
        <FaCartPlus className="me-1" style={{ fontSize: '11px' }} />
        Add
      </button>
    </td>
  </tr>
);

// Stock Badge Component
const StockBadge = ({ stock, unit }) => {
  const stockNumber = Number(stock || 0);
  const getBadgeStyle = () => {
    if (stockNumber > 10) return { color: '#065f46', border: 'none' };
    if (stockNumber > 0) return { backgroundColor: '#fef3c7', color: '#92400e', border: 'none' };
    return { backgroundColor: '#fee2e2', color: '#991b1b', border: 'none' };
  };
  
  return (
    <span 
      className="badge" 
      style={{ 
        ...getBadgeStyle(),
        fontSize: '11px',
        padding: '4px 8px',
        fontWeight: '500',
        borderRadius: '4px'
      }}
    >
      {stockNumber}
    </span>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const badgeStyle = status 
    ? { backgroundColor: '#d1fae5', color: '#065f46' }
    : { backgroundColor: '#e5e7eb', color: '#4b5563' };
  
  return (
    <span 
      className="badge" 
      style={{ 
        ...badgeStyle,
        fontSize: '11px',
        padding: '4px 8px',
        fontWeight: '500',
        borderRadius: '4px',
        border: 'none'
      }}
    >
      {status ? 'Active' : 'Inactive'}
    </span>
  );
};

export default MedicineTable;