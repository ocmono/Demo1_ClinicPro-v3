import React, { useState, useRef, useEffect } from 'react';
import { FiInfo, FiPlus, FiMinus, FiUser } from 'react-icons/fi';
import { GrPowerReset } from "react-icons/gr";
import { toast } from "react-toastify";
import ReactSelect from "react-select";
import PreviewPrescription from '../../../components/prescriptions/PreviewPrescription';
import MedicineSection from '../../../components/prescriptions/prescriptionDummy/MedicineSection';
import VaccineSection from '../../../components/prescriptions/prescriptionDummy/VaccineSection';
import LabTestSection from '../../../components/prescriptions/prescriptionDummy/LabTestSection';
import ChipInputWithSuggestions from '../../../components/prescriptions/prescriptionDummy/ChipInputWithSuggestions'


//context api
import { useBooking } from "../../../contentApi/BookingProvider";
import { usePrescription } from "../../../contentApi/PrescriptionProvider";
import { useAppointments } from "../../../context/AppointmentContext";
import { useAuth } from "../../../contentApi/AuthContext";
import { useMedicines } from "../../../context/MedicinesContext";
import { useVaccine } from "../../../context/VaccineContext";
import { useTests } from "../../../context/TestContext";

const PrescriptionCreateSimple = () => {

    return (
        <div>
            <h1>Prescription Create Simple</h1>
        </div>
    )
}

export default PrescriptionCreateSimple;