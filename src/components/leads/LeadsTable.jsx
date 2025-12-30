import React, { memo, useEffect, useState, useRef } from 'react'
import Table from '@/components/shared/table/Table';
import { FiAlertOctagon, FiEdit3, FiTrash2, FiCheckSquare, FiSquare, FiUserPlus } from 'react-icons/fi'
import { leadsStatusOptions } from '@/utils/options';
import getIcon from '@/utils/getIcon';

import { useLeads } from "../../context/LeadsContext";
import { toast } from 'react-toastify';
import DeleteConfirmationModal from '../../pages/clinic/settings/DeleteConfirmationModal';
import EditModalLead from './EditModalLead';
import BulkOperationsModal from './BulkOperationsModal';
import { useAuth } from "../../contentApi/AuthContext";
import { calculateLeadScore, detectDuplicates } from '@/utils/leadIntegrations';
import { convertLeadToPatient, canConvertLeadToPatient } from '@/utils/leadToPatient';
import { useNavigate } from 'react-router-dom';

const LeadssTable = ({ showPrint = true }) => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { leads, campaigns, updateLead, deleteLead, fetchLeads } = useLeads();
  console.log("Leads Data", leads);
  const [editData, setEditData] = useState({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState(null);
  const [filters, setFilters] = useState({
    campaign: "",
    date: "",
    source: "",
    status: "",
  });
  const calendarRef = useRef(null);
  const printRef = useRef(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        const calendarButton = event.target.closest(".filter-icon-btn");
        if (!calendarButton) {
          setShowCalendar(false);
        }
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  const getCampaignName = (id) => {
    const campaign = campaigns.find((c) => c.id.toString() === id.toString());
    return campaign ? campaign.displayName : "Unknown Campaign";
  };

  const handleEditClick = (lead) => {
    setEditData(lead);
    setEditModalOpen(true);
  };

  const handleDateSelect = (date) => {
    setFilters((prev) => ({ ...prev, date: date.toISOString().split("T")[0] }));
    setCalendarDate(date);
    setShowCalendar(false);
  };

  const handleTodayClick = () => {
    const today = new Date();
    setFilters((prev) => ({
      ...prev,
      date: today.toISOString().split("T")[0],
    }));
    setCalendarDate(today);
    setShowCalendar(false);
  };

  const handleDeleteClick = (lead) => {
    setLeadToDelete(lead);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!leadToDelete) return;
    try {
      await deleteLead(leadToDelete.id || leadToDelete._id);
      toast.success("Lead deleted successfully!");
    } catch (error) {
      console.log("Failed to delete lead");
      // toast.error("Failed to delete lead");
    } finally {
      setDeleteModalOpen(false);
      setLeadToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setLeadToDelete(null);
  };

  const handleConvertToPatient = (lead) => {
    const validation = canConvertLeadToPatient(lead);
    if (!validation.canConvert) {
      console.log(validation.reason);
      // toast.error(validation.reason);
      return;
    }
    setLeadToConvert(lead);
    setShowConvertModal(true);
  };

  const confirmConvertToPatient = async () => {
    if (!leadToConvert) return;

    try {
      const patientData = convertLeadToPatient(leadToConvert);
      const existingPatients = JSON.parse(localStorage.getItem('patients') || '[]');
      const newPatient = {
        id: Date.now().toString(),
        ...patientData,
        patientId: Date.now().toString()
      };
      existingPatients.push(newPatient);
      localStorage.setItem('patients', JSON.stringify(existingPatients));

      const updatedLead = {
        ...leadToConvert,
        leadStatus: 'converted',
        patientId: newPatient.id,
        convertedAt: new Date().toISOString()
      };

      await updateLead(leadToConvert.id || leadToConvert._id, updatedLead);
      toast.success(`Lead "${leadToConvert.fullName}" converted to patient successfully!`);
      setShowConvertModal(false);
      setLeadToConvert(null);
      await fetchLeads();

      setTimeout(() => {
        if (window.confirm('Would you like to view the patient record?')) {
          navigate(`/patients/view/${newPatient.id}`);
        }
      }, 1000);
    } catch (error) {
      console.log(`Failed to convert lead: ${error.message}`);
      // toast.error(`Failed to convert lead: ${error.message}`);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");

    const printHTML = `
    <html>
      <head>
        <title>Print Leads</title>
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
        <h2>Leads List</h2>
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>FullName</th>
              <th>Phone</th>
              <th>Campaign Id</th>
              <th>Date</th>
              <th>Source</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${leads.map((p) => `
                <tr>
                <td>${p.id || "—"}</td>
                <td>${p.fullName || "—"}</td>
                <td>${p.mobile || "—"}</td>
                <td>${p.campaignId || "—"}</td>
                <td>${p.leadDate || "—"}</td>
                <td>${p.leadSource || "—"}</td>
                <td>${p.leadStatus || "—"}</td>
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

  useEffect(() => {
    fetchLeads();
  }, []);

  const resetFilters = () => {
    setFilters({
      campaign: "",
      date: "",
      source: "",
      status: "",
    });
    setShowCalendar(false);
  };

  const handleFilterClick = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  const filteredLeads = leads.filter((lead) => {
    const campaignMatch = filters.campaign
      ? getCampaignName(lead.campaignId) === filters.campaign
      : true;
    const dateMatch = filters.date ? lead.leadDate === filters.date : true;
    const sourceMatch = filters.source
      ? lead.leadSource?.toLowerCase() === filters.source.toLowerCase()
      : true;
    const statusMatch = filters.status
      ? lead.leadStatus?.replace(/\s+/g, "-").toLowerCase() ===
      filters.status.toLowerCase()
      : true;

    return campaignMatch && dateMatch && sourceMatch && statusMatch;
  });

  const handleSelectLead = (leadId) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(lead => lead.id || lead._id)));
    }
  };

  const handleBulkComplete = () => {
    setSelectedLeads(new Set());
    fetchLeads();
  };

  const selectedLeadsArray = filteredLeads.filter(lead => 
    selectedLeads.has(lead.id || lead._id)
  );

  const ActionButtons = memo(({ lead }) => {
    const isConverted = lead?.leadStatus?.toLowerCase() === 'converted' && lead?.patientId;
    
    return (
      <div className="hstack gap-1">
        <button
          className="avatar-text avatar-md"
          onClick={() => handleEditClick(lead)}
          title="Edit Lead"
        >
          <FiEdit3 size={14} />
        </button>
        
        {!isConverted && (
          <button
            className="avatar-text avatar-md"
            onClick={() => handleConvertToPatient(lead)}
            title="Convert to Patient"
          >
            <FiUserPlus size={14} />
          </button>
        )}
        
        {role?.toLowerCase() !== 'receptionist' && (
          <button
            className="avatar-text avatar-md"
            onClick={() => handleDeleteClick(lead)}
            title="Delete Lead"
          >
            <FiTrash2 size={14} />
          </button>
        )}
      </div>
    );
  });

  const columns = [
    {
      accessorKey: 'id',
      header: () => (
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-sm p-0 border-0 bg-transparent"
            onClick={handleSelectAll}
            title={selectedLeads.size === filteredLeads.length ? 'Deselect All' : 'Select All'}
          >
            {selectedLeads.size === filteredLeads.length && filteredLeads.length > 0 ? (
              <FiCheckSquare size={18} />
            ) : (
              <FiSquare size={18} />
            )}
          </button>
          <span>ID</span>
        </div>
      ),
      cell: (info) => {
        const leadId = info.row.original.id || info.row.original._id;
        const isSelected = selectedLeads.has(leadId);
        return (
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-sm p-0 border-0 bg-transparent"
              onClick={() => handleSelectLead(leadId)}
            >
              {isSelected ? (
                <FiCheckSquare size={18} className="text-primary" />
              ) : (
                <FiSquare size={18} />
              )}
            </button>
            <span className="badge bg-light text-dark">#{info.getValue()}</span>
          </div>
        );
      },
      meta: {
        headerClassName: 'width-30',
      },
    },
    {
      accessorKey: 'fullName',
      header: () => 'Customer Name',
      cell: (info) => {
        const lead = info.row.original;
        const name = info.getValue();
        const isConverted = lead?.leadStatus?.toLowerCase() === 'converted' && lead?.patientId;
        return (
          <a href="#" className="hstack gap-3">
            <div className="text-white avatar-text user-avatar-text avatar-md">
              {name?.charAt(0)}
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <span className="text-truncate-1-line">{name}</span>
                {isConverted && (
                  <span className="badge bg-success" title="Converted to Patient">
                    <FiUserPlus size={12} className="me-1" />
                    Patient
                  </span>
                )}
              </div>
            </div>
          </a>
        )
      }
    },
    {
      accessorKey: 'mobile',
      header: () => 'Mobile',
      cell: (info) => <a href={`tel:${info.getValue()}`}>{info.getValue()}</a>,
    },
    {
      accessorKey: 'campaignId',
      header: () => 'Campaign',
      cell: ({ getValue }) => {
        const campaign = campaigns.find(
          (c) => c.id.toString() === getValue()?.toString()
        );
        return campaign ? (
          <div className="hstack gap-2">
            <div className="avatar-text avatar-sm">
              {campaign.icon ? getIcon(campaign.icon) : <FiAlertOctagon />}
            </div>
            <a href="#">{campaign.displayName || 'Unnamed Campaign'}</a>
          </div>
        ) : (
          <span className="text-muted">Unknown</span>
        );
      },
    },
    {
      accessorKey: 'leadDate',
      header: () => 'Date',
      cell: (info) => {
        const dateStr = info.getValue();
        return <span>{dateStr}</span>;
      },
    },
    {
      accessorKey: 'leadSource',
      header: () => 'Source',
      cell: (info) => <span>{info.getValue() || 'N/A'}</span>,
    },
    {
      accessorKey: 'leadStatus',
      header: () => 'Status',
      cell: (info) => {
        const value = info.getValue();
        const statusOption = leadsStatusOptions.find(
          (opt) => opt.value.toLowerCase() === value?.toLowerCase()
        );

        if (!statusOption) {
          return <span className="badge bg-secondary">N/A</span>;
        }

        return (
          <span
            className="badge text-white"
            style={{
              backgroundColor: statusOption.color,
            }}
          >
            {statusOption.label}
          </span>
        );
      },
    },
    {
      accessorKey: 'score',
      header: () => 'Score',
      cell: (info) => {
        const lead = info.row.original;
        const score = calculateLeadScore(lead);
        const scoreColor = score >= 70 ? 'success' : score >= 40 ? 'warning' : 'secondary';
        return (
          <span className={`badge bg-${scoreColor}`}>
            {score}
          </span>
        );
      },
    },
    {
      accessorKey: 'actions',
      header: () => "Actions",
      cell: ({ row }) => <ActionButtons lead={row.original} />,
      meta: { headerClassName: 'text-end' }
    },
  ]
  return (
    <>
      {selectedLeads.size > 0 && (
        <div className='col-md-12'>
          <div className="alert alert-info d-flex align-items-center justify-content-between">
          <div>
            <strong>{selectedLeads.size} lead(s)</strong> selected
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => setBulkModalOpen(true)}
            >
              Bulk Operations
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setSelectedLeads(new Set())}
            >
              Clear Selection
            </button>
          </div>
          </div>
        </div>
      )}
      <Table data={filteredLeads} columns={columns} onPrint={handlePrint} emptyMessage={"No leads available"} showPrint={showPrint} cardHeader={<h5 className="card-title mb-0">Leads List</h5>} />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete "${leadToDelete?.fullName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
      />
      <EditModalLead
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        lead={editData}
      />
      <BulkOperationsModal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        selectedLeads={selectedLeadsArray}
        onBulkComplete={handleBulkComplete}
      />
      {/* Convert to Patient Modal */}
      {showConvertModal && leadToConvert && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Convert Lead to Patient</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowConvertModal(false);
                    setLeadToConvert(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <strong>Converting Lead:</strong> {leadToConvert.fullName}
                </div>
                <div className="mb-3">
                  <h6 className="mb-3">Lead Information to Convert:</h6>
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <strong>Name:</strong> {leadToConvert.fullName || 'N/A'}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Mobile:</strong> {leadToConvert.mobile || 'N/A'}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Email:</strong> {leadToConvert.email || 'N/A'}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Source:</strong> {leadToConvert.leadSource || 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="alert alert-warning">
                  <strong>Note:</strong> This will create a new patient record and update the lead status to "Converted".
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowConvertModal(false);
                    setLeadToConvert(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={confirmConvertToPatient}
                >
                  <FiUserPlus className="me-2" />
                  Convert to Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default LeadssTable