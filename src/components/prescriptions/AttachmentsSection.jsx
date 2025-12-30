import React from 'react'

const AttachmentsSection = ({ attachments, onAttachmentsChange, onRemoveAttachment }) => {
    const handleAttachmentsChange = (e) => {
        const files = Array.from(e.target.files);
        const readers = files.map(file => {
            return new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result });
                reader.readAsDataURL(file);
            });
        });
        
        Promise.all(readers).then(results => {
            onAttachmentsChange([...attachments, ...results]);
        });
    };
    return (
        <div className="px-4 mt-4">
            <label className="form-label fw-bold">Attachments (Lab Reports, Images, etc.)</label>
            <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={handleAttachmentsChange}
                className="form-control"
            />
            <div className="mt-3">
                {attachments.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                        {attachments.map((file, idx) => (
                            <div key={idx} className="position-relative border rounded p-2" style={{ width: '120px', height: '120px' }}>
                                {file.type.startsWith('image') ? (
                                    <img
                                        src={file.data}
                                        alt={file.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            borderRadius: '4px'
                                        }}
                                    />
                                ) : (
                                    <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                        <i className="bi bi-file-earmark-pdf text-danger" style={{ fontSize: '2rem' }}></i>
                                        <small className="text-muted text-center mt-1" style={{ fontSize: '0.75rem' }}>
                                            {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                                        </small>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                    style={{ width: '20px', height: '20px', fontSize: '10px', padding: '0' }}
                                    onClick={() => onRemoveAttachment(idx)}
                                    title="Remove attachment"
                                >
                                    ×
                                </button>
                                <div className="position-absolute bottom-0 start-0 w-100 p-1">
                                    <small className="text-white bg-dark bg-opacity-75 rounded px-1" style={{ fontSize: '0.7rem' }}>
                                        {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}
                                    </small>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-muted">
                        <i className="bi bi-cloud-upload" style={{ fontSize: '2rem' }}></i>
                        <p className="mt-2 mb-0">No files selected</p>
                        <small>Upload lab reports, images, or other documents</small>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AttachmentsSection
