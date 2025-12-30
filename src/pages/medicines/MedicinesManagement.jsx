import React, { useState } from "react";
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import MedicinesLayout from "./MedicinesLayout";
import AddMedicinesForm from "./AddMedicinesForm";
import MedicinesList from "./MedicinesList"; // Correctly imported!

const MedicinesManagement = () => {
  const [activeTab, setActiveTab] = useState("addMedicine");
  const [medicines, setMedicines] = useState([]); // 🔥 hold all medicines here

  const addMedicine = (newMedicine) => {
    setMedicines((prevMedicines) => [...prevMedicines, newMedicine]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "addMedicine":
        return <AddMedicinesForm addMedicine={addMedicine} />;
      case "medicineList":
        return <MedicinesList medicines={medicines} />;
      default:
        return <div>Select a tab from the menu</div>;
    }
  };

  return (
    <MedicinesLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </MedicinesLayout>
  );
};

export default MedicinesManagement;
