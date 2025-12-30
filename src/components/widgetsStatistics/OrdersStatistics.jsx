import React from 'react'
import getIcon from '@/utils/getIcon';
import { FiTrendingDown, FiTrendingUp } from 'react-icons/fi';

const statisticsData = [
    { value: '290+', description: 'Page Views', changePercentage: '2.9% change', icon: 'feather-eye', trend: "up", color: "success" },
    { value: '$10,254', description: 'Today Earnings', changePercentage: '3.6% change', icon: 'feather-pie-chart', trend: "down", color: "warning" },
    { value: '690+', description: 'Total Sales', changePercentage: '2.3% change', icon: 'feather-shopping-bag', trend: "up", color: "primary" },
    { value: '$25,345', description: 'Orders Received', changePercentage: '4.2% change', icon: 'feather-shopping-cart', trend: "down", color: "danger" }
];


const OrdersStatistics = () => {
    return (
        <>
            {statisticsData.map(({ value, description, changePercentage, icon, trend, color }, index) => (
                <div key={index} className="col-xxl-3 col-md-6">
                    <div className="card stretch stretch-full">
                        <div className="card-body">
                            <div className="hstack justify-content-between">
                                <div>
                                    <h4 className={`text-${color}`}>{value}</h4>
                                    <div className="text-muted">{description}</div>
                                </div>
                                <div className="text-end">
                                    <i className={"fs-2"} >{getIcon(icon)}</i>
                                </div>
                            </div>
                        </div>
                        <div className={`card-footer bg-${color} py-3`}>
                            <div className="hstack justify-content-between">
                                <p className="text-white mb-0">{changePercentage}</p>
                                <div className="text-end">
                                    <i className="text-white fs-16">{trend === "up" ? <FiTrendingUp /> : <FiTrendingDown />}</i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}

export const PrescriptionStatistics = ({ prescriptions }) => {
  // Use mock data if not provided
  const mockPrescriptions = [
    { id: 1, medicines: [{ medicine_name: 'Paracetamol' }, { medicine_name: 'Ibuprofen' }] },
    { id: 2, medicines: [{ medicine_name: 'Paracetamol' }] },
    { id: 3, medicines: [{ medicine_name: 'Aspirin' }, { medicine_name: 'Paracetamol' }] },
    { id: 4, medicines: [{ medicine_name: 'Ibuprofen' }] },
  ];
  const data = prescriptions && prescriptions.length > 0 ? prescriptions : mockPrescriptions;

  const totalPrescriptions = data.length;
  const allMeds = data.flatMap(p => p.medicines || []);
  const totalMedicines = allMeds.length;
  const medCount = {};
  allMeds.forEach(m => {
    const name = m.medicine_name || m.name || 'Unknown';
    medCount[name] = (medCount[name] || 0) + 1;
  });
  const topMeds = Object.entries(medCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <>
      <div className="col-xxl-3 col-md-6">
        <div className="card stretch stretch-full">
          <div className="card-body">
            <div className="hstack justify-content-between">
              <div>
                <h4 className="text-primary">{totalPrescriptions}</h4>
                <div className="text-muted">Total Prescriptions</div>
              </div>
              <div className="text-end">
                <i className="fs-2">💊</i>
              </div>
            </div>
          </div>
          <div className="card-footer bg-primary py-3">
            <div className="hstack justify-content-between">
              <p className="text-white mb-0">Total Medicines Prescribed: {totalMedicines}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="col-xxl-3 col-md-6">
        <div className="card stretch stretch-full">
          <div className="card-body">
            <div className="hstack justify-content-between">
              <div>
                <h4 className="text-success">Top Medicines</h4>
                <ul className="text-muted mb-0" style={{ paddingLeft: 16 }}>
                  {topMeds.map(([name, count], idx) => (
                    <li key={idx}>{name}: {count}</li>
                  ))}
                </ul>
              </div>
              <div className="text-end">
                <i className="fs-2">🩺</i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrdersStatistics