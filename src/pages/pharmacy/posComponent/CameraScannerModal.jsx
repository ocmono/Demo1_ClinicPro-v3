// posComponent/CameraScannerModal.jsx
import { FaCamera, FaStop, FaSync, FaTimes, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const CameraScannerModal = ({
  showCameraScanner,
  setShowCameraScanner,
  isCameraActive,
  cameraPermission,
  selectedCamera,
  availableCameras,
  videoRef,
  startCamera,
  stopCamera,
  setSelectedCamera,
  getAvailableCameras
}) => {
  const handleClose = () => {
    stopCamera();
    setShowCameraScanner(false);
  };

  const handleCameraChange = async (e) => {
    const cameraId = e.target.value;
    setSelectedCamera(cameraId);
    stopCamera();
    setTimeout(() => {
      startCamera(cameraId);
    }, 300);
  };

  const refreshCameras = async () => {
    await getAvailableCameras();
  };

  return (
    <>
      {showCameraScanner && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title d-flex align-items-center">
                  <FaCamera className="me-2" />
                  Camera Barcode Scanner
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
              </div>
              
              <div className="modal-body">
                {/* Camera Status */}
                <div className="row mb-3">
                  <div className="col-12">
                    <div className={`alert ${isCameraActive ? 'alert-success' : cameraPermission === 'denied' ? 'alert-danger' : 'alert-warning'} d-flex align-items-center`}>
                      {isCameraActive ? (
                        <>
                          <FaCheckCircle className="me-2" />
                          Camera is active. Point at barcode to scan.
                        </>
                      ) : cameraPermission === 'denied' ? (
                        <>
                          <FaExclamationTriangle className="me-2" />
                          Camera permission denied. Please allow camera access in your browser settings.
                        </>
                      ) : (
                        <>
                          <FaExclamationTriangle className="me-2" />
                          Camera is not active. Click "Start Camera" to begin scanning.
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Camera Selection */}
                <div className="row mb-3">
                  <div className="col-md-8">
                    <label className="form-label fw-bold">Select Camera:</label>
                    <div className="input-group">
                      <select 
                        className="form-select" 
                        value={selectedCamera} 
                        onChange={handleCameraChange}
                        disabled={isCameraActive}
                      >
                        <option value="">Select a camera...</option>
                        {availableCameras.map((camera, index) => (
                          <option key={camera.deviceId} value={camera.deviceId}>
                            {camera.label || `Camera ${index + 1}`}
                          </option>
                        ))}
                      </select>
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button" 
                        onClick={refreshCameras}
                        disabled={isCameraActive}
                      >
                        <FaSync />
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-md-4 d-flex align-items-end">
                    {!isCameraActive ? (
                      <button 
                        className="btn btn-success w-100 d-flex align-items-center justify-content-center"
                        onClick={() => startCamera()}
                        disabled={!selectedCamera && availableCameras.length > 0}
                      >
                        <FaCamera className="me-2" />
                        Start Camera
                      </button>
                    ) : (
                      <button 
                        className="btn btn-danger w-100 d-flex align-items-center justify-content-center"
                        onClick={stopCamera}
                      >
                        <FaStop className="me-2" />
                        Stop Camera
                      </button>
                    )}
                  </div>
                </div>

                {/* Camera Preview */}
                <div className="row">
                  <div className="col-12">
                    <div className="camera-preview-container border rounded p-2 bg-dark">
                      {isCameraActive ? (
                        <video 
                          ref={videoRef}
                          className="w-100"
                          style={{ maxHeight: '400px', objectFit: 'contain' }}
                          autoPlay
                          playsInline
                          muted
                        />
                      ) : (
                        <div className="text-center text-light py-5">
                          <FaCamera size={48} className="mb-3 opacity-50" />
                          <p className="mb-0">Camera preview will appear here</p>
                          <small className="text-muted">Select a camera and click "Start Camera"</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="row mt-3">
                  <div className="col-12">
                    <div className="alert alert-info">
                      <h6 className="fw-bold mb-2">How to use:</h6>
                      <ul className="mb-0 small">
                        <li>Ensure good lighting for better barcode detection</li>
                        <li>Hold the barcode steady in front of the camera</li>
                        <li>The scanner will automatically detect barcodes</li>
                        <li>Camera will close automatically after successful scan</li>
                        <li>Make sure barcode is clear and not blurry</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleClose}>
                  <FaTimes className="me-1" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CameraScannerModal;