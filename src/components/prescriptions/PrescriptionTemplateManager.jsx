import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../../contentApi/AuthContext';
import { toast } from 'react-toastify';

const getUserTemplateKey = (userId) => `prescriptionTemplates_${userId}`;

const defaultTemplate = {
  name: '',
  symptoms: '',
  diagnosis: '',
  followUpDate: '',
  medicines: [
    { medicine: null, notes: '', medicine_timing: '' }
  ]
};

const PrescriptionTemplateManager = ({ isOpen, onClose, onSelectTemplate }) => {
  const { user } = useAuth();
  const userId = user?.id || user?.email || 'default';
  const storageKey = getUserTemplateKey(userId);

  const [templates, setTemplates] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState(defaultTemplate);
  const [showForm, setShowForm] = useState(false);

  // Load templates from localStorage
  useEffect(() => {
    if (!isOpen) return;
    const stored = localStorage.getItem(storageKey);
    setTemplates(stored ? JSON.parse(stored) : []);
  }, [isOpen, storageKey]);

  // Save templates to localStorage
  const saveTemplates = (newTemplates) => {
    setTemplates(newTemplates);
    localStorage.setItem(storageKey, JSON.stringify(newTemplates));
  };

  const handleAdd = () => {
    setForm(defaultTemplate);
    setEditingIndex(null);
    setShowForm(true);
  };

  const handleEdit = (idx) => {
    setForm(templates[idx]);
    setEditingIndex(idx);
    setShowForm(true);
  };

  const handleDelete = (idx) => {
    if (window.confirm('Delete this template?')) {
      const newTemplates = templates.filter((_, i) => i !== idx);
      saveTemplates(newTemplates);
      toast.success('Template deleted');
    }
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMedicineChange = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      medicines: prev.medicines.map((m, i) => i === idx ? { ...m, [field]: value } : m)
    }));
  };

  const handleAddMedicine = () => {
    setForm((prev) => ({
      ...prev,
      medicines: [...prev.medicines, { medicine: null, notes: '', medicine_timing: '' }]
    }));
  };

  const handleRemoveMedicine = (idx) => {
    setForm((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== idx)
    }));
  };

  const handleSaveForm = () => {
    if (!form.name.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (!form.diagnosis.trim()) {
      toast.error('Diagnosis is required');
      return;
    }
    let newTemplates;
    if (editingIndex !== null) {
      newTemplates = templates.map((t, i) => i === editingIndex ? form : t);
      toast.success('Template updated');
    } else {
      newTemplates = [...templates, form];
      toast.success('Template added');
    }
    saveTemplates(newTemplates);
    setShowForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }}>
      <div className="modal-content card" style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 500, maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Prescription Templates</h4>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}><FiX /></button>
        </div>
        {!showForm && (
          <>
            <button className="btn btn-primary mb-3" onClick={handleAdd}><FiPlus className="me-1" />Add Template</button>
            <ul className="list-group mb-3">
              {templates.length === 0 && <li className="list-group-item text-muted">No templates yet.</li>}
              {templates.map((tpl, idx) => (
                <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{tpl.name}</strong> <span className="text-muted">({tpl.diagnosis})</span>
                  </div>
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-primary" onClick={() => onSelectTemplate && onSelectTemplate(tpl)} title="Use Template"><FiSave /></button>
                    <button className="btn btn-outline-secondary" onClick={() => handleEdit(idx)} title="Edit"><FiEdit2 /></button>
                    <button className="btn btn-outline-danger" onClick={() => handleDelete(idx)} title="Delete"><FiTrash2 /></button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
        {showForm && (
          <div>
            <div className="mb-3">
              <label className="form-label">Template Name *</label>
              <input type="text" className="form-control" value={form.name} onChange={e => handleFormChange('name', e.target.value)} placeholder="e.g. Diabetes Followup" />
            </div>
            <div className="mb-3">
              <label className="form-label">Symptoms</label>
              <input type="text" className="form-control" value={form.symptoms} onChange={e => handleFormChange('symptoms', e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Diagnosis *</label>
              <input type="text" className="form-control" value={form.diagnosis} onChange={e => handleFormChange('diagnosis', e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Follow Up Date</label>
              <input type="date" className="form-control" value={form.followUpDate} onChange={e => handleFormChange('followUpDate', e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Medicines</label>
              {form.medicines.map((med, idx) => (
                <div key={idx} className="d-flex gap-2 mb-2 align-items-center">
                  <input type="text" className="form-control" style={{ maxWidth: 160 }} placeholder="Medicine Name" value={med.medicine || ''} onChange={e => handleMedicineChange(idx, 'medicine', e.target.value)} />
                  <input type="text" className="form-control" style={{ maxWidth: 120 }} placeholder="Timing (e.g. 1-0-1)" value={med.medicine_timing || ''} onChange={e => handleMedicineChange(idx, 'medicine_timing', e.target.value)} />
                  <input type="text" className="form-control" style={{ maxWidth: 120 }} placeholder="Notes" value={med.notes || ''} onChange={e => handleMedicineChange(idx, 'notes', e.target.value)} />
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveMedicine(idx)}><FiMinus /></button>
                </div>
              ))}
              <button className="btn btn-outline-primary btn-sm mt-2" onClick={handleAddMedicine}><FiPlus /> Add Medicine</button>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveForm}>{editingIndex !== null ? 'Update' : 'Add'} Template</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionTemplateManager; 