import React, { useState } from "react";
import MedicinesList from "./MedicinesList";
import AddMedicineForm from "./AddMedicinesForm";

const MedicinesManager = () => {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div>
      {showAddForm ? (
        <AddMedicineForm onClose={() => setShowAddForm(false)} />
      ) : (
        <MedicinesList onAddClick={() => setShowAddForm(true)} />
      )}
    </div>
  );
};

export default MedicinesManager;
