import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import RootLayout from "../layout/root";
import ProtectedRoute from "../components/shared/ProtectedRoute";
import LayoutApplications from "../layout/layoutApplications";
import LayoutSetting from "../layout/layoutSetting";
import LayoutAuth from "../layout/layoutAuth";
import InitialRedirect from "../components/InitialRedirect";

// Direct imports for appointment pages (no lazy loading)
import AppointmentsBook from "../pages/appointments/book-appointment";
import AppointmentsBookIframe from "../pages/appointments/book-appointment-iframe";
import AppointmentsView from "../pages/appointments/appointments";
import PrescriptionCreateSimple from "../pages/prescriptions/SimpleComponent/PrescriptionCreateSimple";

// Loading component for Suspense fallback
const LoadingFallback = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
);

// Lazy load all other components except appointments
const Home = lazy(() => import("../pages/home"));
const Analytics = lazy(() => import("../pages/reports/analytics"));
const ReportsSales = lazy(() => import("../pages/reports/reports-sales"));
const ReportsLeads = lazy(() => import("../pages/reports/reports-leads"));
const ReportsProject = lazy(() => import("../pages/reports/reports-project"));
const AppsChat = lazy(() => import("../pages/apps/apps-chat"));
const AppsEmail = lazy(() => import("../pages/apps/apps-email"));
const ReportsTimesheets = lazy(() => import("../pages/reports/reports-timesheets"));
const LoginCover = lazy(() => import("../pages/auth/login/login-cover"));
const AppsTasks = lazy(() => import("../pages/apps/apps-tasks"));
const AppsNotes = lazy(() => import("../pages/apps/apps-notes"));
const AppsCalender = lazy(() => import("../pages/apps/apps-calender"));
const AppsStorage = lazy(() => import("../pages/apps/apps-storage"));
const Proposalist = lazy(() => import("../pages/proposals/proposal-list"));
const CustomersList = lazy(() => import("../pages/customers/customers-list"));
const ProposalView = lazy(() => import("../pages/proposals/proposal-view"));
const ProposalEdit = lazy(() => import("../pages/proposals/proposal-edit"));
const LeadsList = lazy(() => import("../pages/leads/leadsList"));
const LeadsManage = lazy(() => import("../pages/leads/leads-manage"));
const CustomersView = lazy(() => import("../pages/customers/customers-view"));
const CustomersCreate = lazy(() => import("../pages/customers/customers-create"));
const ProposalCreate = lazy(() => import("../pages/proposals/proposal-create"));
const LeadsView = lazy(() => import("../pages/leads/leads-view"));
const LeadsCreate = lazy(() => import("../pages/leads/leads-create"));
const LeadsImport = lazy(() => import("../pages/leads/leads-import"));
const LeadsExport = lazy(() => import("../pages/leads/leads-export"));
const SheetsSync = lazy(() => import("../pages/leads/sheets-sync"));
const BulkImportEnhanced = lazy(() => import("../pages/leads/bulk-import-enhanced"));
const GoogleSheetsEnhanced = lazy(() => import("../pages/leads/google-sheets-enhanced"));
const CampaignsEnhanced = lazy(() => import("../pages/leads/campaigns-enhanced"));
const CommunicationTemplates = lazy(() => import("../pages/leads/communication-templates"));
const LeadsEnhanced = lazy(() => import("../pages/leads/leads-enhanced"));
const LeadsDashboard = lazy(() => import("../pages/leads/leads-dashboard"));
const LeadsImportExport = lazy(() => import("../pages/leads/leads-import-export"));
const GoogleSheetsPage = lazy(() => import("../pages/leads/google-sheets-page"));
const TemplatesPage = lazy(() => import("../pages/leads/templates-page"));
const CampaignsPage = lazy(() => import("../pages/leads/campaigns-page"));
const LeadsAnalytics = lazy(() => import("../pages/leads/leads-analytics"));
const LeadsWorkflows = lazy(() => import("../pages/leads/leads-workflows"));
const PaymentList = lazy(() => import("../pages/payments/payment-list"));
const PaymentView = lazy(() => import("../pages/payments/payment-view/"));
const PaymentCreate = lazy(() => import("../pages/payments/payment-create"));
const ProjectsList = lazy(() => import("../pages/projects/projects-list"));
const ProjectsView = lazy(() => import("../pages/projects/projects-view"));
const ProjectsCreate = lazy(() => import("../pages/projects/projects-create"));
const SettingsGaneral = lazy(() => import("../pages/settings/settings-ganeral"));
const SettingsSeo = lazy(() => import("../pages/settings/settings-seo"));
const SettingsTags = lazy(() => import("../pages/settings/settings-tags"));
const SettingsEmail = lazy(() => import("../pages/settings/settings-email"));
const SettingsTasks = lazy(() => import("../pages/settings/settings-tasks"));
const SettingsLeads = lazy(() => import("../pages/settings/settings-leads"));
const SettingsMiscellaneous = lazy(() => import("../pages/settings/settings-miscellaneous"));
const SettingsRecaptcha = lazy(() => import("../pages/settings/settings-recaptcha"));
const SettingsLocalization = lazy(() => import("../pages/settings/settings-localization"));
const SettingsCustomers = lazy(() => import("../pages/settings/settings-customers"));
const SettingsGateways = lazy(() => import("../pages/settings/settings-gateways"));
const SettingsFinance = lazy(() => import("../pages/settings/settings-finance"));
const SettingsSupport = lazy(() => import("../pages/settings/settings-support"));
const SettingsToast = lazy(() => import("../pages/settings/settings-toast"));
const SettingsNotifications = lazy(() => import("../pages/settings/settings-notifications"));
const LoginMinimal = lazy(() => import("../pages/auth/login/login-minimal"));
const LoginCreative = lazy(() => import("../pages/auth/login/login-creative"));
const RegisterCover = lazy(() => import("../pages/auth/register/register-cover"));
const RegisterMinimal = lazy(() => import("../pages/auth/register/register-minimal"));
const RegisterCreative = lazy(() => import("../pages/auth/register/register-creative"));
const ResetCover = lazy(() => import("../pages/auth/reset-password/reset-cover"));
const ResetMinimal = lazy(() => import("../pages/auth/reset-password/reset-minimal"));
const ResetCreative = lazy(() => import("../pages/auth/reset-password/reset-creative"));
const ErrorCover = lazy(() => import("../pages/errors/error-cover"));
const ErrorCreative = lazy(() => import("../pages/errors/error-creative"));
const ErrorMinimal = lazy(() => import("../pages/errors/error-minimal"));
const OtpCover = lazy(() => import("../pages/auth/otp/otp-cover"));
const OtpMinimal = lazy(() => import("../pages/auth/otp/otp-minimal"));
const OtpCreative = lazy(() => import("../pages/auth/otp/otp-creative"));
const MaintenanceCover = lazy(() => import("../pages/auth/maintenance/maintenance-cover"));
const MaintenanceMinimal = lazy(() => import("../pages/auth/maintenance/maintenance-minimal"));
const MaintenanceCreative = lazy(() => import("../pages/auth/maintenance/maintenance-creative"));
const HelpKnowledgebase = lazy(() => import("../pages/help/knowledge-base/index"));
const WidgetsLists = lazy(() => import("../pages/widgets/widgets-lists"));
const WidgetsTables = lazy(() => import("../pages/widgets/widgets-tables"));
const WidgetsCharts = lazy(() => import("../pages/widgets/widgets-charts"));
const WidgetsStatistics = lazy(() => import("../pages/widgets/widgets-statistics"));
const WidgetsMiscellaneous = lazy(() => import("../pages/widgets/widgets-miscellaneous"));
const AppoCalender = lazy(() => import("../pages/apps/calendar/appo-calender"));
const DashboardAds = lazy(() => import("../pages/dashboard/ads-dashboard"));
const DashboardSocialMedia = lazy(() => import("../pages/dashboard/social-media-dashboard"));
const Dashboardleads = lazy(() => import("../pages/dashboard/leads-dashboard"));
const DashboardClinic = lazy(() => import("../pages/dashboard/clinic-dashboard"));
const MedicineAdd = lazy(() => import("../pages/medicines/add-medicine"));
const PatientsView = lazy(() => import("../pages/patients/patients"));
const VaccineCalendar = lazy(() => import("../pages/vaccines/vaccine-calendar"));
const CalendarConfig = lazy(() => import("../pages/clinic/settings/CalendarConfig"));
const PrescriptionCreate = lazy(() => import("../pages/prescriptions/create-prescription"));
const PrescriptionCreatePediatrics = lazy(() => import("../pages/prescriptions/create-prescription-pediatrics"));
const PrescriptionCreateDermatologist = lazy(() => import("../pages/prescriptions/create-prescription-dermatologist"));
const PrescriptionsView = lazy(() => import("../pages/prescriptions/prescriptions"));
const PrescriptionViewPage = lazy(() => import("../components/prescriptions/PrescriptionViewPage"));
const PatientAdd = lazy(() => import("../pages/patients/add-patient"));
const MedicinesView = lazy(() => import("../pages/medicines/medicines"));
const SpecialitiesView = lazy(() => import("../pages/clinic/specialties/specialities"));
const SpecialitiesAdd = lazy(() => import("../pages/clinic/specialties/specialities-add"));
const SpecialitiesEdit = lazy(() => import("../pages/clinic/specialties/specialities-edit"));
const SpecialitiesManage = lazy(() => import("../pages/clinic/specialties/specialities-manage"));
const SpecialtyProfile = lazy(() => import("../pages/clinic/specialties/specialty-profile"));
const SpecialtyConfigure = lazy(() => import("../pages/clinic/specialties/specialty-configure"));
const ClinicDashboard = lazy(() => import("../pages/clinic/dashboard/clinic-dashboard"));
const ReceptionistsView = lazy(() => import("../pages/clinic/receptionists/receptionists-view"));
const ReceptionistsAdd = lazy(() => import("../pages/clinic/receptionists/receptionists-add"));
const ReceptionistsEdit = lazy(() => import("../pages/clinic/receptionists/receptionists-edit"));
const ReceptionistsManage = lazy(() => import("../pages/clinic/receptionists/receptionists-manage"));
const RceptionistsView = lazy(() => import("../pages/clinic/receptionists/receptionists"));
const ReceptionistProfile = lazy(() => import("../pages/clinic/receptionists/receptionist-profile"));
const DoctorsView = lazy(() => import("../pages/clinic/doctors/doctors-view"));
const DoctorsAdd = lazy(() => import("../pages/clinic/doctors/doctors-add"));
const DoctorsEdit = lazy(() => import("../pages/clinic/doctors/doctors-edit"));
const DoctorsManage = lazy(() => import("../pages/clinic/doctors/doctors-manage"));
const AccountantsView = lazy(() => import("../pages/clinic/accountants/accountants"));
const AccountantsAdd = lazy(() => import("../pages/clinic/accountants/accountants-add"));
const AccountantsEdit = lazy(() => import("../pages/clinic/accountants/accountants-edit"));
const AccountantsManage = lazy(() => import("../pages/clinic/accountants/accountants-manage"));
const AccountantProfile = lazy(() => import("../pages/clinic/accountants/accountant-profile"));
const GenerateLink = lazy(() => import("../pages/settings/settings-genrate-link"));
const CustomMessage = lazy(() => import("../pages/settings/settings-custom-message"));
const CampaignsCreate = lazy(() => import("../pages/leads/campaigns-create"));
const CampaignsList = lazy(() => import("../pages/leads/campaignsList"));
const LeadsIntegrations = lazy(() => import("../pages/leads/integrations"));
const ManageUsers = lazy(() => import("../pages/clinic/users/manage-users"));
const UserProfile = lazy(() => import("../pages/clinic/users/user-profile"));
const EditUser = lazy(() => import("../pages/clinic/users/edit-user"));
const SuppliersEdit = lazy(() => import('../pages/inventory/suppliers/suppliers-edit'));
const CreateUser = lazy(() => import("../pages/clinic/users/create-user"));
const Users = lazy(() => import("../pages/clinic/users/Users"));
const AddUser = lazy(() => import("../pages/clinic/manage-users/Add-User"));
const UserRoles = lazy(() => import("../pages/clinic/users/UserRoles"));
const PermissionManagement = lazy(() => import("../pages/clinic/users/PermissionManagement"));
const PharmacyPOSTerminal = lazy(() => import("../pages/pharmacy/pos-terminal"));
const PharmacySalesHistory = lazy(() => import("../pages/pharmacy/sales-history"));
const PharmacyInvoices = lazy(() => import("../pages/pharmacy/invoices"));
const PharmacyInvoiceView = lazy(() => import("../pages/pharmacy/invoice-view"));
const ProductList = lazy(() => import("../pages/inventory/products/product-list"));
const ProductCreate = lazy(() => import("../pages/inventory/products/product-create"));
const ProductEdit = lazy(() => import("../pages/inventory/products/product-edit"));
const InventoryStockAdjustment = lazy(() => import("../pages/inventory/stock/stock-adjustment"));
const SettingsCommunication = lazy(() => import("../pages/settings/settings-communication"));
const SettingsWhatsApp = lazy(() => import("../pages/settings/settings-whatsapp"));
const SettingsEmailMessaging = lazy(() => import("../pages/settings/settings-email-messaging"));
const SettingsSMS = lazy(() => import("../pages/settings/settings-sms"));
const SettingsGpt = lazy(() => import("../pages/settings/settings-gpt"));
const PurchaseOrderCreate = lazy(() => import('../pages/inventory/purchase-orders/purchase-order-create'));
const PurchaseOrderEdit = lazy(() => import('../pages/inventory/purchase-orders/purchase-order-edit'));
const ProductVariations = lazy(() => import("../pages/inventory/products/product-variations"));
const CategoryList = lazy(() => import("../pages/inventory/categories/category-list"));
const AttributeList = lazy(() => import("../pages/inventory/attributes/attribute-list"));
const StockHistory = lazy(() => import("../pages/inventory/stock/stock-history"));
const SuppliersList = lazy(() => import("../pages/inventory/suppliers/suppliers-list"));
const SuppliersCreate = lazy(() => import("../pages/inventory/suppliers/suppliers-create"));
const SuppliersView = lazy(() => import('../pages/inventory/suppliers/suppliers-view'));
const ManufacturersList = lazy(() => import('../pages/inventory/manufacturers/manufacturers-list'));
const ManufacturersCreate = lazy(() => import('../pages/inventory/manufacturers/manufacturers-create'));
const ManufacturersView = lazy(() => import('../pages/inventory/manufacturers/manufacturers-view'));
const PurchaseOrdersList = lazy(() => import("../pages/inventory/purchase-orders/purchase-orders-list"));
const InventoryReport = lazy(() => import("../pages/inventory/reports/inventory-report"));
const InventorySettings = lazy(() => import("../pages/inventory/settings/inventory-settings"));
const SettingsClinic = lazy(() => import("../pages/settings/settings-clinic"));
const TemplatesManagement = lazy(() => import("../pages/prescriptions/templates-management"));
const DoctorViewDetails = lazy(() => import("../pages/clinic/doctors/doctors-view-details"));
const VaccineDashboard = lazy(() => import('../pages/vaccines/vaccine-dashboard'));
const PatientVaccineAdd = lazy(() => import('../pages/vaccines/add-vaccine'));
const VaccineAdd = lazy(() => import("@/components/vaccine/VaccineCreate"));
const ResetPassword = lazy(() => import("@/components/authentication/ResetPassword"));
const ActivityView = lazy(() => import("../pages/clinic/activity/activity-view"));
const UserSettings = lazy(() => import("@/components/setting/settingUser"));
const settingDateAndTimeFormate = lazy(() => import("@/components/setting/settingDateAndTimeFormate"));
const settingPasswordChange = lazy(() => import("@/components/setting/settingChangePassword"));

// Create a wrapper component for lazy loading with Suspense
const LazyComponent = ({ Component }) => (
    <Suspense fallback={<LoadingFallback />}>
        <Component />
    </Suspense>
);

export const router = createBrowserRouter([
    // Top-level route for iframe booking page (no layout) - This should remain public
    {
        path: "/appointment/book-appointment-iframe",
        element: <AppointmentsBookIframe /> // Direct component (no lazy loading)
    },
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <RootLayout />
            </ProtectedRoute>
        ), // main app layout
        children: [
            {
                path: "/",
                element: <LazyComponent Component={DashboardClinic} />
            },
            // Appointment pages - direct components (no lazy loading)
            {
                path: "/appointments/all-appointments",
                element: <AppointmentsView /> // Direct component
            },
            {
                path: "/appointments/book-appointment",
                element: <AppointmentsBook /> // Direct component
            },
            // All other routes use lazy loading
            {
                path: "/clinic/accountants",
                element: <LazyComponent Component={AccountantsView} />
            },
            {
                path: "/clinic/accountants/add",
                element: <LazyComponent Component={AccountantsAdd} />
            },
            {
                path: "/clinic/accountants/edit/:id",
                element: <LazyComponent Component={AccountantsEdit} />
            },
            {
                path: "/clinic/accountants/view/:id",
                element: <LazyComponent Component={AccountantProfile} />
            },
            {
                path: "/clinic/accountants/manage",
                element: <LazyComponent Component={AccountantsManage} />
            },
            {
                path: "/clinic/accountants-add",
                element: <LazyComponent Component={AccountantsAdd} />
            },
            {
                path: "/clinic/doctors",
                element: <LazyComponent Component={DoctorsView} />
            },
            {
                path: "/clinic/doctors/add",
                element: <LazyComponent Component={DoctorsAdd} />
            },
            {
                path: "/clinic/doctors/edit/:id",
                element: <LazyComponent Component={DoctorsEdit} />
            },
            {
                path: "/clinic/doctors/manage",
                element: <LazyComponent Component={DoctorsManage} />
            },
            {
                path: "/clinic/doctors/view/:id",
                element: <LazyComponent Component={DoctorViewDetails} />
            },
            {
                path: "/clinic/receptionists",
                element: <LazyComponent Component={RceptionistsView} />
            },
            {
                path: "/clinic/receptionists/add",
                element: <LazyComponent Component={ReceptionistsAdd} />
            },
            {
                path: "/clinic/receptionists/edit/:id",
                element: <LazyComponent Component={ReceptionistsEdit} />
            },
            {
                path: "/clinic/receptionists/view/:id",
                element: <LazyComponent Component={ReceptionistProfile} />
            },
            {
                path: "/clinic/receptionists/manage",
                element: <LazyComponent Component={ReceptionistsManage} />
            },
            {
                path: "/clinic/receptionists-add",
                element: <LazyComponent Component={ReceptionistsAdd} />
            },
            {
                path: "/clinic/specialities",
                element: <LazyComponent Component={SpecialitiesView} />
            },
            {
                path: "/clinic/specialities/add",
                element: <LazyComponent Component={SpecialitiesAdd} />
            },
            {
                path: "/clinic/specialities/edit/:id",
                element: <LazyComponent Component={SpecialitiesEdit} />
            },
            {
                path: "/clinic/specialities/view/:id",
                element: <LazyComponent Component={SpecialtyProfile} />
            },
            {
                path: "/clinic/specialities/configure/:id",
                element: <LazyComponent Component={SpecialtyConfigure} />
            },
            {
                path: "/clinic/specialities/manage",
                element: <LazyComponent Component={SpecialitiesManage} />
            },
            {
                path: "/clinic/dashboard",
                element: <LazyComponent Component={ClinicDashboard} />
            },
            {
                path: "/clinic/specialists/add",
                element: <LazyComponent Component={SpecialitiesAdd} />
            },
            {
                path: "/users",
                element: <LazyComponent Component={Users} />
            },
            {
                path: "/users/add",
                element: <LazyComponent Component={AddUser} />
            },
            {
                path: "/users/view/:id",
                element: <LazyComponent Component={UserProfile} />
            },
            {
                path: "/users/edit/:id",
                element: <LazyComponent Component={EditUser} />
            },
            {
                path: "/users/roles",
                element: <LazyComponent Component={UserRoles} />
            },
            {
                path: "/users/permission-management",
                element: <LazyComponent Component={PermissionManagement} />
            },
            {
                path: "/support",
                element: <LazyComponent Component={SettingsSupport} />
            },
            {
                path: "/clinic/activity",
                element: <LazyComponent Component={ActivityView} />
            },
            {
                path: "/dashboards/ads-google-meta",
                element: <LazyComponent Component={DashboardAds} />
            },
            {
                path: "/dashboards/social-media",
                element: <LazyComponent Component={DashboardSocialMedia} />
            },
            {
                path: "/dashboards/leads",
                element: <LazyComponent Component={Dashboardleads} />
            },
            {
                path: "/dashboards/clinic",
                element: <LazyComponent Component={DashboardClinic} />
            },
            // {
            //     path: "/medicines/add-medicine",
            //     element: <LazyComponent Component={MedicineAdd} />
            // },
            {
                path: "/medicines/all-medicines",
                element: <LazyComponent Component={MedicinesView} />
            },
            {
                path: "/patients/add-patient",
                element: <LazyComponent Component={PatientAdd} />
            },
            {
                path: "/patients/all-patients",
                element: <LazyComponent Component={PatientsView} />
            },
            {
                path: "/vaccines/vaccine-calendar",
                element: <LazyComponent Component={VaccineCalendar} />
            },
            {
                path: "/prescriptions/create-prescription",
                element: <LazyComponent Component={PrescriptionCreate} />
            },
            {
                path: "/prescriptions/create-prescription-pediatrics",
                element: <LazyComponent Component={PrescriptionCreatePediatrics} />
            },
            // {
            //     path: "/prescriptions/create-prescription-dermatologist",
            //     element: <LazyComponent Component={PrescriptionCreateDermatologist} />
            // },
            {
                path: "/prescriptions/create-prescription-simple",
                element: <LazyComponent Component={PrescriptionCreateSimple} />
            },
            // {
            //     path: "/prescriptions/create-prescription-dummy",
            //     element: <LazyComponent Component={PrescriptionsCreateDummy} />
            // },
            {
                path: "/prescriptions/all-prescriptions",
                element: <LazyComponent Component={PrescriptionsView} />
            },
            {
                path: "/prescription/view/:id",
                element: <LazyComponent Component={PrescriptionViewPage} />
            },
            {
                path: "/prescription/templates-management",
                element: <LazyComponent Component={TemplatesManagement} />
            },
            {
                path: "/vaccines/add-vaccine",
                element: <LazyComponent Component={VaccineAdd} />
            },
            {
                path: "/vaccines/dashboard",
                element: <LazyComponent Component={VaccineDashboard} />
            },
            {
                path: "/patients/add-patient-vaccine",
                element: <LazyComponent Component={PatientVaccineAdd} />
            },
            {
                path: "/dashboards/analytics",
                element: <LazyComponent Component={Analytics} />
            },
            {
                path: "/reports/sales",
                element: <LazyComponent Component={ReportsSales} />
            },
            {
                path: "/reports/leads",
                element: <LazyComponent Component={ReportsLeads} />
            },
            {
                path: "/reports/project",
                element: <LazyComponent Component={ReportsProject} />
            },
            {
                path: "/reports/timesheets",
                element: <LazyComponent Component={ReportsTimesheets} />
            },
            {
                path: "/proposal/list",
                element: <LazyComponent Component={Proposalist} />
            },
            {
                path: "/proposal/view",
                element: <LazyComponent Component={ProposalView} />
            },
            {
                path: "/proposal/edit",
                element: <LazyComponent Component={ProposalEdit} />
            },
            {
                path: "/proposal/create",
                element: <LazyComponent Component={ProposalCreate} />
            },
            {
                path: "/payment/list",
                element: <LazyComponent Component={PaymentList} />
            },
            {
                path: "/payment/view",
                element: <LazyComponent Component={PaymentView} />
            },
            {
                path: "/payment/create",
                element: <LazyComponent Component={PaymentCreate} />
            },
            {
                path: "/customers/list",
                element: <LazyComponent Component={CustomersList} />
            },
            {
                path: "/profile/view",
                element: <LazyComponent Component={CustomersView} />
            },
            {
                path: "/customers/create",
                element: <LazyComponent Component={CustomersCreate} />
            },
            {
                path: "/leads/all-leads",
                element: <LazyComponent Component={LeadsList} />
            },
            {
                path: "/leads/all-leads-enhanced",
                element: <LazyComponent Component={LeadsEnhanced} />
            },
            {
                path: "/leads/view",
                element: <LazyComponent Component={LeadsView} />
            },
            {
                path: "/leads/add-lead",
                element: <LazyComponent Component={LeadsCreate} />
            },
            {
                path: "/leads/campaigns",
                element: <LazyComponent Component={CampaignsList} />
            },
            {
                path: "/leads/add-campaigns",
                element: <LazyComponent Component={CampaignsCreate} />
            },
            {
                path: "/leads/integrations",
                element: <LazyComponent Component={LeadsIntegrations} />
            },
            {
                path: "/leads/import",
                element: <LazyComponent Component={LeadsImport} />
            },
            {
                path: "/leads/export",
                element: <LazyComponent Component={LeadsExport} />
            },
            {
                path: "/leads/sheets-sync",
                element: <LazyComponent Component={SheetsSync} />
            },
            {
                path: "/leads/bulk-import",
                element: <LazyComponent Component={BulkImportEnhanced} />
            },
            {
                path: "/leads/google-sheets",
                element: <LazyComponent Component={GoogleSheetsEnhanced} />
            },
            {
                path: "/leads/campaigns-enhanced",
                element: <LazyComponent Component={CampaignsEnhanced} />
            },
            {
                path: "/leads/communication-templates",
                element: <LazyComponent Component={CommunicationTemplates} />
            },
            {
                path: "/leads/all-leads-enhanced",
                element: <LazyComponent Component={LeadsEnhanced} />
            },
            {
                path: "/leads/dashboard",
                element: <LazyComponent Component={LeadsDashboard} />
            },
            {
                path: "/leads/manage",
                element: <LazyComponent Component={LeadsManage} />
            },
            {
                path: "/leads/import-export",
                element: <LazyComponent Component={LeadsImportExport} />
            },
            {
                path: "/leads/google-sheets-page",
                element: <LazyComponent Component={GoogleSheetsPage} />
            },
            {
                path: "/leads/templates-page",
                element: <LazyComponent Component={TemplatesPage} />
            },
            {
                path: "/leads/campaigns-page",
                element: <LazyComponent Component={CampaignsPage} />
            },
            {
                path: "/leads/analytics",
                element: <LazyComponent Component={LeadsAnalytics} />
            },
            {
                path: "/leads/workflows",
                element: <LazyComponent Component={LeadsWorkflows} />
            },
            {
                path: "/projects/list",
                element: <LazyComponent Component={ProjectsList} />
            },
            {
                path: "/projects/view",
                element: <LazyComponent Component={ProjectsView} />
            },
            {
                path: "/projects/create",
                element: <LazyComponent Component={ProjectsCreate} />
            },
            {
                path: "/widgets/lists",
                element: <LazyComponent Component={WidgetsLists} />
            },
            {
                path: "/widgets/tables",
                element: <LazyComponent Component={WidgetsTables} />
            },
            {
                path: "/widgets/charts",
                element: <LazyComponent Component={WidgetsCharts} />
            },
            {
                path: "/widgets/statistics",
                element: <LazyComponent Component={WidgetsStatistics} />
            },
            {
                path: "/widgets/miscellaneous",
                element: <LazyComponent Component={WidgetsMiscellaneous} />
            },
            {
                path: "/help/knowledgebase",
                element: <LazyComponent Component={HelpKnowledgebase} />
            },
            {
                path: "/pharmacy/pos-terminal",
                element: <LazyComponent Component={PharmacyPOSTerminal} />
            },
            {
                path: "/pharmacy/sales-history",
                element: <LazyComponent Component={PharmacySalesHistory} />
            },
            {
                path: "/pharmacy/invoices",
                element: <LazyComponent Component={PharmacyInvoices} />
            },
            {
                path: "/pharmacy/invoices/:id",
                element: <LazyComponent Component={PharmacyInvoiceView} />
            },
            {
                path: "/inventory/products/product-list",
                element: <LazyComponent Component={ProductList} />
            },
            {
                path: "/inventory/products/product-create",
                element: <LazyComponent Component={ProductCreate} />
            },
            {
                path: "/inventory/products/product-edit",
                element: <LazyComponent Component={ProductEdit} />
            },
            {
                path: "/inventory/products/product-variations",
                element: <LazyComponent Component={ProductVariations} />
            },
            {
                path: "/inventory/categories/category-list",
                element: <LazyComponent Component={CategoryList} />
            },
            {
                path: "/inventory/attributes/attribute-list",
                element: <LazyComponent Component={AttributeList} />
            },
            {
                path: "/inventory/stock/stock-adjustment",
                element: <LazyComponent Component={InventoryStockAdjustment} />
            },
            // {
            //     path: "/inventory/stock/stock-history",
            //     element: <LazyComponent Component={StockHistory} />
            // },
            {
                path: "/inventory/suppliers/suppliers-list",
                element: <LazyComponent Component={SuppliersList} />
            },
            {
                path: "/inventory/suppliers/suppliers-create",
                element: <LazyComponent Component={SuppliersCreate} />
            },
            {
                path: "/inventory/suppliers/suppliers-edit/:id",
                element: <LazyComponent Component={SuppliersEdit} />
            },
            {
                path: "/inventory/suppliers/suppliers-view/:id",
                element: <LazyComponent Component={SuppliersView} />
            },
            {
                path: "/inventory/manufacturers/manufacturers-list",
                element: <LazyComponent Component={ManufacturersList} />
            },
            {
                path: "/inventory/manufacturers/manufacturers-create",
                element: <LazyComponent Component={ManufacturersCreate} />
            },
            {
                path: "/inventory/manufacturers/manufacturers-view/:id",
                element: <LazyComponent Component={ManufacturersView} />
            },
            {
                path: "/inventory/purchase-orders/purchase-orders-list",
                element: <LazyComponent Component={PurchaseOrdersList} />
            },
            {
                path: "/inventory/purchase-orders/purchase-order-create",
                element: <LazyComponent Component={PurchaseOrderCreate} />
            },
            {
                path: "/inventory/purchase-orders/purchase-order-edit",
                element: <LazyComponent Component={PurchaseOrderEdit} />
            },
            {
                path: "/inventory/reports/inventory-report",
                element: <LazyComponent Component={InventoryReport} />
            },
            {
                path: "/inventory/settings/inventory-settings",
                element: <LazyComponent Component={InventorySettings} />
            },
            {
                path: "/calendar-config",
                element: <LazyComponent Component={CalendarConfig} /> 
            }
        ]
    },
    {
        path: "/",
        element: <LayoutApplications />,
        children: [
            {
                path: "/calender",
                element: <LazyComponent Component={AppoCalender} />
            },
            // {
            //     path: "/applications/chat",
            //     element: <LazyComponent Component={AppsChat} />
            // },
            {
                path: "/applications/email",
                element: <LazyComponent Component={AppsEmail} />
            },
            {
                path: "/applications/tasks",
                element: <LazyComponent Component={AppsTasks} />
            },
            {
                path: "/applications/notes",
                element: <LazyComponent Component={AppsNotes} />
            },
            {
                path: "/applications/calender",
                element: <LazyComponent Component={AppsCalender} />
            },
            {
                path: "/applications/storage",
                element: <LazyComponent Component={AppsStorage} />
            },
            {
                path: "*",
                element: <LazyComponent Component={ErrorMinimal} />
            }
        ]
    },
    {
        path: "/",
        element: <LayoutSetting />,
        children: [
            {
                path: "/settings/clinic",
                element: <LazyComponent Component={SettingsClinic} />
            },
            {
                path: "/settings/cutsom-message",
                element: <LazyComponent Component={CustomMessage} />
            },
            {
                path: "/settings/genrate-link",
                element: <LazyComponent Component={GenerateLink} />
            },
            {
                path: "/settings/ganeral",
                element: <LazyComponent Component={SettingsGaneral} />
            },
            {
                path: "/settings/seo",
                element: <LazyComponent Component={SettingsSeo} />
            },
            {
                path: "/settings/email",
                element: <LazyComponent Component={SettingsEmail} />
            },
            {
                path: "/settings/tasks",
                element: <LazyComponent Component={SettingsTasks} />
            },
            {
                path: "/settings/leads",
                element: <LazyComponent Component={SettingsLeads} />
            },
            {
                path: "/settings/finance",
                element: <LazyComponent Component={SettingsFinance} />
            },
            {
                path: "/settings/gateways",
                element: <LazyComponent Component={SettingsGateways} />
            },
            {
                path: "/settings/supplier-manufacturer",
                element: <LazyComponent Component={SettingsCustomers} />
            },
            {
                path: "/settings/localization",
                element: <LazyComponent Component={SettingsLocalization} />
            },
            {
                path: "/settings/recaptcha",
                element: <LazyComponent Component={SettingsRecaptcha} />
            },
            {
                path: "/settings/miscellaneous",
                element: <LazyComponent Component={SettingsMiscellaneous} />
            },
            {
                path: "/settings/communication",
                element: <LazyComponent Component={SettingsCommunication} />
            },
            // {
            //     path: "/settings/whatsapp",
            //     element: <LazyComponent Component={SettingsWhatsApp} />
            // },
            // {
            //     path: "/settings/email-messaging",
            //     element: <LazyComponent Component={SettingsEmailMessaging} />
            // },
            // {
            //     path: "/settings/sms",
            //     element: <LazyComponent Component={SettingsSMS} />
            // },
            {
                path: "/settings/gpt",
                element: <LazyComponent Component={SettingsGpt} />
            },
            {
                path: "/settings/toast",
                element: <LazyComponent Component={SettingsToast} />
            },
            {
                path: "/settings/notifications",
                element: <LazyComponent Component={SettingsNotifications} />
            },
            {
                path: "/settings/user-settings",
                element: <LazyComponent Component={UserSettings} />
            },
            {
                path: "/settings/user-datetimeformat",
                element: <LazyComponent Component={settingDateAndTimeFormate} />
            },
            {
                path: "/settings/change-password",
                element: <LazyComponent Component={settingPasswordChange} />
            },
            {
                path: "*",
                element: <LazyComponent Component={ErrorMinimal} />
            }
        ]
    },
    {
        path: "/",
        element: <LayoutAuth />,
        children: [
            {
                path: "/",
                element: <InitialRedirect />,
            },
            {
                path: "/login",
                element: <Navigate to="/authentication/login" replace />,
            },
            {
                path: "/authentication/login",
                element: <LazyComponent Component={LoginCreative} />,
            },
            {
                path: "/authentication/register/cover",
                element: <LazyComponent Component={RegisterCover} />,
            },
            {
                path: "/authentication/register/minimal",
                element: <LazyComponent Component={RegisterMinimal} />,
            },
            {
                path: "/authentication/register",
                element: <LazyComponent Component={RegisterCreative} />,
            },
            {
                path: "/authentication/reset/cover",
                element: <LazyComponent Component={ResetCover} />,
            },
            {
                path: "/authentication/reset/minimal",
                element: <LazyComponent Component={ResetMinimal} />,
            },
            {
                path: "/authentication/reset/creative",
                element: <LazyComponent Component={ResetCreative} />,
            },
            {
                path: "/reset-password",
                element: <LazyComponent Component={ResetPassword} />
            },
            {
                path: "/authentication/404/cover",
                element: <LazyComponent Component={ErrorCover} />,
            },
            {
                path: "/authentication/404/minimal",
                element: <LazyComponent Component={ErrorMinimal} />,
            },
            {
                path: "/authentication/404/creative",
                element: <LazyComponent Component={ErrorCreative} />,
            },
            {
                path: "/authentication/verify/cover",
                element: <LazyComponent Component={OtpCover} />,
            },
            {
                path: "/authentication/verify/minimal",
                element: <LazyComponent Component={OtpMinimal} />,
            },
            {
                path: "/authentication/verify/creative",
                element: <LazyComponent Component={OtpCreative} />,
            },
            {
                path: "/authentication/maintenance/cover",
                element: <LazyComponent Component={MaintenanceCover} />,
            },
            {
                path: "/authentication/maintenance/minimal",
                element: <LazyComponent Component={MaintenanceMinimal} />,
            },
            {
                path: "/authentication/maintenance/creative",
                element: <LazyComponent Component={MaintenanceCreative} />,
            },
            {
                path: "*",
                element: <LazyComponent Component={ErrorMinimal} />
            }
        ],
    },
    {
        path: "*",
        element: <LazyComponent Component={ErrorMinimal} />
    }
]);