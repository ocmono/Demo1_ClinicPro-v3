import { useState, useEffect } from 'react';
import PageHeaderSetting from '../shared/pageHeader/PageHeaderSetting';
import Footer from '../shared/Footer';
import PerfectScrollbar from 'react-perfect-scrollbar';

const SettingsCommunicationForm = () => {
  // WhatsApp Business API config state
  const [waToken, setWaToken] = useState('');
  const [waPhoneId, setWaPhoneId] = useState('');
  const [waBusinessNumber, setWaBusinessNumber] = useState('');
  // Loading and status
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // Load settings on mount
  useEffect(() => {
    setLoading(true);
    fetch('/api/settings/whatsapp-business').then(r => r.ok ? r.json() : {})
    .then((wa) => {
      setWaToken(wa.waToken || '');
      setWaPhoneId(wa.waPhoneId || '');
      setWaBusinessNumber(wa.waBusinessNumber || '');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleWaSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch('/api/settings/whatsapp-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waToken, waPhoneId, waBusinessNumber })
      });
      if (res.ok) setStatus('WhatsApp Business API settings saved!');
      else setStatus('Failed to save WhatsApp Business API settings.');
    } catch {
      setStatus('Failed to save WhatsApp Business API settings.');
    }
    setLoading(false);
  };

  return (
    <div className="content-area setting-form">
      <PerfectScrollbar>
        <PageHeaderSetting />
        <div className="content-area-body">
          <div className="card mb-0">
            <div className="card-body">
              <h4 className="mb-4 fw-bold">Communication Settings</h4>
              {loading && <div className="alert alert-info">Loading...</div>}
              {status && <div className="alert alert-success">{status}</div>}
              
              <div className="mb-4">
                <h6 className="fw-semibold mb-3">WhatsApp Web</h6>
                <p className="text-muted mb-0">No configuration needed. WhatsApp Web sharing uses the user&apos;s browser and WhatsApp account.</p>
              </div>
              
              <hr />
              
              <div className="mb-4">
                <h6 className="fw-semibold mb-3">WhatsApp Business API Configuration</h6>
                <form onSubmit={handleWaSave}>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">API Token</label>
                      <input className="form-control" value={waToken} onChange={e => setWaToken(e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Phone Number ID</label>
                      <input className="form-control" value={waPhoneId} onChange={e => setWaPhoneId(e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Business Number</label>
                      <input className="form-control" value={waBusinessNumber} onChange={e => setWaBusinessNumber(e.target.value)} />
                    </div>
                  </div>
                  <button className="btn btn-primary mt-3" type="submit" disabled={loading}>Save WhatsApp API Settings</button>
                </form>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </PerfectScrollbar>
    </div>
  );
};

export default SettingsCommunicationForm; 