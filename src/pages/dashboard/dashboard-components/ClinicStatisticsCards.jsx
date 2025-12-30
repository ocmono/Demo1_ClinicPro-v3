// ClinicStatisticsCards.jsx - Flexible version
import { Link } from 'react-router-dom';
import CircleProgress from '../../components/shared/CircleProgress';
import { FiRefreshCw } from 'react-icons/fi';

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  progressValue, 
  progressColor, 
  badgeText, 
  viewLink, 
  actionLink, 
  actionText = "View All" 
}) => {
  return (
    <div className="col-xxl-3 col-md-6">
      <div className="card-body border border-dashed border-gray-5 rounded-3 position-relative">
        <div className="hstack justify-content-between gap-4">
          <div>
            <h6 className="fs-14 text-truncate-1-line">{title}</h6>
            <div className="fs-12 text-muted">{subtitle}</div>
          </div>
          <div className="project-progress-1">
            <CircleProgress 
              value={progressValue} 
              text_sym={"%"} 
              path_width='8px' 
              path_color={progressColor} 
            />
          </div>
        </div>
        <div className="badge bg-gray-200 text-dark project-mini-card-badge">{badgeText}</div>
        <div className="mt-3 d-flex gap-2">
          <Link to={viewLink} className="btn btn-sm btn-outline-primary">
            {actionText}
          </Link>
          {actionLink && (
            <Link to={actionLink} className="btn btn-sm btn-outline-success">
              {title.includes('Appointment') ? 'Book' : 
               title.includes('Prescription') ? 'Create' : 
               title.includes('Medicine') ? 'Add' : 'Manage'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const ClinicStatisticsCards = ({ 
  user, 
  role, 
  stats, 
  vaccines, 
  dateRangeDisplay, 
  onRefresh,
  customCards = [] // Allow custom cards to be passed
}) => {
  
  const defaultCards = [
    {
      title: "Total Appointments",
      subtitle: `<span class="text-dark fw-medium">Total:</span> ${stats.totalAppointments}`,
      progressValue: stats.appointmentCompletionRate,
      progressColor: "#3454d1",
      badgeText: "Updates",
      viewLink: "/appointments/all-appointments",
      actionLink: "/appointments/book-appointment"
    },
    {
      title: "Total Prescriptions",
      subtitle: `<span class="text-dark fw-medium">Total:</span> ${stats.totalPrescriptions}`,
      progressValue: stats.prescriptionCompletionRate,
      progressColor: "#17c666",
      badgeText: "Active",
      viewLink: "/prescriptions/all-prescriptions",
      actionLink: "/prescriptions/create-prescription"
    },
    {
      title: "Total Medicines",
      subtitle: `<span class="text-dark fw-medium">In Stock:</span> ${Math.round(stats.totalMedicines * 0.8)}`,
      progressValue: Math.round(stats.totalMedicines * 0.8),
      progressColor: "#ffa21d",
      badgeText: "Stock",
      viewLink: "/medicines/all-medicines",
      actionLink: "/inventory/products/product-create"
    },
    {
      title: "Total Vaccines",
      subtitle: `<span class="text-dark fw-medium">Available:</span> ${vaccines.length}`,
      progressValue: Math.round(vaccines.length * 0.8),
      progressColor: "#ea4d4d",
      badgeText: "Available",
      viewLink: "/vaccines/dashboard",
      actionLink: "/vaccines/dashboard"
    }
  ];

  const cardsToRender = customCards.length > 0 ? customCards : defaultCards;

  return (
    <div className="col-12">
      <div className="card stretch stretch-full">
        <div className="card-body">
          <div className="hstack justify-content-between mb-4 pb-1">
            <div>
              <h5 className="mb-1">Clinic Overview</h5>
              <span className="fs-12 text-muted">
                Welcome back, {user?.name || 'Clinic Staff'}! Here&apos;s your clinic overview for {dateRangeDisplay}
              </span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="text-end me-3">
                <div className="badge bg-soft-primary text-primary fs-12">{role || 'Staff'}</div>
                <p className="text-muted small mt-1 mb-0">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <button
                className="btn btn-light-brand btn-sm"
                onClick={onRefresh}
                title="Refresh Data"
              >
                <FiRefreshCw size={14} />
              </button>
            </div>
          </div>
          
          <div className="row g-4">
            {cardsToRender.map((card, index) => (
              <StatCard
                key={index}
                title={card.title}
                value={card.value}
                subtitle={<span dangerouslySetInnerHTML={{ __html: card.subtitle }} />}
                progressValue={card.progressValue}
                progressColor={card.progressColor}
                badgeText={card.badgeText}
                viewLink={card.viewLink}
                actionLink={card.actionLink}
                actionText={card.actionText}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicStatisticsCards;