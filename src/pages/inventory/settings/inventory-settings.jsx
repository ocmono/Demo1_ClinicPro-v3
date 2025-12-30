import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiSave, FiRefreshCw, FiSettings, FiAlertTriangle, FiPackage, FiDollarSign, FiCalendar, FiBell, FiShield, FiDatabase } from 'react-icons/fi';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import CardHeader from '@/components/shared/CardHeader';
import CardLoader from '@/components/shared/CardLoader';
import useCardTitleActions from '@/hooks/useCardTitleActions';
import Footer from '@/components/shared/Footer';

const InventorySettings = () => {
  const [settings, setSettings] = useState({
    // Stock Management
    lowStockThreshold: 10,
    criticalStockThreshold: 5,
    autoReorderEnabled: true,
    reorderPoint: 15,
    
    // Units & Measurements
    defaultUnit: 'tablet',
    weightUnit: 'mg',
    volumeUnit: 'ml',
    customUnits: ['capsule', 'syrup', 'injection', 'drops'],
    
    // Notifications
    lowStockAlerts: true,
    expiryAlerts: true,
    expiryWarningDays: 30,
    emailNotifications: true,
    smsNotifications: false,
    
    // Pricing & Currency
    defaultCurrency: 'INR',
    currencySymbol: '₹',
    taxRate: 18,
    markupPercentage: 25,
    
    // Categories & Attributes
    defaultCategory: 'General',
    enableVariations: true,
    enableBarcodes: true,
    autoGenerateSKU: true,
    skuPrefix: 'MED',
    
    // Backup & Security
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetentionDays: 365,
    enableAuditLog: true,
    
    // Display & UI
    itemsPerPage: 20,
    showStockLevels: true,
    showPricing: true,
    enableSearch: true,
    enableFilters: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('stock');

  const {
    refreshKey,
    isRemoved,
    isExpanded,
    handleRefresh,
    handleExpand,
    handleDelete
  } = useCardTitleActions();

  if (isRemoved) return null;

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.log("Failed to save settings");
      // toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      setSettings({
        lowStockThreshold: 10,
        criticalStockThreshold: 5,
        autoReorderEnabled: true,
        reorderPoint: 15,
        defaultUnit: 'tablet',
        weightUnit: 'mg',
        volumeUnit: 'ml',
        customUnits: ['capsule', 'syrup', 'injection', 'drops'],
        lowStockAlerts: true,
        expiryAlerts: true,
        expiryWarningDays: 30,
        emailNotifications: true,
        smsNotifications: false,
        defaultCurrency: 'INR',
        currencySymbol: '₹',
        taxRate: 18,
        markupPercentage: 25,
        defaultCategory: 'General',
        enableVariations: true,
        enableBarcodes: true,
        autoGenerateSKU: true,
        skuPrefix: 'MED',
        autoBackup: true,
        backupFrequency: 'daily',
        dataRetentionDays: 365,
        enableAuditLog: true,
        itemsPerPage: 20,
        showStockLevels: true,
        showPricing: true,
        enableSearch: true,
        enableFilters: true,
      });
      toast.success('Settings reset to default values!');
    }
  };

  const SettingSection = ({ title, icon: Icon, children }) => (
    <div className="card mb-4">
      <div className="card-header">
        <h6 className="mb-0">
          <Icon className="me-2" />
          {title}
        </h6>
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );

  const SettingRow = ({ label, children, description }) => (
    <div className="row mb-3">
      <div className="col-md-4">
        <label className="form-label fw-bold">{label}</label>
        {description && <small className="text-muted d-block">{description}</small>}
      </div>
      <div className="col-md-8">
        {children}
      </div>
    </div>
  );

  return (
    <>
      <PageHeader />
      <div className="main-content">
        <div className="row">
          <div className="col-12">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
              <CardHeader 
                title="Inventory Settings" 
                children={
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm" onClick={handleResetSettings}>
                      <FiRefreshCw className="me-1" />
                      Reset to Default
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveSettings} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiSave className="me-1" />
                          Save Settings
                        </>
                      )}
                    </button>
                  </div>
                }
              />
              <div className="card-body">
                {/* Tab Navigation */}
                <ul className="nav nav-tabs mb-4" role="tablist">
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'stock' ? 'active' : ''}`}
                      onClick={() => setActiveTab('stock')}
                    >
                      <FiPackage className="me-1" />
                      Stock Management
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'notifications' ? 'active' : ''}`}
                      onClick={() => setActiveTab('notifications')}
                    >
                      <FiBell className="me-1" />
                      Notifications
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'pricing' ? 'active' : ''}`}
                      onClick={() => setActiveTab('pricing')}
                    >
                      <FiDollarSign className="me-1" />
                      Pricing & Currency
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'categories' ? 'active' : ''}`}
                      onClick={() => setActiveTab('categories')}
                    >
                      <FiSettings className="me-1" />
                      Categories & Attributes
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
                      onClick={() => setActiveTab('security')}
                    >
                      <FiShield className="me-1" />
                      Security & Backup
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'display' ? 'active' : ''}`}
                      onClick={() => setActiveTab('display')}
                    >
                      <FiDatabase className="me-1" />
                      Display & UI
                    </button>
                  </li>
                </ul>

                {/* Stock Management Tab */}
                {activeTab === 'stock' && (
                  <div>
                    <SettingSection title="Stock Thresholds" icon={FiAlertTriangle}>
                      <SettingRow 
                        label="Low Stock Threshold" 
                        description="Alert when stock falls below this level"
                      >
                        <input 
                          type="number" 
                          className="form-control" 
                          value={settings.lowStockThreshold} 
                          onChange={e => handleSettingChange('lowStockThreshold', parseInt(e.target.value))}
                          min="1"
                        />
                      </SettingRow>
                      <SettingRow 
                        label="Critical Stock Threshold" 
                        description="Urgent alert when stock falls below this level"
                      >
                        <input 
                          type="number" 
                          className="form-control" 
                          value={settings.criticalStockThreshold} 
                          onChange={e => handleSettingChange('criticalStockThreshold', parseInt(e.target.value))}
                          min="1"
                        />
                      </SettingRow>
                      <SettingRow 
                        label="Reorder Point" 
                        description="Automatically create purchase orders when stock reaches this level"
                      >
                        <input 
                          type="number" 
                          className="form-control" 
                          value={settings.reorderPoint} 
                          onChange={e => handleSettingChange('reorderPoint', parseInt(e.target.value))}
                          min="1"
                        />
                      </SettingRow>
                      <SettingRow 
                        label="Auto Reorder" 
                        description="Enable automatic purchase order generation"
                      >
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={settings.autoReorderEnabled} 
                            onChange={e => handleSettingChange('autoReorderEnabled', e.target.checked)} 
                          />
                        </div>
                      </SettingRow>
                    </SettingSection>

                    <SettingSection title="Units & Measurements" icon={FiPackage}>
                      <SettingRow 
                        label="Default Unit" 
                        description="Default unit for new products"
                      >
                        <select 
                          className="form-select" 
                          value={settings.defaultUnit} 
                          onChange={e => handleSettingChange('defaultUnit', e.target.value)}
                        >
                          <option value="tablet">Tablet</option>
                          <option value="capsule">Capsule</option>
                          <option value="syrup">Syrup</option>
                          <option value="injection">Injection</option>
                          <option value="drops">Drops</option>
                          <option value="piece">Piece</option>
                        </select>
                      </SettingRow>
                      <SettingRow 
                        label="Weight Unit" 
                        description="Default unit for weight measurements"
                      >
                        <select 
                          className="form-select" 
                          value={settings.weightUnit} 
                          onChange={e => handleSettingChange('weightUnit', e.target.value)}
                        >
                          <option value="mg">Milligrams (mg)</option>
                          <option value="g">Grams (g)</option>
                          <option value="kg">Kilograms (kg)</option>
                        </select>
                      </SettingRow>
                      <SettingRow 
                        label="Volume Unit" 
                        description="Default unit for volume measurements"
                      >
                        <select 
                          className="form-select" 
                          value={settings.volumeUnit} 
                          onChange={e => handleSettingChange('volumeUnit', e.target.value)}
                        >
                          <option value="ml">Milliliters (ml)</option>
                          <option value="l">Liters (l)</option>
                        </select>
                      </SettingRow>
                    </SettingSection>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div>
                    <SettingSection title="Stock Alerts" icon={FiBell}>
                      <SettingRow 
                        label="Low Stock Alerts" 
                        description="Receive notifications for low stock items"
                      >
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={settings.lowStockAlerts} 
                            onChange={e => handleSettingChange('lowStockAlerts', e.target.checked)} 
                          />
                        </div>
                      </SettingRow>
                      <SettingRow 
                        label="Expiry Alerts" 
                        description="Receive notifications for expiring products"
                      >
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={settings.expiryAlerts} 
                            onChange={e => handleSettingChange('expiryAlerts', e.target.checked)} 
                          />
                        </div>
                      </SettingRow>
                      <SettingRow 
                        label="Expiry Warning Days" 
                        description="Days before expiry to start showing alerts"
                      >
                        <input 
                          type="number" 
                          className="form-control" 
                          value={settings.expiryWarningDays} 
                          onChange={e => handleSettingChange('expiryWarningDays', parseInt(e.target.value))}
                          min="1"
                        />
                      </SettingRow>
                    </SettingSection>

                    <SettingSection title="Notification Channels" icon={FiBell}>
                      <SettingRow 
                        label="Email Notifications" 
                        description="Send notifications via email"
                      >
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={settings.emailNotifications} 
                            onChange={e => handleSettingChange('emailNotifications', e.target.checked)} 
                          />
                        </div>
                      </SettingRow>
                      <SettingRow 
                        label="SMS Notifications" 
                        description="Send notifications via SMS"
                      >
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={settings.smsNotifications} 
                            onChange={e => handleSettingChange('smsNotifications', e.target.checked)} 
                          />
                        </div>
                      </SettingRow>
                    </SettingSection>
                  </div>
                )}

                {/* Pricing & Currency Tab */}
                {activeTab === 'pricing' && (
                  <div>
                    <SettingSection title="Currency Settings" icon={FiDollarSign}>
                      <SettingRow 
                        label="Default Currency" 
                        description="Primary currency for pricing"
                      >
                        <select 
                          className="form-select" 
                          value={settings.defaultCurrency} 
                          onChange={e => handleSettingChange('defaultCurrency', e.target.value)}
                        >
                          <option value="INR">Indian Rupee (₹)</option>
                          <option value="USD">US Dollar ($)</option>
                          <option value="EUR">Euro (€)</option>
                          <option value="GBP">British Pound (£)</option>
                        </select>
                      </SettingRow>
                      <SettingRow 
                        label="Currency Symbol" 
                        description="Symbol to display with prices"
                      >
                        <input 
                          type="text" 
                          className="form-control" 
                          value={settings.currencySymbol} 
                          onChange={e => handleSettingChange('currencySymbol', e.target.value)}
                          maxLength="5"
                        />
                      </SettingRow>
                    </SettingSection>

                    <SettingSection title="Pricing Rules" icon={FiDollarSign}>
                      <SettingRow 
                        label="Tax Rate (%)" 
                        description="Default tax rate for products"
                      >
                        <input 
                          type="number" 
                          className="form-control" 
                          value={settings.taxRate} 
                          onChange={e => handleSettingChange('taxRate', parseFloat(e.target.value))}
                          min="0"
                          max="100"
                          step="0.01"
                        />
                      </SettingRow>
                      <SettingRow 
                        label="Markup Percentage (%)" 
                        description="Default markup percentage for pricing"
                      >
                        <input 
                          type="number" 
                          className="form-control" 
                          value={settings.markupPercentage} 
                          onChange={e => handleSettingChange('markupPercentage', parseFloat(e.target.value))}
                          min="0"
                          max="100"
                          step="0.01"
                        />
                      </SettingRow>
                    </SettingSection>
                  </div>
                )}

                {/* Categories & Attributes Tab */}
                {activeTab === 'categories' && (
                  <div>
                    <SettingSection title="Product Configuration" icon={FiSettings}>
                      <SettingRow 
                        label="Default Category" 
                        description="Default category for new products"
                      >
                        <input 
                          type="text" 
                          className="form-control" 
                          value={settings.defaultCategory} 
                          onChange={e => handleSettingChange('defaultCategory', e.target.value)}
                        />
                      </SettingRow>
                      <SettingRow 
                        label="Enable Variations" 
                        description="Allow products to have multiple variations"
                      >
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={settings.enableVariations} 
                            onChange={e => handleSettingChange('enableVariations', e.target.checked)} 
                          />
                        </div>
                      </SettingRow>
                      <SettingRow 
                        label="Enable Barcodes" 
                        description="Enable barcode scanning functionality"
                      >
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={settings.enableBarcodes} 
                            onChange={e => handleSettingChange('enableBarcodes', e.target.checked)} 
                          />
                        </div>
                      </SettingRow>
                    </SettingSection>

                    <SettingSection title="SKU Configuration" icon={FiSettings}>
                      <SettingRow 
                        label="Auto Generate SKU" 
                        description="Automatically generate SKU for new products"
                      >
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={settings.autoGenerateSKU} 
                            onChange={e => handleSettingChange('autoGenerateSKU', e.target.checked)} 
                          />
                        </div>
                      </SettingRow>
                      <SettingRow 
                        label="SKU Prefix" 
                        description="Prefix for auto-generated SKUs"
                      >
                        <input 
                          type="text" 
                          className="form-control" 
                          value={settings.skuPrefix} 
                          onChange={e => handleSettingChange('skuPrefix', e.target.value.toUpperCase())}
                          maxLength="10"
                        />
                      </SettingRow>
                    </SettingSection>
                  </div>
                )}

                {/* Security & Backup Tab */}
                {activeTab === 'security' && (
                  <div>
                    <SettingSection title="Backup Settings" icon={FiShield}>
                      <SettingRow 
                        label="Auto Backup" 
                        description="Enable automatic data backup"
                      >
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={settings.autoBackup} 
                            onChange={e => handleSettingChange('autoBackup', e.target.checked)} 
                          />
                        </div>
                      </SettingRow>
                      <SettingRow 
                        label="Backup Frequency" 
                        description="How often to perform backups"
                      >
                        <select 
                          className="form-select" 
                          value={settings.backupFrequency} 
                          onChange={e => handleSettingChange('backupFrequency', e.target.value)}
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </SettingRow>
                      <SettingRow 
                        label="Data Retention (Days)" 
                        description="How long to keep backup data"
                      >
                        <input 
                          type="number" 
                          className="form-control" 
                          value={settings.dataRetentionDays} 
                          onChange={e => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
                          min="30"
                          max="3650"
                        />
                      </SettingRow>
                    </SettingSection>

                    <SettingSection title="Audit & Security" icon={FiShield}>
                      <SettingRow 
                        label="Enable Audit Log" 
                        description="Track all changes and user actions"
                      >
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={settings.enableAuditLog} 
                            onChange={e => handleSettingChange('enableAuditLog', e.target.checked)} 
                          />
                        </div>
                      </SettingRow>
                    </SettingSection>
                  </div>
                )}

                {/* Display & UI Tab */}
                {activeTab === 'display' && (
                  <div>
                    <SettingSection title="Table Display" icon={FiDatabase}>
                      <SettingRow 
                        label="Items Per Page" 
                        description="Number of items to show per page"
                      >
                        <select 
                          className="form-select" 
                          value={settings.itemsPerPage} 
                          onChange={e => handleSettingChange('itemsPerPage', parseInt(e.target.value))}
                        >
                          <option value={10}>10 items</option>
                          <option value={20}>20 items</option>
                          <option value={50}>50 items</option>
                          <option value={100}>100 items</option>
                        </select>
                      </SettingRow>
                      <SettingRow 
                        label="Show Stock Levels" 
                        description="Display stock levels in product lists"
                      >
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={settings.showStockLevels} 
                            onChange={e => handleSettingChange('showStockLevels', e.target.checked)} 
                          />
                        </div>
                      </SettingRow>
                      <SettingRow 
                        label="Show Pricing" 
                        description="Display pricing information in lists"
                      >
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={settings.showPricing} 
                            onChange={e => handleSettingChange('showPricing', e.target.checked)} 
                          />
                        </div>
                      </SettingRow>
                    </SettingSection>

                    <SettingSection title="Search & Filters" icon={FiDatabase}>
                      <SettingRow 
                        label="Enable Search" 
                        description="Enable search functionality"
                      >
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={settings.enableSearch} 
                            onChange={e => handleSettingChange('enableSearch', e.target.checked)} 
                          />
                        </div>
                      </SettingRow>
                      <SettingRow 
                        label="Enable Filters" 
                        description="Enable filtering options"
                      >
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={settings.enableFilters} 
                            onChange={e => handleSettingChange('enableFilters', e.target.checked)} 
                          />
                        </div>
                      </SettingRow>
                    </SettingSection>
                  </div>
                )}

                {/* Save Button */}
                <div className="mt-4 text-end">
                  <button className="btn btn-primary" onClick={handleSaveSettings} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving Settings...
                      </>
                    ) : (
                      <>
                        <FiSave className="me-2" />
                        Save All Settings
                      </>
                    )}
                  </button>
                </div>
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

export default InventorySettings; 