import React, { useState } from 'react'
import Footer from '@/components/shared/Footer'
import PageHeaderSetting from '@/components/shared/pageHeader/PageHeaderSetting'
import { settingOptions } from './settingsEmailForm'
import SelectDropdown from '@/components/shared/SelectDropdown'
import TextAreaTopLabel from '@/components/shared/TextAreaTopLabel'
import MultiSelectTags from '@/components/shared/MultiSelectTags'
import { FiTruck, FiPackage } from 'react-icons/fi'
import PerfectScrollbar from 'react-perfect-scrollbar'

const supplierPermissionsOptions = [
    { label: "Purchase Orders", value: "purchase_orders" },
    { label: "Inventory Management", value: "inventory" },
    { label: "Product Catalog", value: "catalog" },
    { label: "Quality Control", value: "quality" },
    { label: "Delivery Tracking", value: "delivery" },
    { label: "Payment Terms", value: "payments" },
]

const manufacturerPermissionsOptions = [
    { label: "Production Planning", value: "production" },
    { label: "Quality Assurance", value: "qa" },
    { label: "Batch Management", value: "batches" },
    { label: "Regulatory Compliance", value: "compliance" },
    { label: "Supply Chain", value: "supply_chain" },
    { label: "Technical Support", value: "tech_support" },
]
const SettingsSuppliersManufacturersForm = () => {
    const [selectedOption, setSelectedOption] = useState(null)
    const [activeTab, setActiveTab] = useState('supplier')
    const options = settingOptions

    return (
        <div className="content-area" data-scrollbar-target="#psScrollbarInit">
            <PerfectScrollbar >
            <PageHeaderSetting />
                {/* Tab Navigation */}
                <div className="content-area-body">
                <div className="card mb-0">
                        <div className="card-header border-bottom-0 pb-0">
                            <div className="nav nav-tabs nav-tabs-line" role="tablist">
                                <button
                                    className={`nav-link ${activeTab === 'supplier' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('supplier')}
                                    type="button"
                                >
                                    <FiTruck className="me-2" />
                                    Supplier Settings
                                </button>
                                <button
                                    className={`nav-link ${activeTab === 'manufacturer' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('manufacturer')}
                                    type="button"
                                >
                                    <FiPackage className="me-2" />
                                    Manufacturer Settings
                                </button>
                            </div>
                        </div>
                    <div className="card-body">
                            {/* Supplier Settings */}
                            {activeTab === 'supplier' && (
                                <>
                                    <div className="mb-4">
                                        <h6 className="card-title mb-3 d-flex align-items-center">
                                            <FiTruck className="me-2 text-primary" />
                                            Supplier Registration & Management
                                        </h6>
                                    </div>

                                    <div className="mb-5">
                                        <label className="form-label">Company field is required for suppliers</label>
                                        <SelectDropdown
                                            options={options}
                                            defaultSelect={"yes"}
                                            selectedOption={selectedOption}
                                            onSelectOption={(option) => setSelectedOption(option)}
                                        />
                                        <small className="form-text text-muted">Company field is required for supplier registration [Ex: Yes/No]</small>
                                    </div>

                                    <div className="mb-5">
                                        <label className="form-label">Require supplier license/certification verification</label>
                                        <SelectDropdown
                                            options={options}
                                            defaultSelect={"yes"}
                                            selectedOption={selectedOption}
                                            onSelectOption={(option) => setSelectedOption(option)}
                                        />
                                        <small className="form-text text-muted">Require suppliers to provide valid licenses and certifications [Ex: Yes/No]</small>
                                    </div>

                                    <div className="mb-5">
                                        <label className="form-label">Allow suppliers to self-register</label>
                                        <SelectDropdown
                                            options={options}
                                            defaultSelect={"no"}
                                            selectedOption={selectedOption}
                                            onSelectOption={(option) => setSelectedOption(option)}
                                        />
                                        <small className="form-text text-muted">Allow suppliers to register themselves or require admin approval [Ex: Yes/No]</small>
                                    </div>

                                    <div className="mb-5">
                                        <label className="form-label">Enable supplier performance tracking</label>
                                        <SelectDropdown
                                            options={options}
                                            defaultSelect={"yes"}
                                            selectedOption={selectedOption}
                                            onSelectOption={(option) => setSelectedOption(option)}
                                        />
                                        <small className="form-text text-muted">Track supplier delivery times, quality ratings, and reliability [Ex: Yes/No]</small>
                                    </div>

                                    <div className="mb-5">
                                        <label className="form-label">Require minimum order quantities (MOQ)</label>
                                        <SelectDropdown
                                            options={options}
                                            defaultSelect={"yes"}
                                            selectedOption={selectedOption}
                                            onSelectOption={(option) => setSelectedOption(option)}
                                        />
                                        <small className="form-text text-muted">Enforce minimum order quantities for supplier products [Ex: Yes/No]</small>
                                    </div>

                                    <div className="mb-5">
                                        <label className="form-label">Enable automated purchase order generation</label>
                                        <SelectDropdown
                                            options={options}
                                            defaultSelect={"no"}
                                            selectedOption={selectedOption}
                                            onSelectOption={(option) => setSelectedOption(option)}
                                        />
                                        <small className="form-text text-muted">Automatically generate purchase orders when inventory is low [Ex: Yes/No]</small>
                                    </div>

                                    <div className="mb-5">
                                        <label className="form-label">Require supplier quality certifications</label>
                                        <SelectDropdown
                                            options={options}
                                            defaultSelect={"yes"}
                                            selectedOption={selectedOption}
                                            onSelectOption={(option) => setSelectedOption(option)}
                                        />
                                        <small className="form-text text-muted">Require suppliers to maintain quality certifications (ISO, GMP, etc.) [Ex: Yes/No]</small>
                                    </div>

                                    <div className="mb-5">
                                        <label className="form-label">Default supplier permissions</label>
                                        <MultiSelectTags
                                            options={supplierPermissionsOptions}
                                            defaultSelect={[supplierPermissionsOptions[0], supplierPermissionsOptions[1], supplierPermissionsOptions[2]]}
                                        />
                                        <small className="form-text text-muted">Default permissions for supplier contacts</small>
                                    </div>

                                    <TextAreaTopLabel
                                        label={"Supplier Information Format (PDF and HTML)"}
                                        placeholder="{company_name}
{supplier_id}
{contact_person}
{street}
{city} {state}
{country_code} {zip_code}
{phone}
{email}
{license_number}
{certification_details}"
                                        info={"Supplier Information Format for documents [Ex: {company_name}, {supplier_id}, {contact_person}, {street}, {city}, {state}, {zip_code}, {country_code}, {phone}, {email}, {license_number}, {certification_details}]"}
                                    />
                                </>
                            )}

                            {/* Manufacturer Settings */}
                            {activeTab === 'manufacturer' && (
                                <>
                                    <div className="mb-4">
                                        <h6 className="card-title mb-3 d-flex align-items-center">
                                            <FiPackage className="me-2 text-success" />
                                            Manufacturer Registration & Management
                                        </h6>
                                    </div>

                                    <div className="mb-5">
                                        <label className="form-label">Require FDA/regulatory approval verification</label>
                                        <SelectDropdown
                                            options={options}
                                            defaultSelect={"yes"}
                                            selectedOption={selectedOption}
                                            onSelectOption={(option) => setSelectedOption(option)}
                                        />
                                        <small className="form-text text-muted">Require manufacturers to provide valid FDA or regulatory approvals [Ex: Yes/No]</small>
                                    </div>

                                    <div className="mb-5">
                                        <label className="form-label">Enable batch tracking and traceability</label>
                                        <SelectDropdown
                                            options={options}
                                            defaultSelect={"yes"}
                                            selectedOption={selectedOption}
                                            onSelectOption={(option) => setSelectedOption(option)}
                                        />
                                        <small className="form-text text-muted">Track product batches from manufacturer to end user [Ex: Yes/No]</small>
                                    </div>

                                    <div className="mb-5">
                                        <label className="form-label">Require Good Manufacturing Practice (GMP) certification</label>
                                        <SelectDropdown
                                            options={options}
                                            defaultSelect={"yes"}
                                            selectedOption={selectedOption}
                                            onSelectOption={(option) => setSelectedOption(option)}
                                        />
                                        <small className="form-text text-muted">Require manufacturers to maintain GMP certification [Ex: Yes/No]</small>
                                    </div>

                                    <div className="mb-5">
                                        <label className="form-label">Enable product recall management</label>
                                        <SelectDropdown
                                            options={options}
                                            defaultSelect={"yes"}
                                            selectedOption={selectedOption}
                                            onSelectOption={(option) => setSelectedOption(option)}
                                        />
                                        <small className="form-text text-muted">Enable system to handle product recalls and notifications [Ex: Yes/No]</small>
                                    </div>

                                    <div className="mb-5">
                                        <label className="form-label">Require expiry date tracking</label>
                                        <SelectDropdown
                                            options={options}
                                            defaultSelect={"yes"}
                                            selectedOption={selectedOption}
                                            onSelectOption={(option) => setSelectedOption(option)}
                                        />
                                        <small className="form-text text-muted">Track product expiry dates and send alerts [Ex: Yes/No]</small>
                                    </div>

                                    <div className="mb-5">
                                        <label className="form-label">Enable temperature-controlled storage requirements</label>
                                        <SelectDropdown
                                            options={options}
                                            defaultSelect={"no"}
                                            selectedOption={selectedOption}
                                            onSelectOption={(option) => setSelectedOption(option)}
                                        />
                                        <small className="form-text text-muted">Track and enforce temperature storage requirements for products [Ex: Yes/No]</small>
                                    </div>

                                    <div className="mb-5">
                                        <label className="form-label">Require manufacturer audit reports</label>
                                        <SelectDropdown
                                            options={options}
                                            defaultSelect={"yes"}
                                            selectedOption={selectedOption}
                                            onSelectOption={(option) => setSelectedOption(option)}
                                        />
                                        <small className="form-text text-muted">Require regular audit reports from manufacturers [Ex: Yes/No]</small>
                                    </div>

                                    <div className="mb-5">
                                        <label className="form-label">Default manufacturer permissions</label>
                                        <MultiSelectTags
                                            options={manufacturerPermissionsOptions}
                                            defaultSelect={[manufacturerPermissionsOptions[0], manufacturerPermissionsOptions[1], manufacturerPermissionsOptions[3]]}
                                        />
                                        <small className="form-text text-muted">Default permissions for manufacturer contacts</small>
                                    </div>

                                    <TextAreaTopLabel
                                        label={"Manufacturer Information Format (PDF and HTML)"}
                                        placeholder="{company_name}
{manufacturer_id}
{contact_person}
{street}
{city} {state}
{country_code} {zip_code}
{phone}
{email}
{fda_license}
{gmp_certification}
{audit_date}"
                                        info={"Manufacturer Information Format for documents [Ex: {company_name}, {manufacturer_id}, {contact_person}, {street}, {city}, {state}, {zip_code}, {country_code}, {phone}, {email}, {fda_license}, {gmp_certification}, {audit_date}]"}
                                    />
                                </>
                            )}

                        </div>
                    </div>
                </div>
            <Footer />
            </PerfectScrollbar>
        </div>

    )
}

export default SettingsSuppliersManufacturersForm