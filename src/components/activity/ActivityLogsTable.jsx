import React, { useState, useEffect } from "react";
import { FiRefreshCw, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Table from "@/components/shared/table/Table";
import { toast } from "react-toastify";
// import { useAuth } from "@/contentApi/AuthContext";
import { useActivity } from "../../context/ActivityContext";

const ActivityLogsTable = () => {
    // const { user } = useAuth();
    const navigate = useNavigate();
    const { activityLogs, loading, fetchActivityLogsFromBackend } = useActivity();

    useEffect(() => {
        fetchActivityLogsFromBackend();
    }, []);

    const handleRefresh = () => {
        fetchActivityLogsFromBackend();
        toast.success("Activity logs refreshed");
    };

    const tableData = activityLogs.map((p) => ({
        ...p,
        id: p.id || p._id,
        user_id: p.user_id || "-",
        name: p.name || "Unknown",
        role: p.role || "Unknown",
        action: p.action || "-",
        details: p.details || "-",
        timestamp: p.timestamp ? new Date(p.timestamp).toLocaleString() : "Not specified",
    }));

    const columns = [
        {
            accessorKey: "id",
            header: () => "ID",
            cell: (info) => (
                <span className="badge bg-light text-dark">#{info.getValue()}</span>
            ),
        },
        {
            accessorKey: "name",
            header: () => "User",
            cell: (info) => (
                <div>
                    <div className="fw-medium">{info.getValue()}</div>
                    <small className="text-muted">
                        ID: {info.row.original.user_id} | {info.row.original.role}
                    </small>
                </div>
            ),
        },
        {
            accessorKey: "action",
            header: () => "Action",
            cell: (info) => (
                <span className="badge bg-primary small">{info.getValue()}</span>
            ),
        },
        {
            accessorKey: "details",
            header: () => "Details",
            cell: (info) => (
                <span className="text-muted small">{info.getValue()}</span>
            ),
        },
        {
            accessorKey: "timestamp",
            header: () => "Timestamp",
            cell: (info) => (
                <span className="text-muted small">{info.getValue()}</span>
            ),
        },
        // {
        //     accessorKey: "actions",
        //     header: () => "Actions",
        //     cell: (info) => {
        //         return (
        //             <div className="hstack gap-2">
        //                 <button
        //                     className="avatar-text avatar-md"
        //                     title="View"
        //                     onClick={() =>
        //                         navigate(`/admin/activity-logs/view/${info.row.original.id}`, {
        //                             state: { info },
        //                         })
        //                     }
        //                 >
        //                     <FiEye />
        //                 </button>
        //             </div>
        //         );
        //     },
        //     meta: { headerClassName: "text-end" },
        // },
    ];

    return (
        <div className="activity-logs-table">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h6 className="mb-1 fw-bold">Activity Logs</h6>
                    <small className="text-muted">
                        {tableData.length} log
                        {tableData.length !== 1 ? "s" : ""} found
                    </small>
                </div>
                <div>
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={handleRefresh}
                        disabled={loading}
                        title="Refresh Logs"
                    >
                        <FiRefreshCw
                            size={14}
                            className={loading ? "spinner-border spinner-border-sm" : ""}
                        />
                    </button>
                </div>
            </div>

            <Table
                data={tableData}
                columns={columns}
                showPrint={false}
                emptyMessage={
                    <div className="text-center py-4">
                        <div className="text-muted mb-2">
                            <FiEye size={32} className="opacity-50" />
                        </div>
                        <h6 className="text-muted">No activity logs found</h6>
                        <p className="text-muted small mb-3">
                            Logs will appear once users start performing actions.
                        </p>
                    </div>
                }
                loading={loading}
            />
        </div>
    );
};

export default ActivityLogsTable;
