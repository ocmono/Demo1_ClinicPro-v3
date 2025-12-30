import { useState } from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import CardHeader from '@/components/shared/CardHeader';
import CardLoader from '@/components/shared/CardLoader';
import useCardTitleActions from '@/hooks/useCardTitleActions';
import { toast } from 'react-toastify';

const EditMedicine = () => {
  const [medicines, setMedicines] = useState([
    {
      id: 1,
      name: 'Paracetamol',
      brand: 'ABC Pharmaceuticals',
      variations: [
        { sku: 'P001', quantity: 10, unit: 'Pcs', price: 10 },
        { sku: 'P002', quantity: 20, unit: 'Pcs', price: 20 },
      ],
    },
    {
      id: 2,
      name: 'Ibuprofen',
      brand: 'XYZ Pharmaceuticals',
      variations: [
        { sku: 'I001', quantity: 5, unit: 'Pcs', price: 5 },
        { sku: 'I002', quantity: 10, unit: 'Pcs', price: 10 },
      ],
    },
  ]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const {
    refreshKey,
    isRemoved,
    isExpanded,
    handleRefresh,
    handleExpand,
    handleDelete
  } = useCardTitleActions();

  if (isRemoved) return null;

  const handleSelect = (index) => {
    setSelectedIndex(index);
    setEditForm({ ...medicines[index] });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleVariationChange = (vIdx, field, value) => {
    const updated = [...editForm.variations];
    updated[vIdx][field] = value;
    setEditForm(prev => ({ ...prev, variations: updated }));
  };

  const handleSave = () => {
    if (!editForm.name || !editForm.brand) {
      toast.error('Please fill in Medicine Name and Brand');
      return;
    }
    // In a real application, you would update the medicines state here
    // For now, we'll just toast success
    toast.success('Medicine updated!');
    setSelectedIndex(null);
    setEditForm(null);
  };

  const handleCancel = () => {
    setSelectedIndex(null);
    setEditForm(null);
  };

  return (
    <>
      <PageHeader />
      <div className="main-content">
        <div className="row">
          <div className="col-12">
            <div className={`card stretch stretch-full ${isExpanded ? 'card-expand' : ''} ${refreshKey ? 'card-loading' : ''}`}>
              <CardHeader title="Edit Medicine" />
              <div className="card-body">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Brand</th>
                      <th>Variations</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(medicines) && medicines.length > 0 ? (
                      medicines.map((medicine, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{medicine.name}</td>
                          <td>{medicine.brand}</td>
                          <td>
                            {Array.isArray(medicine.variations) && medicine.variations.length > 0 ? (
                              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                {medicine.variations.map((v, vIdx) => (
                                  <li key={vIdx}>
                                    SKU: {v.sku}, Qty: {v.quantity}{v.unit ? ` (${v.unit})` : ''}, Price: {v.price}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <i>No variations</i>
                            )}
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleSelect(idx)}>Edit</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center">No medicines found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {editForm && (
                  <div className="mt-4">
                    <h5>Edit Form</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Medicine Name</label>
                          <input type="text" name="name" value={editForm.name} onChange={handleChange} className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Brand</label>
                          <input type="text" name="brand" value={editForm.brand} onChange={handleChange} className="form-control" />
                        </div>
                      </div>
                    </div>
                    <div className="row mt-3">
                      <div className="col-12">
                        <label>Variations</label>
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              <th>SKU</th>
                              <th>Quantity</th>
                              <th>Unit</th>
                              <th>Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {editForm.variations.map((variation, vIdx) => (
                              <tr key={vIdx}>
                                <td>
                                  <input type="text" value={variation.sku} onChange={e => handleVariationChange(vIdx, 'sku', e.target.value)} className="form-control" />
                                </td>
                                <td>
                                  <input type="number" value={variation.quantity} onChange={e => handleVariationChange(vIdx, 'quantity', e.target.value)} className="form-control" />
                                </td>
                                <td>
                                  <input type="text" value={variation.unit} onChange={e => handleVariationChange(vIdx, 'unit', e.target.value)} className="form-control" />
                                </td>
                                <td>
                                  <input type="number" value={variation.price} onChange={e => handleVariationChange(vIdx, 'price', e.target.value)} className="form-control" />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <button className="btn btn-success me-2" onClick={handleSave}>Save</button>
                    <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                  </div>
                )}
              </div>
              <CardLoader refreshKey={refreshKey} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditMedicine; 