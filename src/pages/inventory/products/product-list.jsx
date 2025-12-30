import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiRefreshCw, FiDownload, FiUpload } from 'react-icons/fi';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import CardHeader from '@/components/shared/CardHeader';
import CardLoader from '@/components/shared/CardLoader';
import useCardTitleActions from '@/hooks/useCardTitleActions';
import MedicinesTable from '../../../components/medicines/MedicinesTable';
import Footer from '@/components/shared/Footer';

const ProductList = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    refreshKey,
    isRemoved,
    isExpanded
  } = useCardTitleActions();

  if (isRemoved) return null;

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Medicine list refreshed successfully!');
    } catch (error) {
      console.log('Failed to refresh medicine list');
      // toast.error('Failed to refresh medicine list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    toast.info('Export functionality coming soon!');
  };

  const handleImport = () => {
    toast.info('Import functionality coming soon!');
  };

  const handleView = (medicine) => {
    toast.info('View functionality coming soon!');
  };

  const handleEdit = (medicine) => {
    navigate(`/inventory/products/product-edit/${medicine.id}`);
  };

  return (
    <>
      <PageHeader>
        <div className='d-flex gap-2'>
          <button
            className="btn btn-outline-secondary"
            onClick={handleRefreshData}
            disabled={isLoading}
          >
            <FiRefreshCw className={`me-1 ${isLoading ? 'spinner-border spinner-border-sm' : ''}`} />
            Refresh
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/inventory/products/product-create')}>
            <FiPlus className="me-1" />
            Add Medicine
          </button>
        </div>
      </PageHeader>
      <div className="main-content">
        <div className="row">
          <div className="col-12">
            {/* <CardHeader
                title="Products List"
                children={
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm" onClick={handleRefreshData} disabled={isLoading}>
                      <FiRefreshCw className={`me-1 ${isLoading ? 'spinner-border spinner-border-sm' : ''}`} />
                      Refresh
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={handleExport}>
                      <FiDownload className="me-1" />
                      Export
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={handleImport}>
                      <FiUpload className="me-1" />
                      Import
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/inventory/products/product-create')}>
                      <FiPlus className="me-1" />
                      Add Medicine
                    </button>
                  </div>
                }
              /> */}
              <MedicinesTable
                onViewClick={handleView}
                onEditClick={handleEdit}
                canDelete={true}
                canEdit={true}
                canView={true}
                showPrint={true}
              cardHeader={
                <div className="d-flex justify-content-between align-items-center w-100">
                  <h5 className="card-title mb-0">Products List</h5>
                  {/* <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={handleRefreshData}
                      disabled={isLoading}
                    >
                      <FiRefreshCw className={`me-1 ${isLoading ? 'spinner-border spinner-border-sm' : ''}`} />
                      Refresh
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={handleExport}>
                      <FiDownload className="me-1" />
                      Export
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={handleImport}>
                      <FiUpload className="me-1" />
                      Import
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/inventory/products/product-create')}>
                      <FiPlus className="me-1" />
                      Add Medicine
                    </button>
                  </div> */}
                </div>
              }
              isLoading={isLoading}
              refreshKey={refreshKey}
              />
            {refreshKey && <CardLoader refreshKey={refreshKey} />}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductList;