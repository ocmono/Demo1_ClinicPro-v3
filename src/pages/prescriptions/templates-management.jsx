import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import PageHeaderDate from '@/components/shared/pageHeader/PageHeaderDate';
import Footer from '@/components/shared/Footer';
import { useMedicines } from '../../context/MedicinesContext';
import { usePrescription } from '../../contentApi/PrescriptionProvider';
import { FiEdit } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { FiEye } from "react-icons/fi";

const normalizeTemplate = (t, medicinesList = []) => {
  return {
    id: t.id,
    label: t.template_name,
    value: t.template_value,
    data: {
      diagnosis: t.diagnosis || "",
      symptoms: t.symptoms || "",
      instructions: t.instructions || "",
      medicines: (t.medicines || []).map(m => {
        const matchedMed = medicinesList.find(x => x.id === m.product_id) || null;

        return {
          medicine: matchedMed || { id: m.product_id, name: "Unknown" },
          dose: m.dose || "0-0-0",
          when: m.when || "",
          frequency: m.frequency || "",
          duration: m.duration || "",
          notes: m.notes || "",
          sku: matchedMed?.variations?.[0]?.sku || ""
        };
      })
    },
    isCustom: true
  };
};


const TemplatesManagement = () => {
  const { templates, fetchTemplates, createTemplate, updateTemplate, deleteTemplate } = usePrescription();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  const [createMode, setCreateMode] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    label: '',
    value: '',
    data: {
      symptoms: '',
      diagnosis: '',
      followUpDate: '',
      instructions: '',
      medicines: []
    }
  });

  // Get medicines from context
  const { medicines, fetchMedicines } = useMedicines();
  console.log("Medicines from context:", medicines)

  useEffect(() => {
    fetchTemplates();
    fetchMedicines();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteTemplate(id);
      toast.success("Template deleted successfully!");
    } catch (error) {
      console.error("Error deleting template:", error);
      // toast.error("Failed to delete template.");
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(templates, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom-prescription-templates.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        if (!Array.isArray(imported)) throw new Error('Invalid format');
        for (const template of imported) {
          await createTemplate(template);
        }
        toast.success('Templates imported successfully!');
        fetchTemplates();
      } catch {
        console.error('Import failed:', error);
        toast.error('Import failed. Invalid file.');
      }
    };
    reader.readAsText(file);
  };

  const handleEdit = (template) => {
    setEditMode(true);
    setEditData({ ...template });
  };

  const handleEditSave = async () => {
    if (!editData?.label || !editData?.value) {
      toast.error("Template name and value are required.");
      return;
    }

    try {
      const payload = {
        template_name: editData.label,
        template_value: editData.value,
        diagnosis: editData.data.diagnosis,
        instructions: editData.data.instructions,
        symptoms: editData.data.symptoms,
        medicines: editData.data.medicines.map((m) => ({
          product_id: m.medicine?.id,
          dose: m.dose || "0-0-0",
          when: m.when || null,
          frequency: m.frequency || null,
          duration: m.duration || null,
          notes: m.notes || "",
        })),
      };

      await updateTemplate(editData.id, payload);
      setEditMode(null);
      setEditData(null);
      toast.success("Template updated successfully!");
      fetchTemplates();
    } catch (error) {
      console.error("Error updating template:", error);
      // toast.error("Failed to update template.");
    }
  };

  const handleCreate = () => {
    setCreateMode(true);
    setNewTemplate({
      label: '',
      value: '',
      data: {
        symptoms: '',
        diagnosis: '',
        followUpDate: '',
        instructions: '',
        medicines: []
      }
    });
  };

  const handleCreateSave = async () => {
    if (!newTemplate.label.trim() || !newTemplate.value.trim()) {
      toast.error('Template name and value are required.');
      return;
    }

    try {
      const payload = {
        template_name: newTemplate.label,
        template_value: newTemplate.value,
        diagnosis: newTemplate.data.diagnosis,
        instructions: newTemplate.data.instructions,
        symptoms: newTemplate.data.symptoms,
        medicines: newTemplate.data.medicines.map(m => ({
          product_id: m.medicine?.id,
          dose: m.dose || "0-0-0",
          when: m.when || null,
          frequency: m.frequency || null,
          duration: m.duration || null,
          notes: m.notes || "",
          timing: m.medicine_timing || "",
        })),
      };

      const saved = await createTemplate(payload); // ✅ use context API
      if (saved) {
        setCreateMode(false);
        setNewTemplate({
          label: '',
          value: '',
          data: { symptoms: '', diagnosis: '', followUpDate: '', instructions: '', medicines: [] },
        });
        toast.success('Template created successfully!');
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error creating template:', error);
      // toast.error('Failed to create template.');
    }
  };

  const addMedicineToTemplate = () => {
    setNewTemplate(prev => ({
      ...prev,
      data: {
        ...prev.data,
        medicines: [...prev.data.medicines, { medicine: null, notes: '', dose: '0-0-0' }]
      }
    }));
  };

  const removeMedicineFromTemplate = (index) => {
    setNewTemplate(prev => ({
      ...prev,
      data: {
        ...prev.data,
        medicines: prev.data.medicines.filter((_, i) => i !== index)
      }
    }));
  };

  const updateMedicineInTemplate = (index, field, value) => {
    setNewTemplate(prev => ({
      ...prev,
      data: {
        ...prev.data,
        medicines: prev.data.medicines.map((med, i) =>
          i === index ? { ...med, [field]: value } : med
        )
      }
    }));
  };

  // Timing functions for checkbox-style timing
  const timingLabels = ["Morning", "Afternoon", "Dinner"];

  const getTimingArray = (timingStr = "") => {
    if (!timingStr) return [0, 0, 0];
    return timingStr.split("-").map((v) => (v === "1" ? 1 : 0));
  };

  const handleTimingCheckboxChange = (index, pos) => {
    const updatedMedicines = [...newTemplate.data.medicines];
    const currentArr = updatedMedicines[index].dose.split("-").map(Number);
    currentArr[pos] = currentArr[pos] ? 0 : 1;
    updatedMedicines[index].dose = currentArr.join("-");
    setNewTemplate(prev => ({
      ...prev,
      data: {
        ...prev.data,
        medicines: updatedMedicines
      }
    }));
  };

  const allTemplates = useMemo(() => {
    if (!medicines.length) return [];
    return templates.map(t => normalizeTemplate(t, medicines));
  }, [templates, medicines]);

  return (
    <>
      <PageHeader>
        <PageHeaderDate />
      </PageHeader>

      <div className='main-content'>
        <div className='row'>
          {/* Controls Card */}
          <div className="col-12">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Prescription Templates</h5>
                <div className="card-header-action">
                  <p className="mb-0 text-muted">Manage and organize your prescription templates</p>
                </div>
              </div>

              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="d-flex gap-2">
                    <button className="btn btn-success" onClick={handleCreate}>
                      <i className="fas fa-plus me-2"></i>Create Template
                    </button>
                    <button className="btn btn-primary" onClick={handleExport}>
                      <i className="fas fa-download me-2"></i>Export
                    </button>
                    <label className="btn btn-info text-white mb-0">
                      <i className="fas fa-upload me-2"></i>Import
                      <input type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />
                    </label>
                  </div>

                  <div className="btn-group" role="group">
                    <button
                      className={`btn ${viewMode === 'card' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setViewMode('card')}
                    >
                      <i className="fas fa-th-large me-2"></i>Cards
                    </button>
                    <button
                      className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setViewMode('list')}
                    >
                      <i className="fas fa-list me-2"></i>List
                    </button>
                  </div>
                </div>

                {viewMode === 'card' ? (
                  <div className="row g-4">
                    {allTemplates.map(t => (
                      <div key={t.value} className="col-lg-4 col-md-6">
                        <div className="card stretch stretch-full">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <h5 className="card-title mb-0">{t.label}</h5>
                              {t.isCustom ? (
                                <span className="badge bg-info">Custom</span>
                              ) : (
                                <span className="badge bg-secondary">Built-in</span>
                              )}
                            </div>

                            <div className="mb-3">
                              <div className="bg-light p-3 rounded">
                                <div className="mb-2">
                                  <strong className="text-primary">Diagnosis:</strong>
                                  <span className="ms-2">{t.data.diagnosis}</span>
                                </div>
                                <div className="mb-2">
                                  <strong className="text-primary">Symptoms:</strong>
                                  <span className="ms-2">{t.data.symptoms}</span>
                                </div>
                                <div>
                                  <strong className="text-primary">Medicines:</strong>
                                  <span className="ms-2">
                                    {t.data.medicines.map(m => {
                                      const medName =
                                        typeof m.medicine === 'string'
                                          ? m.medicine
                                          : (m.medicine?.name || m.medicine?.medicineName || m.medicine_name);

                                      const medSku = m.sku || m.medicine?.variation?.sku || m.medicine?.sku || "";

                                      return medSku ? `${medName} (${medSku})` : medName;
                                    }).join(', ')}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="d-flex gap-2 flex-wrap">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setSelectedTemplate(t)}
                              >
                                <i className="fas fa-eye me-1"></i>Preview
                              </button>
                              {t.isCustom && (
                                <>
                                  <button
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => handleEdit(t)}
                                  >
                                    <i className="fas fa-edit me-1"></i>Edit
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete(t.id)}
                                  >
                                    <i className="fas fa-trash me-1"></i>Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Name</th>
                            <th>Diagnosis</th>
                            <th>Symptoms</th>
                            <th>Medicines</th>
                            <th>Type</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allTemplates.map(t => (
                            <tr key={t.value}>
                            <td className="fw-medium">{t.label}</td>
                              <td>{t.data.diagnosis}</td>
                              <td>{t.data.symptoms}</td>
                              <td>{t.data.medicines.map(m =>
                                typeof m.medicine === 'string' ? m.medicine : (m.medicine?.medicineName || m.medicine_name)
                              ).join(', ')}</td>
                            <td>
                              {t.isCustom ? (
                                <span className="badge bg-info">Custom</span>
                              ) : (
                                <span className="badge bg-secondary">Built-in</span>
                              )}
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                  <button
                                    className="avatar-text avatar-md btn-outline-primary"
                                  onClick={() => setSelectedTemplate(t)}
                                >
                                    <FiEye />
                                </button>
                                {t.isCustom && (
                                  <>
                                      <button
                                        className="avatar-text avatar-md btn-outline-success"
                                      onClick={() => handleEdit(t)}
                                    >
                                        <FiEdit />
                                    </button>
                                      <button
                                        className="avatar-text avatar-md btn-outline-danger"
                                        onClick={() => handleDelete(t.id)}
                                    >
                                        <MdDelete />
                                    </button>
                                  </>
                                )}
                              </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Template Modal */}
      {createMode && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xxl modal-dialog-centered" style={{ maxWidth: "75%", margin: "0 auto" }}>
            <div className="modal-content">
              <div className="modal-header bg-light border-bottom">
                <h5 className="modal-title">
                  <i className="fas fa-plus-circle me-2 text-primary"></i>
                  Create New Template
                </h5>
                <button type="button" className="btn-close" onClick={() => setCreateMode(false)}></button>
              </div>
              <div className="modal-body p-0">
                <div className="px-4 pt-3 pb-2">
                  {/* Basic Information */}
                  <div className="form-group mb-3">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label mb-1">
                          Template Name <span className="text-danger">*</span>
                        </label>
                        <input
                          className="form-control"
                          placeholder="e.g., Fever (Adult)"
                          value={newTemplate.label}
                          onChange={e => setNewTemplate({ ...newTemplate, label: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label mb-1">
                          Template Value <span className="text-danger">*</span>
                        </label>
                        <input
                          className="form-control"
                          placeholder="e.g., fever-adult"
                          value={newTemplate.value}
                          onChange={e => setNewTemplate({ ...newTemplate, value: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="my-0 border-dashed" />

                <div className="px-4 pt-3 pb-2">
                  {/* Medical Information */}
                  <div className="card bg-light border-0 shadow-none mb-3">
                    <div className="card-body py-2 px-3">
                      <div className="row g-2 align-items-center">
                        <div className="col-md-6">
                          <label className="form-label mb-1 d-flex align-items-center gap-2">
                            <span className="text-success"><i className="bi bi-search-heart"></i></span> Diagnosis
                          </label>
                          <input
                            className="form-control bg-white border-0 shadow-sm px-3"
                            placeholder="e.g., Viral Fever"
                            value={newTemplate.data.diagnosis}
                            onChange={e => setNewTemplate({ ...newTemplate, data: { ...newTemplate.data, diagnosis: e.target.value } })}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label mb-1 d-flex align-items-center gap-2">
                            <span className="text-primary"><i className="bi bi-activity"></i></span> Instructions
                          </label>
                          <textarea
                            className="form-control bg-white border-0 shadow-sm px-3"
                            rows="1"
                            placeholder="e.g., Take with water. Rest and hydrate."
                            value={newTemplate.data.instructions}
                            onChange={e => setNewTemplate({ ...newTemplate, data: { ...newTemplate.data, instructions: e.target.value } })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label mb-1 d-flex align-items-center gap-2">
                      <span className="text-warning"><i className="bi bi-activity"></i></span> Symptoms
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="e.g., High temperature, chills, headache"
                      value={newTemplate.data.symptoms}
                      onChange={e => setNewTemplate({ ...newTemplate, data: { ...newTemplate.data, symptoms: e.target.value } })}
                    />
                  </div>
                </div>

                <hr className="my-0 border-dashed" />

                <div className="px-4 pt-3 pb-2">
                  {/* Medicines Section */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">
                      <i className="fas fa-pills me-2 text-warning"></i>
                      Medicines
                    </h6>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={addMedicineToTemplate}
                    >
                      <i className="fas fa-plus me-1"></i>Add Medicine
                    </button>
                  </div>

                  <div className="card stretch stretch-full">
                    <div className="card-body custom-card-action p-0">
                      <div className="table-responsive project-report-table">
                        <table className="table table-hover align-middle mb-0">
                          <thead>
                            <tr>
                              <th className="text-center" style={{ width: '2.2rem' }}>#</th>
                              <th>Medicine</th>
                              <th>Duration</th>
                              <th>When</th>
                              <th>Frequency</th>
                              <th>Notes</th>
                              <th>Dose</th>
                              <th className="text-end" style={{ width: '4.5rem' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {newTemplate.data.medicines.map((medicine, index) => (
                              <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                                <td className="text-center fw-bold">{index + 1}</td>
                                <td style={{ minWidth: 160 }}>
                                  <div className="hstack gap-3">
                                    <div className="avatar-image rounded bg-light d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                      <span className="text-primary" style={{ fontSize: 16 }}><i className="bi bi-capsule"></i></span>
                                    </div>
                                    <div style={{ minWidth: 100 }}>
                                      <select
                                        className="form-select"
                                        value={medicine.medicine?.id || ''}
                                        onChange={e => {
                                          const selectedMedicine = medicines.find(m => m.id === parseInt(e.target.value));
                                          if (selectedMedicine) {
                                            // Get the first variation's SKU if available, otherwise use medicine SKU
                                            const firstVariation = selectedMedicine.variations?.[0];
                                            const sku = firstVariation?.sku || selectedMedicine.sku || "";

                                            updateMedicineInTemplate(index, 'medicine', selectedMedicine);
                                            updateMedicineInTemplate(index, 'sku', sku);
                                            updateMedicineInTemplate(index, 'medicine_name', selectedMedicine.name);
                                          } else {
                                            updateMedicineInTemplate(index, 'medicine', null);
                                            updateMedicineInTemplate(index, 'sku', '');
                                            updateMedicineInTemplate(index, 'medicine_name', '');
                                          }
                                        }}
                                      >
                                        <option value="">Select Medicine</option>
                                        {medicines.map(med => {
                                          // Get the first variation SKU or medicine SKU
                                          const firstVariation = med.variations?.[0];
                                          const displaySku = firstVariation?.sku || med.sku;
                                          const skuText = displaySku ? ` (${displaySku})` : '';

                                          return (
                                            <option key={med.id} value={med.id}>
                                              {med.name} {med.brand ? `(${med.brand})` : ''}{skuText}
                                            </option>
                                          );
                                        })}
                                      </select>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g., 3 times"
                                    value={medicine.duration || ''}
                                    onChange={e => updateMedicineInTemplate(index, 'duration', e.target.value)}
                                  />
                                </td>
                                <td>
                                  <select
                                    className="form-select"
                                    value={medicine.when || ''}
                                    onChange={e => updateMedicineInTemplate(index, 'when', e.target.value)}
                                  >
                                    <option value="">Select</option>
                                    <option value="Before Food">Before Food</option>
                                    <option value="After Food">After Food</option>
                                    <option value="With Food">With Food</option>
                                    <option value="Empty Stomach">Empty Stomach</option>
                                    <option value="Bedtime">Bedtime</option>
                                  </select>
                                </td>
                                <td>
                                  <select
                                    className="form-select"
                                    value={medicine.frequency || ''}
                                    onChange={e => updateMedicineInTemplate(index, 'frequency', e.target.value)}
                                  >
                                    <option value="">Select</option>
                                    <option value="Once daily">Once daily</option>
                                    <option value="Twice daily">Twice daily</option>
                                    <option value="Thrice daily">Thrice daily</option>
                                    <option value="Four times daily">Four times daily</option>
                                    <option value="Every 4 hours">Every 4 hours</option>
                                    <option value="Every 6 hours">Every 6 hours</option>
                                    <option value="Every 8 hours">Every 8 hours</option>
                                    <option value="Every 12 hours">Every 12 hours</option>
                                    <option value="SOS">SOS (As needed)</option>
                                  </select>
                                </td>
                                <td>
                                  <textarea
                                    className="form-control"
                                    placeholder="e.g., 500mg, 3x daily"
                                    value={medicine.notes || ''}
                                    onChange={e => updateMedicineInTemplate(index, 'notes', e.target.value)}
                                    rows="1"
                                    style={{
                                      resize: 'none',
                                      overflow: 'hidden',
                                      minHeight: '38px',
                                      maxHeight: '200px'
                                    }}
                                    onInput={(e) => {
                                      e.target.style.height = 'auto';
                                      e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                                    }}
                                  />
                                </td>
                                <td>
                                  <div className="d-flex gap-1" style={{ flexWrap: 'nowrap' }}>
                                    {timingLabels.map((label, pos) => {
                                       // Use dose field instead of medicine_timing
                                       const doseValue = medicine.dose || "0-0-0";
                                       console.log(`Medicine ${index} dose value:`, doseValue);
                                       const checked = getTimingArray(doseValue)[pos] === 1;
                                       console.log(`Button ${label} checked:`, checked);

                                       return (
                                         <button
                                           key={label}
                                           type="button"
                                           className={`btn btn-sm ${checked ? 'btn-primary' : 'btn-outline-primary'}`}
                                           onClick={() => {
                                             console.log(`Clicked ${label} button for medicine ${index}`);
                                             handleTimingCheckboxChange(index, pos);
                                           }}
                                           style={{ fontSize: '0.8em', minWidth: '28px', padding: '4px 6px', flexShrink: 0 }}
                                           title={label}
                                         >
                                           {label[0]}
                                         </button>
                                       );
                                     })}
                                  </div>
                                </td>
                                <td className="text-end">
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => removeMedicineFromTemplate(index)}
                                    title="Remove Medicine"
                                    style={{
                                      minWidth: '32px',
                                      padding: '6px 8px',
                                      borderWidth: '1px',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={(e) => {
                                      e.target.style.backgroundColor = '#dc3545';
                                      e.target.style.color = 'white';
                                      e.target.style.borderColor = '#dc3545';
                                    }}
                                    onMouseOut={(e) => {
                                      e.target.style.backgroundColor = 'transparent';
                                      e.target.style.color = '#dc3545';
                                      e.target.style.borderColor = '#dc3545';
                                    }}
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {newTemplate.data.medicines.length === 0 && (
                              <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                                <td colSpan="12" className="text-center py-5">
                                  <div className="mb-3">
                                    <i className="fas fa-pills fa-2x text-muted"></i>
                                  </div>
                                  <h6 className="text-muted mb-2">No medicines added yet</h6>
                                  <p className="text-muted mb-0">Click "Add Medicine" to get started with your template</p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-dashed my-4" />

                <div className="px-5 pb-5">
                  <button type="button" className="btn btn-success w-100 shadow-lg" onClick={handleCreateSave}>
                    <i className="fas fa-save me-2"></i>Create Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {selectedTemplate && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Template Preview: {selectedTemplate.label}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedTemplate(null)}></button>
              </div>
              <div className="modal-body">
                <div className="bg-light p-3 rounded">
                  <div className="mb-3">
                    <strong className="text-primary">Diagnosis:</strong>
                    <span className="ms-2">{selectedTemplate.data.diagnosis}</span>
                  </div>
                  <div className="mb-3">
                    <strong className="text-primary">Symptoms:</strong>
                    <span className="ms-2">{selectedTemplate.data.symptoms}</span>
                  </div>
                  <div className="mb-3">
                    <strong className="text-primary">Instructions:</strong>
                    <span className="ms-2">{selectedTemplate.data.instructions}</span>
                  </div>
                  <div>
                    <strong className="text-primary">Medicines:</strong>
                    <span className="ms-2">
                      {selectedTemplate.data.medicines.map(m => {
                        const medName = m.medicine?.name || m.medicine_name || "Unknown";
                        const medSku = m.sku || m.medicine?.sku || "";
                        return medSku ? `${medName} (${medSku})` : medName;
                      }).join(', ')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedTemplate(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {/* {editMode && editData && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Template: {editData.label}</h5>
                <button type="button" className="btn-close" onClick={() => setEditMode(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-medium">Diagnosis</label>
                  <input
                    className="form-control"
                    value={editData.data.diagnosis}
                    onChange={e => setEditData({ ...editData, data: { ...editData.data, diagnosis: e.target.value } })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium">Symptoms</label>
                  <input
                    className="form-control"
                    value={editData.data.symptoms}
                    onChange={e => setEditData({ ...editData, data: { ...editData.data, symptoms: e.target.value } })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium">Instructions</label>
                  <input
                    className="form-control"
                    value={editData.data.instructions}
                    onChange={e => setEditData({ ...editData, data: { ...editData.data, instructions: e.target.value } })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium">Medicines (comma separated)</label>
                  <input
                    className="form-control"
                    value={editData.data.medicines
                      .map(m =>
                        typeof m.medicine === "string"
                          ? m.medicine
                          : (m.medicine?.name || m.medicine?.medicineName || m.medicine_name || "")
                      )
                      .join(", ")}
                    onChange={e =>
                      setEditData({
                        ...editData,
                        data: {
                          ...editData.data,
                          medicines: e.target.value.split(",").map(name => ({
                            medicine: name.trim()
                          }))
                        }
                      })
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleEditSave}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Edit Template Modal */}
      {editMode && editData && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xxl modal-dialog-centered" style={{ maxWidth: "75%", margin: "0 auto" }}>
            <div className="modal-content">
              <div className="modal-header bg-light border-bottom">
                <h5 className="modal-title">
                  <i className="fas fa-edit me-2 text-success"></i>
                  Edit Template: {editData.label}
                </h5>
                <button type="button" className="btn-close" onClick={() => setEditMode(false)}></button>
              </div>
              <div className="modal-body p-0">
                <div className="px-4 pt-3 pb-2">
                  {/* Basic Information */}
                  <div className="form-group mb-3">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label mb-1">Template Name <span className="text-danger">*</span></label>
                        <input
                          className="form-control"
                          value={editData.label}
                          onChange={e => setEditData({ ...editData, label: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label mb-1">Template Value <span className="text-danger">*</span></label>
                        <input
                          className="form-control"
                          value={editData.value}
                          onChange={e => setEditData({ ...editData, value: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="my-0 border-dashed" />

                {/* Medical Info */}
                <div className="px-4 pt-3 pb-2">
                  <div className="card bg-light border-0 shadow-none mb-3">
                    <div className="card-body py-2 px-3">
                      <div className="row g-2 align-items-center">
                        <div className="col-md-6">
                          <label className="form-label mb-1">Diagnosis</label>
                          <input
                            className="form-control"
                            value={editData.data.diagnosis}
                            onChange={e => setEditData({ ...editData, data: { ...editData.data, diagnosis: e.target.value } })}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label mb-1">Instructions</label>
                          <textarea
                            className="form-control"
                            rows="1"
                            value={editData.data.instructions}
                            onChange={e => setEditData({ ...editData, data: { ...editData.data, instructions: e.target.value } })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label mb-1">Symptoms</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editData.data.symptoms}
                      onChange={e => setEditData({ ...editData, data: { ...editData.data, symptoms: e.target.value } })}
                    />
                  </div>
                </div>

                <hr className="my-0 border-dashed" />

                {/* Medicines Table (same as Create) */}
                <div className="px-4 pt-3 pb-2">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0"><i className="fas fa-pills me-2 text-warning"></i> Medicines</h6>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        setEditData(prev => ({
                          ...prev,
                          data: {
                            ...prev.data,
                            medicines: [...prev.data.medicines, { medicine: null, notes: '', medicine_timing: '', sku: '' }]
                          }
                        }))
                      }
                    >
                      <i className="fas fa-plus me-1"></i> Add Medicine
                    </button>
                  </div>

                  <div className="card stretch stretch-full">
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead>
                            <tr>
                              <th className="text-center" style={{ width: '2.2rem' }}>#</th>
                              <th>Medicine</th>
                              <th>Duration</th>
                              <th>When</th>
                              <th>Frequency</th>
                              <th>Notes</th>
                              <th>Dose</th>
                              <th className="text-end" style={{ width: '4.5rem' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {editData.data.medicines.map((med, idx) => (
                              <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td>
                                  <select
                                    className="form-select"
                                    value={med.medicine?.id || ""}
                                    onChange={e => {
                                      const selected = medicines.find(m => m.id === parseInt(e.target.value));
                                      const newMeds = [...editData.data.medicines];

                                      if (selected) {
                                        // Get the first variation's SKU if available, otherwise use medicine SKU
                                        const firstVariation = selected.variations?.[0];
                                        const sku = firstVariation?.sku || selected.sku || "";

                                        newMeds[idx].medicine = selected;
                                        newMeds[idx].sku = sku;
                                      } else {
                                        newMeds[idx].medicine = null;
                                        newMeds[idx].sku = "";
                                      }

                                      setEditData(prev => ({ ...prev, data: { ...prev.data, medicines: newMeds } }));
                                    }}
                                  >
                                    <option value="">Select Medicine</option>
                                    {medicines.map(medObj => {
                                      const firstVariation = medObj.variations?.[0];
                                      const displaySku = firstVariation?.sku || medObj.sku;
                                      const skuText = displaySku ? ` (${displaySku})` : '';

                                      return (
                                        <option key={medObj.id} value={medObj.id}>
                                          {medObj.name}{skuText}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </td>
                                <td>
                                  <input
                                    className="form-control"
                                    value={med.duration || ""}
                                    onChange={e => {
                                      const newMeds = [...editData.data.medicines];
                                      newMeds[idx].duration = e.target.value;
                                      setEditData(prev => ({ ...prev, data: { ...prev.data, medicines: newMeds } }));
                                    }}
                                  />
                                </td>
                                <td>
                                  <select
                                    className="form-select"
                                    value={med.when || ""}
                                    onChange={e => {
                                      const newMeds = [...editData.data.medicines];
                                      newMeds[idx].when = e.target.value;
                                      setEditData(prev => ({ ...prev, data: { ...prev.data, medicines: newMeds } }));
                                    }}
                                  >
                                    <option value="">Select</option>
                                    <option value="Before Food">Before Food</option>
                                    <option value="After Food">After Food</option>
                                    <option value="With Food">With Food</option>
                                    <option value="Empty Stomach">Empty Stomach</option>
                                    <option value="Bedtime">Bedtime</option>
                                  </select>
                                </td>
                                <td>
                                  <select
                                    className="form-select"
                                    value={med.frequency || ""}
                                    onChange={e => {
                                      const newMeds = [...editData.data.medicines];
                                      newMeds[idx].frequency = e.target.value;
                                      setEditData(prev => ({ ...prev, data: { ...prev.data, medicines: newMeds } }));
                                    }}
                                  >
                                    <option value="">Select</option>
                                    <option value="Once daily">Once daily</option>
                                    <option value="Twice daily">Twice daily</option>
                                    <option value="Thrice daily">Thrice daily</option>
                                    <option value="Four times daily">Four times daily</option>
                                    <option value="Every 4 hours">Every 4 hours</option>
                                    <option value="Every 6 hours">Every 6 hours</option>
                                    <option value="Every 8 hours">Every 8 hours</option>
                                    <option value="Every 12 hours">Every 12 hours</option>
                                    <option value="SOS">SOS (As needed)</option>
                                  </select>
                                </td>


                                <td>
                                  <textarea
                                    className="form-control"
                                    rows="1"
                                    value={med.notes || ""}
                                    onChange={e => {
                                      const newMeds = [...editData.data.medicines];
                                      newMeds[idx].notes = e.target.value;
                                      setEditData(prev => ({ ...prev, data: { ...prev.data, medicines: newMeds } }));
                                    }}
                                  />
                                </td>
                                <td>
                                  {/* reuse your timing buttons logic */}
                                  <div className="d-flex gap-1">
                                    {["Morning", "Afternoon", "Dinner"].map((label, pos) => {
                                      const arr = med.dose?.split("-").map(x => +x) || [0, 0, 0];
                                      const checked = arr[pos] === 1;
                                      return (
                                        <button
                                          key={label}
                                          type="button"
                                          className={`btn btn-sm ${checked ? "btn-primary" : "btn-outline-primary"}`}
                                          onClick={() => {
                                            const newArr = [...arr];
                                            newArr[pos] = newArr[pos] ? 0 : 1;
                                            const newMeds = [...editData.data.medicines];
                                            newMeds[idx].dose = newArr.join("-");
                                            setEditData(prev => ({ ...prev, data: { ...prev.data, medicines: newMeds } }));
                                          }}
                                        >
                                          {label[0]}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </td>
                                <td className="text-end">
                                  <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => {
                                      setEditData(prev => ({
                                        ...prev,
                                        data: { ...prev.data, medicines: prev.data.medicines.filter((_, i) => i !== idx) }
                                      }));
                                    }}
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {editData.data.medicines.length === 0 && (
                              <tr>
                                <td colSpan="6" className="text-center text-muted py-4">No medicines added</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-dashed my-4" />

                <div className="px-5 pb-5">
                  <button type="button" className="btn btn-success w-100" onClick={handleEditSave}>
                    <i className="fas fa-save me-2"></i> Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default TemplatesManagement; 