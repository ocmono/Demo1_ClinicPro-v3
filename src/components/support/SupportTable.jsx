import React, { useEffect, useState } from 'react'
import Table from '@/components/shared/table/Table'
import { FiEye, FiDownload, FiEdit } from 'react-icons/fi'
import { toast } from "react-toastify";
import { useAuth } from "../../contentApi/AuthContext";
import SupportViewModal from './SupportViewModal';
import EditStatusModal from './EditStatusModal';

const SupportTable = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusTicket, setStatusTicket] = useState(null);

  // Fetch tickets data
    const fetchTickets = async () => {
      setIsLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            // Replace with your actual API endpoint
            const response = await fetch('https://bkdemo1.clinicpro.cc/support/tickets', {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Data found", data);
          setTickets(data);
        } else {
          throw new Error('Failed to fetch tickets');
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
          // toast.error("Failed to load support tickets");
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setViewModalOpen(true);
  };

  const handleOpenStatusModal = (ticket) => {
    setStatusTicket(ticket);
    setStatusModalOpen(true);
  };

  const handleDownloadAttachment = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || url.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      'Low': 'badge bg-success',
      'Normal': 'badge bg-primary',
      'High': 'badge bg-warning',
      'Urgent': 'badge bg-danger'
    };
    
    return (
      <span className={priorityClasses[priority] || 'badge bg-secondary'}>
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Open': 'badge bg-success',
      'In Progress': 'badge bg-warning',
      'Resolved': 'badge bg-info',
      'Closed': 'badge bg-secondary'
    };
    
    return (
      <span className={statusClasses[status] || 'badge bg-secondary'}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
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
      accessorKey: 'subject',
      header: 'Subject',
      cell: (info) => (
        <span className="fw-medium">{info.getValue()}</span>
      )
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: (info) => (
        <span className="fw-medium">{info.getValue()}</span>
      )
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: (info) => getPriorityBadge(info.getValue())
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => getStatusBadge(info.getValue())
    },
    {
      accessorKey: 'created_at',
      header: 'Created Date',
      cell: (info) => formatDate(info.getValue())
    },
    {
      accessorKey: 'updated_at',
      header: 'Last Updated',
      cell: (info) => formatDate(info.getValue())
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="hstack gap-2">
          <button
            className="avatar-text avatar-md"
            title="View Ticket"
            onClick={() => handleViewTicket(info.row.original)}
          >
            <FiEye />
          </button>
          
          {info.row.original.attachment_urls?.length > 0 && (
            <button
              className="avatar-text avatar-md text-primary"
              title="Download Attachments"
              onClick={() => {
                // Download first attachment, you can modify this to handle multiple attachments
                const firstAttachment = info.row.original.attachment_urls[0];
                handleDownloadAttachment(firstAttachment);
              }}
            >
              <FiDownload />
            </button>
          )}
          <button
            className="avatar-text avatar-md"
            title="Edit Status"
            onClick={() => handleOpenStatusModal(info.row.original)}
          >
         <FiEdit />
        </button>
        </div>
      ),
      meta: {
        headerClassName: 'text-end'
      }
    },
  ];

  const tableData = React.useMemo(() => {
    return tickets.map(ticket => ({
      ...ticket,
      id: ticket.id,
      subject: ticket.subject,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      description: ticket.description,
      attachment_urls: ticket.attachment_urls || []
    }));
  }, [tickets]);

  return (
    <>
      {isLoading && (
        <div className="alert alert-info mb-3">
          <strong>Loading support tickets...</strong>
        </div>
      )}

      <Table 
        data={tableData} 
        columns={columns} 
        emptyMessage="No support tickets found"
      />

      {/* View Ticket Modal */}
      {viewModalOpen && selectedTicket && (
        <SupportViewModal
        isOpen={viewModalOpen}
        ticket={selectedTicket}
        onClose={() => setViewModalOpen(false)}
        getPriorityBadge={getPriorityBadge}
        getStatusBadge={getStatusBadge}
        formatDate={formatDate}
        handleDownloadAttachment={handleDownloadAttachment}
      />
      )}
      <EditStatusModal
        ticket={statusTicket}
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        refreshTickets={fetchTickets}
      />
    </>
  )
}

export default SupportTable