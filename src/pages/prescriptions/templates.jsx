import React, { useState } from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import PrescriptionTemplateManager from '@/components/prescriptions/PrescriptionTemplateManager';

const PrescriptionTemplatesPage = () => {
  // Always open in page mode
  const [dummy, setDummy] = useState(false); // Just to force rerender if needed
  return (
    <>
      <PageHeader>
        <h3 className="mb-0">Manage Prescription Templates</h3>
      </PageHeader>
      <div className="main-content">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            <div className="card p-3">
              <PrescriptionTemplateManager isOpen={true} onClose={() => {}} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrescriptionTemplatesPage; 