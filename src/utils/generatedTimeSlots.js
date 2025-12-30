// utils/generateTimeSlots.js
//normal time slots
// export function generateSortedTimeSlots(selectedDoctor, dateSelected) {
//   if (!selectedDoctor || !dateSelected) return [];

//   const dayName = dateSelected.toLocaleDateString("en-US", {
//     weekday: "long",
//   });

//   const doctorDay = selectedDoctor.availability.filter(
//     (day) => day.day === dayName && !day.closed
//   );

//   if (doctorDay.length === 0) return [];

//   const slots = [];

//   doctorDay.forEach((slot) => {
//     if (!slot.startTime || !slot.endTime) return;

//     // Split handles both "HH:mm" and "HH:mm:ss"
//     let [startH, startM] = slot.startTime.split(":").map(Number);
//     let [endH, endM] = slot.endTime.split(":").map(Number);

//     let start = new Date(1970, 0, 1, startH, startM || 0);
//     const end = new Date(1970, 0, 1, endH, endM || 0);

//     while (start < end) {
//        slots.push({
//          dateObj: new Date(start), // keep raw Date for comparisons
//          label: start.toLocaleTimeString([], {
//            hour: "2-digit",
//            minute: "2-digit",
//           hour12: true, // 👈 switch to 12-hour or false for 24-hour
//         }),
//       });
//       start = new Date(start.getTime() + slot.slotDuration * 60000);
//     }
//   });

//   return slots;
// }

// // Helper to convert 12-hour to 24-hour format
// function convertTo24Hr(timeStr) {
//   const [time, modifier] = timeStr.split(" ");
//   let [hours, minutes] = time.split(":");
//   hours = parseInt(hours, 10);
//   minutes = parseInt(minutes, 10);

//   if (modifier === "PM" && hours !== 12) {
//     hours += 12;
//   }
//   if (modifier === "AM" && hours === 12) {
//     hours = 0;
//   }

//   return `${hours.toString().padStart(2, "0")}:${minutes
//     .toString()
//     .padStart(2, "0")}`;
// }


// Per person time slots
// import { format } from 'date-fns';

// export const generateSortedTimeSlots = (doctor, selectedDate, allAppointments = []) => {
//   if (!doctor || !doctor.availability || !selectedDate) return [];

//   const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
//   const availabilities = doctor.availability.filter(
//     (a) => a.day.toLowerCase() === dayName.toLowerCase() && !a.closed
//   );

//   const slots = [];

//   for (let avail of availabilities) {
//     const [startHour, startMin] = avail.startTime.split(":").map(Number);
//     const [endHour, endMin] = avail.endTime.split(":").map(Number);
//     const slotDuration = avail.slotDuration || 30;
//     const personLimit = parseInt(avail.persons || "1");

//     let currentTime = new Date(selectedDate);
//     currentTime.setHours(startHour, startMin, 0, 0);

//     const endTime = new Date(selectedDate);
//     endTime.setHours(endHour, endMin, 0, 0);

//     while (currentTime < endTime) {
//       const label = currentTime.toLocaleTimeString("en-US", {
//         hour: 'numeric',
//         minute: '2-digit',
//         hour12: true
//       });

//       const timeValue = format(currentTime, "HH:mm");

//       // Count existing appointments for this time
//       const bookedAppointments = allAppointments.filter(
//         appt =>
//           appt.doctor.id === doctor.id &&
//           appt.date === format(selectedDate, 'yyyy-MM-dd') &&
//           appt.time === label &&
//           ['approved', 'pending'].includes(appt.status)
//       ).length;

//       const isFullyBooked = bookedAppointments >= personLimit;

//       slots.push({
//         value: label,
//         label: label,
//         dateObj: new Date(currentTime),
//         disabled: isFullyBooked
//       });

//       currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
//     }
//   }

//   return slots;
// };

// With buffertime and per persons time slots
// import { format } from 'date-fns';

// export const generateSortedTimeSlots = (doctor, selectedDate, allAppointments = []) => {
//   if (!doctor || !doctor.availability || !selectedDate) return [];

//   const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
//   const availabilities = doctor.availability.filter(
//     (a) => a.day.toLowerCase() === dayName.toLowerCase() && !a.closed
//   );

//   const slots = [];

//   for (let avail of availabilities) {
//     const [startHour, startMin] = avail.startTime.split(":").map(Number);
//     const [endHour, endMin] = avail.endTime.split(":").map(Number);
//     const slotDuration = avail.slotDuration || 30;
//     const personLimit = parseInt(avail.persons || "1");

//     let currentTime = new Date(selectedDate);
//     currentTime.setHours(startHour, startMin, 0, 0);

//     const endTime = new Date(selectedDate);
//     endTime.setHours(endHour, endMin, 0, 0);

//     while (currentTime < endTime) {
//       const label = currentTime.toLocaleTimeString("en-US", {
//         hour: 'numeric',
//         minute: '2-digit',
//         hour12: true
//       });

//       const timeValue = format(currentTime, "HH:mm");

//       // Count existing appointments for this time
//       const bookedAppointments = allAppointments.filter(
//         appt =>
//           appt.doctor.id === doctor.id &&
//           appt.date === format(selectedDate, 'yyyy-MM-dd') &&
//           appt.time === label &&
//           ['approved', 'pending'].includes(appt.status)
//       ).length;

//       const isFullyBooked = bookedAppointments >= personLimit;

//       slots.push({
//         value: label,
//         label: label,
//         dateObj: new Date(currentTime),
//         disabled: isFullyBooked
//       });

//       currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
//     }
//   }

//   return slots;
// };

import { format } from 'date-fns';

export const generateSortedTimeSlots = (doctor, selectedDate, allAppointments = [], appointmentMode = 'clinic') => {
  if (!doctor || !selectedDate) return [];

  // Check if this is "No Doctor" - handle specially
  const isNoDoctor = doctor.firstName === "No Doctor" || doctor.label === "No Doctor" || doctor.id === 111;

  if (isNoDoctor) {
    return generateAllDayTimeSlots(selectedDate);
  }

  // For regular doctors, use existing logic
  if (!doctor.availability) return [];

  const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
  // const availabilities = doctor.availability.filter(
  //   (a) => a.day.toLowerCase() === dayName.toLowerCase() && !a.closed
  // );

  const availabilities = doctor.availability.filter((a) => {
  if (a.closed) return false;
  if (a.day.toLowerCase() !== dayName.toLowerCase()) return false;

  if (appointmentMode === 'video') {
    return a.is_video_time === true;
  }

  if (appointmentMode === 'clinic') {
    return a.is_clinic_time === true;
  }

  return false;
});

  const slots = [];

  for (let avail of availabilities) {
    const [startHour, startMin] = avail.startTime.split(":").map(Number);
    const [endHour, endMin] = avail.endTime.split(":").map(Number);
    const slotDuration = avail.slotDuration || 30;
    const personLimit = parseInt(avail.persons || "1");

    let currentTime = new Date(selectedDate);
    currentTime.setHours(startHour, startMin, 0, 0);

    const endTime = new Date(selectedDate);
    endTime.setHours(endHour, endMin, 0, 0);

    while (currentTime < endTime) {
      const label = currentTime.toLocaleTimeString("en-US", {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const timeValue = format(currentTime, "HH:mm");

      // Count existing appointments for this time
      const bookedAppointments = allAppointments.filter(
        appt =>
          appt.doctor.id === doctor.id &&
          appt.date === format(selectedDate, 'yyyy-MM-dd') &&
          appt.time === label &&
          ['approved', 'pending'].includes(appt.status)
      ).length;

      const isFullyBooked = bookedAppointments >= personLimit;

      slots.push({
        value: label,
        label: label,
        dateObj: new Date(currentTime),
        disabled: isFullyBooked
      });

      currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
    }
  }

  return slots;
};

// Function to generate all-day time slots for "No Doctor"
const generateAllDayTimeSlots = (selectedDate) => {
  const slots = [];
  const dateObj = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);

  const now = new Date();
  const isToday = dateObj.toDateString() === now.toDateString();

  // Generate slots from 8:00 AM to 8:00 PM (12 hours) with 30-minute intervals
  let currentTime = new Date(dateObj);
  currentTime.setHours(8, 0, 0, 0); // Start at 8:00 AM

  const endTime = new Date(dateObj);
  endTime.setHours(20, 0, 0, 0); // End at 8:00 PM

  while (currentTime < endTime) {
    const timeString = currentTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const timeValue = format(currentTime, "HH:mm");

    // Check if it's a past time slot for today
    const isPast = isToday && currentTime < now;

    if (!isPast) {
      slots.push({
        value: timeString,
        label: timeString,
        dateObj: new Date(currentTime),
        disabled: false // All slots are available for "No Doctor"
      });
    }

    // Move to next slot (30-minute intervals)
    currentTime = new Date(currentTime.getTime() + 30 * 60000);
  }

  return slots;
};