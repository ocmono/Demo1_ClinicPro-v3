import React, { memo, useEffect, useState, useRef } from 'react'
import Table from '@/components/shared/table/Table';
import { FiAlertOctagon, FiArchive, FiClock, FiEdit3, FiEye, FiMoreHorizontal, FiPrinter, FiTrash2 } from 'react-icons/fi'
import Dropdown from '@/components/shared/Dropdown';
import SelectDropdown from '@/components/shared/SelectDropdown';
import getIcon from '@/utils/getIcon';
import { toast } from "react-toastify";
import { useLeads } from "../../context/LeadsContext";
import { useAuth } from "../../contentApi/AuthContext";
import DeleteConfirmationModal from "../../pages/clinic/settings/DeleteConfirmationModal"
import EditModalCampaign from '../campaigns/EditModalCampaign';

const getActionsOptions = (userRole) => {
    const baseActions = [
        { label: "Edit", icon: <FiEdit3 /> },
    ];

    // Add delete option only for non-receptionist roles
    if (userRole?.toLowerCase() !== 'receptionist') {
        baseActions.push({ label: "Delete", icon: <FiTrash2 /> });
    }

    return baseActions;
};

const TableCell = memo(({ options, defaultSelect }) => {
    const [selectedOption, setSelectedOption] = useState(null);

    return (
        <SelectDropdown
            options={options}
            defaultSelect={defaultSelect}
            selectedOption={selectedOption}
            onSelectOption={(option) => setSelectedOption(option)}
        />
    );
});


const CampaignTable = ({ showPrint = true }) => {
    const { campaigns, updateCampaign, deleteCampaign } = useLeads();
    console.log("Campaigns Data", campaigns);
    const { user, role } = useAuth();
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({});
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);

  // Define roles that can print
  const canPrintRoles = ["super_admin", "clinic_admin", "doctor", "receptionist"];
  
  // Check if current user can print
  const canPrint = user && canPrintRoles.includes(user.role);

    const startEdit = (campaign) => {
        setEditId(campaign.id);
        setEditData({ ...campaign });
    };

    const handleEditClick = (campaign) => {
        setEditData(campaign);
        setEditModalOpen(true);
    };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

    const actionsOptions = getActionsOptions(role);

  const submitEdit = async () => {
    try {
      await updateCampaign(editId, editData);
      setEditId(null);
      toast.success("Campaign updated successfully!");
    } catch (error) {
        console.log("Failed to update campaign");
        //   toast.error("Failed to update campaign");
    }
  };

  const cancelEdit = () => {
    setEditId(null);
  };

    const handleDeleteClick = (lead) => {
        setCampaignToDelete(lead);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!campaignToDelete) return;
        try {
            await deleteCampaign(campaignToDelete.id || campaignToDelete._id);
            toast.success("Campaign deleted successfully!");
        } catch (error) {
            console.log("Failed to delete campaign");
            // toast.error("Failed to delete campaign");
        } finally {
            setDeleteModalOpen(false);
            setCampaignToDelete(null);
        }
    };

    const cancelDelete = () => {
        setDeleteModalOpen(false);
        setCampaignToDelete(null);
    };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");

    const printHTML = `
        <html>
        <head>
            <title>Print Campaigns</title>
            <style>
            body {
                font-family: Arial, sans-serif;
                padding: 20px;
                margin: 0;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: center;
                word-wrap: break-word;
            }
            th {
                background-color: #f2f2f2;
            }
            </style>
        </head>
        <body>
            <h2>Campaign List</h2>
            <table>
            <thead>
                <tr>
                <th>Id</th>
                <th>Display Name</th>
                <th>Campaign Name</th>
                <th>Description</th>
                <th>Budget</th>
                </tr>
            </thead>
            <tbody>
                ${campaigns.map((p) => `
                    <tr>
                    <td>${p.id || "—"}</td>
                    <td>${p.displayName || "—"}</td>
                    <td>${p.campaign || "—"}</td>
                    <td>${p.description || "—"}</td>
                    <td>${p.budget || "—"}</td>
                </tr>
                `).join('')}
            </tbody>
            </table>
        </body>
        </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printHTML);
    printWindow.document.close();

    printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    };
  };

  const handleRefresh = () => {
    // Add your refresh logic here
    toast.info("Refreshing campaigns list...");
  };
    const columns = [
        // {
        //     accessorKey: 'id',
        //     header: ({ table }) => {
        //         const checkboxRef = React.useRef(null);

        //         useEffect(() => {
        //             if (checkboxRef.current) {
        //                 checkboxRef.current.indeterminate = table.getIsSomeRowsSelected();
        //             }
        //         }, [table.getIsSomeRowsSelected()]);

        //         return (
        //             <input
        //                 type="checkbox"
        //                 className="custom-table-checkbox"
        //                 ref={checkboxRef}
        //                 checked={table.getIsAllRowsSelected()}
        //                 onChange={table.getToggleAllRowsSelectedHandler()}
        //             />
        //         );
        //     },
        //     cell: ({ row }) => (
        //         <input
        //             type="checkbox"
        //             className="custom-table-checkbox"
        //             checked={row.getIsSelected()}
        //             disabled={!row.getCanSelect()}
        //             onChange={row.getToggleSelectedHandler()}
        //         />
        //     ),
        //     meta: {
        //         headerClassName: 'width-30',
        //     },
        // },
        {
            accessorKey: 'id',
            header: 'ID',
            cell: (info) => (
                <span className="badge bg-light text-dark">#{info.getValue()}</span>
            ),
            meta: {
                headerClassName: 'width-30',
            },
        },
        {
            accessorKey: 'displayName',
            header: () => 'Display Name',
            cell: (info) => {
                const name = info.getValue();
                return (
                    <a href="#" className="hstack gap-3">
                        <div className="text-white avatar-text user-avatar-text avatar-md">
                            {name?.charAt(0)}
                        </div>
                        <div>
                            <span className="text-truncate-1-line">{name}</span>
                        </div>
                    </a>
                )
            }
        },
        {
            accessorKey: 'campaign',
            header: () => 'Campaign Name',
            cell: (info) => <span>{info.getValue()}</span>,
        },
        {
            accessorKey: 'description',
            header: () => 'Description',
            cell: (info) => <a href="tel:">{info.getValue()}</a>
            // meta: {
            //     className: "fw-bold text-dark"
            // }
        },
        {
            accessorKey: 'budget',
            header: () => 'Budget',
            cell: (info) => <span>₹{info.getValue() || 'N/A'}</span>,
        },
        {
            accessorKey: 'platform',
            header: () => 'Platform',
            cell: (info) => {
                const platform = info.getValue() || 'meta';
                const platformLabels = {
                    'meta': 'Meta',
                    'google': 'Google',
                    'both': 'Both'
                };
                return <span className="badge bg-primary">{platformLabels[platform] || platform}</span>;
            },
        },
        {
            accessorKey: 'status',
            header: () => 'Status',
            cell: (info) => {
                const status = info.getValue() || 'active';
                const statusColors = {
                    'active': 'success',
                    'paused': 'warning',
                    'scheduled': 'info'
                };
                return (
                    <span className={`badge bg-${statusColors[status] || 'secondary'}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                );
            },
        },
        {
            accessorKey: 'actions',
            header: () => "Actions",
            cell: ({ row }) => (
                <div className="hstack gap-2">
                <Dropdown
                        dropdownItems={actionsOptions}
                        triggerClass="avatar-md"
                        triggerPosition={"0,21"}
                        triggerIcon={<FiMoreHorizontal />}
                        onClick={(actionLabel) => {
                            const campaign = row.original;
                            if (actionLabel === "Edit") {
                                handleEditClick(campaign);
                            } else if (actionLabel === "Delete") {
                                handleDeleteClick(campaign);   // ✅ open modal instead of direct delete
                            }
                        }}
                />
                </div>
            ),
            meta: { headerClassName: 'text-end' }
        },
    ]
    return (
        <>
            <Table data={campaigns} columns={columns} onPrint={handlePrint} emptyMessage={"No campaigns available"} showPrint={showPrint} />
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                title="Delete Campaign"
                message={`Are you sure you want to delete "${campaignToDelete?.displayName}"?`}
                confirmText="Delete"
                cancelText="Cancel"
            />
            <EditModalCampaign
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                campaign={editData}
            />
        </>
    )
}

export default CampaignTable