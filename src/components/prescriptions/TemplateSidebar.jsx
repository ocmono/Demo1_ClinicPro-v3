// components/TemplateSidebar.js
import React, { useState, useEffect } from 'react';
import { FiInfo, FiTrash2 } from 'react-icons/fi';
import { toast } from "react-toastify";
import { usePrescription } from "../../contentApi/PrescriptionProvider";
import { useMedicines } from "../../context/MedicinesContext";

const TemplateSidebar = () => {
  const { prescriptionFormData, setPrescriptionFormData, resetPrescriptionForm, templates, setAttachments } = usePrescription();
  const { medicines: contextMedicines } = useMedicines();
  const [customTemplates, setCustomTemplates] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('customPrescriptionTemplates');
    if (saved) {
      setCustomTemplates(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('customPrescriptionTemplates', JSON.stringify(customTemplates));
  }, [customTemplates]);

  const medicineOptions = contextMedicines.flatMap(med =>
    (med.variations || []).map(variation => ({
      label: `${med.name} (${variation.sku})`,
      value: variation.sku,
      medicineName: med.name,
      sku: variation.sku,
      price: Number(variation.price) || 0,
      unit: variation.unit,
      productId: med.id,
      ...variation,
    }))
  );

  const handleTemplateChange = (e) => {
    const selectedValue = e.target.value;

    if (selectedValue === "__none") {
      resetPrescriptionForm();
      setAttachments([]);
      toast.info("Template cleared. You can start fresh.");
      return;
    }

    const selectedTemplate = templates.find(t => t.id === parseInt(selectedValue));

    if (selectedTemplate) {
      const mappedMedicines = selectedTemplate.medicines.map(templateMed => {
        let foundMedicineOption = medicineOptions.find(opt =>
          opt.productId === templateMed.product_id ||
          opt.sku === templateMed.sku
        );

        if (!foundMedicineOption) {
          for (const med of contextMedicines) {
            if (med.id === templateMed.product_id) {
              const mainVariation = med.variations?.[0];
              foundMedicineOption = {
                label: `${med.name} (${mainVariation?.sku || templateMed.sku || 'N/A'})`,
                value: mainVariation?.sku || templateMed.sku || med.id,
                medicineName: med.name,
                sku: mainVariation?.sku || templateMed.sku,
                price: Number(mainVariation?.price) || 0,
                unit: mainVariation?.unit,
                productId: med.id,
                ...mainVariation
              };
              break;
            }

            if (med.variations) {
              const variation = med.variations.find(v => v.id === templateMed.product_id);
              if (variation) {
                foundMedicineOption = {
                  label: `${med.name} (${variation.sku || templateMed.sku || 'N/A'})`,
                  value: variation.sku || templateMed.sku || variation.id,
                  medicineName: med.name,
                  sku: variation.sku || templateMed.sku,
                  price: Number(variation.price) || 0,
                  unit: variation.unit,
                  productId: med.id,
                  ...variation
                };
                break;
              }
            }
          }
        }

        if (foundMedicineOption) {
          return {
            medicine: foundMedicineOption,
            notes: templateMed.notes || "",
            medicine_timing: templateMed.timing || "",
            sku: templateMed.sku || foundMedicineOption.sku
          };
        } else {
          const fallbackOption = {
            label: `${templateMed.product_name || "Unknown Medicine"} (${templateMed.sku || "N/A"})`,
            value: templateMed.sku || templateMed.product_id,
            medicineName: templateMed.product_name || "Unknown Medicine",
            sku: templateMed.sku || "",
            price: 0,
            productId: templateMed.product_id
          };

          return {
            medicine: fallbackOption,
            notes: templateMed.notes || "",
            medicine_timing: templateMed.timing || "",
            sku: templateMed.sku || ""
          };
        }
      });

      setPrescriptionFormData(prev => ({
        ...prev,
        symptoms: selectedTemplate.symptoms || "",
        diagnosis: selectedTemplate.diagnosis || "",
        instructions: selectedTemplate.instructions || "",
        medicines: mappedMedicines
      }));

      toast.success(`Template '${selectedTemplate.template_name}' applied!`);
    }
  };

  const handleSaveTemplate = () => {
    const name = prompt('Enter a name for this template:');
    if (!name) return;
    const templateData = {
      label: name,
      value: `custom_${Date.now()}`,
      data: {
        symptoms: prescriptionFormData.symptoms,
        diagnosis: prescriptionFormData.diagnosis,
        followUpDate: prescriptionFormData.followUpDate,
        instructions: prescriptionFormData.instructions,
        medicines: prescriptionFormData.medicines.map(med => ({ ...med })),
        vaccines: prescriptionFormData.vaccines?.map(vacc => ({ ...vacc })) || [],
        labTests: prescriptionFormData.labTests?.map(test => ({ ...test })) || []
      },
      isCustom: true,
    };
    setCustomTemplates(prev => [...prev, templateData]);
    toast.success(`Template '${name}' saved!`);
  };

  const handleDeleteTemplate = (value) => {
    if (!window.confirm('Delete this template?')) return;
    setCustomTemplates(prev => prev.filter(t => t.value !== value));
    toast.success('Template deleted.');
  };

  return (
    <div className="mb-0 card">
      <div className="card-header d-flex align-items-center gap-2">
        <span className="fw-bold">Prescription Template</span>
        <span className="fs-5 text-info"><FiInfo /></span>
      </div>
      <div className="card-body">
        <label className="form-label fw-bold fs-16">Select Template</label>
        <div className="d-flex align-items-center gap-2 mb-2">
          <select
            className="form-select"
            defaultValue=""
            onChange={handleTemplateChange}
          >
            <option value="">Select a template...</option>
            <option value="__none">None</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>
                {t.template_name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Show delete button for custom templates */}
        {customTemplates.length > 0 && (
          <div className="mt-2">
            <span className="me-2">Delete custom:</span>
            {customTemplates.map(t => (
              <button key={t.value} type="button" className="btn btn-xs btn-light btn-icon text-danger me-2 mb-1 border-0" style={{ padding: 0, width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleDeleteTemplate(t.value)}>
                <FiTrash2 size={12} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateSidebar;