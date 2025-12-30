import React, { useState, useRef, useEffect } from 'react';
import { FiEdit3, FiUpload, FiTrash2, FiDownload } from 'react-icons/fi';

const SignaturePad = ({ onSave, onClose, existingSignature }) => {
    const sigCanvas = useRef(null);
    const [activeTab, setActiveTab] = useState('draw');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [drawing, setDrawing] = useState(false);

    useEffect(() => {
        if (sigCanvas.current && activeTab === 'draw') {
            const canvas = sigCanvas.current;
            const ctx = canvas.getContext('2d');

            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    }, [activeTab]);

    const getMousePos = (canvas, e) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width),
            y: (e.clientY - rect.top) * (canvas.height / rect.height)
        };
    };

    const startDrawing = (e) => {
        setDrawing(true);
        const ctx = sigCanvas.current.getContext('2d');
        const { x, y } = getMousePos(sigCanvas.current, e);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!drawing) return;
        const ctx = sigCanvas.current.getContext('2d');
        const { x, y } = getMousePos(sigCanvas.current, e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => setDrawing(false);

    const clearSignature = () => {
        const ctx = sigCanvas.current.getContext('2d');
        ctx.clearRect(0, 0, sigCanvas.current.width, sigCanvas.current.height);
    };

    const isCanvasBlank = (canvas) => {
        const ctx = canvas.getContext('2d');
        const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
        return !pixelBuffer.some(color => color !== 0);
    };

    const saveDrawnSignature = () => {
        const canvas = sigCanvas.current;
        if (canvas && !isCanvasBlank(canvas)) {
            const signatureData = canvas.toDataURL('image/png');
            onSave(signatureData);
        } else {
            alert('Please draw your signature first');
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert('File size should be less than 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveUploadedSignature = () => {
        if (!uploadedImage) return alert('Please upload a signature image first.');
        onSave(uploadedImage);
    };

    // preload existing signature
    useEffect(() => {
        if (existingSignature && activeTab === 'draw') {
            const ctx = sigCanvas.current.getContext('2d');
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                try {
                    ctx.clearRect(0, 0, sigCanvas.current.width, sigCanvas.current.height);
                    ctx.drawImage(img, 0, 0, sigCanvas.current.width, sigCanvas.current.height);
                } catch (err) {
                    console.warn("Image draw failed:", err);
                }
            };
            img.onerror = (e) => console.warn("Failed to load signature image", e);
            img.src = existingSignature + (existingSignature.includes('?') ? '&' : '?') + 'nocache=' + Date.now();
        }
    }, [existingSignature, activeTab]);

    return (
        <div className="signature-modal">
            <div className="modal-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Doctor Signature</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
                <ul className="nav nav-tabs mb-3">
                    <li className="nav-item">
                        <button className={`nav-link ${activeTab === 'draw' ? 'active' : ''}`} onClick={() => setActiveTab('draw')}>
                            <FiEdit3 className="me-1" /> Draw
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>
                            <FiUpload className="me-1" /> Upload
                        </button>
                    </li>
                </ul>

                {activeTab === 'draw' && (
                    <div>
                        <canvas
                            ref={sigCanvas}
                            width={500}
                            height={200}
                            style={{
                                width: '100%',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                backgroundColor: '#fff',
                                cursor: 'crosshair'
                            }}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={(e) => {
                                e.preventDefault();
                                startDrawing(e.touches[0]);
                            }}
                            onTouchMove={(e) => {
                                e.preventDefault();
                                draw(e.touches[0]);
                            }}
                            onTouchEnd={stopDrawing}
                        />
                        <div className="d-flex gap-2 mt-3">
                            <button className="btn btn-outline-danger" onClick={clearSignature}><FiTrash2 className="me-1" />Clear</button>
                            <button className="btn btn-primary ms-auto" onClick={saveDrawnSignature}><FiDownload className="me-1" />Save</button>
                        </div>
                        <small className="text-muted d-block mt-2">
                            Draw your signature in the box above
                        </small>
                    </div>
                )}

                {activeTab === 'upload' && (
                    <div>
                        <div className="upload-container text-center p-4 border rounded bg-light">
                            {uploadedImage ? (
                                <div>
                                    <img
                                        src={uploadedImage}
                                        alt="Uploaded signature"
                                        className="img-fluid mb-3 border rounded"
                                        style={{ maxHeight: '200px', maxWidth: '100%' }}
                                    />
                                    <div className="d-flex gap-2 justify-content-center">
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={() => setUploadedImage(null)}
                                        >
                                            <FiTrash2 className="me-1" />
                                            Remove
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={saveUploadedSignature}
                                        >
                                            <FiDownload className="me-1" />
                                            Use This Image
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <FiUpload size={48} className="text-muted mb-3" />
                                    <p className="text-muted mb-3">
                                        Upload a clear image of your signature
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="form-control"
                                    />
                                    <small className="text-muted d-block mt-2">
                                        Supported formats: JPG, PNG, GIF (Max: 2MB)
                                    </small>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignaturePad;
