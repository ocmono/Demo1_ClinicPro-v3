import React, { forwardRef, useContext } from "react";
import { IoMdClose } from "react-icons/io";
import { AppointmentContext } from "../../context/AppointmentContext";
import "./AppointmentsData.css";
import { useBooking } from "../../contentApi/BookingProvider";

const AppointmentsData = forwardRef(function AppointmentsData(
  { selectedDate, onClose },
  ref
) {
  const { appointments, markVisitDone, doneVisits } =
    useContext(AppointmentContext);

  const {
    setDateSelected,
    setCurrentStep,
    setLaunchedFromCalendar,
    setAppointmentSource,
  } = useBooking();
  const handleAddAppointmentClick = () => {
    setLaunchedFromCalendar(true);
    setDateSelected(new Date(selectedDate));
    setAppointmentSource("");
    setCurrentStep("source");
    onClose();
  };

  const filteredAppointments = appointments.filter(
    (appt) => appt.date === selectedDate
  );

  const categorized = {
    approved: [],
    rejected: [],
    done: [],
  };

  filteredAppointments.forEach((appt) => {
    if (appt.status === "Done") {
      categorized.done.push(appt);
    } else if (appt.status === "Accepted") {
      categorized.approved.push(appt);
    } else if (appt.status === "Rejected") {
      categorized.rejected.push(appt);
    }
  });

  const renderTable = (title, data, showAction = false) => (
    <div className="mb-4">
      {title && (
        <h3 className={`section-title ${title.toLowerCase()}`}>{title}</h3>
      )}
      {data.length > 0 ? (
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Doctor</th>
              <th>Time</th>
              {showAction && <th>Dr Visit</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((appt) => (
              <tr key={appt.id}>
                <td>{appt.id}</td>
                <td>{appt.name}</td>
                <td>{appt.contact}</td>
                <td>{appt.doctor}</td>
                <td>{appt.time}</td>
                {showAction && (
                  <td style={{ textAlign: "center" }}>
                    {doneVisits.includes(appt.id) ? (
                      <span className="done-label">Done</span>
                    ) : (
                      <button
                        className="mark-done-btn"
                        onClick={() => markVisitDone(appt.id)}
                      >
                        ✔
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No {title.toLowerCase()} appointments.</p>
      )}
    </div>
  );

  return (
    <div
      className="data-modal-overlay"
      ref={ref}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="data-modal">
        <button className="data-modal__close" onClick={onClose}>
          <IoMdClose />
        </button>

        <div className="data-modal__header">
          <h3>Appointments on {selectedDate}</h3>
          <div className="add-appointment-wrapper">
            <button
              onClick={handleAddAppointmentClick}
              className="add-appointment-btn"
            >
              Add Appointment
            </button>
          </div>
        </div>
        <div className="data-modal__body">
          {renderTable("Approved", categorized.approved, true)}
          {renderTable("Done", categorized.done)}
          {renderTable("Rejected", categorized.rejected)}
        </div>
      </div>
    </div>
  );
});

export default AppointmentsData;
