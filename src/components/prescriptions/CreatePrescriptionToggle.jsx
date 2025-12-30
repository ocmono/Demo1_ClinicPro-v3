import React, { useRef, useEffect, useState } from "react";

const CreatePrescriptionToggle = ({ filter, setFilter }) => {
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const allRef = useRef(null);
  const todayRef = useRef(null);

  useEffect(() => {
    const ref = filter === "all" ? allRef : todayRef;
    if (ref.current) {
      const { offsetLeft, offsetWidth } = ref.current;
      setIndicatorStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
    }
  }, [filter]);

  return (
    <div className="prescription-toggle-wrapper">
      <div className="prescription-toggle-bg d-flex align-items-center justify-content-between bg-gray-100  p-1 shadow-sm">
            <button
            ref={allRef}
            className={`btn btn-sm  ${filter === "all" ? "btn-primary shadow-sm" : "text-dark"}`}
            onClick={() => setFilter("all")}
            >
            All
            </button>
            <button
            ref={todayRef}
            className={`btn btn-sm  ${filter === "today" ? "btn-primary shadow-sm" : "text-dark"}`}
            onClick={() => setFilter("today")}
            >
            Today
            </button>
      </div>
    </div>
  );
};

export default CreatePrescriptionToggle;
