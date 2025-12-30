// Indian Dummy Data for Leads
// Contains Indian names, cities, addresses, phone numbers, etc.

export const indianCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
    'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
    'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna',
    'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad'
];

export const indianStates = [
    'Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal',
    'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Andhra Pradesh',
    'Bihar', 'Punjab', 'Haryana', 'Kerala', 'Odisha', 'Assam', 'Jharkhand'
];

export const indianNames = {
    male: [
        'Rajesh Kumar', 'Amit Patel', 'Vikram Singh', 'Rahul Mehta', 'Suresh Iyer',
        'Arjun Malhotra', 'Nikhil Agarwal', 'Aditya Rao', 'Rohan Chawla', 'Karan Verma',
        'Ankit Sharma', 'Mohit Gupta', 'Prateek Joshi', 'Siddharth Nair', 'Varun Reddy',
        'Abhishek Desai', 'Ravi Kumar', 'Manish Tiwari', 'Gaurav Shah', 'Harsh Varma',
        'Yash Kapoor', 'Kunal Malhotra', 'Rishabh Agarwal', 'Sahil Mehta', 'Akash Patel'
    ],
    female: [
        'Priya Sharma', 'Sneha Reddy', 'Anjali Desai', 'Kavita Nair', 'Meera Joshi',
        'Divya Menon', 'Pooja Kapoor', 'Shreya Bhatt', 'Neha Gupta', 'Isha Khanna',
        'Riya Singh', 'Aishwarya Patel', 'Sanjana Kumar', 'Ananya Rao', 'Kritika Verma',
        'Aditi Sharma', 'Sakshi Gupta', 'Tanvi Mehta', 'Nidhi Agarwal', 'Swati Joshi',
        'Ritika Kapoor', 'Pallavi Nair', 'Shruti Desai', 'Kavya Reddy', 'Anushka Sharma'
    ]
};

export const indianAddresses = [
    '123, MG Road, Andheri West', '456, Connaught Place, New Delhi', 
    '789, Brigade Road, Bangalore', '321, Banjara Hills, Hyderabad',
    '654, T Nagar, Chennai', '987, Park Street, Kolkata',
    '147, Koregaon Park, Pune', '258, Satellite, Ahmedabad',
    '369, C Scheme, Jaipur', '741, Varachha, Surat',
    '852, Hazratganj, Lucknow', '963, Civil Lines, Kanpur',
    '159, Sitabuldi, Nagpur', '357, Vijay Nagar, Indore',
    '753, Kolshet Road, Thane', '951, Arera Colony, Bhopal'
];

export const indianPhoneNumbers = [
    '+91 98765 43210', '+91 98765 43211', '+91 98765 43212', '+91 98765 43213',
    '+91 98765 43214', '+91 98765 43215', '+91 98765 43216', '+91 98765 43217',
    '+91 98765 43218', '+91 98765 43219', '+91 98765 43220', '+91 98765 43221',
    '+91 98765 43222', '+91 98765 43223', '+91 98765 43224', '+91 98765 43225',
    '+91 98765 43226', '+91 98765 43227', '+91 98765 43228', '+91 98765 43229',
    '+91 98765 43230', '+91 98765 43231', '+91 98765 43232', '+91 98765 43233',
    '+91 98765 43234', '+91 98765 43235', '+91 98765 43236', '+91 98765 43237',
    '+91 98765 43238', '+91 98765 43239', '+91 98765 43240', '+91 98765 43241'
];

export const indianEmailDomains = [
    'gmail.com', 'yahoo.in', 'outlook.com', 'hotmail.com', 'rediffmail.com',
    'icloud.com', 'protonmail.com', 'zoho.com', 'mail.com', 'live.com'
];

export const indianLeadSources = [
    'Website', 'Google Ads', 'Facebook', 'Instagram', 'LinkedIn', 
    'Referral', 'Meta Ads', 'WhatsApp', 'SMS Campaign', 'Email Campaign'
];

export const indianLeadStatuses = [
    'New', 'Contacted', 'Qualified', 'Follow-up', 'Converted', 'Lost', 'Nurturing'
];

// Generate random Indian lead data
export const generateIndianLead = (id, overrides = {}) => {
    const isMale = Math.random() > 0.5;
    const names = isMale ? indianNames.male : indianNames.female;
    const name = names[Math.floor(Math.random() * names.length)];
    const firstName = name.split(' ')[0].toLowerCase();
    const lastName = name.split(' ')[1]?.toLowerCase() || 'kumar';
    const emailDomain = indianEmailDomains[Math.floor(Math.random() * indianEmailDomains.length)];
    const city = indianCities[Math.floor(Math.random() * indianCities.length)];
    const state = indianStates[Math.floor(Math.random() * indianStates.length)];
    const address = indianAddresses[Math.floor(Math.random() * indianAddresses.length)];
    const phone = indianPhoneNumbers[Math.floor(Math.random() * indianPhoneNumbers.length)];
    const source = indianLeadSources[Math.floor(Math.random() * indianLeadSources.length)];
    const status = indianLeadStatuses[Math.floor(Math.random() * indianLeadStatuses.length)];
    
    const leadDate = new Date();
    leadDate.setDate(leadDate.getDate() - Math.floor(Math.random() * 30));
    
    return {
        id: id || Date.now(),
        fullName: name,
        mobile: phone.replace(/\s/g, '').replace('+91', ''),
        email: `${firstName}.${lastName}@${emailDomain}`,
        leadDate: leadDate.toISOString().split('T')[0],
        leadSource: source,
        leadStatus: status,
        address: address,
        city: city,
        state: state,
        country: 'India',
        campaignId: Math.floor(Math.random() * 5) + 1,
        comments: `Interested in services. Located in ${city}, ${state}.`,
        age: Math.floor(Math.random() * 50) + 20,
        gender: isMale ? 'Male' : 'Female',
        ...overrides
    };
};

// Generate multiple Indian leads
export const generateIndianLeads = (count = 20) => {
    return Array.from({ length: count }, (_, index) => 
        generateIndianLead(index + 1)
    );
};

// Sample Indian leads data
export const sampleIndianLeads = generateIndianLeads(25);


