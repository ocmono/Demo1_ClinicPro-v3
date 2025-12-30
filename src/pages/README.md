# Pages Organization

This directory contains all the pages of the ClinicPro application, organized by functionality and user flow.

## 📁 Directory Structure

```
src/pages/
├── README.md                           # This file
├── auth/                               # Authentication pages
│   ├── login/
│   │   ├── login-cover.jsx
│   │   ├── login-creative.jsx
│   │   └── login-minimal.jsx
│   ├── register/
│   │   ├── register-cover.jsx
│   │   ├── register-creative.jsx
│   │   └── register-minimal.jsx
│   ├── reset-password/
│   │   ├── reset-cover.jsx
│   │   ├── reset-creative.jsx
│   │   └── reset-minimal.jsx
│   ├── otp/
│   │   ├── otp-cover.jsx
│   │   ├── otp-creative.jsx
│   │   └── otp-minimal.jsx
│   └── maintenance/
│       ├── maintenance-cover.jsx
│       ├── maintenance-creative.jsx
│       └── maintenance-minimal.jsx
├── dashboard/                          # Dashboard pages
│   ├── clinic-dashboard.jsx
│   ├── leads-dashboard.jsx
│   ├── social-media-dashboard.jsx
│   └── ads-dashboard.jsx
├── clinic/                             # Clinic management
│   ├── dashboard/
│   │   └── clinic-dashboard.jsx
│   ├── specialties/
│   │   ├── specialties-list.jsx
│   │   ├── specialties-add.jsx
│   │   ├── specialties-edit.jsx
│   │   ├── specialties-view.jsx
│   │   ├── specialties-manage.jsx
│   │   ├── specialty-profile.jsx
│   │   └── specialty-configure.jsx
│   ├── doctors/
│   │   ├── doctors-list.jsx
│   │   ├── doctors-add.jsx
│   │   ├── doctors-edit.jsx
│   │   ├── doctors-view.jsx
│   │   ├── doctors-manage.jsx
│   │   └── doctors-view-details.jsx
│   ├── receptionists/
│   │   ├── receptionists-list.jsx
│   │   ├── receptionists-add.jsx
│   │   ├── receptionists-edit.jsx
│   │   ├── receptionists-view.jsx
│   │   ├── receptionists-manage.jsx
│   │   └── receptionist-profile.jsx
│   ├── accountants/
│   │   ├── accountants-list.jsx
│   │   ├── accountants-add.jsx
│   │   ├── accountants-edit.jsx
│   │   ├── accountants-view.jsx
│   │   ├── accountants-manage.jsx
│   │   └── accountant-profile.jsx
│   ├── users/
│   │   ├── users-list.jsx
│   │   ├── users-add.jsx
│   │   ├── users-edit.jsx
│   │   └── users-manage.jsx
│   └── settings/
│       ├── general-settings.jsx
│       ├── clinic-settings.jsx
│       └── communication-settings.jsx
├── patients/                           # Patient management
│   ├── patients-list.jsx
│   ├── patients-add.jsx
│   ├── patients-edit.jsx
│   ├── patients-view.jsx
│   └── patient-profile.jsx
├── appointments/                       # Appointment management
│   ├── appointments-list.jsx
│   ├── appointments-add.jsx
│   ├── appointments-edit.jsx
│   ├── appointments-view.jsx
│   ├── book-appointment.jsx
│   └── book-appointment-iframe.jsx
├── prescriptions/                      # Prescription management
│   ├── prescriptions-list.jsx
│   ├── prescriptions-add.jsx
│   ├── prescriptions-edit.jsx
│   ├── prescriptions-view.jsx
│   └── prescription-templates.jsx
├── medicines/                          # Medicine management
│   ├── medicines-list.jsx
│   ├── medicines-add.jsx
│   ├── medicines-edit.jsx
│   ├── medicines-view.jsx
│   └── medicine-categories.jsx
├── pharmacy/                           # Pharmacy management
│   ├── pharmacy-dashboard.jsx
│   ├── inventory-management.jsx
│   ├── sales-management.jsx
│   └── billing-management.jsx
├── inventory/                          # Inventory management
│   ├── inventory-list.jsx
│   ├── inventory-add.jsx
│   ├── inventory-edit.jsx
│   ├── purchase-orders/
│   │   ├── purchase-orders-list.jsx
│   │   ├── purchase-order-create.jsx
│   │   ├── purchase-order-edit.jsx
│   │   └── purchase-order-view.jsx
│   └── stock-management.jsx
├── vaccines/                           # Vaccine management
│   ├── vaccines-list.jsx
│   ├── vaccines-add.jsx
│   ├── vaccines-edit.jsx
│   ├── vaccines-view.jsx
│   └── vaccine-schedule.jsx
├── leads/                              # Lead management
│   ├── leads-list.jsx
│   ├── leads-add.jsx
│   ├── leads-edit.jsx
│   ├── leads-view.jsx
│   └── campaigns/
│       ├── campaigns-list.jsx
│       ├── campaign-create.jsx
│       └── campaign-view.jsx
├── customers/                          # Customer management
│   ├── customers-list.jsx
│   ├── customers-add.jsx
│   ├── customers-edit.jsx
│   └── customers-view.jsx
├── payments/                           # Payment management
│   ├── payments-list.jsx
│   ├── payment-create.jsx
│   ├── payment-edit.jsx
│   └── payment-view.jsx
├── projects/                           # Project management
│   ├── projects-list.jsx
│   ├── projects-create.jsx
│   ├── projects-edit.jsx
│   └── projects-view.jsx
├── proposals/                          # Proposal management
│   ├── proposals-list.jsx
│   ├── proposal-create.jsx
│   ├── proposal-edit.jsx
│   └── proposal-view.jsx
├── reports/                            # Reports and analytics
│   ├── analytics.jsx
│   ├── reports-sales.jsx
│   ├── reports-leads.jsx
│   ├── reports-project.jsx
│   └── reports-timesheets.jsx
├── apps/                               # Application pages
│   ├── calendar/
│   │   └── calendar.jsx
│   ├── chat/
│   │   └── chat.jsx
│   ├── email/
│   │   └── email.jsx
│   ├── notes/
│   │   └── notes.jsx
│   ├── storage/
│   │   └── storage.jsx
│   └── tasks/
│       └── tasks.jsx
├── widgets/                            # Widget pages
│   ├── widgets-charts.jsx
│   ├── widgets-lists.jsx
│   ├── widgets-tables.jsx
│   ├── widgets-statistics.jsx
│   └── widgets-miscellaneous.jsx
├── help/                               # Help and support
│   └── knowledge-base/
│       └── index.jsx
├── errors/                             # Error pages
│   ├── error-cover.jsx
│   ├── error-creative.jsx
│   └── error-minimal.jsx
└── home.jsx                            # Home page
```

## 🎯 Organization Principles

### 1. **Functional Grouping**
- Pages are grouped by their primary function (clinic, patients, appointments, etc.)
- Related functionality is kept together

### 2. **User Flow Organization**
- Authentication pages are grouped together
- Dashboard pages are separated by type
- Management pages follow consistent patterns (list, add, edit, view, manage)

### 3. **Consistent Naming**
- All pages follow the pattern: `{module}-{action}.jsx`
- Actions: list, add, edit, view, manage, profile, configure
- Special cases: dashboard, settings, reports

### 4. **Scalable Structure**
- Each module can have its own subdirectories for complex features
- Common patterns are maintained across modules
- Easy to add new modules following the same structure

## 📋 Migration Plan

1. **Create new directory structure**
2. **Move existing files to new locations**
3. **Update import paths in all files**
4. **Update routing configuration**
5. **Test all functionality**

## 🔄 Benefits

- **Better Navigation:** Easier to find related pages
- **Improved Maintainability:** Clear separation of concerns
- **Enhanced Scalability:** Easy to add new features
- **Consistent Patterns:** Standardized naming and structure
- **Better Developer Experience:** Intuitive file organization 