export const menuList = [
    {
        id: 0,
        name: "dashboards",
        path: "/dashboards/clinic",
        icon: 'feather-airplay',
        dropdownMenu: [],
    },
    {
        id: 1,
        name: "Calendar",
        path: "/applications/calender",
        icon: "feather-calendar",
        allowedRoles: ["super_admin", "clinic_admin", "doctor", "receptionist"],
        dropdownMenu: [],
    },
    // {
    //     id: 15,
    //     name: "Chat",
    //     path: "/applications/chat",
    //     icon: "feather-message-square",
    //     allowedRoles: ["super_admin", "clinic_admin", "doctor", "receptionist"],
    //     dropdownMenu: [],
    // },
    // {
    //     id: 16,
    //     name: "Email",
    //     path: "/applications/email",
    //     icon: "feather-mail",
    //     allowedRoles: ["super_admin", "clinic_admin", "doctor", "receptionist"],
    //     dropdownMenu: [],
    // },
    {
        id: 2,
        name: "appointments",
        path: "#",
        icon: 'feather-layout',
        dropdownMenu: [
            {
                id: 1,
                name: "Appointments",
                path: "/appointments/all-appointments",
                subdropdownMenu: false
            },
            {
                id: 2,
                name: "Appointment Book",
                path: "/appointments/book-appointment",
                subdropdownMenu: false
            }
        ]
    },
    {
        id: 2,
        name: "prescriptions",
        path: "#",
        icon: 'feather-file-text',
        dropdownMenu: [
            {
                id: 1,
                name: "Prescriptions",
                path: "/prescriptions/all-prescriptions",
                subdropdownMenu: false
            },
            // {
            //     id: 2,
            //     name: "Prescription Create Simple",
            //     path: "/prescriptions/create-prescription-simple",
            //     subdropdownMenu: false,
            //     allowedRoles: ["super_admin", "clinic_admin", "doctor"]
            // },
            // {
            //     id: 2,
            //     name: "Prescription Create 1",
            //     path: "/prescriptions/create-prescription-dummy",
            //     subdropdownMenu: false,
            //     allowedRoles: ["super_admin", "clinic_admin", "doctor"]
            // },
            // {
            //     id: 3,
            //     name: "Prescription Create",
            //     path: "/prescriptions/create-prescription",
            //     subdropdownMenu: false,
            //     allowedRoles: ["super_admin", "clinic_admin", "doctor"]
            // },
            {
                id: 3,
                name: "Prescription Create ",
                path: "/prescriptions/create-prescription",
                subdropdownMenu: false,
                allowedRoles: ["super_admin", "clinic_admin", "doctor"]
            },
            // {
            //     id: 6,
            //     name: "Prescription Create (Dermatologist)",
            //     path: "/prescriptions/create-prescription-dermatologist",
            //     subdropdownMenu: false,
            //     allowedRoles: ["super_admin", "clinic_admin", "doctor"]
            // },
            {
                id: 4,
                name: "Templates Management",
                path: "/prescription/templates-management",
                subdropdownMenu: false
            },
        ]
    },
    {
        id: 4,
        name: "patients",
        path: "#",
        icon: 'feather-users',
        dropdownMenu: [
            {
                id: 1,
                name: "Patients",
                path: "/patients/all-patients",
                subdropdownMenu: false
            },
            {
                id: 2,
                name: "Patient Add Record",
                path: "/patients/add-patient",
                subdropdownMenu: false
            }
        ]
    },
    {
        id: 5,
        name: "leads",
        path: "#",
        icon: 'feather-dollar-sign',
        dropdownMenu: [
            {
                id: 1,
                name: "All Leads",
                path: "/leads/all-leads",
                subdropdownMenu: false
            },
            {
                id: 3,
                name: "Add Lead",
                path: "/leads/add-lead",
                subdropdownMenu: false
            },
            {
                id: 4,
                name: "Campaigns",
                path: "/leads/campaigns-page",
                subdropdownMenu: false
            },
            {
                id: 5,
                name: "Import/Export",
                path: "/leads/import-export",
                subdropdownMenu: false
            },
            {
                id: 6,
                name: "Google Sheets",
                path: "/leads/google-sheets-page",
                subdropdownMenu: false
            },
            {
                id: 7,
                name: "Templates",
                path: "/leads/templates-page",
                subdropdownMenu: false
            },
            {
                id: 8,
                name: "Analytics",
                path: "/leads/analytics",
                subdropdownMenu: false
            },
            {
                id: 9,
                name: "Workflows",
                path: "/leads/workflows",
                subdropdownMenu: false
            }
        ]
    },
    {
        id: 7,
        name: "vaccine",
        path: "#",
        icon: 'lia-syringe',
        dropdownMenu: [
            {
                id: 1,
                name: "Vaccine Dashboard",
                path: "/vaccines/dashboard",
                subdropdownMenu: false
            },
            {
                id: 2,
                name: "Vaccine Calendar",
                path: "/vaccines/vaccine-calendar",
                subdropdownMenu: false
            }
        ]
    },
    {
        id: 8,
        name: "pharmacy",
        path: "#",
        icon: 'feather-shopping-bag',
        dropdownMenu: [
            {
                id: 1,
                name: "POS Terminal",
                path: "/pharmacy/pos-terminal",
                subdropdownMenu: false
            },
            {
                id: 2,
                name: "Sales History",
                path: "/pharmacy/sales-history",
                subdropdownMenu: false
            },
            // {
            //     id: 3,
            //     name: "Invoices",
            //     path: "/pharmacy/invoices",
            //     subdropdownMenu: false
            // },
                // {
                //     id: 4,
                //     name: "Invoice View",
                //     path: "/pharmacy/invoice-view",
                //     subdropdownMenu: false
                // }
        ]
    },
    {
        id: 9,
        name: "inventory",
        path: "#",
        icon: 'feather-archive',
        dropdownMenu: [
            {
                id: 1,
                name: "Products",
                path: "#",
                subdropdownMenu: [
                    {
                        id: 1,
                        name: "All Product",
                        path: "/inventory/products/product-list",
                        subdropdownMenu: false
                    },
                    {
                        id: 2,
                        name: "Add Product",
                        path: "/inventory/products/product-create",
                        subdropdownMenu: false
                    },
                    // {
                    //     id: 2,
                    //     name: "Edit Product",
                    //     path: "/inventory/products/product-edit",
                    //     subdropdownMenu: false
                    // },
                    {
                        id: 3,
                        name: "Variations",
                        path: "/inventory/products/product-variations",
                        subdropdownMenu: false
                    },
                ]
            },
            // {
            //     id: 2,
            //     name: "Categories",
            //     path: "/inventory/categories/category-list",
            //     subdropdownMenu: false
            // },
            // {
            //     id: 3,
            //     name: "Attributes",
            //     path: "/inventory/attributes/attribute-list",
            //     subdropdownMenu: false
            // },
            {
                id: 4,
                name: "Stock",
                path: "#",
                subdropdownMenu: [
                    {
                        id: 1,
                        name: "Stock Adjustment",
                        path: "/inventory/stock/stock-adjustment",
                        subdropdownMenu: false
                    },
                    // {
                    //     id: 2,
                    //     name: "Stock History",
                    //     path: "/inventory/stock/stock-history",
                    //     subdropdownMenu: false
                    // },
                ]
            },
            {
                id: 5,
                name: "Suppliers",
                path: "/inventory/suppliers/suppliers-list",
                subdropdownMenu: false,
            },
            {
                id: 6,
                name: "Manufacturers",
                path: "/inventory/manufacturers/manufacturers-list",
                subdropdownMenu: false,
            },
            // {
            //     id: 7,
            //     name: "Purchase Orders",
            //     path: "/inventory/purchase-orders/purchase-orders-list",
            //     subdropdownMenu: [
            //         {
            //             id: 1,
            //             name: "Create Purchase Order",
            //             path: "/inventory/purchase-orders/purchase-order-create",
            //             subdropdownMenu: false
            //         },
            //         {
            //             id: 2,
            //             name: "Edit Purchase Order",
            //             path: "/inventory/purchase-orders/purchase-order-edit",
            //             subdropdownMenu: false
            //         },
            //     ]
            // },
            // {
            //     id: 8,
            //     name: "Reports",
            //     path: "/inventory/reports/inventory-report",
            //     subdropdownMenu: false
            // },
            {
                id: 9,
                name: "Settings",
                path: "/inventory/settings/inventory-settings",
                subdropdownMenu: false
            },
        ]
    },
    // {
    //     id: 10,
    //     name: "file manager",
    //     path: "#",
    //     icon: 'feather-folder',
    //     dropdownMenu: [
    //         {
    //             id: 1,
    //             name: "File Manager",
    //             path: "/file-manager/dashboard",
    //             subdropdownMenu: false
    //         },
    //         {
    //             id: 2,
    //             name: "Upload Files",
    //             path: "/file-manager/upload",
    //             subdropdownMenu: false
    //         },
    //         {
    //             id: 3,
    //             name: "Documents",
    //             path: "/file-manager/documents",
    //             subdropdownMenu: false
    //         },
    //         {
    //             id: 4,
    //             name: "Images",
    //             path: "/file-manager/images",
    //             subdropdownMenu: false
    //         },
    //         {
    //             id: 5,
    //             name: "Media Library",
    //             path: "/file-manager/media-library",
    //             subdropdownMenu: false
    //         },
    //         {
    //             id: 6,
    //             name: "Shared Files",
    //             path: "/file-manager/shared",
    //             subdropdownMenu: false
    //         },
    //         {
    //             id: 7,
    //             name: "Trash",
    //             path: "/file-manager/trash",
    //             subdropdownMenu: false
    //         }
    //     ]
    // },
    {
        id: 11,
        name: "clinic",
        path: "#",
        icon: 'feather-alert-circle',
        dropdownMenu: [
            {
                id: 1,
                name: "Doctors",
                path: "/clinic/doctors",
                subdropdownMenu: false
            },
            {
                id: 2,
                name: "Receptionists",
                path: "/clinic/receptionists",
                subdropdownMenu: false
            },
            {
                id: 3,
                name: "Accountants",
                path: "/clinic/accountants",
                subdropdownMenu: false
            },
            {
                id: 4,
                name: "Specialities",
                path: "/clinic/specialities",
                subdropdownMenu: false
            },
            {
                id: 5,
                name: "Activity Log",
                path: "/clinic/activity",
                subdropdownMenu: false
            }
        ]
    },
    {
        id: 12,
        name: "users",
        path: "#",
        icon: 'feather-users',
        dropdownMenu: [
            {
                id: 1,
                name: "All Users",
                path: "/users",
                subdropdownMenu: false
            },
            {
                id: 2,
                name: "Add User",
                path: "/users/add",
                subdropdownMenu: false
            },
            // {
            //     id: 3,
            //     name: "User Roles",
            //     path: "/users/roles",
            //     subdropdownMenu: false
            // },
            // {
            //     id: 4,
            //     name: "Permission Management",
            //     path: "/users/permission-management",
            //     subdropdownMenu: false
            // }
        ]
    },
    {
        id: 13,
        name: "settings",
        path: "#",
        icon: 'feather-settings',
        dropdownMenu: [
            { id: 1, name: "Clinic Details", path: "/settings/clinic", subdropdownMenu: false },
            // { id: 2, name: "General", path: "/settings/ganeral", subdropdownMenu: false },
            // { id: 3, name: "SEO", path: "/settings/seo", subdropdownMenu: false },
            // { id: 4, name: "Tags", path: "/settings/tags", subdropdownMenu: false },
            { id: 5, name: "Email", path: "/settings/email", subdropdownMenu: false },
            // { id: 6, name: "Tasks", path: "/settings/tasks", subdropdownMenu: false },
            // { id: 7, name: "Leads", path: "/settings/leads", subdropdownMenu: false },
            // { id: 8, name: "Support", path: "/settings/support", subdropdownMenu: false },
            // { id: 9, name: "Finance", path: "/settings/finance", subdropdownMenu: false },
            { id: 10, name: "Gateways", path: "/settings/gateways", subdropdownMenu: false },
            { id: 11, name: "Supplier & Manufacturer", path: "/settings/supplier-manufacturer", subdropdownMenu: false },
            // { id: 12, name: "Localization", path: "/settings/localization", subdropdownMenu: false },
            // { id: 13, name: "reCaptcha", path: "/settings/recaptcha", subdropdownMenu: false },
            // { id: 14, name: "Miscellaneous", path: "/settings/miscellaneous", subdropdownMenu: false },
            { id: 16, name: "Generate Link", path: "/settings/genrate-link", subdropdownMenu: false },
            { id: 17, name: "Custom Messages", path: "/settings/cutsom-message", subdropdownMenu: false },
            { id: 18, name: "Communication", path: "/settings/communication", subdropdownMenu: false },
            // { id: 22, name: "WhatsApp", path: "/settings/whatsapp", subdropdownMenu: false },
            // { id: 23, name: "Email Messaging", path: "/settings/email-messaging", subdropdownMenu: false },
            // { id: 24, name: "SMS", path: "/settings/sms", subdropdownMenu: false },
            { id: 25, name: "GPT Integration", path: "/settings/gpt", subdropdownMenu: false },
            { id: 19, name: "Users Settings", path: "/settings/user-settings", subdropdownMenu: false },
            { id: 20, name: "Date & Time Format", path: "/settings/user-datetimeformat", subdropdownMenu: false },
            { id: 21, name: "Change Password", path: "/settings/change-password", subdropdownMenu: false },
            // { id: 21, name: "Timezone", path: "/settings/timezone", subdropdownMenu: false },
        ]
    },
    {
        id: 14,
        name: "support",
        path: "/support",
        icon: 'feather-support',
        dropdownMenu: [],
    },
    {
        id: 14,
        name: "Clinical Notes",
        path: "/applications/notes",
        icon: 'fa-notes',
        dropdownMenu: [],
    },
]
