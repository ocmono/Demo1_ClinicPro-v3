import { FaBarcode, FaCog, FaUsb, FaBluetooth, FaKeyboard, FaWifi, FaRegTimesCircle, FaTimes, FaCamera } from 'react-icons/fa';

const ScannerSettings = ({
  showScannerSettings,
  setShowScannerSettings,
  scannerType,
  setScannerType,
  isScannerConnected,
  scannerStatus,
  connectScanner,
  disconnectScanner,
  getScannerIcon,
  getStatusIcon
}) => {
  if (!showScannerSettings) return null;

  return (
    <div className="card mb-4 border-primary">
      <div className="card-header bg-primary text-white py-2">
        <h6 className="mb-0 d-flex align-items-center">
          <FaBarcode className="me-2" />
          Barcode Scanner Settings (Optional)
        </h6>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small fw-bold">Scanner Type</label>
            <select
              className="form-select form-select-sm"
              value={scannerType}
              onChange={(e) => setScannerType(e.target.value)}
              disabled={isScannerConnected && scannerType !== 'keyboard' && scannerType !== 'camera'}
            >
              <option value="keyboard">Keyboard (Always Available)</option>
              <option value="camera">Camera Scanner</option>
              <option value="serial">USB Scanner</option>
              <option value="bluetooth">Bluetooth Scanner</option>
            </select>
            <small className="text-muted">
              {scannerType === 'camera' 
                ? 'Uses device camera for barcode scanning'
                : 'Keyboard mode works without any setup'
              }
            </small>
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-bold">Status</label>
            <div className="d-flex align-items-center">
              {getStatusIcon()}
              <span className={`ms-2 ${
                isScannerConnected ? 'text-success' : 
                scannerType === 'camera' ? 'text-info' : 'text-warning'
              }`}>
                {scannerType === 'camera' 
                  ? 'Click camera icon to scan' 
                  : isScannerConnected ? 'Connected' : 'Offline'
                } - {scannerType}
              </span>
            </div>
            <small className="text-muted">
              Manual input always works in any mode
            </small>
          </div>
          <div className="col-12">
            <div className="d-flex gap-2 flex-wrap">
              {scannerType === 'camera' ? (
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-info btn-sm d-flex align-items-center"
                    onClick={() => {
                      // This will be handled by the parent component
                      setShowScannerSettings(false);
                    }}
                  >
                    <FaCamera className="me-1" />
                    Open Camera Scanner
                  </button>
                </div>
              ) : !isScannerConnected && scannerType !== 'keyboard' ? (
                <button
                  className="btn btn-success btn-sm d-flex align-items-center"
                  onClick={connectScanner}
                >
                  {getScannerIcon()}
                  Connect Scanner
                </button>
              ) : isScannerConnected && scannerType !== 'keyboard' ? (
                <button
                  className="btn btn-danger btn-sm d-flex align-items-center"
                  onClick={disconnectScanner}
                >
                  <FaTimes className="me-1" />
                  Disconnect
                </button>
              ) : null}
              
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowScannerSettings(false)}
              >
                Close
              </button>
            </div>

            {/* Scanner Type Specific Instructions */}
            {scannerType === 'keyboard' && (
              <div className="mt-2 p-2 bg-light rounded">
                <small className="text-success">
                  <FaKeyboard className="me-1" />
                  <strong>Keyboard mode active:</strong> Simply type barcodes and press Enter, or connect a scanner for automatic scanning.
                </small>
              </div>
            )}

            {scannerType === 'camera' && (
              <div className="mt-2 p-2 bg-info bg-opacity-10 rounded">
                <small className="text-info">
                  <FaCamera className="me-1" />
                  <strong>Camera Scanner:</strong> Uses your device camera to scan barcodes. 
                  Works best in Chrome/Edge with good lighting. 
                  <br />
                  <strong>Shortcut:</strong> Press Ctrl+C to open camera scanner
                </small>
              </div>
            )}

            {scannerType === 'serial' && !isScannerConnected && (
              <div className="mt-2 p-2 bg-warning bg-opacity-10 rounded">
                <small className="text-warning">
                  <FaUsb className="me-1" />
                  <strong>USB Scanner:</strong> Connect a USB barcode scanner. Make sure it's in HID mode (acts as keyboard).
                </small>
              </div>
            )}

            {scannerType === 'bluetooth' && !isScannerConnected && (
              <div className="mt-2 p-2 bg-warning bg-opacity-10 rounded">
                <small className="text-warning">
                  <FaBluetooth className="me-1" />
                  <strong>Bluetooth Scanner:</strong> Pair your Bluetooth scanner with your device first, then connect here.
                </small>
              </div>
            )}

            {/* Browser Compatibility Warning for Camera */}
            {scannerType === 'camera' && (
              <div className="mt-2 p-2 bg-warning bg-opacity-10 rounded">
                <small className="text-warning">
                  <strong>Browser Support:</strong> Camera scanning works best in Chrome, Edge, and Safari. 
                  Firefox may require additional permissions.
                </small>
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips Section */}
        <div className="row mt-3">
          <div className="col-12">
            <div className="border-top pt-3">
              <h6 className="small fw-bold mb-2">Quick Tips:</h6>
              <ul className="small text-muted mb-0">
                <li>Press <kbd>/</kbd> to focus on barcode input field</li>
                <li>Press <kbd>Ctrl+C</kbd> to open camera scanner</li>
                <li>Always select a customer before scanning</li>
                <li>Camera works best with clear, well-lit barcodes</li>
                <li>Keyboard mode is always available as fallback</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerSettings;