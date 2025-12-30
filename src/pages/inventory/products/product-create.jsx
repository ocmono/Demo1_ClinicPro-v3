import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import CardHeader from '@/components/shared/CardHeader';
import CardLoader from '@/components/shared/CardLoader';
import useCardTitleActions from '@/hooks/useCardTitleActions';
import { toast } from 'react-toastify';
import { FiTrash, FiPlus, FiMinus } from 'react-icons/fi';
import classNames from 'classnames';
import { useMedicines } from '../../../context/MedicinesContext';
import { useSuppliers } from '../../../contentApi/SuppliersProvider';
import { useManufacturers } from '../../../contentApi/ManufacturersProvider';
import Footer from '@/components/shared/Footer'

const AddMedicine = () => {
  const { suppliers } = useSuppliers();
  const { manufacturers } = useManufacturers();
  const [medicineForm, setMedicineForm] = useState({
    product_id: '',
    name: '',
    brand: '',  
    category: '',
    notes: '',
    status: true,
    keywords: [],
    supplier: '',
    supplier_contact: '',
    supplier_email: '',
    supplier_contact_person: '',
    supplier_address: '',
    manufacturer_name: '',
    manufacturer_contact_person: '',
    manufacturer_email: '',
    manufacturer_phone: '',
    manufacturer_reg_no: '',
    manufacturer_license_no: '',
    manufacturer_website: '',
    mp_certified: false,
    o_certified: false,
    manufacturer_address: '',
    vaccine_type: '',
    age_grp: '',
    route_administration: '',
    storage_temperature: '',
    vaccine_manufacturer: '',
    lot_no: '',
    dose_schedule: '',
    dose_interval: '',
    total_doses: '',
    special_instructions: '',
    contraindications: '',
    side_effects: '',
    antibiotic_class: '',
    spectrum: '',
    dosage_form: '',
    strength: '',
    treatment_duration: '',
    food_interaction: '',
    precautions: '',
    pain_type: '',
    active_ingredient: '',
    dose_form: '',
    maximum_daily_dose: '',
    age_restrictions: '',
    medicine_type: '',
    medicine_category: '',
    variations: [{ sku: '', stock: '', unit: '', price: '', batch_code: '', expiry_date: '', mfg_date: '', status: true, discounts: [] }]
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [errors, setErrors] = useState({});
  const [showSupplierDetails, setShowSupplierDetails] = useState(false);
  const [showBatchDetails, setShowBatchDetails] = useState({});
  const [showDiscountDetails, setShowDiscountDetails] = useState({});
  const commonUnits = [
    'mg', 'ml', 'tablet', 'capsule', 'g', 'bottle', 'strip', 'sachet', 'drop', 'custom', 'vial'
  ];
  const [customUnits, setCustomUnits] = useState({});
  const [showVaccineFields, setShowVaccineFields] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [selectedManufacturerId, setSelectedManufacturerId] = useState(null);

  const discountTypes = [
    { value: 'flat', label: 'Flat Amount' },
    { value: 'percent', label: 'Percentage' }
  ];

  // Effect to maintain category-specific field visibility
  useEffect(() => {
    setShowVaccineFields(medicineForm.category === 'Vaccine');
  }, [medicineForm.category, activeTab]);

  // Effect to sync vaccine form with main form data
  useEffect(() => {
    if (medicineForm.category === 'Vaccine') {
      setVaccineForm(prev => ({
        vaccine_type: medicineForm.vaccine_vaccine_type || prev.vaccine_type,
        age_group: medicineForm.vaccine_age_group || prev.age_group,
        dosage_schedule: medicineForm.vaccine_dosage_schedule || prev.dosage_schedule,
        route_of_administration: medicineForm.vaccine_route_of_administration || prev.route_of_administration,
        storage_temperature: medicineForm.storage_temperature || prev.storage_temperature,
        manufacturer: medicineForm.vaccine_manufacturer || prev.manufacturer,
        lot_number: medicineForm.vaccine_lot_number || prev.lot_number,
        contraindications: medicineForm.contraindications || prev.contraindications,
        side_effects: medicineForm.side_effects || prev.side_effects,
        special_instructions: medicineForm.special_instructions || prev.special_instructions
      }));
    }
  }, [activeTab, medicineForm.category]);

  // Effect to sync manufacturer form with main form data
  useEffect(() => {
    setManufacturerForm(prev => ({
      ...prev,
      manufacturer_name: medicineForm.manufacturer_name || prev.manufacturer_name,
      manufacturer_contact: medicineForm.manufacturer_contact_person || prev.manufacturer_contact,
      manufacturer_email: medicineForm.manufacturer_email || prev.manufacturer_email,
      manufacturer_address: medicineForm.manufacturer_address || prev.manufacturer_address,
      manufacturer_phone: medicineForm.manufacturer_phone || prev.manufacturer_phone,
      manufacturer_website: medicineForm.manufacturer_website || prev.manufacturer_website,
      registration_number: medicineForm.manufacturer_reg_no || prev.registration_number,
      license_number: medicineForm.manufacturer_license_no || prev.license_number,
      gmp_certified: medicineForm.mp_certified || prev.gmp_certified,
      iso_certified: medicineForm.o_certified || prev.iso_certified
    }));
  }, [activeTab]);

  const {
    refreshKey,
    isRemoved,
    isExpanded
  } = useCardTitleActions();

  // Tab order for navigation
  const tabOrder = ['basic', 'variations', 'suppliers', 'manufacturers'];
  const currentTabIndex = tabOrder.indexOf(activeTab);

  // Navigation functions
  const goToNextTab = () => {
    const nextIndex = currentTabIndex + 1;
    if (nextIndex < tabOrder.length) {
      setActiveTab(tabOrder[nextIndex]);
    }
  };

  const goToPreviousTab = () => {
    const prevIndex = currentTabIndex - 1;
    if (prevIndex >= 0) {
      setActiveTab(tabOrder[prevIndex]);
    }
  };

  const isLastTab = currentTabIndex === tabOrder.length - 1;
  const isFirstTab = currentTabIndex === 0;

  // Only two categories as requested
  const predefinedCategories = [
    'Vaccine',
    'Medicine'
  ];

  // Vaccine-specific fields
  const [vaccineForm, setVaccineForm] = useState({
    vaccine_type: '',
    age_group: '',
    dosage_schedule: '',
    route_of_administration: '',
    storage_temperature: '',
    manufacturer: '',
    lot_number: '',
    contraindications: '',
    side_effects: '',
    special_instructions: '',
    total_doses: 1,
    mandatory: false,
    medicine_type: '',
    medicine_category: ''
  });

  // Manufacturer fields
  const [manufacturerForm, setManufacturerForm] = useState({
    manufacturer_name: '',
    manufacturer_contact: '',
    manufacturer_email: '',
    manufacturer_address: '',
    manufacturer_phone: '',
    manufacturer_website: '',
    registration_number: '',
    license_number: '',
    gmp_certified: false,
    iso_certified: false
  });

  // Vaccine type options
  const vaccineTypes = [
    'COVID-19',
    'Influenza',
    'Hepatitis A',
    'Hepatitis B',
    'MMR (Measles, Mumps, Rubella)',
    'Varicella (Chickenpox)',
    'DTaP (Diphtheria, Tetanus, Pertussis)',
    'HPV (Human Papillomavirus)',
    'Pneumococcal',
    'Meningococcal',
    'Rotavirus',
    'Polio',
    'Tuberculosis (BCG)',
    'Yellow Fever',
    'Rabies',
    'Other'
  ];

  // Age group options
  const ageGroups = [
    'Infant (0-2 years)',
    'Child (3-12 years)',
    'Adolescent (13-17 years)',
    'Adult (18-64 years)',
    'Senior (65+ years)',
    'All Ages'
  ];

  // Route of administration options
  const routeOptions = [
    'Intramuscular (IM)',
    'Subcutaneous (SC)',
    'Intradermal (ID)',
    'Oral',
    'Nasal',
    'Intravenous (IV)'
  ];

  // Storage temperature options
  const temperatureOptions = [
    '2-8°C (Refrigerated)',
    '-15 to -25°C (Frozen)',
    '-50 to -80°C (Ultra-cold)',
    'Room Temperature (15-25°C)'
  ];

  if (isRemoved) return null;

  const validate = (form = medicineForm) => {
    const newErrors = {};

    // Basic field validations
    if (form.product_id) {
      const existingProduct = medicines.find(med => med.product_id === form.product_id);
      if (existingProduct) {
        newErrors.product_id = 'Product ID already exists. Please use a different ID.';
      }
    }

    if (!form.name) newErrors.name = 'Medicine name is required.';
    if (!form.brand) newErrors.brand = 'Brand is required.';
    if (!form.category) newErrors.category = 'Category is required.';

    if (showSupplierDetails && form.supplier_email && !/\S+@\S+\.\S+/.test(form.supplier_email)) {
      newErrors.supplier_email = 'Email is invalid.';
    }

    // Check for duplicate SKUs
    const skuCounts = {};
    form.variations.forEach(v => {
      if (v.sku) skuCounts[v.sku] = (skuCounts[v.sku] || 0) + 1;
    });

    // Variation validations - FIXED: Initialize as empty array first
    newErrors.variations = [];

    form.variations.forEach((v, index) => {
      const vErr = {};

      // SKU validation
      if (!v.sku) {
        vErr.sku = 'SKU required.';
      } else if (skuCounts[v.sku] > 1) {
        vErr.sku = 'Duplicate SKU.';
      }

      // Stock validation
      if (!v.stock || isNaN(Number(v.stock)) || Number(v.stock) <= 0) {
        vErr.stock = 'Stock must be positive.';
      }

      // Price validation
      if (!v.price || isNaN(Number(v.price)) || Number(v.price) <= 0) {
        vErr.price = 'Price must be a positive number.';
      }

      // Batch code validation
      // if (!v.batch_code) {
      //   vErr.batch_code = 'Batch code required.';
      // }

      // Date validations
      if (!v.expiry_date) {
        vErr.expiry_date = 'Expiry date required.';
      }

      if (!v.mfg_date) {
        vErr.mfg_date = 'Manufacturing date required.';
      }

      // Discount validations
      vErr.discounts = [];
      if (v.discounts && v.discounts.length > 0) {
        v.discounts.forEach((discount, discountIndex) => {
          const dErr = {};

          // Discount value validation
          if (!discount.value || isNaN(Number(discount.value)) || Number(discount.value) <= 0) {
            dErr.value = 'Discount value must be positive.';
          } else if (discount.type === 'percent' && Number(discount.value) > 100) {
            dErr.value = 'Percentage discount cannot exceed 100%.';
          }

          // Quantity validation
          if (!discount.quantity || isNaN(Number(discount.quantity)) || Number(discount.quantity) <= 0) {
            dErr.quantity = 'Quantity must be positive.';
          }

          vErr.discounts[discountIndex] = dErr;
        });
      }

      newErrors.variations[index] = vErr;
    });

    setErrors(newErrors);
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedicineForm(prev => {
      const updated = { ...prev, [name]: value };

      // Show/hide vaccine fields based on category selection
      if (name === 'category') {
        setShowVaccineFields(value === 'Vaccine');
      }

      validate(updated);
      return updated;
    });
  };

  // Handle supplier selection and auto-fill
  const handleSupplierSelect = (supplierName) => {
    const selectedSupplier = suppliers.find(s =>
      s.name === supplierName || s.supplier_name === supplierName
    );

    if (selectedSupplier) {
      setSelectedSupplierId(selectedSupplier.id);
      setMedicineForm(prev => ({
        ...prev,
        supplier: selectedSupplier.name || selectedSupplier.supplier_name || '',
        supplier_contact_person: selectedSupplier.contactPerson || selectedSupplier.contact || selectedSupplier.supplier_contact || '',
        supplier_email: selectedSupplier.email || selectedSupplier.supplier_email || '',
        supplier_contact: selectedSupplier.phone || selectedSupplier.supplier_contact || '',
        supplier_address: selectedSupplier.address || selectedSupplier.supplier_address || ''
      }));
      setShowSupplierDetails(true);
      toast.success('Supplier details auto-filled!');
    }
  };

  // Handle manufacturer selection and auto-fill
  const handleManufacturerSelect = (manufacturerName) => {
    const selectedManufacturer = manufacturers.find(m =>
      m.name === manufacturerName || m.manufacturer_name === manufacturerName
    );

    if (selectedManufacturer) {
      setSelectedManufacturerId(selectedManufacturer.id);
      setManufacturerForm(prev => ({
        ...prev,
        manufacturer_name: selectedManufacturer.name || selectedManufacturer.manufacturer_name || '',
        manufacturer_contact: selectedManufacturer.contactPerson || selectedManufacturer.contact || selectedManufacturer.manufacturer_contact || '',
        manufacturer_email: selectedManufacturer.email || selectedManufacturer.manufacturer_email || '',
        manufacturer_phone: selectedManufacturer.phone || selectedManufacturer.manufacturer_phone || '',
        manufacturer_address: selectedManufacturer.address || selectedManufacturer.manufacturer_address || '',
        manufacturer_website: selectedManufacturer.website || selectedManufacturer.manufacturer_website || '',
        registration_number: selectedManufacturer.registration_number || selectedManufacturer.reg_no || '',
        license_number: selectedManufacturer.license_number || selectedManufacturer.license_no || '',
        gmp_certified: selectedManufacturer.gmp_certified || false,
        iso_certified: selectedManufacturer.iso_certified || false
      }));

      // Also update the main medicine form
      setMedicineForm(prev => ({
        ...prev,
        manufacturer_name: selectedManufacturer.name || selectedManufacturer.manufacturer_name || '',
        manufacturer_contact_person: selectedManufacturer.contactPerson || selectedManufacturer.contact || selectedManufacturer.manufacturer_contact || '',
        manufacturer_email: selectedManufacturer.email || selectedManufacturer.manufacturer_email || '',
        manufacturer_phone: selectedManufacturer.phone || selectedManufacturer.manufacturer_phone || '',
        manufacturer_address: selectedManufacturer.address || selectedManufacturer.manufacturer_address || '',
        manufacturer_website: selectedManufacturer.website || selectedManufacturer.manufacturer_website || '',
        manufacturer_reg_no: selectedManufacturer.registration_number || selectedManufacturer.reg_no || '',
        manufacturer_license_no: selectedManufacturer.license_number || selectedManufacturer.license_no || '',
        mp_certified: selectedManufacturer.gmp_certified || false,
        o_certified: selectedManufacturer.iso_certified || false
      }));
      toast.success('Manufacturer details auto-filled!');
    }
  };

  // Handle vaccine field changes
  const handleVaccineFieldChange = (field, value) => {
    setVaccineForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Also update the main medicine form to persist the data
    setMedicineForm(prev => ({
      ...prev,
      [`vaccine_${field}`]: value,
      ...(field === 'medicine_type' && { medicine_type: value }),
      ...(field === 'medicine_category' && { medicine_category: value })
    }));
  };

  // Handle manufacturer field changes
  const handleManufacturerFieldChange = (field, value) => {
    setManufacturerForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Also update the main medicine form to persist the data
    const fieldMapping = {
      manufacturer_name: 'manufacturer_name',
      manufacturer_contact: 'manufacturer_contact_person',
      manufacturer_email: 'manufacturer_email',
      manufacturer_address: 'manufacturer_address',
      manufacturer_phone: 'manufacturer_phone',
      manufacturer_website: 'manufacturer_website',
      registration_number: 'manufacturer_reg_no',
      license_number: 'manufacturer_license_no',
      gmp_certified: 'mp_certified',
      iso_certified: 'o_certified'
    };

    if (fieldMapping[field]) {
      setMedicineForm(prev => ({
        ...prev,
        [fieldMapping[field]]: value
      }));
    }
  };

  // Category is now handled directly through the input with datalist

  const handleVariationChange = (index, field, value) => {
    const updated = [...medicineForm.variations];
    updated[index][field] = value;
    setMedicineForm(prev => {
      const newForm = { ...prev, variations: updated };
      validate(newForm);
      return newForm;
    });
  };

  const handleDiscountChange = (variationIndex, discountIndex, field, value) => {
    const updatedVariations = [...medicineForm.variations];
    const updatedDiscounts = [...updatedVariations[variationIndex].discounts];

    updatedDiscounts[discountIndex] = {
      ...updatedDiscounts[discountIndex],
      [field]: value
    };

    updatedVariations[variationIndex].discounts = updatedDiscounts;

    setMedicineForm(prev => {
      const newForm = { ...prev, variations: updatedVariations };
      validate(newForm);
      return newForm;
    });
  };

  const addDiscount = (variationIndex) => {
    const updatedVariations = [...medicineForm.variations];
    updatedVariations[variationIndex].discounts.push({
      value: '',
      type: 'flat',
      quantity: 1
    });

    setMedicineForm(prev => ({
      ...prev,
      variations: updatedVariations
    }));
  };

  const removeDiscount = (variationIndex, discountIndex) => {
    const updatedVariations = [...medicineForm.variations];
    updatedVariations[variationIndex].discounts.splice(discountIndex, 1);

    setMedicineForm(prev => ({
      ...prev,
      variations: updatedVariations
    }));
  };

  const toggleDiscountDetails = (variationIndex) => {
    setShowDiscountDetails(prev => ({
      ...prev,
      [variationIndex]: !prev[variationIndex]
    }));
  };

  const addVariationRow = () => {
    setMedicineForm(prev => ({
      ...prev,
      variations: [...prev.variations, { sku: '', stock: '', unit: '', price: '', batch_code: '', expiry_date: '', mfg_date: '', status: true, discounts: [] }]
    }));
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !medicineForm.keywords.includes(keywordInput.trim())) {
      setMedicineForm(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove) => {
    setMedicineForm(prev => ({
      ...prev,
      keywords: prev.keywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  const handleKeywordKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleKeywordSuggestionClick = (suggestion) => {
    if (!medicineForm.keywords.includes(suggestion)) {
      setMedicineForm(prev => ({
        ...prev,
        keywords: [...prev.keywords, suggestion]
      }));
    }
  };

  const removeKeyword = (index) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index),
    }));
  };

  const deleteVariationRow = (index) => {
    if (index === 0) return;
    const updated = medicineForm.variations.filter((_, i) => i !== index);
    setMedicineForm(prev => ({ ...prev, variations: updated }));
  };

  const handleUnitChange = (index, value) => {
    if (value === 'custom') {
      setCustomUnits(prev => ({ ...prev, [index]: '' }));
      handleVariationChange(index, 'unit', '');
    } else {
      setCustomUnits(prev => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
      handleVariationChange(index, 'unit', value);
    }
  };

  const handleCustomUnitChange = (index, value) => {
    setCustomUnits(prev => ({ ...prev, [index]: value }));
    handleVariationChange(index, 'unit', value);
  };

  const { addMedicineNew, medicines } = useMedicines();

  // Use only the predefined categories (Vaccine and Medicine)
  const allCategories = predefinedCategories;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only allow submission from the variations tab (last tab)
    if (activeTab !== 'manufacturers') {
      toast.error('Please complete all steps before submitting.');
      return;
    }

    const validation = validate();
    const hasErrors =
      validation.name ||
      validation.brand ||
      validation.category ||
      validation.supplier_email ||
      (validation.variations && validation.variations.some(v =>
        Object.keys(v).length > 0 &&
        (v.sku || v.stock || v.price || v.batch_code || v.expiry_date || v.mfg_date ||
          (v.discounts && v.discounts.some(d => d.value || d.quantity)))
      ));

    if (hasErrors) {
      toast.error('Please fix validation errors.');
      return;
    }
    for (const variation of medicineForm.variations) {
      if (!variation.sku || !variation.stock || !variation.price || !variation.batch_code || !variation.expiry_date || !variation.mfg_date) {
        toast.error('All variation fields must be filled.');
        return;
      }
    }

    try {
      // Base payload structure for both Medicine and Vaccine
      let submissionData = {
        name: medicineForm.name,
        brand: medicineForm.brand,
        category: medicineForm.category,
        notes: medicineForm.notes || '',
        status: medicineForm.status,
        keywords: medicineForm.keywords, // Array of strings
        // Include medicine_type and medicine_category for both categories from dropdown selections
        medicine_type: medicineForm.medicine_type || '',
        medicine_category: medicineForm.medicine_category || '',
        variations: medicineForm.variations.map(variation => ({
          sku: variation.sku,
          stock: parseInt(variation.stock),
          unit: variation.unit,
          price: variation.price,
          batch_code: variation.batch_code,
          expiry_date: variation.expiry_date,
          mfg_date: variation.mfg_date,
          status: variation.status,
          supplier_id: selectedSupplierId,
          manufacturer_id: selectedManufacturerId,
          discounts: variation.discounts.map(discount => ({
            value: parseFloat(discount.value),
            type: discount.type,
            quantity: parseInt(discount.quantity)
          }))
        }))
      };

      // Add vaccine-specific fields only if category is "Vaccine"
      if (medicineForm.category === 'Vaccine') {
        submissionData = {
          ...submissionData,
          vaccine_type: vaccineForm.vaccine_type || '',
          age_grp: vaccineForm.age_group || '',
          storage_temperature: vaccineForm.storage_temperature || '',
          dose_interval: vaccineForm.dosage_schedule || '',
          total_doses: parseInt(vaccineForm.total_doses) || 1,
          mandatory: vaccineForm.mandatory || false,
          side_effects: vaccineForm.side_effects || '',
          special_instructions: vaccineForm.special_instructions || ''
        };
      }

      // Add medicine-specific fields only if category is "Medicine"
      if (medicineForm.category === 'Medicine') {
        submissionData = {
          ...submissionData,
          dosage_form: medicineForm.dosage_form || '',
          strength: medicineForm.strength || '',
          special_instructions: medicineForm.special_instructions || ''
        };
      }

      console.log('Submission Data:', submissionData);

      const result = await addMedicineNew(submissionData);
      console.log("Result Data", result);

      if (result.success) {
        toast.success(`${medicineForm.category} added successfully!`);

        // Reset form after successful submission
        setMedicineForm({
          product_id: '',
          name: '',
          brand: '',
          category: '',
          notes: '',
          status: true,
          keywords: [],
          supplier: '',
          supplier_contact: '',
          supplier_email: '',
          supplier_contact_person: '',
          supplier_address: '',
          manufacturer_name: '',
          manufacturer_contact_person: '',
          manufacturer_email: '',
          manufacturer_phone: '',
          manufacturer_reg_no: '',
          manufacturer_license_no: '',
          manufacturer_website: '',
          mp_certified: false,
          o_certified: false,
          manufacturer_address: '',
          vaccine_type: '',
          age_grp: '',
          route_administration: '',
          storage_temperature: '',
          vaccine_manufacturer: '',
          lot_no: '',
          dose_schedule: '',
          dose_interval: '',
          total_doses: '',
          special_instructions: '',
          contraindications: '',
          side_effects: '',
          antibiotic_class: '',
          spectrum: '',
          dosage_form: '',
          strength: '',
          treatment_duration: '',
          food_interaction: '',
          precautions: '',
          pain_type: '',
          active_ingredient: '',
          dose_form: '',
          maximum_daily_dose: '',
          age_restrictions: '',
          medicine_type: '',
          medicine_category: '',
          variations: [{ sku: '', stock: '', unit: '', price: '', batch_code: '', expiry_date: '', mfg_date: '', status: true, discounts: [] }]
        });

        // Reset vaccine form
        setVaccineForm({
          vaccine_type: '',
          age_group: '',
          dosage_schedule: '',
          route_of_administration: '',
          storage_temperature: '',
          manufacturer: '',
          lot_number: '',
          contraindications: '',
          side_effects: '',
          special_instructions: '',
          total_doses: 1,
          mandatory: false,
          medicine_type: '',
          medicine_category: ''
        });

        // Reset manufacturer form
        setManufacturerForm({
          manufacturer_name: '',
          manufacturer_contact: '',
          manufacturer_email: '',
          manufacturer_address: '',
          manufacturer_phone: '',
          manufacturer_website: '',
          registration_number: '',
          license_number: '',
          gmp_certified: false,
          iso_certified: false
        });

        setShowVaccineFields(false);
        setShowSupplierDetails(false);
        setShowBatchDetails({});
        setSelectedSupplierId(null);
        setSelectedManufacturerId(null);
        setActiveTab('basic'); // Reset to first tab
      } else {
        toast.error(`Error adding ${medicineForm.category.toLowerCase()}: ${result.error}`);
      }
    } catch (error) {
      console.error(`Error adding ${medicineForm.category.toLowerCase()}:`, error);
      toast.error(`Error adding ${medicineForm.category.toLowerCase()}: ${error.message}`);
    }
  };

  const getDiscountDisplay = (discount) => {
    if (discount.type === 'flat') {
      return `$${discount.value} off for ${discount.quantity}+ items`;
    } else {
      return `${discount.value}% off for ${discount.quantity}+ items`;
    }
  };

  return (
    <>
      <PageHeader />
      <div className="main-content">
        <div className="row">
          <div className="col-12">
            <div className={`card stretch stretch-full ${isExpanded ? 'card-expand' : ''} ${refreshKey ? 'card-loading' : ''}`}>
              <CardHeader title="Add Product" />
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {/* Tab Navigation */}
                  <div className="row mb-3">
                    <div className="col-12">
                      <ul className="nav nav-tabs" role="tablist">
                        <li className="nav-item" role="presentation">
                          <span className={`nav-link ${activeTab === 'basic' ? 'active' : ''}`} onClick={() => setActiveTab('basic')}>
                            <span className="badge bg-primary me-2">1</span>
                            Basic Information
                          </span>
                        </li>
                        <li className="nav-item" role="presentation">
                          <span className={`nav-link ${activeTab === 'variations' ? 'active' : ''}`} onClick={() => setActiveTab('variations')}>
                            <span className="badge bg-primary me-2">2</span>
                            Variations
                          </span>
                        </li>
                        <li className="nav-item" role="presentation">
                          <span className={`nav-link ${activeTab === 'suppliers' ? 'active' : ''}`} onClick={() => setActiveTab('suppliers')}>
                            <span className="badge bg-primary me-2">3</span>
                            Suppliers
                          </span>
                        </li>
                        <li className="nav-item" role="presentation">
                          <span className={`nav-link ${activeTab === 'manufacturers' ? 'active' : ''}`} onClick={() => setActiveTab('manufacturers')}>
                            <span className="badge bg-primary me-2">4</span>
                            Manufacturers
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Basic Information Tab */}
                  {activeTab === 'basic' && (
                    <>
                      <div className="row mt-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>Product ID (Optional)</label>
                            <input
                              type="text"
                              name="product_id"
                              value={medicineForm.product_id}
                              onChange={handleChange}
                              placeholder="Enter custom Product ID"
                              className="form-control"
                            />
                            {errors.product_id && <div className="invalid-feedback d-block">{errors.product_id}</div>}
                            <small className="form-text text-muted">
                              Leave blank to auto-generate a product ID
                            </small>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>Product Name</label>
                            <input type="text" name="name" value={medicineForm.name} onChange={handleChange} placeholder="Enter Product Name" className={classNames("form-control", { 'is-invalid': errors.name })} />
                            {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>Brand</label>
                            <input type="text" name="brand" value={medicineForm.brand} onChange={handleChange} placeholder="Enter Brand" className={classNames("form-control", { 'is-invalid': errors.brand })} />
                            {errors.brand && <div className="invalid-feedback d-block">{errors.brand}</div>}
                          </div>
                        </div>
                      </div>

                      <div className="row mt-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>Category</label>
                            <select
                              name="category"
                              value={medicineForm.category}
                              onChange={handleChange}
                              className={classNames("form-control", { 'is-invalid': errors.category })}
                            >
                              <option value="">Select Category</option>
                              {allCategories.map(category => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                            {errors.category && <div className="invalid-feedback d-block">{errors.category}</div>}
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>Status</label>
                            <div className="mt-2">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="mainStatus"
                                  checked={medicineForm.status}
                                  onChange={e => setMedicineForm(prev => ({ ...prev, status: e.target.checked }))}
                                />
                                <label className="form-check-label ms-1" htmlFor="mainStatus">
                                  {medicineForm.status ? 'Active' : 'Inactive'}
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label>Keywords</label>
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control"
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyPress={handleKeywordKeyPress}
                                placeholder="Enter keyword and press Enter or click Add"
                              />
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={handleAddKeyword}
                                disabled={!keywordInput.trim()}
                              >
                                Add
                              </button>
                            </div>
                            {medicineForm.keywords.length > 0 && (
                              <div className="mt-2">
                                <div className="d-flex flex-wrap gap-2">
                                  {medicineForm.keywords.map((keyword, index) => (
                                    <span key={index} className="badge bg-primary position-relative d-flex align-items-center">
                                      {keyword}
                                      <button
                                        type="button"
                                        className="btn-close btn-close-white ms-1"
                                        onClick={() => handleRemoveKeyword(keyword)}
                                        style={{ fontSize: '0.7rem', padding: '0.2rem' }}
                                        aria-label="Remove keyword"
                                      >
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="row mt-3">
                        <div className="col-12">
                          <div className="form-group">
                            <label>Notes</label>
                            <textarea
                              className="form-control"
                              rows="3"
                              name="notes"
                              value={medicineForm.notes}
                              onChange={handleChange}
                              placeholder="Enter any additional notes or description"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Vaccine-specific fields */}
                      {showVaccineFields && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-primary text-white">
                                <h6 className="mb-0">Vaccine Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Vaccine Type</label>
                                      <select
                                        className="form-control"
                                        value={vaccineForm.vaccine_type}
                                        onChange={(e) => handleVaccineFieldChange('vaccine_type', e.target.value)}
                                      >
                                        <option value="">Select Vaccine Type</option>
                                        {vaccineTypes.map(type => (
                                          <option key={type} value={type}>{type}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Age Group</label>
                                      <select
                                        className="form-control"
                                        value={vaccineForm.age_group}
                                        onChange={(e) => handleVaccineFieldChange('age_group', e.target.value)}
                                      >
                                        <option value="">Select Age Group</option>
                                        {ageGroups.map(group => (
                                          <option key={group} value={group}>{group}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                  {/* <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Route of Administration</label>
                                      <select
                                        className="form-control"
                                        value={vaccineForm.route_of_administration}
                                        onChange={(e) => handleVaccineFieldChange('route_of_administration', e.target.value)}
                                      >
                                        <option value="">Select Route</option>
                                        {routeOptions.map(route => (
                                          <option key={route} value={route}>{route}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div> */}
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Storage Temperature</label>
                                      <select
                                        className="form-control"
                                        value={vaccineForm.storage_temperature}
                                        onChange={(e) => handleVaccineFieldChange('storage_temperature', e.target.value)}
                                      >
                                        <option value="">Select Temperature</option>
                                        {temperatureOptions.map(temp => (
                                          <option key={temp} value={temp}>{temp}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dose Interval</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={vaccineForm.dosage_schedule}
                                        onChange={(e) => handleVaccineFieldChange('dosage_schedule', e.target.value)}
                                        placeholder="e.g., 0, 1, 6 months"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Total Doses *</label>
                                      <input
                                        type="number"
                                        className="form-control"
                                        value={vaccineForm.total_doses}
                                        onChange={(e) => handleVaccineFieldChange('total_doses', e.target.value)}
                                        placeholder="Enter total number of doses"
                                        min="1"
                                        required
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Mandatory Vaccination</label>
                                      <div className="mt-2">
                                        <div className="form-check form-switch">
                                          <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="mandatoryVaccine"
                                            checked={vaccineForm.mandatory}
                                            onChange={(e) => handleVaccineFieldChange('mandatory', e.target.checked)}
                                          />
                                          <label className="form-check-label ms-1" htmlFor="mandatoryVaccine">
                                            {vaccineForm.mandatory ? 'Mandatory' : 'Optional'}
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  {/* <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Medicine Type</label>
                                      <select
                                        className="form-control"
                                        value={vaccineForm.medicine_type}
                                        onChange={(e) => handleVaccineFieldChange('medicine_type', e.target.value)}
                                      >
                                        <option value="">Select Medicine Type</option>
                                        <option value="Injection">Injection</option>
                                        <option value="Oral">Oral</option>
                                        <option value="Nasal Spray">Nasal Spray</option>
                                        <option value="Patch">Patch</option>
                                        <option value="Other">Other</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Medicine Category</label>
                                      <select
                                        className="form-control"
                                        value={vaccineForm.medicine_category}
                                        onChange={(e) => handleVaccineFieldChange('medicine_category', e.target.value)}
                                      >
                                        <option value="">Select Category</option>
                                        <option value="Immunization">Immunization</option>
                                        <option value="Preventive">Preventive</option>
                                        <option value="Prophylactic">Prophylactic</option>
                                        <option value="Therapeutic">Therapeutic</option>
                                        <option value="Other">Other</option>
                                      </select>
                                    </div>
                                  </div> */}
                                  {/* <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Manufacturer</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={vaccineForm.manufacturer}
                                        onChange={(e) => handleVaccineFieldChange('manufacturer', e.target.value)}
                                        placeholder="Enter manufacturer"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Lot Number</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={vaccineForm.lot_number}
                                        onChange={(e) => handleVaccineFieldChange('lot_number', e.target.value)}
                                        placeholder="Enter lot number"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Schedule</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={vaccineForm.dosage_schedule}
                                        onChange={(e) => handleVaccineFieldChange('dosage_schedule', e.target.value)}
                                        placeholder="e.g., 2 doses, 4 weeks apart"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Special Instructions</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={vaccineForm.special_instructions}
                                        onChange={(e) => handleVaccineFieldChange('special_instructions', e.target.value)}
                                        placeholder="e.g., Shake well before use"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Contraindications</label>
                                      <textarea
                                        className="form-control"
                                        rows="2"
                                        value={vaccineForm.contraindications}
                                        onChange={(e) => handleVaccineFieldChange('contraindications', e.target.value)}
                                        placeholder="List contraindications"
                                      />
                                    </div>
                                  </div> */}
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Side Effects</label>
                                      <textarea
                                        className="form-control"
                                        rows="2"
                                        value={vaccineForm.side_effects}
                                        onChange={(e) => handleVaccineFieldChange('side_effects', e.target.value)}
                                        placeholder="List common side effects"
                                      />
                                    </div>
                                  </div>
                                  {/* <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Special Instructions</label>
                                      <textarea
                                        className="form-control"
                                        rows="2"
                                        value={vaccineForm.special_instructions}
                                        onChange={(e) => handleVaccineFieldChange('special_instructions', e.target.value)}
                                        placeholder="e.g., Administer intramuscularly in the deltoid"
                                      />
                                    </div>
                                  </div> */}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Medicine-specific fields */}
                      {medicineForm.category === 'Medicine' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-success text-white">
                                <h6 className="mb-0">Medicine Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Medicine Type</label>
                                      <select
                                        className="form-control"
                                        value={medicineForm.medicine_type}
                                        onChange={handleChange}
                                        name="medicine_type"
                                      >
                                        <option value="">Select Medicine Type</option>
                                        <option value="Tablet">Tablet</option>
                                        <option value="Capsule">Capsule</option>
                                        <option value="Syrup">Syrup</option>
                                        <option value="Injection">Injection</option>
                                        <option value="Cream">Cream</option>
                                        <option value="Ointment">Ointment</option>
                                        <option value="Drops">Drops</option>
                                        <option value="Inhaler">Inhaler</option>
                                        <option value="Other">Other</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Medicine Category</label>
                                      <select
                                        className="form-control"
                                        value={medicineForm.medicine_category}
                                        onChange={handleChange}
                                        name="medicine_category"
                                      >
                                        <option value="">Select Category</option>
                                        <option value="Antibiotic">Antibiotic</option>
                                        <option value="Painkiller">Painkiller</option>
                                        <option value="Antiviral">Antiviral</option>
                                        <option value="Antifungal">Antifungal</option>
                                        <option value="Vitamin">Vitamin</option>
                                        <option value="Supplement">Supplement</option>
                                        <option value="Antiseptic">Antiseptic</option>
                                        <option value="Other">Other</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={medicineForm.dosage_form}
                                        onChange={handleChange}
                                        name="dosage_form"
                                        placeholder="e.g., 500mg, 10ml"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={medicineForm.strength}
                                        onChange={handleChange}
                                        name="strength"
                                        placeholder="e.g., 250mg, 5mg/ml"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Special Instructions</label>
                                      <textarea
                                        className="form-control"
                                        rows="2"
                                        value={medicineForm.special_instructions}
                                        onChange={handleChange}
                                        name="special_instructions"
                                        placeholder="e.g., Take with food, Avoid alcohol"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Antibiotics-specific fields */}
                      {/* {medicineForm.category === 'Antibiotics' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-warning text-dark">
                                <h6 className="mb-0">Antibiotic Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Antibiotic Class</label>
                                      <select className="form-control">
                                        <option value="">Select Antibiotic Class</option>
                                        <option value="penicillin">Penicillin</option>
                                        <option value="cephalosporin">Cephalosporin</option>
                                        <option value="macrolide">Macrolide</option>
                                        <option value="tetracycline">Tetracycline</option>
                                        <option value="fluoroquinolone">Fluoroquinolone</option>
                                        <option value="aminoglycoside">Aminoglycoside</option>
                                        <option value="sulfonamide">Sulfonamide</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Spectrum</label>
                                      <select className="form-control">
                                        <option value="">Select Spectrum</option>
                                        <option value="broad">Broad Spectrum</option>
                                        <option value="narrow">Narrow Spectrum</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="capsule">Capsule</option>
                                        <option value="liquid">Liquid</option>
                                        <option value="injection">Injection</option>
                                        <option value="cream">Cream</option>
                                        <option value="ointment">Ointment</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 500mg, 250mg/5ml"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Duration of Treatment</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 7-10 days"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Food Interaction</label>
                                      <select className="form-control">
                                        <option value="">Select Food Interaction</option>
                                        <option value="take_with_food">Take with Food</option>
                                        <option value="take_on_empty_stomach">Take on Empty Stomach</option>
                                        <option value="no_restriction">No Restriction</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Precautions</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List important precautions and warnings"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Pain Relief-specific fields */}
                      {/* {medicineForm.category === 'Pain Relief' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-info text-white">
                                <h6 className="mb-0">Pain Relief Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Pain Type</label>
                                      <select className="form-control">
                                        <option value="">Select Pain Type</option>
                                        <option value="headache">Headache</option>
                                        <option value="muscle_pain">Muscle Pain</option>
                                        <option value="joint_pain">Joint Pain</option>
                                        <option value="dental_pain">Dental Pain</option>
                                        <option value="fever">Fever</option>
                                        <option value="inflammation">Inflammation</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Active Ingredient</label>
                                      <select className="form-control">
                                        <option value="">Select Active Ingredient</option>
                                        <option value="paracetamol">Paracetamol</option>
                                        <option value="ibuprofen">Ibuprofen</option>
                                        <option value="aspirin">Aspirin</option>
                                        <option value="diclofenac">Diclofenac</option>
                                        <option value="naproxen">Naproxen</option>
                                        <option value="codeine">Codeine</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="capsule">Capsule</option>
                                        <option value="liquid">Liquid</option>
                                        <option value="gel">Gel</option>
                                        <option value="cream">Cream</option>
                                        <option value="spray">Spray</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 500mg, 400mg"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Maximum Daily Dose</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 4 tablets per day"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Age Restriction</label>
                                      <select className="form-control">
                                        <option value="">Select Age Restriction</option>
                                        <option value="adults_only">Adults Only</option>
                                        <option value="children_allowed">Children Allowed</option>
                                        <option value="consult_doctor">Consult Doctor</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Side Effects</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List common side effects"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Vitamins-specific fields */}
                      {/* {medicineForm.category === 'Vitamins' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-success text-white">
                                <h6 className="mb-0">Vitamin Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Vitamin Type</label>
                                      <select className="form-control">
                                        <option value="">Select Vitamin Type</option>
                                        <option value="vitamin_a">Vitamin A</option>
                                        <option value="vitamin_b">Vitamin B Complex</option>
                                        <option value="vitamin_c">Vitamin C</option>
                                        <option value="vitamin_d">Vitamin D</option>
                                        <option value="vitamin_e">Vitamin E</option>
                                        <option value="vitamin_k">Vitamin K</option>
                                        <option value="multivitamin">Multivitamin</option>
                                        <option value="mineral">Mineral Supplement</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="capsule">Capsule</option>
                                        <option value="liquid">Liquid</option>
                                        <option value="gummy">Gummy</option>
                                        <option value="powder">Powder</option>
                                        <option value="chewable">Chewable</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 1000 IU, 500mg"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Recommended Age</label>
                                      <select className="form-control">
                                        <option value="">Select Age Group</option>
                                        <option value="infants">Infants (0-2 years)</option>
                                        <option value="children">Children (3-12 years)</option>
                                        <option value="adolescents">Adolescents (13-18 years)</option>
                                        <option value="adults">Adults (19+ years)</option>
                                        <option value="seniors">Seniors (65+ years)</option>
                                        <option value="all_ages">All Ages</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Frequency</label>
                                      <select className="form-control">
                                        <option value="">Select Frequency</option>
                                        <option value="daily">Daily</option>
                                        <option value="twice_daily">Twice Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="as_needed">As Needed</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Storage Requirements</label>
                                      <select className="form-control">
                                        <option value="">Select Storage</option>
                                        <option value="room_temperature">Room Temperature</option>
                                        <option value="refrigerated">Refrigerated</option>
                                        <option value="cool_dry_place">Cool, Dry Place</option>
                                        <option value="away_from_light">Away from Light</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Benefits</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List health benefits and uses"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Diabetes Medications-specific fields */}
                      {/* {medicineForm.category === 'Diabetes Medications' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-danger text-white">
                                <h6 className="mb-0">Diabetes Medication Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Medication Type</label>
                                      <select className="form-control">
                                        <option value="">Select Medication Type</option>
                                        <option value="insulin">Insulin</option>
                                        <option value="oral_antidiabetic">Oral Antidiabetic</option>
                                        <option value="glp1_receptor">GLP-1 Receptor Agonist</option>
                                        <option value="sglt2_inhibitor">SGLT2 Inhibitor</option>
                                        <option value="dpp4_inhibitor">DPP-4 Inhibitor</option>
                                        <option value="metformin">Metformin</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Insulin Type (if applicable)</label>
                                      <select className="form-control">
                                        <option value="">Select Insulin Type</option>
                                        <option value="rapid_acting">Rapid Acting</option>
                                        <option value="short_acting">Short Acting</option>
                                        <option value="intermediate_acting">Intermediate Acting</option>
                                        <option value="long_acting">Long Acting</option>
                                        <option value="premixed">Premixed</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="capsule">Capsule</option>
                                        <option value="injection">Injection</option>
                                        <option value="liquid">Liquid</option>
                                        <option value="inhaler">Inhaler</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 500mg, 10 units/ml"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Administration Time</label>
                                      <select className="form-control">
                                        <option value="">Select Administration Time</option>
                                        <option value="before_meals">Before Meals</option>
                                        <option value="with_meals">With Meals</option>
                                        <option value="after_meals">After Meals</option>
                                        <option value="bedtime">Bedtime</option>
                                        <option value="morning">Morning</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Blood Sugar Monitoring</label>
                                      <select className="form-control">
                                        <option value="">Select Monitoring Frequency</option>
                                        <option value="daily">Daily</option>
                                        <option value="multiple_daily">Multiple Times Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="as_needed">As Needed</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Precautions & Warnings</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List important precautions, hypoglycemia risks, and warnings"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Cardiovascular Medications-specific fields */}
                      {/* {medicineForm.category === 'Cardiovascular' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-dark text-white">
                                <h6 className="mb-0">Cardiovascular Medication Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Medication Class</label>
                                      <select className="form-control">
                                        <option value="">Select Medication Class</option>
                                        <option value="ace_inhibitor">ACE Inhibitor</option>
                                        <option value="angiotensin_receptor">Angiotensin Receptor Blocker</option>
                                        <option value="beta_blocker">Beta Blocker</option>
                                        <option value="calcium_channel">Calcium Channel Blocker</option>
                                        <option value="diuretic">Diuretic</option>
                                        <option value="statin">Statin</option>
                                        <option value="antiplatelet">Antiplatelet</option>
                                        <option value="anticoagulant">Anticoagulant</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Indication</label>
                                      <select className="form-control">
                                        <option value="">Select Indication</option>
                                        <option value="hypertension">Hypertension</option>
                                        <option value="heart_failure">Heart Failure</option>
                                        <option value="coronary_artery">Coronary Artery Disease</option>
                                        <option value="arrhythmia">Arrhythmia</option>
                                        <option value="hyperlipidemia">Hyperlipidemia</option>
                                        <option value="stroke_prevention">Stroke Prevention</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="capsule">Capsule</option>
                                        <option value="liquid">Liquid</option>
                                        <option value="injection">Injection</option>
                                        <option value="patch">Transdermal Patch</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 25mg, 10mg"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Administration Time</label>
                                      <select className="form-control">
                                        <option value="">Select Administration Time</option>
                                        <option value="morning">Morning</option>
                                        <option value="evening">Evening</option>
                                        <option value="twice_daily">Twice Daily</option>
                                        <option value="with_meals">With Meals</option>
                                        <option value="empty_stomach">Empty Stomach</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Monitoring Required</label>
                                      <select className="form-control">
                                        <option value="">Select Monitoring</option>
                                        <option value="blood_pressure">Blood Pressure</option>
                                        <option value="heart_rate">Heart Rate</option>
                                        <option value="kidney_function">Kidney Function</option>
                                        <option value="liver_function">Liver Function</option>
                                        <option value="blood_tests">Blood Tests</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Precautions & Side Effects</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List important precautions, side effects, and drug interactions"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Respiratory Medications-specific fields */}
                      {/* {medicineForm.category === 'Respiratory' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-primary text-white">
                                <h6 className="mb-0">Respiratory Medication Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Medication Type</label>
                                      <select className="form-control">
                                        <option value="">Select Medication Type</option>
                                        <option value="bronchodilator">Bronchodilator</option>
                                        <option value="corticosteroid">Corticosteroid</option>
                                        <option value="combination">Combination Inhaler</option>
                                        <option value="antihistamine">Antihistamine</option>
                                        <option value="decongestant">Decongestant</option>
                                        <option value="expectorant">Expectorant</option>
                                        <option value="mucolytic">Mucolytic</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Indication</label>
                                      <select className="form-control">
                                        <option value="">Select Indication</option>
                                        <option value="asthma">Asthma</option>
                                        <option value="copd">COPD</option>
                                        <option value="bronchitis">Bronchitis</option>
                                        <option value="allergic_rhinitis">Allergic Rhinitis</option>
                                        <option value="sinusitis">Sinusitis</option>
                                        <option value="cough">Cough</option>
                                        <option value="cystic_fibrosis">Cystic Fibrosis</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="inhaler">Inhaler</option>
                                        <option value="nebulizer">Nebulizer Solution</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="liquid">Liquid</option>
                                        <option value="nasal_spray">Nasal Spray</option>
                                        <option value="injection">Injection</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 100mcg, 250mcg"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Administration Frequency</label>
                                      <select className="form-control">
                                        <option value="">Select Frequency</option>
                                        <option value="as_needed">As Needed</option>
                                        <option value="twice_daily">Twice Daily</option>
                                        <option value="four_times_daily">Four Times Daily</option>
                                        <option value="every_4_hours">Every 4 Hours</option>
                                        <option value="every_6_hours">Every 6 Hours</option>
                                        <option value="daily">Daily</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Device Type (if inhaler)</label>
                                      <select className="form-control">
                                        <option value="">Select Device Type</option>
                                        <option value="mdi">Metered Dose Inhaler</option>
                                        <option value="dpi">Dry Powder Inhaler</option>
                                        <option value="soft_mist">Soft Mist Inhaler</option>
                                        <option value="nebulizer">Nebulizer</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Instructions & Precautions</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List administration instructions, device cleaning, and precautions"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Dermatological Medications-specific fields */}
                      {/* {medicineForm.category === 'Dermatological' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-secondary text-white">
                                <h6 className="mb-0">Dermatological Medication Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Medication Type</label>
                                      <select className="form-control">
                                        <option value="">Select Medication Type</option>
                                        <option value="corticosteroid">Corticosteroid</option>
                                        <option value="antibiotic">Antibiotic</option>
                                        <option value="antifungal">Antifungal</option>
                                        <option value="antiviral">Antiviral</option>
                                        <option value="retinoid">Retinoid</option>
                                        <option value="immunomodulator">Immunomodulator</option>
                                        <option value="moisturizer">Moisturizer</option>
                                        <option value="sunscreen">Sunscreen</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Indication</label>
                                      <select className="form-control">
                                        <option value="">Select Indication</option>
                                        <option value="eczema">Eczema</option>
                                        <option value="psoriasis">Psoriasis</option>
                                        <option value="acne">Acne</option>
                                        <option value="fungal_infection">Fungal Infection</option>
                                        <option value="bacterial_infection">Bacterial Infection</option>
                                        <option value="viral_infection">Viral Infection</option>
                                        <option value="sunburn">Sunburn</option>
                                        <option value="dry_skin">Dry Skin</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="cream">Cream</option>
                                        <option value="ointment">Ointment</option>
                                        <option value="gel">Gel</option>
                                        <option value="lotion">Lotion</option>
                                        <option value="solution">Solution</option>
                                        <option value="shampoo">Shampoo</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="capsule">Capsule</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 1%, 0.5%, 2.5%"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Application Frequency</label>
                                      <select className="form-control">
                                        <option value="">Select Frequency</option>
                                        <option value="once_daily">Once Daily</option>
                                        <option value="twice_daily">Twice Daily</option>
                                        <option value="three_times_daily">Three Times Daily</option>
                                        <option value="as_needed">As Needed</option>
                                        <option value="weekly">Weekly</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Body Area</label>
                                      <select className="form-control">
                                        <option value="">Select Body Area</option>
                                        <option value="face">Face</option>
                                        <option value="scalp">Scalp</option>
                                        <option value="body">Body</option>
                                        <option value="hands">Hands</option>
                                        <option value="feet">Feet</option>
                                        <option value="genital">Genital Area</option>
                                        <option value="all_over">All Over</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Application Instructions</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List application instructions, precautions, and side effects"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Mental Health Medications-specific fields */}
                      {/* {medicineForm.category === 'Mental Health' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-info text-white">
                                <h6 className="mb-0">Mental Health Medication Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Medication Class</label>
                                      <select className="form-control">
                                        <option value="">Select Medication Class</option>
                                        <option value="antidepressant">Antidepressant</option>
                                        <option value="antianxiety">Antianxiety</option>
                                        <option value="antipsychotic">Antipsychotic</option>
                                        <option value="mood_stabilizer">Mood Stabilizer</option>
                                        <option value="stimulant">Stimulant</option>
                                        <option value="sedative">Sedative</option>
                                        <option value="anticonvulsant">Anticonvulsant</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Indication</label>
                                      <select className="form-control">
                                        <option value="">Select Indication</option>
                                        <option value="depression">Depression</option>
                                        <option value="anxiety">Anxiety</option>
                                        <option value="bipolar_disorder">Bipolar Disorder</option>
                                        <option value="schizophrenia">Schizophrenia</option>
                                        <option value="adhd">ADHD</option>
                                        <option value="insomnia">Insomnia</option>
                                        <option value="ocd">Obsessive-Compulsive Disorder</option>
                                        <option value="ptsd">PTSD</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="capsule">Capsule</option>
                                        <option value="liquid">Liquid</option>
                                        <option value="injection">Injection</option>
                                        <option value="patch">Transdermal Patch</option>
                                        <option value="orally_disintegrating">Orally Disintegrating</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 20mg, 50mg"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Administration Time</label>
                                      <select className="form-control">
                                        <option value="">Select Administration Time</option>
                                        <option value="morning">Morning</option>
                                        <option value="evening">Evening</option>
                                        <option value="bedtime">Bedtime</option>
                                        <option value="twice_daily">Twice Daily</option>
                                        <option value="with_meals">With Meals</option>
                                        <option value="empty_stomach">Empty Stomach</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Monitoring Required</label>
                                      <select className="form-control">
                                        <option value="">Select Monitoring</option>
                                        <option value="mood_tracking">Mood Tracking</option>
                                        <option value="blood_tests">Blood Tests</option>
                                        <option value="weight_monitoring">Weight Monitoring</option>
                                        <option value="blood_pressure">Blood Pressure</option>
                                        <option value="heart_rate">Heart Rate</option>
                                        <option value="liver_function">Liver Function</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Important Warnings & Side Effects</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List important warnings, side effects, and monitoring requirements"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Gastrointestinal Medications-specific fields */}
                      {/* {medicineForm.category === 'Gastrointestinal' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-warning text-dark">
                                <h6 className="mb-0">Gastrointestinal Medication Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Medication Type</label>
                                      <select className="form-control">
                                        <option value="">Select Medication Type</option>
                                        <option value="antacid">Antacid</option>
                                        <option value="proton_pump">Proton Pump Inhibitor</option>
                                        <option value="h2_blocker">H2 Blocker</option>
                                        <option value="antiemetic">Antiemetic</option>
                                        <option value="laxative">Laxative</option>
                                        <option value="antidiarrheal">Antidiarrheal</option>
                                        <option value="probiotic">Probiotic</option>
                                        <option value="ulcer_medication">Ulcer Medication</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Indication</label>
                                      <select className="form-control">
                                        <option value="">Select Indication</option>
                                        <option value="acid_reflux">Acid Reflux</option>
                                        <option value="ulcer">Ulcer</option>
                                        <option value="nausea">Nausea</option>
                                        <option value="vomiting">Vomiting</option>
                                        <option value="constipation">Constipation</option>
                                        <option value="diarrhea">Diarrhea</option>
                                        <option value="indigestion">Indigestion</option>
                                        <option value="irritable_bowel">Irritable Bowel Syndrome</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="capsule">Capsule</option>
                                        <option value="liquid">Liquid</option>
                                        <option value="suspension">Suspension</option>
                                        <option value="chewable">Chewable</option>
                                        <option value="suppository">Suppository</option>
                                        <option value="injection">Injection</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 20mg, 40mg"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Administration Time</label>
                                      <select className="form-control">
                                        <option value="">Select Administration Time</option>
                                        <option value="before_meals">Before Meals</option>
                                        <option value="with_meals">With Meals</option>
                                        <option value="after_meals">After Meals</option>
                                        <option value="empty_stomach">Empty Stomach</option>
                                        <option value="as_needed">As Needed</option>
                                        <option value="bedtime">Bedtime</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Duration of Treatment</label>
                                      <select className="form-control">
                                        <option value="">Select Duration</option>
                                        <option value="short_term">Short Term (1-2 weeks)</option>
                                        <option value="medium_term">Medium Term (1-3 months)</option>
                                        <option value="long_term">Long Term (3+ months)</option>
                                        <option value="as_needed">As Needed</option>
                                        <option value="maintenance">Maintenance</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Instructions & Precautions</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List administration instructions, dietary restrictions, and side effects"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Oncology Medications-specific fields */}
                      {/* {medicineForm.category === 'Oncology' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-danger text-white">
                                <h6 className="mb-0">Oncology Medication Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Medication Type</label>
                                      <select className="form-control">
                                        <option value="">Select Medication Type</option>
                                        <option value="chemotherapy">Chemotherapy</option>
                                        <option value="targeted_therapy">Targeted Therapy</option>
                                        <option value="immunotherapy">Immunotherapy</option>
                                        <option value="hormone_therapy">Hormone Therapy</option>
                                        <option value="supportive_care">Supportive Care</option>
                                        <option value="bisphosphonate">Bisphosphonate</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Cancer Type</label>
                                      <select className="form-control">
                                        <option value="">Select Cancer Type</option>
                                        <option value="breast_cancer">Breast Cancer</option>
                                        <option value="lung_cancer">Lung Cancer</option>
                                        <option value="prostate_cancer">Prostate Cancer</option>
                                        <option value="colorectal_cancer">Colorectal Cancer</option>
                                        <option value="leukemia">Leukemia</option>
                                        <option value="lymphoma">Lymphoma</option>
                                        <option value="multiple_myeloma">Multiple Myeloma</option>
                                        <option value="other">Other</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="injection">Injection</option>
                                        <option value="infusion">Infusion</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="capsule">Capsule</option>
                                        <option value="liquid">Liquid</option>
                                        <option value="oral_solution">Oral Solution</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 100mg, 50mg/m²"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Administration Schedule</label>
                                      <select className="form-control">
                                        <option value="">Select Schedule</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="biweekly">Bi-weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="cycle_based">Cycle-based</option>
                                        <option value="continuous">Continuous</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Monitoring Required</label>
                                      <select className="form-control">
                                        <option value="">Select Monitoring</option>
                                        <option value="blood_counts">Blood Counts</option>
                                        <option value="liver_function">Liver Function</option>
                                        <option value="kidney_function">Kidney Function</option>
                                        <option value="cardiac_function">Cardiac Function</option>
                                        <option value="tumor_markers">Tumor Markers</option>
                                        <option value="imaging">Imaging</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Special Precautions & Side Effects</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List chemotherapy precautions, side effects, and safety measures"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Neurology Medications-specific fields */}
                      {/* {medicineForm.category === 'Neurology' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-dark text-white">
                                <h6 className="mb-0">Neurology Medication Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Medication Class</label>
                                      <select className="form-control">
                                        <option value="">Select Medication Class</option>
                                        <option value="anticonvulsant">Anticonvulsant</option>
                                        <option value="antiparkinson">Antiparkinson</option>
                                        <option value="antimigraine">Antimigraine</option>
                                        <option value="muscle_relaxant">Muscle Relaxant</option>
                                        <option value="antispasticity">Antispasticity</option>
                                        <option value="cognitive_enhancer">Cognitive Enhancer</option>
                                        <option value="neuroprotective">Neuroprotective</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Indication</label>
                                      <select className="form-control">
                                        <option value="">Select Indication</option>
                                        <option value="epilepsy">Epilepsy</option>
                                        <option value="parkinsons">Parkinson's Disease</option>
                                        <option value="migraine">Migraine</option>
                                        <option value="multiple_sclerosis">Multiple Sclerosis</option>
                                        <option value="alzheimers">Alzheimer's Disease</option>
                                        <option value="stroke">Stroke</option>
                                        <option value="neuropathic_pain">Neuropathic Pain</option>
                                        <option value="tremor">Tremor</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="capsule">Capsule</option>
                                        <option value="liquid">Liquid</option>
                                        <option value="injection">Injection</option>
                                        <option value="patch">Transdermal Patch</option>
                                        <option value="nasal_spray">Nasal Spray</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 100mg, 25mg"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Administration Time</label>
                                      <select className="form-control">
                                        <option value="">Select Administration Time</option>
                                        <option value="morning">Morning</option>
                                        <option value="evening">Evening</option>
                                        <option value="twice_daily">Twice Daily</option>
                                        <option value="three_times_daily">Three Times Daily</option>
                                        <option value="as_needed">As Needed</option>
                                        <option value="bedtime">Bedtime</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Monitoring Required</label>
                                      <select className="form-control">
                                        <option value="">Select Monitoring</option>
                                        <option value="blood_levels">Blood Levels</option>
                                        <option value="liver_function">Liver Function</option>
                                        <option value="kidney_function">Kidney Function</option>
                                        <option value="neurological_exam">Neurological Exam</option>
                                        <option value="eeg">EEG</option>
                                        <option value="mri">MRI</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Special Instructions & Warnings</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List special instructions, driving restrictions, and neurological warnings"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Endocrinology Medications-specific fields */}
                      {/* {medicineForm.category === 'Endocrinology' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-info text-white">
                                <h6 className="mb-0">Endocrinology Medication Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Hormone Type</label>
                                      <select className="form-control">
                                        <option value="">Select Hormone Type</option>
                                        <option value="thyroid">Thyroid Hormone</option>
                                        <option value="insulin">Insulin</option>
                                        <option value="cortisol">Cortisol</option>
                                        <option value="estrogen">Estrogen</option>
                                        <option value="testosterone">Testosterone</option>
                                        <option value="growth_hormone">Growth Hormone</option>
                                        <option value="parathyroid">Parathyroid Hormone</option>
                                        <option value="antithyroid">Antithyroid</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Indication</label>
                                      <select className="form-control">
                                        <option value="">Select Indication</option>
                                        <option value="hypothyroidism">Hypothyroidism</option>
                                        <option value="hyperthyroidism">Hyperthyroidism</option>
                                        <option value="diabetes">Diabetes</option>
                                        <option value="adrenal_insufficiency">Adrenal Insufficiency</option>
                                        <option value="menopause">Menopause</option>
                                        <option value="hypogonadism">Hypogonadism</option>
                                        <option value="growth_deficiency">Growth Deficiency</option>
                                        <option value="osteoporosis">Osteoporosis</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="capsule">Capsule</option>
                                        <option value="injection">Injection</option>
                                        <option value="patch">Transdermal Patch</option>
                                        <option value="gel">Gel</option>
                                        <option value="cream">Cream</option>
                                        <option value="inhaler">Inhaler</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 50mcg, 100mg"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Administration Time</label>
                                      <select className="form-control">
                                        <option value="">Select Administration Time</option>
                                        <option value="morning">Morning</option>
                                        <option value="evening">Evening</option>
                                        <option value="daily">Daily</option>
                                        <option value="twice_daily">Twice Daily</option>
                                        <option value="with_meals">With Meals</option>
                                        <option value="empty_stomach">Empty Stomach</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Monitoring Required</label>
                                      <select className="form-control">
                                        <option value="">Select Monitoring</option>
                                        <option value="hormone_levels">Hormone Levels</option>
                                        <option value="blood_sugar">Blood Sugar</option>
                                        <option value="thyroid_function">Thyroid Function</option>
                                        <option value="bone_density">Bone Density</option>
                                        <option value="blood_pressure">Blood Pressure</option>
                                        <option value="weight">Weight</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Special Instructions & Precautions</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List hormone-specific instructions, monitoring requirements, and side effects"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Immunology Medications-specific fields */}
                      {/* {medicineForm.category === 'Immunology' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-success text-white">
                                <h6 className="mb-0">Immunology Medication Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Medication Type</label>
                                      <select className="form-control">
                                        <option value="">Select Medication Type</option>
                                        <option value="immunosuppressant">Immunosuppressant</option>
                                        <option value="immunomodulator">Immunomodulator</option>
                                        <option value="biologic">Biologic</option>
                                        <option value="monoclonal_antibody">Monoclonal Antibody</option>
                                        <option value="cytokine">Cytokine</option>
                                        <option value="vaccine">Vaccine</option>
                                        <option value="allergen">Allergen</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Indication</label>
                                      <select className="form-control">
                                        <option value="">Select Indication</option>
                                        <option value="autoimmune_disease">Autoimmune Disease</option>
                                        <option value="organ_transplant">Organ Transplant</option>
                                        <option value="allergic_reaction">Allergic Reaction</option>
                                        <option value="immunodeficiency">Immunodeficiency</option>
                                        <option value="inflammatory_disease">Inflammatory Disease</option>
                                        <option value="cancer">Cancer</option>
                                        <option value="infection">Infection</option>
                                        <option value="prevention">Prevention</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="injection">Injection</option>
                                        <option value="infusion">Infusion</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="capsule">Capsule</option>
                                        <option value="liquid">Liquid</option>
                                        <option value="sublingual">Sublingual</option>
                                        <option value="nasal_spray">Nasal Spray</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 5mg, 10mg/ml"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Administration Schedule</label>
                                      <select className="form-control">
                                        <option value="">Select Schedule</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="as_needed">As Needed</option>
                                        <option value="cycle_based">Cycle-based</option>
                                        <option value="single_dose">Single Dose</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Monitoring Required</label>
                                      <select className="form-control">
                                        <option value="">Select Monitoring</option>
                                        <option value="immune_function">Immune Function</option>
                                        <option value="infection_risk">Infection Risk</option>
                                        <option value="blood_counts">Blood Counts</option>
                                        <option value="liver_function">Liver Function</option>
                                        <option value="kidney_function">Kidney Function</option>
                                        <option value="allergic_reaction">Allergic Reaction</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Special Precautions & Side Effects</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List immune system precautions, infection risks, and monitoring requirements"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Emergency Medications-specific fields */}
                      {/* {medicineForm.category === 'Emergency' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-danger text-white">
                                <h6 className="mb-0">Emergency Medication Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Emergency Type</label>
                                      <select className="form-control">
                                        <option value="">Select Emergency Type</option>
                                        <option value="cardiac_arrest">Cardiac Arrest</option>
                                        <option value="anaphylaxis">Anaphylaxis</option>
                                        <option value="seizure">Seizure</option>
                                        <option value="overdose">Overdose</option>
                                        <option value="trauma">Trauma</option>
                                        <option value="respiratory_distress">Respiratory Distress</option>
                                        <option value="hypertensive_crisis">Hypertensive Crisis</option>
                                        <option value="diabetic_emergency">Diabetic Emergency</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Medication Class</label>
                                      <select className="form-control">
                                        <option value="">Select Medication Class</option>
                                        <option value="vasopressor">Vasopressor</option>
                                        <option value="antihistamine">Antihistamine</option>
                                        <option value="anticonvulsant">Anticonvulsant</option>
                                        <option value="antidote">Antidote</option>
                                        <option value="analgesic">Analgesic</option>
                                        <option value="bronchodilator">Bronchodilator</option>
                                        <option value="antihypertensive">Antihypertensive</option>
                                        <option value="glucose">Glucose</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="injection">Injection</option>
                                        <option value="intravenous">Intravenous</option>
                                        <option value="intramuscular">Intramuscular</option>
                                        <option value="subcutaneous">Subcutaneous</option>
                                        <option value="oral">Oral</option>
                                        <option value="nasal">Nasal</option>
                                        <option value="rectal">Rectal</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 1mg/ml, 0.1mg"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Administration Route</label>
                                      <select className="form-control">
                                        <option value="">Select Route</option>
                                        <option value="iv">Intravenous</option>
                                        <option value="im">Intramuscular</option>
                                        <option value="sc">Subcutaneous</option>
                                        <option value="oral">Oral</option>
                                        <option value="nasal">Nasal</option>
                                        <option value="rectal">Rectal</option>
                                        <option value="inhalation">Inhalation</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Storage Requirements</label>
                                      <select className="form-control">
                                        <option value="">Select Storage</option>
                                        <option value="room_temperature">Room Temperature</option>
                                        <option value="refrigerated">Refrigerated</option>
                                        <option value="frozen">Frozen</option>
                                        <option value="protected_from_light">Protected from Light</option>
                                        <option value="controlled_temperature">Controlled Temperature</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Emergency Instructions & Precautions</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List emergency administration instructions, contraindications, and safety measures"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Surgical Supplies-specific fields */}
                      {/* {medicineForm.category === 'Surgical Supplies' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-secondary text-white">
                                <h6 className="mb-0">Surgical Supplies Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Supply Type</label>
                                      <select className="form-control">
                                        <option value="">Select Supply Type</option>
                                        <option value="suture">Suture</option>
                                        <option value="dressing">Dressing</option>
                                        <option value="gauze">Gauze</option>
                                        <option value="bandage">Bandage</option>
                                        <option value="catheter">Catheter</option>
                                        <option value="syringe">Syringe</option>
                                        <option value="needle">Needle</option>
                                        <option value="surgical_instrument">Surgical Instrument</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Material</label>
                                      <select className="form-control">
                                        <option value="">Select Material</option>
                                        <option value="cotton">Cotton</option>
                                        <option value="silicone">Silicone</option>
                                        <option value="polyester">Polyester</option>
                                        <option value="nylon">Nylon</option>
                                        <option value="stainless_steel">Stainless Steel</option>
                                        <option value="plastic">Plastic</option>
                                        <option value="latex">Latex</option>
                                        <option value="latex_free">Latex-Free</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Size</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 3-0, 4x4 inches, 18G"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Sterility</label>
                                      <select className="form-control">
                                        <option value="">Select Sterility</option>
                                        <option value="sterile">Sterile</option>
                                        <option value="non_sterile">Non-Sterile</option>
                                        <option value="single_use">Single Use</option>
                                        <option value="reusable">Reusable</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Packaging</label>
                                      <select className="form-control">
                                        <option value="">Select Packaging</option>
                                        <option value="individual">Individual</option>
                                        <option value="bulk">Bulk</option>
                                        <option value="sterile_pack">Sterile Pack</option>
                                        <option value="box">Box</option>
                                        <option value="roll">Roll</option>
                                        <option value="sheet">Sheet</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Expiry Date</label>
                                      <input
                                        type="date"
                                        className="form-control"
                                        placeholder="Select expiry date"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Usage Instructions & Precautions</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List usage instructions, sterilization requirements, and safety precautions"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Diagnostic Supplies-specific fields */}
                      {/* {medicineForm.category === 'Diagnostic Supplies' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-primary text-white">
                                <h6 className="mb-0">Diagnostic Supplies Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Diagnostic Type</label>
                                      <select className="form-control">
                                        <option value="">Select Diagnostic Type</option>
                                        <option value="blood_test">Blood Test</option>
                                        <option value="urine_test">Urine Test</option>
                                        <option value="stool_test">Stool Test</option>
                                        <option value="pregnancy_test">Pregnancy Test</option>
                                        <option value="glucose_monitor">Glucose Monitor</option>
                                        <option value="blood_pressure_monitor">Blood Pressure Monitor</option>
                                        <option value="thermometer">Thermometer</option>
                                        <option value="stethoscope">Stethoscope</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Test Category</label>
                                      <select className="form-control">
                                        <option value="">Select Test Category</option>
                                        <option value="point_of_care">Point of Care</option>
                                        <option value="laboratory">Laboratory</option>
                                        <option value="home_testing">Home Testing</option>
                                        <option value="screening">Screening</option>
                                        <option value="monitoring">Monitoring</option>
                                        <option value="diagnostic">Diagnostic</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Accuracy</label>
                                      <select className="form-control">
                                        <option value="">Select Accuracy</option>
                                        <option value="high">High (&gt;95%)</option>
                                        <option value="medium">Medium (85-95%)</option>
                                        <option value="low">Low (&lt;85%)</option>
                                        <option value="variable">Variable</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Result Time</label>
                                      <select className="form-control">
                                        <option value="">Select Result Time</option>
                                        <option value="immediate">Immediate</option>
                                        <option value="minutes">Minutes</option>
                                        <option value="hours">Hours</option>
                                        <option value="days">Days</option>
                                        <option value="weeks">Weeks</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Storage Requirements</label>
                                      <select className="form-control">
                                        <option value="">Select Storage</option>
                                        <option value="room_temperature">Room Temperature</option>
                                        <option value="refrigerated">Refrigerated</option>
                                        <option value="frozen">Frozen</option>
                                        <option value="protected_from_light">Protected from Light</option>
                                        <option value="dry_place">Dry Place</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Expiry Date</label>
                                      <input
                                        type="date"
                                        className="form-control"
                                        placeholder="Select expiry date"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Usage Instructions & Interpretation</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List usage instructions, result interpretation, and quality control measures"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Pediatrics Medications-specific fields */}
                      {/* {medicineForm.category === 'Pediatrics' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-info text-white">
                                <h6 className="mb-0">Pediatrics Medication Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Age Group</label>
                                      <select className="form-control">
                                        <option value="">Select Age Group</option>
                                        <option value="neonates">Neonates (0-28 days)</option>
                                        <option value="infants">Infants (1-12 months)</option>
                                        <option value="toddlers">Toddlers (1-3 years)</option>
                                        <option value="preschool">Preschool (3-5 years)</option>
                                        <option value="school_age">School Age (6-12 years)</option>
                                        <option value="adolescents">Adolescents (13-18 years)</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Calculation</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Calculation</option>
                                        <option value="weight_based">Weight-based (mg/kg)</option>
                                        <option value="body_surface_area">Body Surface Area (mg/m²)</option>
                                        <option value="age_based">Age-based</option>
                                        <option value="fixed_dose">Fixed Dose</option>
                                        <option value="titration">Titration</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="liquid">Liquid</option>
                                        <option value="suspension">Suspension</option>
                                        <option value="chewable">Chewable</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="capsule">Capsule</option>
                                        <option value="injection">Injection</option>
                                        <option value="suppository">Suppository</option>
                                        <option value="drops">Drops</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 125mg/5ml, 10mg/kg"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Administration Method</label>
                                      <select className="form-control">
                                        <option value="">Select Administration Method</option>
                                        <option value="oral">Oral</option>
                                        <option value="intravenous">Intravenous</option>
                                        <option value="intramuscular">Intramuscular</option>
                                        <option value="subcutaneous">Subcutaneous</option>
                                        <option value="rectal">Rectal</option>
                                        <option value="nasal">Nasal</option>
                                        <option value="topical">Topical</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Flavoring</label>
                                      <select className="form-control">
                                        <option value="">Select Flavoring</option>
                                        <option value="cherry">Cherry</option>
                                        <option value="grape">Grape</option>
                                        <option value="bubblegum">Bubblegum</option>
                                        <option value="strawberry">Strawberry</option>
                                        <option value="orange">Orange</option>
                                        <option value="banana">Banana</option>
                                        <option value="unflavored">Unflavored</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Special Instructions & Precautions</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List pediatric-specific instructions, dosing precautions, and safety measures"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Geriatrics Medications-specific fields */}
                      {/* {medicineForm.category === 'Geriatrics' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-secondary text-white">
                                <h6 className="mb-0">Geriatrics Medication Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Age Group</label>
                                      <select className="form-control">
                                        <option value="">Select Age Group</option>
                                        <option value="young_elderly">Young Elderly (65-74 years)</option>
                                        <option value="elderly">Elderly (75-84 years)</option>
                                        <option value="old_elderly">Old Elderly (85+ years)</option>
                                        <option value="frail_elderly">Frail Elderly</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Adjustment</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Adjustment</option>
                                        <option value="renal_adjustment">Renal Adjustment</option>
                                        <option value="hepatic_adjustment">Hepatic Adjustment</option>
                                        <option value="reduced_dose">Reduced Dose</option>
                                        <option value="extended_interval">Extended Interval</option>
                                        <option value="standard_dose">Standard Dose</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="capsule">Capsule</option>
                                        <option value="liquid">Liquid</option>
                                        <option value="patch">Transdermal Patch</option>
                                        <option value="injection">Injection</option>
                                        <option value="orally_disintegrating">Orally Disintegrating</option>
                                        <option value="crushable">Crushable</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 25mg, 50mg"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Administration Time</label>
                                      <select className="form-control">
                                        <option value="">Select Administration Time</option>
                                        <option value="morning">Morning</option>
                                        <option value="evening">Evening</option>
                                        <option value="twice_daily">Twice Daily</option>
                                        <option value="with_meals">With Meals</option>
                                        <option value="empty_stomach">Empty Stomach</option>
                                        <option value="bedtime">Bedtime</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Monitoring Required</label>
                                      <select className="form-control">
                                        <option value="">Select Monitoring</option>
                                        <option value="renal_function">Renal Function</option>
                                        <option value="liver_function">Liver Function</option>
                                        <option value="blood_pressure">Blood Pressure</option>
                                        <option value="cognitive_function">Cognitive Function</option>
                                        <option value="fall_risk">Fall Risk</option>
                                        <option value="drug_interactions">Drug Interactions</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Special Instructions & Precautions</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List geriatric-specific instructions, fall precautions, and polypharmacy considerations"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Obstetrics Medications-specific fields */}
                      {/* {medicineForm.category === 'Obstetrics' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-warning text-dark">
                                <h6 className="mb-0">Obstetrics Medication Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Pregnancy Category</label>
                                      <select className="form-control">
                                        <option value="">Select Pregnancy Category</option>
                                        <option value="category_a">Category A</option>
                                        <option value="category_b">Category B</option>
                                        <option value="category_c">Category C</option>
                                        <option value="category_d">Category D</option>
                                        <option value="category_x">Category X</option>
                                        <option value="not_classified">Not Classified</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Indication</label>
                                      <select className="form-control">
                                        <option value="">Select Indication</option>
                                        <option value="prenatal_care">Prenatal Care</option>
                                        <option value="labor_induction">Labor Induction</option>
                                        <option value="pain_management">Pain Management</option>
                                        <option value="hypertension">Hypertension</option>
                                        <option value="diabetes">Diabetes</option>
                                        <option value="infection">Infection</option>
                                        <option value="nausea_vomiting">Nausea & Vomiting</option>
                                        <option value="postpartum">Postpartum</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="capsule">Capsule</option>
                                        <option value="liquid">Liquid</option>
                                        <option value="injection">Injection</option>
                                        <option value="suppository">Suppository</option>
                                        <option value="patch">Transdermal Patch</option>
                                        <option value="gel">Gel</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 100mg, 50mcg"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Administration Time</label>
                                      <select className="form-control">
                                        <option value="">Select Administration Time</option>
                                        <option value="daily">Daily</option>
                                        <option value="twice_daily">Twice Daily</option>
                                        <option value="as_needed">As Needed</option>
                                        <option value="with_meals">With Meals</option>
                                        <option value="empty_stomach">Empty Stomach</option>
                                        <option value="bedtime">Bedtime</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Monitoring Required</label>
                                      <select className="form-control">
                                        <option value="">Select Monitoring</option>
                                        <option value="fetal_monitoring">Fetal Monitoring</option>
                                        <option value="maternal_vitals">Maternal Vitals</option>
                                        <option value="blood_pressure">Blood Pressure</option>
                                        <option value="blood_sugar">Blood Sugar</option>
                                        <option value="liver_function">Liver Function</option>
                                        <option value="kidney_function">Kidney Function</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Special Instructions & Precautions</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List pregnancy-specific instructions, fetal safety considerations, and maternal precautions"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Sports Medicine Medications-specific fields */}
                      {/* {medicineForm.category === 'Sports Medicine' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-success text-white">
                                <h6 className="mb-0">Sports Medicine Medication Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Injury Type</label>
                                      <select className="form-control">
                                        <option value="">Select Injury Type</option>
                                        <option value="muscle_strain">Muscle Strain</option>
                                        <option value="ligament_sprain">Ligament Sprain</option>
                                        <option value="tendonitis">Tendonitis</option>
                                        <option value="fracture">Fracture</option>
                                        <option value="dislocation">Dislocation</option>
                                        <option value="concussion">Concussion</option>
                                        <option value="overuse_injury">Overuse Injury</option>
                                        <option value="acute_trauma">Acute Trauma</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Medication Type</label>
                                      <select className="form-control">
                                        <option value="">Select Medication Type</option>
                                        <option value="anti_inflammatory">Anti-inflammatory</option>
                                        <option value="analgesic">Analgesic</option>
                                        <option value="muscle_relaxant">Muscle Relaxant</option>
                                        <option value="corticosteroid">Corticosteroid</option>
                                        <option value="supplement">Supplement</option>
                                        <option value="topical">Topical</option>
                                        <option value="injection">Injection</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="capsule">Capsule</option>
                                        <option value="liquid">Liquid</option>
                                        <option value="cream">Cream</option>
                                        <option value="gel">Gel</option>
                                        <option value="spray">Spray</option>
                                        <option value="patch">Patch</option>
                                        <option value="injection">Injection</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 400mg, 1% cream"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Administration Time</label>
                                      <select className="form-control">
                                        <option value="">Select Administration Time</option>
                                        <option value="before_activity">Before Activity</option>
                                        <option value="after_activity">After Activity</option>
                                        <option value="as_needed">As Needed</option>
                                        <option value="daily">Daily</option>
                                        <option value="twice_daily">Twice Daily</option>
                                        <option value="with_meals">With Meals</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Return to Play</label>
                                      <select className="form-control">
                                        <option value="">Select Return to Play</option>
                                        <option value="immediate">Immediate</option>
                                        <option value="24_hours">24 Hours</option>
                                        <option value="48_hours">48 Hours</option>
                                        <option value="1_week">1 Week</option>
                                        <option value="2_weeks">2 Weeks</option>
                                        <option value="medical_clearance">Medical Clearance Required</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Special Instructions & Precautions</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List sports-specific instructions, doping considerations, and return-to-play guidelines"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Alternative Medicine-specific fields */}
                      {/* {medicineForm.category === 'Alternative Medicine' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-primary text-white">
                                <h6 className="mb-0">Alternative Medicine Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Medicine Type</label>
                                      <select className="form-control">
                                        <option value="">Select Medicine Type</option>
                                        <option value="herbal">Herbal</option>
                                        <option value="homeopathic">Homeopathic</option>
                                        <option value="ayurvedic">Ayurvedic</option>
                                        <option value="traditional_chinese">Traditional Chinese</option>
                                        <option value="naturopathic">Naturopathic</option>
                                        <option value="aromatherapy">Aromatherapy</option>
                                        <option value="supplement">Supplement</option>
                                        <option value="probiotic">Probiotic</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Indication</label>
                                      <select className="form-control">
                                        <option value="">Select Indication</option>
                                        <option value="immune_support">Immune Support</option>
                                        <option value="digestive_health">Digestive Health</option>
                                        <option value="stress_relief">Stress Relief</option>
                                        <option value="sleep_aid">Sleep Aid</option>
                                        <option value="energy_boost">Energy Boost</option>
                                        <option value="pain_relief">Pain Relief</option>
                                        <option value="detoxification">Detoxification</option>
                                        <option value="general_wellness">General Wellness</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="capsule">Capsule</option>
                                        <option value="liquid">Liquid</option>
                                        <option value="powder">Powder</option>
                                        <option value="tea">Tea</option>
                                        <option value="essential_oil">Essential Oil</option>
                                        <option value="tincture">Tincture</option>
                                        <option value="cream">Cream</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 500mg, 30 drops"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Administration Time</label>
                                      <select className="form-control">
                                        <option value="">Select Administration Time</option>
                                        <option value="daily">Daily</option>
                                        <option value="twice_daily">Twice Daily</option>
                                        <option value="three_times_daily">Three Times Daily</option>
                                        <option value="as_needed">As Needed</option>
                                        <option value="with_meals">With Meals</option>
                                        <option value="empty_stomach">Empty Stomach</option>
                                        <option value="bedtime">Bedtime</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Certification</label>
                                      <select className="form-control">
                                        <option value="">Select Certification</option>
                                        <option value="organic">Organic</option>
                                        <option value="non_gmo">Non-GMO</option>
                                        <option value="gluten_free">Gluten-Free</option>
                                        <option value="vegan">Vegan</option>
                                        <option value="kosher">Kosher</option>
                                        <option value="halal">Halal</option>
                                        <option value="none">None</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Special Instructions & Precautions</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List herbal interactions, contraindications, and quality assurance measures"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Medical Equipment-specific fields */}
                      {/* {medicineForm.category === 'Medical Equipment' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-dark text-white">
                                <h6 className="mb-0">Medical Equipment Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Equipment Type</label>
                                      <select className="form-control">
                                        <option value="">Select Equipment Type</option>
                                        <option value="monitoring">Monitoring Equipment</option>
                                        <option value="diagnostic">Diagnostic Equipment</option>
                                        <option value="therapeutic">Therapeutic Equipment</option>
                                        <option value="surgical">Surgical Equipment</option>
                                        <option value="respiratory">Respiratory Equipment</option>
                                        <option value="mobility">Mobility Equipment</option>
                                        <option value="safety">Safety Equipment</option>
                                        <option value="storage">Storage Equipment</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Power Source</label>
                                      <select className="form-control">
                                        <option value="">Select Power Source</option>
                                        <option value="battery">Battery</option>
                                        <option value="electric">Electric</option>
                                        <option value="manual">Manual</option>
                                        <option value="solar">Solar</option>
                                        <option value="rechargeable">Rechargeable</option>
                                        <option value="disposable">Disposable</option>
                                        <option value="none">None</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Size</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 12x8x4 inches, Portable"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Weight</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 5kg, Lightweight"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Maintenance Required</label>
                                      <select className="form-control">
                                        <option value="">Select Maintenance</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="annually">Annually</option>
                                        <option value="as_needed">As Needed</option>
                                        <option value="none">None</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Warranty</label>
                                      <select className="form-control">
                                        <option value="">Select Warranty</option>
                                        <option value="30_days">30 Days</option>
                                        <option value="90_days">90 Days</option>
                                        <option value="6_months">6 Months</option>
                                        <option value="1_year">1 Year</option>
                                        <option value="2_years">2 Years</option>
                                        <option value="3_years">3 Years</option>
                                        <option value="lifetime">Lifetime</option>
                                        <option value="none">None</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Usage Instructions & Safety</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List usage instructions, safety precautions, and maintenance requirements"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Veterinary Medications-specific fields */}
                      {/* {medicineForm.category === 'Veterinary' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-info text-white">
                                <h6 className="mb-0">Veterinary Medication Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Animal Type</label>
                                      <select className="form-control">
                                        <option value="">Select Animal Type</option>
                                        <option value="dogs">Dogs</option>
                                        <option value="cats">Cats</option>
                                        <option value="horses">Horses</option>
                                        <option value="cattle">Cattle</option>
                                        <option value="poultry">Poultry</option>
                                        <option value="pigs">Pigs</option>
                                        <option value="sheep">Sheep</option>
                                        <option value="goats">Goats</option>
                                        <option value="exotic">Exotic Animals</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Weight Range</label>
                                      <select className="form-control">
                                        <option value="">Select Weight Range</option>
                                        <option value="small">Small (&lt;10kg)</option>
                                        <option value="medium">Medium (10-25kg)</option>
                                        <option value="large">Large (25-50kg)</option>
                                        <option value="extra_large">Extra Large (&gt;50kg)</option>
                                        <option value="variable">Variable</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="capsule">Capsule</option>
                                        <option value="liquid">Liquid</option>
                                        <option value="injection">Injection</option>
                                        <option value="topical">Topical</option>
                                        <option value="spot_on">Spot-on</option>
                                        <option value="collar">Collar</option>
                                        <option value="feed_additive">Feed Additive</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 50mg/kg, 10mg/ml"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Administration Method</label>
                                      <select className="form-control">
                                        <option value="">Select Administration Method</option>
                                        <option value="oral">Oral</option>
                                        <option value="intravenous">Intravenous</option>
                                        <option value="intramuscular">Intramuscular</option>
                                        <option value="subcutaneous">Subcutaneous</option>
                                        <option value="topical">Topical</option>
                                        <option value="in_feed">In Feed</option>
                                        <option value="in_water">In Water</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Withdrawal Period</label>
                                      <select className="form-control">
                                        <option value="">Select Withdrawal Period</option>
                                        <option value="none">None</option>
                                        <option value="24_hours">24 Hours</option>
                                        <option value="48_hours">48 Hours</option>
                                        <option value="72_hours">72 Hours</option>
                                        <option value="1_week">1 Week</option>
                                        <option value="2_weeks">2 Weeks</option>
                                        <option value="4_weeks">4 Weeks</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Special Instructions & Precautions</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List veterinary-specific instructions, withdrawal periods, and safety measures"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Dental Medications-specific fields */}
                      {/* {medicineForm.category === 'Dental' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-primary text-white">
                                <h6 className="mb-0">Dental Medication Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dental Indication</label>
                                      <select className="form-control">
                                        <option value="">Select Dental Indication</option>
                                        <option value="pain_relief">Pain Relief</option>
                                        <option value="infection">Infection</option>
                                        <option value="inflammation">Inflammation</option>
                                        <option value="anesthesia">Anesthesia</option>
                                        <option value="cleaning">Cleaning</option>
                                        <option value="whitening">Whitening</option>
                                        <option value="sensitivity">Sensitivity</option>
                                        <option value="healing">Healing</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Application Method</label>
                                      <select className="form-control">
                                        <option value="">Select Application Method</option>
                                        <option value="topical">Topical</option>
                                        <option value="oral">Oral</option>
                                        <option value="injection">Injection</option>
                                        <option value="rinse">Rinse</option>
                                        <option value="gel">Gel</option>
                                        <option value="paste">Paste</option>
                                        <option value="spray">Spray</option>
                                        <option value="patch">Patch</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="gel">Gel</option>
                                        <option value="paste">Paste</option>
                                        <option value="liquid">Liquid</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="capsule">Capsule</option>
                                        <option value="spray">Spray</option>
                                        <option value="patch">Patch</option>
                                        <option value="injection">Injection</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 2% gel, 500mg"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Frequency</label>
                                      <select className="form-control">
                                        <option value="">Select Frequency</option>
                                        <option value="once_daily">Once Daily</option>
                                        <option value="twice_daily">Twice Daily</option>
                                        <option value="three_times_daily">Three Times Daily</option>
                                        <option value="as_needed">As Needed</option>
                                        <option value="before_meals">Before Meals</option>
                                        <option value="after_meals">After Meals</option>
                                        <option value="bedtime">Bedtime</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Duration</label>
                                      <select className="form-control">
                                        <option value="">Select Duration</option>
                                        <option value="1_day">1 Day</option>
                                        <option value="3_days">3 Days</option>
                                        <option value="1_week">1 Week</option>
                                        <option value="2_weeks">2 Weeks</option>
                                        <option value="1_month">1 Month</option>
                                        <option value="ongoing">Ongoing</option>
                                        <option value="as_needed">As Needed</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Special Instructions & Precautions</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List dental-specific instructions, application techniques, and safety measures"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Ophthalmology Medications-specific fields */}
                      {/* {medicineForm.category === 'Ophthalmology' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-warning text-dark">
                                <h6 className="mb-0">Ophthalmology Medication Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Eye Condition</label>
                                      <select className="form-control">
                                        <option value="">Select Eye Condition</option>
                                        <option value="glaucoma">Glaucoma</option>
                                        <option value="cataracts">Cataracts</option>
                                        <option value="conjunctivitis">Conjunctivitis</option>
                                        <option value="dry_eye">Dry Eye</option>
                                        <option value="infection">Infection</option>
                                        <option value="inflammation">Inflammation</option>
                                        <option value="allergies">Allergies</option>
                                        <option value="post_surgery">Post-Surgery</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Application Method</label>
                                      <select className="form-control">
                                        <option value="">Select Application Method</option>
                                        <option value="eye_drops">Eye Drops</option>
                                        <option value="eye_ointment">Eye Ointment</option>
                                        <option value="eye_gel">Eye Gel</option>
                                        <option value="oral">Oral</option>
                                        <option value="injection">Injection</option>
                                        <option value="implant">Implant</option>
                                        <option value="contact_lens">Contact Lens</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="drops">Drops</option>
                                        <option value="ointment">Ointment</option>
                                        <option value="gel">Gel</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="capsule">Capsule</option>
                                        <option value="injection">Injection</option>
                                        <option value="implant">Implant</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 0.5%, 1mg/ml"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Frequency</label>
                                      <select className="form-control">
                                        <option value="">Select Frequency</option>
                                        <option value="once_daily">Once Daily</option>
                                        <option value="twice_daily">Twice Daily</option>
                                        <option value="three_times_daily">Three Times Daily</option>
                                        <option value="four_times_daily">Four Times Daily</option>
                                        <option value="every_2_hours">Every 2 Hours</option>
                                        <option value="every_4_hours">Every 4 Hours</option>
                                        <option value="as_needed">As Needed</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Duration</label>
                                      <select className="form-control">
                                        <option value="">Select Duration</option>
                                        <option value="1_day">1 Day</option>
                                        <option value="3_days">3 Days</option>
                                        <option value="1_week">1 Week</option>
                                        <option value="2_weeks">2 Weeks</option>
                                        <option value="1_month">1 Month</option>
                                        <option value="ongoing">Ongoing</option>
                                        <option value="as_needed">As Needed</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Special Instructions & Precautions</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List ophthalmology-specific instructions, application techniques, and safety measures"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Rehabilitation Medications-specific fields */}
                      {/* {medicineForm.category === 'Rehabilitation' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-success text-white">
                                <h6 className="mb-0">Rehabilitation Medication Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Rehabilitation Type</label>
                                      <select className="form-control">
                                        <option value="">Select Rehabilitation Type</option>
                                        <option value="physical_therapy">Physical Therapy</option>
                                        <option value="occupational_therapy">Occupational Therapy</option>
                                        <option value="speech_therapy">Speech Therapy</option>
                                        <option value="cardiac_rehab">Cardiac Rehabilitation</option>
                                        <option value="pulmonary_rehab">Pulmonary Rehabilitation</option>
                                        <option value="neurological_rehab">Neurological Rehabilitation</option>
                                        <option value="orthopedic_rehab">Orthopedic Rehabilitation</option>
                                        <option value="sports_rehab">Sports Rehabilitation</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Medication Type</label>
                                      <select className="form-control">
                                        <option value="">Select Medication Type</option>
                                        <option value="pain_management">Pain Management</option>
                                        <option value="muscle_relaxant">Muscle Relaxant</option>
                                        <option value="anti_inflammatory">Anti-inflammatory</option>
                                        <option value="supplement">Supplement</option>
                                        <option value="topical">Topical</option>
                                        <option value="injection">Injection</option>
                                        <option value="device">Device</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="capsule">Capsule</option>
                                        <option value="liquid">Liquid</option>
                                        <option value="cream">Cream</option>
                                        <option value="gel">Gel</option>
                                        <option value="patch">Patch</option>
                                        <option value="injection">Injection</option>
                                        <option value="device">Device</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Strength</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 500mg, 1% cream"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Administration Time</label>
                                      <select className="form-control">
                                        <option value="">Select Administration Time</option>
                                        <option value="before_therapy">Before Therapy</option>
                                        <option value="after_therapy">After Therapy</option>
                                        <option value="daily">Daily</option>
                                        <option value="twice_daily">Twice Daily</option>
                                        <option value="as_needed">As Needed</option>
                                        <option value="with_meals">With Meals</option>
                                        <option value="bedtime">Bedtime</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Duration</label>
                                      <select className="form-control">
                                        <option value="">Select Duration</option>
                                        <option value="1_week">1 Week</option>
                                        <option value="2_weeks">2 Weeks</option>
                                        <option value="1_month">1 Month</option>
                                        <option value="3_months">3 Months</option>
                                        <option value="6_months">6 Months</option>
                                        <option value="ongoing">Ongoing</option>
                                        <option value="as_needed">As Needed</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Special Instructions & Precautions</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List rehabilitation-specific instructions, exercise precautions, and recovery guidelines"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Laboratory Supplies-specific fields */}
                      {/* {medicineForm.category === 'Laboratory' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-secondary text-white">
                                <h6 className="mb-0">Laboratory Supply Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Lab Equipment Type</label>
                                      <select className="form-control">
                                        <option value="">Select Lab Equipment Type</option>
                                        <option value="analyzers">Analyzers</option>
                                        <option value="microscopes">Microscopes</option>
                                        <option value="centrifuges">Centrifuges</option>
                                        <option value="incubators">Incubators</option>
                                        <option value="autoclaves">Autoclaves</option>
                                        <option value="balances">Balances</option>
                                        <option value="pipettes">Pipettes</option>
                                        <option value="reagents">Reagents</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Test Type</label>
                                      <select className="form-control">
                                        <option value="">Select Test Type</option>
                                        <option value="blood_tests">Blood Tests</option>
                                        <option value="urine_tests">Urine Tests</option>
                                        <option value="microbiology">Microbiology</option>
                                        <option value="chemistry">Chemistry</option>
                                        <option value="hematology">Hematology</option>
                                        <option value="immunology">Immunology</option>
                                        <option value="molecular">Molecular</option>
                                        <option value="histology">Histology</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Accuracy</label>
                                      <select className="form-control">
                                        <option value="">Select Accuracy</option>
                                        <option value="high">High (&gt;95%)</option>
                                        <option value="medium">Medium (85-95%)</option>
                                        <option value="low">Low (&lt;85%)</option>
                                        <option value="variable">Variable</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Calibration Required</label>
                                      <select className="form-control">
                                        <option value="">Select Calibration</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="annually">Annually</option>
                                        <option value="none">None</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Storage Temperature</label>
                                      <select className="form-control">
                                        <option value="">Select Storage Temperature</option>
                                        <option value="room_temperature">Room Temperature</option>
                                        <option value="refrigerated">Refrigerated (2-8°C)</option>
                                        <option value="frozen">Frozen (-20°C)</option>
                                        <option value="ultra_cold">Ultra-cold (-80°C)</option>
                                        <option value="controlled">Controlled Temperature</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Expiry Date</label>
                                      <input
                                        type="date"
                                        className="form-control"
                                        placeholder="Select expiry date"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Usage Instructions & Safety</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List laboratory-specific instructions, safety protocols, and quality control measures"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* First Aid Supplies-specific fields */}
                      {/* {medicineForm.category === 'First Aid' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-danger text-white">
                                <h6 className="mb-0">First Aid Supply Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>First Aid Type</label>
                                      <select className="form-control">
                                        <option value="">Select First Aid Type</option>
                                        <option value="wound_care">Wound Care</option>
                                        <option value="bandages">Bandages</option>
                                        <option value="antiseptics">Antiseptics</option>
                                        <option value="pain_relief">Pain Relief</option>
                                        <option value="emergency">Emergency</option>
                                        <option value="burns">Burns</option>
                                        <option value="fractures">Fractures</option>
                                        <option value="poisoning">Poisoning</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Size</label>
                                      <select className="form-control">
                                        <option value="">Select Size</option>
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                        <option value="extra_large">Extra Large</option>
                                        <option value="variable">Variable</option>
                                        <option value="one_size">One Size</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Sterility</label>
                                      <select className="form-control">
                                        <option value="">Select Sterility</option>
                                        <option value="sterile">Sterile</option>
                                        <option value="non_sterile">Non-sterile</option>
                                        <option value="clean">Clean</option>
                                        <option value="disposable">Disposable</option>
                                        <option value="reusable">Reusable</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Expiry Date</label>
                                      <input
                                        type="date"
                                        className="form-control"
                                        placeholder="Select expiry date"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Storage Location</label>
                                      <select className="form-control">
                                        <option value="">Select Storage Location</option>
                                        <option value="first_aid_kit">First Aid Kit</option>
                                        <option value="emergency_room">Emergency Room</option>
                                        <option value="ambulance">Ambulance</option>
                                        <option value="office">Office</option>
                                        <option value="home">Home</option>
                                        <option value="vehicle">Vehicle</option>
                                        <option value="outdoor">Outdoor</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Quantity per Unit</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 10 pieces, 50ml"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Usage Instructions & Safety</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List first aid-specific instructions, emergency procedures, and safety measures"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Personal Care Products-specific fields */}
                      {/* {medicineForm.category === 'Personal Care' && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="card bg-light border-0 shadow-none">
                              <div className="card-header bg-primary text-white">
                                <h6 className="mb-0">Personal Care Product Information</h6>
                              </div>
                              <div className="card-body">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Product Type</label>
                                      <select className="form-control">
                                        <option value="">Select Product Type</option>
                                        <option value="hygiene">Hygiene</option>
                                        <option value="skincare">Skincare</option>
                                        <option value="haircare">Haircare</option>
                                        <option value="oral_care">Oral Care</option>
                                        <option value="feminine_care">Feminine Care</option>
                                        <option value="baby_care">Baby Care</option>
                                        <option value="elderly_care">Elderly Care</option>
                                        <option value="incontinence">Incontinence</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Skin Type</label>
                                      <select className="form-control">
                                        <option value="">Select Skin Type</option>
                                        <option value="normal">Normal</option>
                                        <option value="dry">Dry</option>
                                        <option value="oily">Oily</option>
                                        <option value="combination">Combination</option>
                                        <option value="sensitive">Sensitive</option>
                                        <option value="acne_prone">Acne-prone</option>
                                        <option value="mature">Mature</option>
                                        <option value="all_types">All Types</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Dosage Form</label>
                                      <select className="form-control">
                                        <option value="">Select Dosage Form</option>
                                        <option value="cream">Cream</option>
                                        <option value="lotion">Lotion</option>
                                        <option value="gel">Gel</option>
                                        <option value="soap">Soap</option>
                                        <option value="shampoo">Shampoo</option>
                                        <option value="toothpaste">Toothpaste</option>
                                        <option value="deodorant">Deodorant</option>
                                        <option value="powder">Powder</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Size</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 100ml, 200g"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Fragrance</label>
                                      <select className="form-control">
                                        <option value="">Select Fragrance</option>
                                        <option value="unscented">Unscented</option>
                                        <option value="lavender">Lavender</option>
                                        <option value="aloe">Aloe</option>
                                        <option value="coconut">Coconut</option>
                                        <option value="citrus">Citrus</option>
                                        <option value="floral">Floral</option>
                                        <option value="mint">Mint</option>
                                        <option value="vanilla">Vanilla</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Certification</label>
                                      <select className="form-control">
                                        <option value="">Select Certification</option>
                                        <option value="hypoallergenic">Hypoallergenic</option>
                                        <option value="dermatologist_tested">Dermatologist Tested</option>
                                        <option value="paraben_free">Paraben Free</option>
                                        <option value="sulfate_free">Sulfate Free</option>
                                        <option value="organic">Organic</option>
                                        <option value="cruelty_free">Cruelty Free</option>
                                        <option value="vegan">Vegan</option>
                                        <option value="none">None</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <label>Usage Instructions & Precautions</label>
                                      <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="List personal care-specific instructions, application methods, and safety precautions"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Navigation Buttons for Basic Tab */}
                      <div className="row mt-4">
                        <div className="col-12">
                          <div className="d-flex justify-content-end">
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={goToNextTab}
                            >
                              Next: Variations
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Suppliers Tab */}
                  {activeTab === 'suppliers' && (
                    <>
                      <div className="row mt-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Supplier Name</label>
                            <select
                              name="supplier"
                              value={medicineForm.supplier}
                              onChange={(e) => {
                                handleChange(e);
                                if (e.target.value) {
                                  handleSupplierSelect(e.target.value);
                                }
                              }}
                              className={classNames("form-control", { 'is-invalid': errors.supplier })}
                            >
                              <option value="">Select Supplier</option>
                              {suppliers.map(supplier => (
                                <option
                                  value={supplier.name || supplier.supplier_name}
                                  key={supplier.id}
                                >
                                  {supplier.name || supplier.supplier_name}
                                </option>
                              ))}
                            </select>
                            {errors.supplier && <div className="invalid-feedback d-block">{errors.supplier}</div>}
                          </div>
                        </div>
                        {/* <div className="col-md-6">
                          <div className="form-group">
                            <label>Supplier Contact Person</label>
                            <input
                              type="text"
                              name="supplier_contact_person"
                              value={medicineForm.supplier_contact_person}
                              onChange={handleChange}
                              placeholder="Enter Contact Person Name"
                              className={classNames("form-control", { 'is-invalid': errors.supplier_contact_person })}
                            />
                            {errors.supplier_contact_person && <div className="invalid-feedback d-block">{errors.supplier_contact_person}</div>}
                          </div>
                        </div> */}
                      </div>
                      <div className="row mt-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Supplier Email</label>
                            <input
                              type="email"
                              name="supplier_email"
                              value={medicineForm.supplier_email}
                              onChange={handleChange}
                              placeholder="Enter Supplier Email"
                              className={classNames("form-control", { 'is-invalid': errors.supplier_email })}
                            />
                            {errors.supplier_email && <div className="invalid-feedback d-block">{errors.supplier_email}</div>}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Supplier Phone</label>
                            <input
                              type="tel"
                              name="supplier_contact"
                              value={medicineForm.supplier_contact || ''}
                              onChange={handleChange}
                              placeholder="Enter Supplier Phone"
                              className="form-control"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mt-3">
                        <div className="col-12">
                          <div className="form-group">
                            <label>Supplier Address</label>
                            <textarea
                              name="supplier_address"
                              value={medicineForm.supplier_address || ''}
                              onChange={handleChange}
                              placeholder="Enter Supplier Address"
                              className="form-control"
                              rows="3"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Navigation Buttons for Suppliers Tab */}
                      <div className="row mt-4">
                        <div className="col-12">
                          <div className="d-flex justify-content-between">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={goToPreviousTab}
                            >
                              Previous: Variation
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={goToNextTab}
                            >
                              Next: Manufacturers
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Manufacturers Tab */}
                  {activeTab === 'manufacturers' && (
                    <>
                      <div className="row mt-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Manufacturer Name</label>
                            <select
                              className="form-control"
                              value={manufacturerForm.manufacturer_name}
                              onChange={(e) => {
                                handleManufacturerFieldChange('manufacturer_name', e.target.value);
                                if (e.target.value) {
                                  handleManufacturerSelect(e.target.value);
                                }
                              }}
                            >
                              <option value="">Select Manufacturer</option>
                              {manufacturers.map(manufacturer => (
                                <option
                                  value={manufacturer.name || manufacturer.manufacturer_name}
                                  key={manufacturer.id}
                                >
                                  {manufacturer.name || manufacturer.manufacturer_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {/* <div className="col-md-6">
                          <div className="form-group">
                            <label>Contact Person</label>
                            <input
                              type="text"
                              className="form-control"
                              value={manufacturerForm.manufacturer_contact}
                              onChange={(e) => handleManufacturerFieldChange('manufacturer_contact', e.target.value)}
                              placeholder="Enter Contact Person"
                            />
                          </div>
                        </div> */}
                      </div>
                      <div className="row mt-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Manufacturer Email</label>
                            <input
                              type="email"
                              className="form-control"
                              value={manufacturerForm.manufacturer_email}
                              onChange={(e) => handleManufacturerFieldChange('manufacturer_email', e.target.value)}
                              placeholder="Enter Manufacturer Email"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Manufacturer Phone</label>
                            <input
                              type="tel"
                              className="form-control"
                              value={manufacturerForm.manufacturer_phone}
                              onChange={(e) => handleManufacturerFieldChange('manufacturer_phone', e.target.value)}
                              placeholder="Enter Manufacturer Phone"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mt-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Registration Number</label>
                            <input
                              type="text"
                              className="form-control"
                              value={manufacturerForm.registration_number}
                              onChange={(e) => handleManufacturerFieldChange('registration_number', e.target.value)}
                              placeholder="Enter Registration Number"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>License Number</label>
                            <input
                              type="text"
                              className="form-control"
                              value={manufacturerForm.license_number}
                              onChange={(e) => handleManufacturerFieldChange('license_number', e.target.value)}
                              placeholder="Enter License Number"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mt-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Website</label>
                            <input
                              type="url"
                              className="form-control"
                              value={manufacturerForm.manufacturer_website}
                              onChange={(e) => handleManufacturerFieldChange('manufacturer_website', e.target.value)}
                              placeholder="Enter Website URL"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Certifications</label>
                            <div className="mt-2">
                              <div className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="gmpCertified"
                                  checked={manufacturerForm.gmp_certified}
                                  onChange={(e) => handleManufacturerFieldChange('gmp_certified', e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="gmpCertified">
                                  GMP Certified
                                </label>
                              </div>
                              <div className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="isoCertified"
                                  checked={manufacturerForm.iso_certified}
                                  onChange={(e) => handleManufacturerFieldChange('iso_certified', e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="isoCertified">
                                  ISO Certified
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row mt-3">
                        <div className="col-12">
                          <div className="form-group">
                            <label>Manufacturer Address</label>
                            <textarea
                              className="form-control"
                              rows="3"
                              value={manufacturerForm.manufacturer_address}
                              onChange={(e) => handleManufacturerFieldChange('manufacturer_address', e.target.value)}
                              placeholder="Enter Manufacturer Address"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Navigation Buttons for Manufacturers Tab */}
                      <div className="row mt-4">
                        <div className="col-12">
                          <div className="d-flex justify-content-between">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={goToPreviousTab}
                            >
                              Previous: Suppliers
                            </button>
                            <button
                              type="submit"
                              className="btn btn-success"
                            >
                              Add Medicine
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Variations Tab */}
                  {activeTab === 'variations' && (
                    <>
                      <div className="row mt-3">
                        <div className="col-12">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <label className="mb-0">Product Variations</label>
                            <button type="button" className="btn btn-outline-secondary" onClick={addVariationRow}>+ Add Variation</button>
                          </div>
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th>SKU</th>
                                <th>Stock</th>
                                <th>Unit</th>
                                <th>Price</th>
                                <th>Batch Code</th>
                                <th>Discounts</th>
                                <th>Status</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {medicineForm.variations.map((variation, index) => (
                                <tr key={index}>
                                  <td>
                                    <input type="text" value={variation.sku} onChange={e => handleVariationChange(index, 'sku', e.target.value)} className={classNames("form-control", { 'is-invalid': errors.variations && errors.variations[index] && errors.variations[index].sku })} placeholder="SKU" />
                                    {errors.variations && errors.variations[index] && errors.variations[index].sku && <div className="invalid-feedback d-block">{errors.variations[index].sku}</div>}
                                  </td>
                                  <td>
                                    <input type="number" value={variation.stock} onChange={e => handleVariationChange(index, 'stock', e.target.value)} className={classNames("form-control", { 'is-invalid': errors.variations && errors.variations[index] && errors.variations[index].stock })} placeholder="Stock" />
                                    {errors.variations && errors.variations[index] && errors.variations[index].stock && <div className="invalid-feedback d-block">{errors.variations[index].stock}</div>}
                                  </td>
                                  <td>
                                    <select
                                      className="form-control"
                                      value={commonUnits.includes(variation.unit) ? variation.unit : (variation.unit ? 'custom' : '')}
                                      onChange={e => handleUnitChange(index, e.target.value)}
                                    >
                                      <option value="">Select</option>
                                      {commonUnits.map(u => <option value={u} key={u}>{u}</option>)}
                                    </select>
                                    {((variation.unit === '' && customUnits[index] !== undefined) || variation.unit === 'custom' || (!commonUnits.includes(variation.unit) && variation.unit)) && (
                                      <input
                                        type="text"
                                        className="form-control mt-1"
                                        placeholder="Custom unit"
                                        value={customUnits[index] !== undefined ? customUnits[index] : variation.unit}
                                        onChange={e => handleCustomUnitChange(index, e.target.value)}
                                      />
                                    )}
                                  </td>
                                  <td>
                                    <input type="text" value={variation.price} onChange={e => handleVariationChange(index, 'price', e.target.value)} className={classNames("form-control", { 'is-invalid': errors.variations && errors.variations[index] && errors.variations[index].price })} placeholder="Price" />
                                    {errors.variations && errors.variations[index] && errors.variations[index].price && <div className="invalid-feedback d-block">{errors.variations[index].price}</div>}
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      value={variation.batch_code}
                                      onChange={e => handleVariationChange(index, 'batch_code', e.target.value)}
                                      onFocus={() => setShowBatchDetails(prev => ({ ...prev, [index]: true }))}
                                      className={classNames("form-control", { 'is-invalid': errors.variations && errors.variations[index] && errors.variations[index].batch_code })}
                                      placeholder="Batch Code"
                                    />
                                    {errors.variations && errors.variations[index] && errors.variations[index].batch_code && (
                                      <div className="invalid-feedback d-block">{errors.variations[index].batch_code}</div>
                                    )}
                                    {showBatchDetails[index] && (
                                      <>
                                      <div className="mt-2">
                                          <label>Exp Date</label>
                                        <input
                                          type="date"
                                          value={variation.expiry_date}
                                          onChange={e => handleVariationChange(index, 'expiry_date', e.target.value)}
                                          className={classNames("form-control mb-1", { 'is-invalid': errors.variations && errors.variations[index] && errors.variations[index].expiry_date })}
                                          placeholder="Expiry Date"
                                        />
                                        {errors.variations && errors.variations[index] && errors.variations[index].expiry_date && (
                                          <div className="invalid-feedback d-block">{errors.variations[index].expiry_date}</div>
                                        )}
                                        </div>
                                        <div>
                                          <label>Manufacturing Date</label>
                                        <input
                                          type="date"
                                          value={variation.mfg_date}
                                          onChange={e => handleVariationChange(index, 'mfg_date', e.target.value)}
                                          className={classNames("form-control", { 'is-invalid': errors.variations && errors.variations[index] && errors.variations[index].mfg_date })}
                                          placeholder="Mfg Date"
                                        />
                                        {errors.variations && errors.variations[index] && errors.variations[index].mfg_date && (
                                          <div className="invalid-feedback d-block">{errors.variations[index].mfg_date}</div>
                                        )}
                                        </div>
                                      </>
                                    )}
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <span className="badge bg-info py-2 me-2">
                                        {variation.discounts.length} discount(s)
                                      </span>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => toggleDiscountDetails(index)}
                                      >
                                        {showDiscountDetails[index] ? <FiMinus /> : <FiPlus />}
                                      </button>
                                    </div>

                                    {/* Show discount fields when expanded */}
                                    {showDiscountDetails[index] && (
                                      <div className="mt-2 p-2 border rounded bg-light">
                                        {variation.discounts.map((discount, discountIndex) => (
                                          <div key={discountIndex} className="discount-row mb-2">
                                            <div className="row g-2">
                                              <div className="col-4">
                                                <input
                                                  type="number"
                                                  className={classNames("form-control form-control-sm", {
                                                    'is-invalid': errors.variations &&
                                                      errors.variations[index] &&
                                                      errors.variations[index].discounts &&
                                                      errors.variations[index].discounts[discountIndex] &&
                                                      errors.variations[index].discounts[discountIndex].value
                                                  })}
                                                  value={discount.value}
                                                  onChange={(e) => handleDiscountChange(index, discountIndex, 'value', e.target.value)}
                                                  placeholder="Value"
                                                  step="0.01"
                                                  min="0"
                                                />
                                                {errors.variations &&
                                                  errors.variations[index] &&
                                                  errors.variations[index].discounts &&
                                                  errors.variations[index].discounts[discountIndex] &&
                                                  errors.variations[index].discounts[discountIndex].value && (
                                                    <div className="invalid-feedback d-block small">
                                                      {errors.variations[index].discounts[discountIndex].value}
                                                    </div>
                                                  )}
                                              </div>
                                              <div className="col-4">
                                                <select
                                                  className="form-control form-control-sm"
                                                  value={discount.type}
                                                  onChange={(e) => handleDiscountChange(index, discountIndex, 'type', e.target.value)}
                                                >
                                                  {discountTypes.map(type => (
                                                    <option key={type.value} value={type.value}>
                                                      {type.label}
                                                    </option>
                                                  ))}
                                                </select>
                                              </div>
                                              <div className="col-3">
                                                <input
                                                  type="number"
                                                  className={classNames("form-control form-control-sm", {
                                                    'is-invalid': errors.variations &&
                                                      errors.variations[index] &&
                                                      errors.variations[index].discounts &&
                                                      errors.variations[index].discounts[discountIndex] &&
                                                      errors.variations[index].discounts[discountIndex].quantity
                                                  })}
                                                  value={discount.quantity}
                                                  onChange={(e) => handleDiscountChange(index, discountIndex, 'quantity', e.target.value)}
                                                  placeholder="Qty"
                                                  min="1"
                                                />
                                                {errors.variations &&
                                                  errors.variations[index] &&
                                                  errors.variations[index].discounts &&
                                                  errors.variations[index].discounts[discountIndex] &&
                                                  errors.variations[index].discounts[discountIndex].quantity && (
                                                    <div className="invalid-feedback d-block small">
                                                      {errors.variations[index].discounts[discountIndex].quantity}
                                                    </div>
                                                  )}
                                              </div>
                                              <div className="col-1 d-flex align-item-center">
                                                <button
                                                  type="button"
                                                  className="btn btn-outline-danger px-2 py-3"
                                                  onClick={() => removeDiscount(index, discountIndex)}
                                                  title="Remove discount"
                                                >
                                                  <FiTrash size={12} />
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        ))}

                                        {/* Add discount button */}
                                        <div className="text-center mt-2">
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => addDiscount(index)}
                                          >
                                            + Add Discount
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Show discount summary when collapsed */}
                                    {variation.discounts.length > 0 && !showDiscountDetails[index] && (
                                      <div className="mt-1">
                                        <small className="text-muted">
                                          {variation.discounts.map((discount, i) => (
                                            <span key={i} className="d-block">
                                              {getDiscountDisplay(discount)}
                                            </span>
                                          ))}
                                        </small>
                                      </div>
                                    )}
                                  </td>
                                  <td>
                                    <div className="form-check form-switch">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={variation.status}
                                        onChange={e => handleVariationChange(index, 'status', e.target.checked)}
                                      />
                                    </div>
                                  </td>
                                  <td className="text-center">
                                    {index !== 0 && (
                                      <button type="button" onClick={() => deleteVariationRow(index)} className="btn btn-sm btn-outline-danger"><FiTrash /></button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Navigation Buttons for Variations Tab (Final Tab) */}
                  {activeTab === 'variations' && (
                    <div className="row mt-4">
                      <div className="col-12">
                        <div className="d-flex justify-content-between">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={goToPreviousTab}
                          >
                            Previous: Basic Information
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={goToNextTab}
                          >
                            Next: Suppliers
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
              <CardLoader refreshKey={refreshKey} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AddMedicine; 