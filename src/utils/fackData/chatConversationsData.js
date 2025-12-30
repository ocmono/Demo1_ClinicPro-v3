// Dummy data for chat conversations
// This matches the expected API response structure

// Get current timestamp and create relative timestamps
const now = new Date();
const getTimeAgo = (minutesAgo) => {
  const date = new Date(now.getTime() - minutesAgo * 60000);
  return date.toISOString();
};

export const dummyConversations = [
  {
    id: 1,
    participants: [
      {
        id: 1, // Current user (will be filtered out in UI)
        name: "Current User",
        username: "currentuser",
        avatar: "/images/avatar/1.png",
        profile_image: "/images/avatar/1.png"
      },
      {
        id: 2,
        name: "Dr. Sarah Johnson",
        username: "sarah.johnson",
        avatar: "/images/avatar/2.png",
        profile_image: "/images/avatar/2.png"
      }
    ],
    last_message: {
      id: 101,
      content: "Thank you for the prescription update!",
      sender_id: 2,
      created_at: getTimeAgo(5)
    },
    unread_count: 2,
    updated_at: getTimeAgo(5),
    created_at: getTimeAgo(120)
  },
  {
    id: 2,
    participants: [
      {
        id: 1,
        name: "Current User",
        username: "currentuser",
        avatar: "/images/avatar/1.png",
        profile_image: "/images/avatar/1.png"
      },
      {
        id: 3,
        name: "Dr. Michael Chen",
        username: "michael.chen",
        avatar: "/images/avatar/3.png",
        profile_image: "/images/avatar/3.png"
      }
    ],
    last_message: {
      id: 102,
      content: "The patient's test results are ready for review.",
      sender_id: 3,
      created_at: getTimeAgo(15)
    },
    unread_count: 0,
    updated_at: getTimeAgo(15),
    created_at: getTimeAgo(240)
  },
  {
    id: 3,
    participants: [
      {
        id: 1,
        name: "Current User",
        username: "currentuser",
        avatar: "/images/avatar/1.png",
        profile_image: "/images/avatar/1.png"
      },
      {
        id: 4,
        name: "Nurse Emily Davis",
        username: "emily.davis",
        avatar: "/images/avatar/4.png",
        profile_image: "/images/avatar/4.png"
      }
    ],
    last_message: {
      id: 103,
      content: "Appointment confirmed for tomorrow at 2 PM.",
      sender_id: 1,
      created_at: getTimeAgo(30)
    },
    unread_count: 0,
    updated_at: getTimeAgo(30),
    created_at: getTimeAgo(360)
  },
  {
    id: 4,
    participants: [
      {
        id: 1,
        name: "Current User",
        username: "currentuser",
        avatar: "/images/avatar/1.png",
        profile_image: "/images/avatar/1.png"
      },
      {
        id: 5,
        name: "Dr. James Wilson",
        username: "james.wilson",
        avatar: "/images/avatar/5.png",
        profile_image: "/images/avatar/5.png"
      }
    ],
    last_message: {
      id: 104,
      content: "Can we reschedule the meeting?",
      sender_id: 5,
      created_at: getTimeAgo(45)
    },
    unread_count: 1,
    updated_at: getTimeAgo(45),
    created_at: getTimeAgo(480)
  },
  {
    id: 5,
    participants: [
      {
        id: 1,
        name: "Current User",
        username: "currentuser",
        avatar: "/images/avatar/1.png",
        profile_image: "/images/avatar/1.png"
      },
      {
        id: 6,
        name: "Receptionist Lisa Brown",
        username: "lisa.brown",
        avatar: "/images/avatar/6.png",
        profile_image: "/images/avatar/6.png"
      }
    ],
    last_message: {
      id: 105,
      content: "The patient file has been updated.",
      sender_id: 6,
      created_at: getTimeAgo(60)
    },
    unread_count: 0,
    updated_at: getTimeAgo(60),
    created_at: getTimeAgo(600)
  },
  {
    id: 6,
    participants: [
      {
        id: 1,
        name: "Current User",
        username: "currentuser",
        avatar: "/images/avatar/1.png",
        profile_image: "/images/avatar/1.png"
      },
      {
        id: 7,
        name: "Dr. Maria Garcia",
        username: "maria.garcia",
        avatar: "/images/avatar/7.png",
        profile_image: "/images/avatar/7.png"
      }
    ],
    last_message: {
      id: 106,
      content: "Please review the lab reports when you have a moment.",
      sender_id: 7,
      created_at: getTimeAgo(90)
    },
    unread_count: 3,
    updated_at: getTimeAgo(90),
    created_at: getTimeAgo(720)
  },
  {
    id: 7,
    participants: [
      {
        id: 1,
        name: "Current User",
        username: "currentuser",
        avatar: "/images/avatar/1.png",
        profile_image: "/images/avatar/1.png"
      },
      {
        id: 8,
        name: "Pharmacist Robert Taylor",
        username: "robert.taylor",
        avatar: "/images/avatar/8.png",
        profile_image: "/images/avatar/8.png"
      }
    ],
    last_message: {
      id: 107,
      content: "Medication ready for pickup.",
      sender_id: 8,
      created_at: getTimeAgo(120)
    },
    unread_count: 0,
    updated_at: getTimeAgo(120),
    created_at: getTimeAgo(840)
  },
  {
    id: 8,
    participants: [
      {
        id: 1,
        name: "Current User",
        username: "currentuser",
        avatar: "/images/avatar/1.png",
        profile_image: "/images/avatar/1.png"
      },
      {
        id: 9,
        name: "Dr. Amanda White",
        username: "amanda.white",
        avatar: "/images/avatar/9.png",
        profile_image: "/images/avatar/9.png"
      }
    ],
    last_message: {
      id: 108,
      content: "Great! See you then.",
      sender_id: 1,
      created_at: getTimeAgo(180)
    },
    unread_count: 0,
    updated_at: getTimeAgo(180),
    created_at: getTimeAgo(960)
  }
];

// Dummy messages for each conversation
export const dummyMessages = {
  1: [
    {
      id: 1,
      content: "Hello! I wanted to discuss the patient's treatment plan.",
      sender_id: 1,
      conversation_id: 1,
      attachments: [],
      created_at: getTimeAgo(130),
      updated_at: getTimeAgo(130)
    },
    {
      id: 2,
      content: "Sure! I'm available now. What would you like to discuss?",
      sender_id: 2,
      conversation_id: 1,
      attachments: [],
      created_at: getTimeAgo(125),
      updated_at: getTimeAgo(125)
    },
    {
      id: 3,
      content: "The patient is responding well to the medication. Should we continue with the current dosage?",
      sender_id: 1,
      conversation_id: 1,
      attachments: [],
      created_at: getTimeAgo(120),
      updated_at: getTimeAgo(120)
    },
    {
      id: 4,
      content: "Yes, let's continue for another week and then reassess.",
      sender_id: 2,
      conversation_id: 1,
      attachments: [],
      created_at: getTimeAgo(115),
      updated_at: getTimeAgo(115)
    },
    {
      id: 5,
      content: "Perfect! I'll update the prescription.",
      sender_id: 1,
      conversation_id: 1,
      attachments: [],
      created_at: getTimeAgo(110),
      updated_at: getTimeAgo(110)
    },
    {
      id: 101,
      content: "Thank you for the prescription update!",
      sender_id: 2,
      conversation_id: 1,
      attachments: [],
      created_at: getTimeAgo(5),
      updated_at: getTimeAgo(5)
    }
  ],
  2: [
    {
      id: 6,
      content: "Hi Dr. Chen, I have a question about the lab results.",
      sender_id: 1,
      conversation_id: 2,
      attachments: [],
      created_at: getTimeAgo(250),
      updated_at: getTimeAgo(250)
    },
    {
      id: 7,
      content: "Of course! What would you like to know?",
      sender_id: 3,
      conversation_id: 2,
      attachments: [],
      created_at: getTimeAgo(245),
      updated_at: getTimeAgo(245)
    },
    {
      id: 8,
      content: "The patient's test results are ready for review.",
      sender_id: 3,
      conversation_id: 2,
      attachments: [],
      created_at: getTimeAgo(15),
      updated_at: getTimeAgo(15)
    }
  ],
  3: [
    {
      id: 9,
      content: "Hi Emily, can you help me schedule an appointment?",
      sender_id: 1,
      conversation_id: 3,
      attachments: [],
      created_at: getTimeAgo(400),
      updated_at: getTimeAgo(400)
    },
    {
      id: 10,
      content: "Sure! What time works best for you?",
      sender_id: 4,
      conversation_id: 3,
      attachments: [],
      created_at: getTimeAgo(395),
      updated_at: getTimeAgo(395)
    },
    {
      id: 11,
      content: "Tomorrow afternoon would be perfect.",
      sender_id: 1,
      conversation_id: 3,
      attachments: [],
      created_at: getTimeAgo(390),
      updated_at: getTimeAgo(390)
    },
    {
      id: 103,
      content: "Appointment confirmed for tomorrow at 2 PM.",
      sender_id: 1,
      conversation_id: 3,
      attachments: [],
      created_at: getTimeAgo(30),
      updated_at: getTimeAgo(30)
    }
  ],
  4: [
    {
      id: 12,
      content: "Dr. Wilson, are you available for a quick consultation?",
      sender_id: 1,
      conversation_id: 4,
      attachments: [],
      created_at: getTimeAgo(500),
      updated_at: getTimeAgo(500)
    },
    {
      id: 13,
      content: "I'm in a meeting right now. Can we talk later?",
      sender_id: 5,
      conversation_id: 4,
      attachments: [],
      created_at: getTimeAgo(495),
      updated_at: getTimeAgo(495)
    },
    {
      id: 14,
      content: "Can we reschedule the meeting?",
      sender_id: 5,
      conversation_id: 4,
      attachments: [],
      created_at: getTimeAgo(45),
      updated_at: getTimeAgo(45)
    }
  ],
  5: [
    {
      id: 15,
      content: "Hello Lisa, I need to update a patient's information.",
      sender_id: 1,
      conversation_id: 5,
      attachments: [],
      created_at: getTimeAgo(650),
      updated_at: getTimeAgo(650)
    },
    {
      id: 16,
      content: "Sure! Which patient?",
      sender_id: 6,
      conversation_id: 5,
      attachments: [],
      created_at: getTimeAgo(645),
      updated_at: getTimeAgo(645)
    },
    {
      id: 105,
      content: "The patient file has been updated.",
      sender_id: 6,
      conversation_id: 5,
      attachments: [],
      created_at: getTimeAgo(60),
      updated_at: getTimeAgo(60)
    }
  ],
  6: [
    {
      id: 17,
      content: "Dr. Garcia, I've completed the initial assessment.",
      sender_id: 1,
      conversation_id: 6,
      attachments: [],
      created_at: getTimeAgo(780),
      updated_at: getTimeAgo(780)
    },
    {
      id: 18,
      content: "Thank you! I'll review it shortly.",
      sender_id: 7,
      conversation_id: 6,
      attachments: [],
      created_at: getTimeAgo(775),
      updated_at: getTimeAgo(775)
    },
    {
      id: 19,
      content: "Please review the lab reports when you have a moment.",
      sender_id: 7,
      conversation_id: 6,
      attachments: [],
      created_at: getTimeAgo(90),
      updated_at: getTimeAgo(90)
    },
    {
      id: 20,
      content: "I've sent the latest test results.",
      sender_id: 7,
      conversation_id: 6,
      attachments: [],
      created_at: getTimeAgo(85),
      updated_at: getTimeAgo(85)
    },
    {
      id: 21,
      content: "The patient's condition seems stable.",
      sender_id: 7,
      conversation_id: 6,
      attachments: [],
      created_at: getTimeAgo(80),
      updated_at: getTimeAgo(80)
    }
  ],
  7: [
    {
      id: 22,
      content: "Hello Robert, has the medication order been processed?",
      sender_id: 1,
      conversation_id: 7,
      attachments: [],
      created_at: getTimeAgo(890),
      updated_at: getTimeAgo(890)
    },
    {
      id: 23,
      content: "Yes, it's ready! The patient can pick it up anytime.",
      sender_id: 8,
      conversation_id: 7,
      attachments: [],
      created_at: getTimeAgo(885),
      updated_at: getTimeAgo(885)
    },
    {
      id: 107,
      content: "Medication ready for pickup.",
      sender_id: 8,
      conversation_id: 7,
      attachments: [],
      created_at: getTimeAgo(120),
      updated_at: getTimeAgo(120)
    }
  ],
  8: [
    {
      id: 24,
      content: "Hi Dr. White, thank you for today's consultation.",
      sender_id: 1,
      conversation_id: 8,
      attachments: [],
      created_at: getTimeAgo(1000),
      updated_at: getTimeAgo(1000)
    },
    {
      id: 25,
      content: "You're welcome! Feel free to reach out if you have any questions.",
      sender_id: 9,
      conversation_id: 8,
      attachments: [],
      created_at: getTimeAgo(995),
      updated_at: getTimeAgo(995)
    },
    {
      id: 108,
      content: "Great! See you then.",
      sender_id: 1,
      conversation_id: 8,
      attachments: [],
      created_at: getTimeAgo(180),
      updated_at: getTimeAgo(180)
    }
  ]
};

// Helper function to get messages for a conversation
export const getDummyMessages = (conversationId) => {
  return dummyMessages[conversationId] || [];
};

// Helper function to get all conversations
export const getDummyConversations = () => {
  return dummyConversations;
};


