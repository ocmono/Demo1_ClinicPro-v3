import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiActivity, FiDroplet, FiPlus, FiEdit3, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import { useClinicManagement } from '../../../contentApi/ClinicMnanagementProvider';
import { useAuth } from '../../../contentApi/AuthContext';
import { toast } from 'react-toastify';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import { useTests } from '../../../context/TestContext';
import Footer from '@/components/shared/Footer';

const SpecialtyConfigure = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    clinicSpecialities,
    fetchSymptoms,
    symptomsBySpeciality,
    saveSymptomsToBackend,
    dedupeDiagnosis,
    normalizeDiagnosis,
  } = useClinicManagement();

  // Use pendingChanges instead of diagnoses for local operations
  const [activeTab, setActiveTab] = useState('diagnosis');
  const [specialty, setSpecialty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editCategoryData, setEditCategoryData] = useState(null);
  const [localDiagnoses, setLocalDiagnoses] = useState([]);
  const [pendingChanges, setPendingChanges] = useState([]); // Use this for local changes
  const [editingDiagnosisIndex, setEditingDiagnosisIndex] = useState(null);

  const operationInProgress = useRef(false);

  const [diagnosisForm, setDiagnosisForm] = useState({
    name: '',
    symptoms: [''], // Start with one empty symptom
  });

  // Symptoms management state
  const [newDiagnosisName, setNewDiagnosisName] = useState('');
  const [diagnosisInputs, setDiagnosisInputs] = useState({});
  const [saving, setSaving] = useState(false);
  const [treatmentInputs, setTreatmentInputs] = useState({});
  const { categories, addTest, fetchTestsBySpeciality, updateTest, deleteTest, addCategory, updateCategory, deleteCategory } = useTests();

  // Lab tests state
  const [labTests, setLabTests] = useState([]);
  const [editLabTest, setEditLabTest] = useState(null);
  const [newLabTest, setNewLabTest] = useState({
    test_name: '',
    category_id: '',
  });

  // Role-based permissions
  const canConfigureRoles = ['super_admin', 'clinic_admin', 'doctor'];
  const canConfigure = user && canConfigureRoles.includes(user.role);

  useEffect(() => {
    if (!canConfigure) {
      toast.error("You don't have permission to configure clinical settings");
      navigate('/clinic/specialities');
      return;
    }

    if (clinicSpecialities.length > 0) {
      const foundSpecialty = clinicSpecialities.find(s => s.id == id);
      if (foundSpecialty) {
        setSpecialty(foundSpecialty);
        // Fetch symptoms for this specialty
        if (id && !isNaN(Number(id))) {
          fetchSymptoms(id);
        }
        setLoading(false);
      } else {
        toast.error('Specialty not found');
        navigate('/clinic/specialities');
      }
    }
  }, [id, clinicSpecialities, canConfigure, navigate]);

  useEffect(() => {
    if (id) {
      fetchTestsBySpeciality(id).then(setLabTests).catch(() => setLabTests([]));
    }
  }, [id]);

  useEffect(() => {
    if (symptomsBySpeciality[id] && Array.isArray(symptomsBySpeciality[id])) {
      const existingDiagnoses = symptomsBySpeciality[id];
      setLocalDiagnoses(existingDiagnoses);
      setPendingChanges(dedupeDiagnosis(normalizeDiagnosis(existingDiagnoses))); // Initialize with existing data
    } else {
      setLocalDiagnoses([]);
      setPendingChanges([]);
    }
  }, [symptomsBySpeciality, id]);

  const tabs = [
    { key: 'diagnosis', label: 'Symptoms & Treatments', icon: <FiActivity /> },
    { key: 'lab', label: 'Lab Tests', icon: <FiDroplet /> },
    { key: 'categories', label: 'Manage Categories', icon: <FiEdit3 /> },
  ];

  const handleDiagnosisFormChange = (field, value) => {
    setDiagnosisForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSymptomChange = (index, value) => {
    const newSymptoms = [...diagnosisForm.symptoms];
    newSymptoms[index] = value;
    setDiagnosisForm(prev => ({
      ...prev,
      symptoms: newSymptoms
    }));
  };

  const addSymptomField = () => {
    setDiagnosisForm(prev => ({
      ...prev,
      symptoms: [...prev.symptoms, '']
    }));
  };

  const removeSymptomField = (index) => {
    if (diagnosisForm.symptoms.length > 1) {
      const newSymptoms = [...diagnosisForm.symptoms];
      newSymptoms.splice(index, 1);
      setDiagnosisForm(prev => ({
        ...prev,
        symptoms: newSymptoms
      }));
    }
  };

  const resetDiagnosisForm = () => {
    setDiagnosisForm({
      name: '',
      symptoms: ['']
    });
    setEditingDiagnosisIndex(null);
  };

  const handleAddOrUpdateDiagnosis = () => {
    if (!diagnosisForm.name.trim()) {
      toast.error("Diagnosis name is required");
      return;
    }

    // Filter out empty symptoms
    const validSymptoms = diagnosisForm.symptoms
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (validSymptoms.length === 0) {
      toast.error("At least one symptom is required");
      return;
    }

    const newDiagnosis = {
      name: diagnosisForm.name.trim(),
      symptoms: validSymptoms,
      isNew: editingDiagnosisIndex === null
    };

    let updatedDiagnoses;

    if (editingDiagnosisIndex !== null) {
      // Update existing diagnosis
      updatedDiagnoses = [...pendingChanges];
      updatedDiagnoses[editingDiagnosisIndex] = newDiagnosis;
      toast.success("✅ Diagnosis updated locally!");
    } else {
      // Check for duplicate diagnosis name
      const isDuplicate = pendingChanges.some(
        d => d.name.toLowerCase() === diagnosisForm.name.trim().toLowerCase()
      );

      if (isDuplicate) {
        toast.error("Diagnosis already exists");
        return;
      }

      // Add new diagnosis
      const cleaned = dedupeDiagnosis(normalizeDiagnosis([...pendingChanges, newDiagnosis]));
      updatedDiagnoses = cleaned;
      toast.success("✅ Diagnosis added locally!");
    }

    setPendingChanges(updatedDiagnoses);
    resetDiagnosisForm();
  };

  const handleEditDiagnosis = (index) => {
    const diagnosisToEdit = pendingChanges[index];
    setDiagnosisForm({
      name: diagnosisToEdit.name,
      symptoms: diagnosisToEdit.symptoms?.length > 0
        ? [...diagnosisToEdit.symptoms, ''] // Add empty field for new symptom
        : ['']
    });
    setEditingDiagnosisIndex(index);
  };

  const handleDeleteDiagnosis = (index) => {
    if (!window.confirm(`Are you sure you want to delete "${pendingChanges[index].name}"?`)) {
      return;
    }

    const updatedDiagnoses = pendingChanges.filter((_, i) => i !== index);
    setPendingChanges(updatedDiagnoses);
    toast.success("✅ Diagnosis removed locally");

    // Reset form if editing this diagnosis
    if (editingDiagnosisIndex === index) {
      resetDiagnosisForm();
    }
  };

  const handleSaveAll = async () => {
    if (saving) return;

    if (pendingChanges.length === 0) {
      toast.warning("No changes to save");
      return;
    }

    setSaving(true);
    try {
      console.log("💾 Saving all pending changes:", pendingChanges);

      // Normalize the data
      let cleaned = normalizeDiagnosis(pendingChanges);

      cleaned = dedupeDiagnosis(cleaned);

      // Save to backend
      await saveSymptomsToBackend(id, cleaned);

      // Update local state to match saved data
      setLocalDiagnoses(cleaned);

      toast.success("✅ All diagnoses & symptoms saved successfully!");
    } catch (err) {
      console.error("❌ Save to backend error:", err);
      // toast.error("Failed to save to backend");
      // Refresh from backend on error
      await fetchSymptoms(id);
    } finally {
      setSaving(false);
    }
  };

  // Lab Tests Management Functions
  const handleAddLabTest = async () => {
    if (!newLabTest.test_name.trim() || !newLabTest.category_id) {
      toast.error('Test name and category are required');
      return;
    }

    try {
      const testPayload = {
        test_name: newLabTest.test_name.trim(),
        speciality_id: Number(id),
        category_id: Number(newLabTest.category_id),
      };

      const added = await addTest(testPayload);
      setLabTests(prev => [...prev, added]);
      toast.success('Lab test added successfully');
      setNewLabTest({ test_name: '', category_id: '' });
    } catch (err) {
      console.error(err);
      // toast.error('Failed to add lab test');
    }
  };

  const handleUpdateLabTest = async (test) => {
    try {
      const payload = {
        id: test.id,
        test_name: test.test_name,
        speciality_id: test.speciality_id,
        category_id: test.category_id,
      };
      const updated = await updateTest(payload);
      setLabTests(prev => prev.map(t => t.id === updated.id ? updated : t));
      toast.success("Lab test updated successfully");
    } catch (err) {
      console.error(err);
      // toast.error("Failed to update lab test");
    }
  };

  const handleRemoveLabTest = async (testId) => {
    if (!window.confirm("Are you sure you want to delete this lab test?")) return;
    try {
      await deleteTest(testId);
      setLabTests(prev => prev.filter(test => test.id !== testId));
      toast.success("Lab test deleted successfully");
    } catch (err) {
      console.error(err);
      // toast.error("Failed to delete lab test");
    }
  };

  const handleSaveCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      if (editCategoryData) {
        // Update existing
        await updateCategory(editCategoryData.id, { category: newCategory.trim() });
        toast.success("Category updated successfully");
      } else {
        // Add new
        await addCategory({ category: newCategory.trim() });
        toast.success("Category added successfully");
      }

      setNewCategory("");
      setEditCategoryData(null);
      setShowCategoryModal(false);
    } catch (err) {
      console.error("❌ handleSaveCategory error:", err);
      // toast.error("Failed to save category");
    }
  };

  // Add beforeunload handler for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Compare pendingChanges with localDiagnoses to detect actual changes
      const hasChanges = JSON.stringify(pendingChanges) !== JSON.stringify(localDiagnoses);

      if (hasChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pendingChanges, localDiagnoses]);

  if (loading) {
    return (
      <>
        <PageHeader>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-icon btn-light"
                onClick={() => navigate('/clinic/specialities')}
              >
                <FiArrowLeft />
              </button>
            </div>
          </div>
        </PageHeader>

        <div className="main-content">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading specialty configuration...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <PageHeader>
        <div className="d-flex align-items-center justify-content-between gap-2">
          <button
            className="btn btn-icon btn-light"
            onClick={() => navigate('/clinic/specialities')}
          >
            <FiArrowLeft size={16} />
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSaveAll}
            disabled={JSON.stringify(pendingChanges) === JSON.stringify(localDiagnoses) || saving}
          >
            <FiSave className="me-2" size={16} />
            {saving ? 'Saving...' : 'Save All Changes'}
            {JSON.stringify(pendingChanges) !== JSON.stringify(localDiagnoses) && (
              <span className="badge bg-danger ms-2">
                {pendingChanges.filter(d => d.isNew).length} new
              </span>
            )}
          </button>
        </div>
      </PageHeader>

      <div className="main-content">
        <div className="card">
          <div className="card-header bg-light border-bottom">
            <ul className="nav nav-tabs nav-tabs-custom-style card-header-tabs" role="tablist">
              {tabs.map((tab) => (
                <li className="nav-item" role="presentation" key={tab.key}>
                  <button
                    className={`nav-link ${activeTab === tab.key ? "active" : ""}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    <span className="me-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-body">
            {activeTab === 'diagnosis' && (
              <div>
                <h5 className="fw-bold mb-4">
                  <FiActivity className="me-2" />
                  Diagnoses & Symptoms
                </h5>

                {/* Add New Diagnosis */}
                <div className="card mb-4 border-primary">
                  <div className="card-header bg-primary-subtle">
                    <h6 className="mb-0 fw-semibold">{editingDiagnosisIndex !== null ? 'Edit Diagnosis' : 'Add New Diagnosis'}</h6>
                    {editingDiagnosisIndex !== null && (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={resetDiagnosisForm}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                  <div className="card-body">
                    <div className="row g-3 align-items-end">
                      <div className="col-md-12">
                        <label className="form-label fw-medium">Diagnosis Name</label>
                        <input
                          type="text"
                          className="form-control form-control-md"
                          placeholder="e.g., Asthma, Hypertension, Diabetes..."
                          value={diagnosisForm.name}
                          onChange={(e) => handleDiagnosisFormChange('name', e.target.value)}
                        />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label fw-medium d-flex justify-content-between align-items-center">
                          <span>Symptoms</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={addSymptomField}
                          >
                            <FiPlus size={12} className="me-1" />
                            Add More
                          </button>
                        </label>

                        {diagnosisForm.symptoms.map((symptom, index) => (
                          <div key={index} className="input-group mb-2">
                            <span className="input-group-text">
                              {index + 1}
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder={`Symptom ${index + 1}`}
                              value={symptom}
                              onChange={(e) => handleSymptomChange(index, e.target.value)}
                            />
                            {diagnosisForm.symptoms.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => removeSymptomField(index)}
                              >
                                <FiX size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="col-md-12">
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-primary"
                            onClick={handleAddOrUpdateDiagnosis}
                          >
                            <FiPlus className="me-2" size={16} />
                            {editingDiagnosisIndex !== null ? 'Update Diagnosis & Symptoms' : 'Add Diagnosis & Symptoms'}
                          </button>

                          {editingDiagnosisIndex !== null && (
                            <button
                              className="btn btn-secondary"
                              onClick={resetDiagnosisForm}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diagnoses List */}
                {pendingChanges.length === 0 ? (
                  <div className="card">
                    <div className="card-body text-center py-5">
                      <FiActivity size={48} className="text-muted mb-3" />
                      <h5 className="text-muted">No diagnoses configured</h5>
                      <p className="text-muted">Add diagnoses to start configuring symptoms</p>
                    </div>
                  </div>
                ) : (
                  <div className="row g-4">
                      {pendingChanges.map((diagnosis, index) => (
                      <div key={index} className="col-12">
                        <div className="card shadow-sm">
                          <div className="card-header bg-light">
                            <div className="d-flex align-items-center justify-content-between w-100">
                              <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-primary">{index + 1}</span>
                                  <h6 className="mb-0 fw-bold">{diagnosis.name}</h6>
                                  <span className="badge bg-secondary ms-2">
                                    {diagnosis.symptoms?.length || 0} symptoms
                                  </span>
                                  {diagnosis.isNew && (
                                    <span className="badge bg-warning ms-2">New</span>
                                  )}
                              </div>
                                <div className="d-flex gap-2">
                                  <button
                                    className="avatar-text avatar-md"
                                    onClick={() => handleEditDiagnosis(index)}
                                    title="Edit Diagnosis"
                                  >
                                    <FiEdit3 size={14} />
                                  </button>
                                  <button
                                    className="avatar-text avatar-md"
                                    onClick={() => handleDeleteDiagnosis(index)}
                                    title="Delete Diagnosis"
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="card-body">
                              <div className="row g-4">
                                {/* Symptoms Section */}
                                <div className="col-12">
                                  <label className="form-label fw-semibold text-secondary mb-2">
                                    Symptoms
                                  </label>
                                  {(!diagnosis.symptoms || diagnosis.symptoms.length === 0) ? (
                                    <p className="text-muted small mb-0">No symptoms added</p>
                                  ) : (
                                    <div className="row g-2">
                                      {diagnosis.symptoms.map((symptom, idx) => (
                                        <div key={idx} className="col-md-3">
                                          <div className="d-flex align-items-center justify-content-between bg-primary-subtle p-2 rounded mb-2">
                                            <div className="d-flex align-items-center gap-2">
                                              <span className="badge bg-light text-dark">{idx + 1}</span>
                                              <span className="small fw-medium">{symptom}</span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'lab' && (
              <div>
                <h5 className="fw-bold mb-4 d-flex align-items-center justify-content-between">
                  <span>
                    <FiDroplet className="me-2" />
                    Laboratory Tests
                  </span>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setShowCategoryModal(true)}
                  >
                    <FiPlus className="me-1" />
                    Add Category
                  </button>
                </h5>

                {/* Add New Lab Test */}
                <div className="card mb-4 border-primary">
                  <div className="card-header bg-primary-subtle">
                    <h6 className="mb-0 fw-semibold">Add New Lab Test</h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3 align-items-end">
                      <div className="col-md-5">
                        <label className="form-label fw-medium">Test Name</label>
                        <input
                          type="text"
                          className="form-control form-control-md"
                          placeholder="Enter test name"
                          value={newLabTest.test_name}
                          onChange={(e) => setNewLabTest(prev => ({ ...prev, test_name: e.target.value }))}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-medium">Category</label>
                        <select
                          className="form-select form-select-md"
                          value={newLabTest.category_id}
                          onChange={(e) => setNewLabTest(prev => ({ ...prev, category_id: e.target.value }))}
                        >
                          <option value="">Select category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.category}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <button className="btn btn-primary btn-lg w-100" onClick={handleAddLabTest}>
                          <FiPlus className="me-2" size={16} /> Add Test
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lab Tests List */}
                {labTests.length === 0 ? (
                  <div className="card">
                    <div className="card-body text-center py-5">
                      <FiDroplet size={48} className="text-muted mb-3" />
                      <h5 className="text-muted">No lab tests configured</h5>
                      <p className="text-muted">Add lab tests commonly used for this specialty</p>
                    </div>
                  </div>
                ) : (
                  <div className="row g-3">
                    {labTests.map((test) => (
                      <div key={test.id} className="col-md-6 col-lg-4">
                        <div className="card h-100 shadow-sm border-0">
                          <div className="card-body">
                            <div className="d-flex align-items-start justify-content-between mb-3">
                              <div className="flex-grow-1">
                                <h6 className="fw-bold mb-2">{test.test_name}</h6>
                                <div className='d-flex flex-wrap gap-2'>
                                  <span className="badge bg-primary-subtle text-primary">
                                    {categories.find(cat => cat.id === test.category_id)?.category || 'Unknown Category'}
                                  </span>
                                  <span className="badge bg-info-subtle text-info">
                                    {clinicSpecialities.find(spec => spec.id === test.speciality_id)?.speciality || 'Unknown Speciality'}
                                  </span>
                                </div>
                              </div>
                              <div className="btn-group-vertical gap-2 flex-row">
                                <button
                                  className="avatar-text avatar-md"
                                  onClick={() => setEditLabTest(test)}
                                  title="Edit Test"
                                >
                                  <FiEdit3 size={14} />
                                </button>
                                <button
                                  className="avatar-text avatar-md"
                                  onClick={() => handleRemoveLabTest(test.id)}
                                  title="Delete Test"
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'categories' && (
              <div>
                <h5 className="fw-bold mb-4">
                  <FiEdit3 className="me-2" />
                  Manage Categories
                </h5>

                {/* Add New Category */}
                <div className="card mb-4 border-primary">
                  <div className="card-header bg-primary-subtle">
                    <h6 className="mb-0 fw-semibold">Add New Category</h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3 align-items-end">
                      <div className="col-md-9">
                        <label className="form-label fw-medium">Category Name</label>
                        <input
                          type="text"
                          className="form-control form-control-md"
                          placeholder="Enter category name"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveCategory()}
                        />
                      </div>
                      <div className="col-md-3">
                        <button className="btn btn-primary btn-lg w-100" onClick={handleSaveCategory}>
                          <FiPlus className="me-2" size={16} />
                          Add Category
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Categories List */}
                {categories.length === 0 ? (
                  <div className="card">
                    <div className="card-body text-center py-5">
                      <FiEdit3 size={48} className="text-muted mb-3" />
                      <h5 className="text-muted">No categories found</h5>
                      <p className="text-muted">Add a category above to organize your lab tests</p>
                    </div>
                  </div>
                ) : (
                    <div className="card">
                      <div className="card-header bg-light">
                        <h6 className="mb-0 fw-semibold">All Categories ({categories.length})</h6>
                      </div>
                      <ul className="list-group list-group-flush">
                        {categories.map((cat, index) => (
                          <li
                            key={cat.id}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-primary">{index + 1}</span>
                              <span className="fw-medium">{cat.category}</span>
                            </div>
                            <div className='d-flex gap-2'>
                              <button
                                className="avatar-text avatar-md"
                                onClick={() => {
                                  setNewCategory(cat.category);
                                  setEditCategoryData(cat);
                                  setShowCategoryModal(true);
                                }}
                                title="Edit Category"
                              >
                                <FiEdit3 size={14} />
                              </button>
                              <button
                                className="avatar-text avatar-md"
                                onClick={async () => {
                                  if (window.confirm(`Are you sure you want to delete "${cat.category}"?`)) {
                                    try {
                                      await deleteCategory(cat.id);
                                      toast.success("Category deleted successfully");
                                    } catch (err) {
                                      console.log("Failed to delete category");
                                      // toast.error("Failed to delete category");
                                    }
                                  }
                                }}
                                title="Delete Category"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </li>
                        ))}
                    </ul>
                    </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {editLabTest && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Lab Test</h5>
                <button type="button" className="btn-close" onClick={() => setEditLabTest(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Test Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editLabTest.test_name}
                    onChange={(e) =>
                      setEditLabTest({ ...editLabTest, test_name: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={editLabTest.category_id}
                    onChange={(e) =>
                      setEditLabTest({ ...editLabTest, category_id: Number(e.target.value) })
                    }
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditLabTest(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    await handleUpdateLabTest(editLabTest);
                    setEditLabTest(null);
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editCategoryData ? "Edit Category" : "Add Category"}
                </h5>
                <button type="button" className="btn-close" onClick={() => {
                  setShowCategoryModal(false);
                  setEditCategoryData(null);
                  setNewCategory("");
                }}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Category Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditCategoryData(null);
                    setNewCategory("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveCategory}
                >
                  {editCategoryData ? "Update Category" : "Save Category"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default SpecialtyConfigure;