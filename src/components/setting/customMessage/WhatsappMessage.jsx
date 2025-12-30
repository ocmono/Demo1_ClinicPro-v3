import React, { useState, useEffect } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { useMessages } from "../../../context/MessageContext";

const WhatsappMessage = () => {
  const {
    whatsappTemplate,
    updateWhatsappTemplate,
    fetchWhatsappTemplate,
    loading,
    error,
  } = useMessages();

  const [editMode, setEditMode] = useState(false);
  const [editedMessage, setEditedMessage] = useState("");
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    if (whatsappTemplate.message) {
      setEditedMessage(whatsappTemplate.message);
    }
  }, [whatsappTemplate]);

  const handleSave = async () => {
    const success = await updateWhatsappTemplate({
      ...whatsappTemplate,
      message: editedMessage,
    });

    if (success) {
      setSaveStatus({
        type: "success",
        message: "Template saved successfully!",
      });
      // setTimeout(() => setSaveStatus(null), 3000);
      setEditMode(false);
    } else {
      setSaveStatus({ type: "error", message: "Failed to save template" });
    }
  };

  const handleRefresh = async () => {
    await fetchWhatsappTemplate();
  };

  if (loading.whatsapp)
    return (
      <div className="card mb-4 shadow rounded">
        <div className="card-header d-flex align-items-center justify-content-between">
          <span className="fw-bold">WhatsApp Message Template</span>
        </div>
        <div className="card-body text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );

  if (error.whatsapp)
    return (
      <div className="card mb-4 shadow rounded">
        <div className="card-header d-flex align-items-center justify-content-between">
          <span className="fw-bold">WhatsApp Message Template</span>
        </div>
        <div className="card-body">
          <div className="alert alert-danger d-flex align-items-center justify-content-between">
            <span>{error.whatsapp}</span>
            <button
              onClick={handleRefresh}
              className="btn btn-sm btn-outline-danger ms-2"
            >
              <FiRefreshCw /> Retry
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="card mb-4 rounded">
      <div className="card-header d-flex align-items-center justify-content-between">
        <span className="fw-bold">WhatsApp Message Template</span>
        <button
          onClick={handleRefresh}
          className="btn btn-sm btn-outline-secondary"
          disabled={loading.whatsapp}
          title="Refresh template"
        >
          {loading.whatsapp ? (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          ) : (
            <FiRefreshCw />
          )}
        </button>
      </div>
      <div className="card-body">
        {saveStatus && (
          <div className={`alert alert-${saveStatus.type}`}>{saveStatus.message}</div>
        )}
        {editMode ? (
          <>
            <textarea
              className="form-control mb-3"
              rows="6"
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              disabled={loading.updatingWhatsapp}
            />
            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-secondary"
                onClick={() => setEditMode(false)}
                disabled={loading.updatingWhatsapp}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handleSave}
                disabled={loading.updatingWhatsapp}
              >
                {loading.updatingWhatsapp ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving...
                  </>
                ) : (
                  "Save Template"
                )}
              </button>
            </div>
            <div className="mt-3">
              <small className="text-muted">
                Available fields :
              </small>
              <table className="table table-sm table-bordered mt-2">
                <thead>
                  <tr className="text-center">
                    <th className="align-middle">Patient Name</th>
                    <th className="align-middle">Doctor Name</th>
                    <th className="align-middle">Appointment Status</th>
                    <th className="align-middle">Appointment Date</th>
                    <th className="align-middle">Appointment Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-center">
                    <td className="align-middle">
                      <code>{"{name}"}</code>
                    </td>
                    <td className="align-middle">
                      <code>{"{doctor}"}</code>
                    </td>
                    <td className="align-middle">
                      <code>{"{status}"}</code>
                    </td>
                    <td className="align-middle">
                      <code>{"{date}"}</code>
                    </td>
                    <td className="align-middle">
                      <code>{"{time}"}</code>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="mb-3">
              <pre className="template-display bg-light p-3 rounded border" style={{ minHeight: 120 }}>{whatsappTemplate.message}</pre>
            </div>
            <button
              className="btn btn-primary mt-3"
              onClick={() => {
                setEditedMessage(whatsappTemplate.message);
                setEditMode(true);
              }}
            >
              Edit Template
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WhatsappMessage;
