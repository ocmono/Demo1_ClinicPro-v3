const useMessages = () => {
  const whatsappTemplate = {
    message: `Dear *{name}*,\n\nYour appointment with *Dr. {doctor}* has been *confirmed* for *{date}* at *{time}*.\nPlease arrive 10 minutes early. Feel free to contact us if you have any questions.\nThank you!`,
    fields: ['name', 'doctor', 'date', 'time']
  };

  const followupTemplate = {
    message: `Dear *{name}*,\n\nI hope you're feeling better after your visit with Dr. {doctor}.\nWould you like to schedule a follow-up appointment?\n\nBest regards,\nClinic Team`,
    fields: ['name', 'doctor']
  };

  const rejectedWhatsappTemplate = {
    message: `Dear *{name}*,\n\nWe regret to inform you that your appointment with *Dr. {doctor}* scheduled for *{date}* at *{time}* has been *cancelled*.\n\nWe apologize for any inconvenience caused. Please contact us to reschedule your appointment.\n\nThank you for your understanding.\n\nBest regards,\nClinic Team`,
    fields: ['name', 'doctor', 'date', 'time']
  };

  return {
    whatsappTemplate,
    followupTemplate,
    rejectedWhatsappTemplate
  };
};

export default useMessages;
