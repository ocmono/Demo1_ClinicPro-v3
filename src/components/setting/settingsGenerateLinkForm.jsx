import { useState } from 'react';
import QRCode from 'react-qr-code';
import PerfectScrollbar from 'react-perfect-scrollbar';
import PageHeaderSetting from '../shared/pageHeader/PageHeaderSetting';
import Footer from '../shared/Footer';

const urlParams = new URLSearchParams(window.location.search);
const baseUrl = urlParams.get('baseUrl') || window.location.origin;

const DEFAULT_URL = `${baseUrl}/appointment/book-appointment-iframe`;
const DEFAULT_HEIGHT = 500;
const DEFAULT_WIDTH = 800;
const DEFAULT_THEME = 'light';
const DEFAULT_LOGO = '';
const DEFAULT_THANKYOU = 'Thank you for booking your appointment!';

const themeOptions = [
{ value: 'light', label: 'Light' },
{ value: 'brand', label: 'Brand' },
{ value: 'dark', label: 'Dark' },
];

const SettingsGenerateLinkForm = () => {
const [height, setHeight] = useState(DEFAULT_HEIGHT);
const [width, setWidth] = useState(DEFAULT_WIDTH);
const [url, setUrl] = useState(DEFAULT_URL);
const [thankyouMessage, setThankyouMessage] = useState(DEFAULT_THANKYOU);
const [theme, setTheme] = useState(DEFAULT_THEME);
const [logo, setLogo] = useState(DEFAULT_LOGO);
const [copied, setCopied] = useState(false);

// Add params
const params = [];
if (thankyouMessage) params.push(`thankyouMessage=${encodeURIComponent(thankyouMessage)}`);
if (theme) params.push(`theme=${encodeURIComponent(theme)}`);
if (logo) params.push(`logo=${encodeURIComponent(logo)}`);
const urlWithParams = params.length ? `${url}${url.includes('?') ? '&' : '?'}${params.join('&')}` : url;

const iframeCode = `
<!-- ClinicPro Appointment Booking Widget -->\n<iframe src='${urlWithParams}'
  style='min-width:${width}px;height:${height}px;border:none;' allowfullscreen></iframe>`;

const handleCopy = () => {
navigator.clipboard.writeText(iframeCode);
setCopied(true);
setTimeout(() => setCopied(false), 1500);
};

const handleReset = () => {
setHeight(DEFAULT_HEIGHT);
setWidth(DEFAULT_WIDTH);
setUrl(DEFAULT_URL);
setThankyouMessage(DEFAULT_THANKYOU);
setTheme(DEFAULT_THEME);
setLogo(DEFAULT_LOGO);
};

return (
  <div className="content-area setting-form">
    <PerfectScrollbar>
      <PageHeaderSetting />
      <div className="content-area-body">
        <div className="card mb-0">
          <div className="card-body">
            <h4 className="mb-4 fw-bold">Embed Appointment Booking Widget</h4>
            {/* Section: Booking Page URL */}
            <div className="mb-4">
              <h6 className="fw-semibold mb-2">1. Booking Page URL</h6>
              <input type="text" className="form-control mb-1" value={url} onChange={e=> setUrl(e.target.value)}
              />
              <small className="text-muted">Use this URL for the iframe on your website. This page is optimized for
                embedding.</small>
            </div>
            <hr />
            {/* Section: Appearance */}
            <div className="mb-4">
              <h6 className="fw-semibold mb-2">2. Appearance</h6>
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <label className="form-label">Color Theme</label>
                  <select className="form-select" value={theme} onChange={e=> setTheme(e.target.value)}>
                    {themeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Logo URL (optional)</label>
                  <input type="text" className="form-control" value={logo} onChange={e=> setLogo(e.target.value)}
                  placeholder="https://yourclinic.com/logo.png"
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Width (px)</label>
                  <input type="number" className="form-control" value={width} min={200} onChange={e=>
                  setWidth(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Height (px)</label>
                  <input type="number" className="form-control" value={height} min={300} onChange={e=>
                  setHeight(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <hr />
            {/* Section: Thank You Message */}
            <div className="mb-4">
              <h6 className="fw-semibold mb-2">3. Thank You Message</h6>
              <textarea className="form-control mb-1" rows={2} value={thankyouMessage} onChange={e=> setThankyouMessage(e.target.value)}
              />
              <small className="text-muted">This message will be shown to patients after they book an appointment.</small>
              <div className="mt-2">
                <strong>Preview:</strong>
                <div className="alert alert-success mt-1 mb-0" style={{ maxWidth: 400 }}>{thankyouMessage}</div>
              </div>
            </div>
            <hr />
            {/* Section: Embed Code & Actions */}
            <div className="mb-4">
              <h6 className="fw-semibold mb-2">4. Embed Code</h6>
              <div className="input-group mb-2">
                <textarea
                  className="form-control"
                  rows={3}
                  value={iframeCode}
                  readOnly
                />
                <button className="btn btn-outline-primary" type="button" onClick={handleCopy}>
                  {copied ? <span>&#10003; Copied!</span> : 'Copy'}
                </button>
              </div>
              <button className="btn btn-link text-danger p-0" type="button" onClick={handleReset}>
                Reset to defaults
              </button>
            </div>
            <hr />
            {/* Section: Live Preview & QR Code */}
            <div className="mb-4">
              <h6 className="fw-semibold mb-2">5. Live Preview & QR Code</h6>
              <div className="row g-3">
                {/* Live Preview */}
                <div className="col-12 col-lg-8">
                  <div
                    className="border rounded shadow-sm bg-light d-flex align-items-center justify-content-center"
                    style={{ width: "100%", overflow: "hidden" }}
                  >
                    <iframe
                      src={urlWithParams}
                      style={{
                        width: "100%",
                        height: `${height}px`,
                        border: "none",
                      }}
                      allowFullScreen
                      title="ClinicPro Appointment Booking Preview"
                    />
                  </div>
                  <small className="text-muted d-block mt-2">
                    Resize your browser window to test responsiveness
                  </small>
                </div>

                {/* QR Code */}
                <div className="col-12 col-lg-4 text-center">
                  <div className="mb-2 fw-semibold">Scan to open booking page:</div>
                  <QRCode value={urlWithParams} size={128} />
                  <div className="small text-muted mt-2">
                    Share this QR code for mobile booking
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </PerfectScrollbar>
  </div>
);
};

export default SettingsGenerateLinkForm;