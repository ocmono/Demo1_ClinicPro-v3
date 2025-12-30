const status = [
    { value: 'active', label: 'Active', color: '#17c666' },
    { value: 'inactive', label: 'Inactive', color: '#ffa21d' },
    { value: 'declined', label: 'Declined', color: '#ea4d4d' },
];

// Indian dummy data for leads
export const leadTableData = [
    {
        "id": 1,
        "customer": {
            "name": "Rajesh Kumar",
            "img": "/images/avatar/1.png"
        },
        "email": "rajesh.kumar@gmail.com",
        "source": {
            "media": "facebook",
            "icon": "feather-facebook"
        },
        "phone": "+91 98765 43210",
        "date": "2024-01-15, 10:30AM",
        "status": { status, defaultSelect: 'active' }
    },
    {
        "id": 2,
        "customer": {
            "name": "Priya Sharma",
            "img": ""
        },
        "email": "priya.sharma@yahoo.in",
        "source": {
            "media": "Website",
            "icon": "feather-globe"
        },
        "phone": "+91 98765 43211",
        "date": "2024-01-16, 02:45PM",
        "status": { status, defaultSelect: 'active' }
    },
    {
        "id": 3,
        "customer": {
            "name": "Amit Patel",
            "img": "/images/avatar/2.png"
        },
        "email": "amit.patel@outlook.com",
        "source": {
            "media": "Google Ads",
            "icon": "feather-search"
        },
        "phone": "+91 98765 43212",
        "date": "2024-01-17, 09:15AM",
        "status": { status, defaultSelect: 'active' }
    },
    {
        "id": 4,
        "customer": {
            "name": "Sneha Reddy",
            "img": "/images/avatar/3.png"
        },
        "email": "sneha.reddy@gmail.com",
        "source": {
            "media": "Referral",
            "icon": "feather-users"
        },
        "phone": "+91 98765 43213",
        "date": "2024-01-18, 11:20AM",
        "status": { status, defaultSelect: 'inactive' }
    },
    {
        "id": 5,
        "customer": {
            "name": "Vikram Singh",
            "img": "/images/avatar/7.png"
        },
        "email": "vikram.singh@yahoo.in",
        "source": {
            "media": "Instagram",
            "icon": "feather-instagram"
        },
        "phone": "+91 98765 43214",
        "date": "2024-01-19, 03:30PM",
        "status": { status, defaultSelect: 'active' }
    },
    {
        "id": 6,
        "customer": {
            "name": "Anjali Desai",
            "img": "/images/avatar/4.png"
        },
        "email": "anjali.desai@gmail.com",
        "source": {
            "media": "Meta Ads",
            "icon": "feather-facebook"
        },
        "phone": "+91 98765 43215",
        "date": "2024-01-20, 01:15PM",
        "status": { status, defaultSelect: 'active' }
    },
    {
        "id": 7,
        "customer": {
            "name": "Rahul Mehta",
            "img": "/images/avatar/5.png"
        },
        "email": "rahul.mehta@outlook.com",
        "source": {
            "media": "Website",
            "icon": "feather-globe"
        },
        "phone": "+91 98765 43216",
        "date": "2024-01-21, 10:45AM",
        "status": { status, defaultSelect: 'active' }
    },
    {
        "id": 8,
        "customer": {
            "name": "Kavita Nair",
            "img": "/images/avatar/6.png"
        },
        "email": "kavita.nair@gmail.com",
        "source": {
            "media": "LinkedIn",
            "icon": "feather-linkedin"
        },
        "phone": "+91 98765 43217",
        "date": "2024-01-22, 04:20PM",
        "status": { status, defaultSelect: 'declined' }
    },
    {
        "id": 9,
        "customer": {
            "name": "Suresh Iyer",
            "img": ""
        },
        "email": "suresh.iyer@yahoo.in",
        "source": {
            "media": "Google Ads",
            "icon": "feather-search"
        },
        "phone": "+91 98765 43218",
        "date": "2024-01-23, 09:30AM",
        "status": { status, defaultSelect: 'active' }
    },
    {
        "id": 10,
        "customer": {
            "name": "Meera Joshi",
            "img": "/images/avatar/4.png"
        },
        "email": "meera.joshi@gmail.com",
        "source": {
            "media": "Referral",
            "icon": "feather-users"
        },
        "phone": "+91 98765 43219",
        "date": "2024-01-24, 02:10PM",
        "status": { status, defaultSelect: 'active' }
    },
    {
        "id": 11,
        "customer": {
            "name": "Arjun Malhotra",
            "img": ""
        },
        "email": "arjun.malhotra@outlook.com",
        "source": {
            "media": "Instagram",
            "icon": "feather-instagram"
        },
        "phone": "+91 98765 43220",
        "date": "2024-01-25, 11:45AM",
        "status": { status, defaultSelect: 'declined' }
    },
    {
        "id": 12,
        "customer": {
            "name": "Divya Menon",
            "img": "/images/avatar/9.png"
        },
        "email": "divya.menon@yahoo.in",
        "source": {
            "media": "Facebook",
            "icon": "feather-facebook"
        },
        "phone": "+91 98765 43221",
        "date": "2024-01-26, 03:25PM",
        "status": { status, defaultSelect: 'inactive' }
    },
    {
        "id": 13,
        "customer": {
            "name": "Nikhil Agarwal",
            "img": "/images/avatar/1.png"
        },
        "email": "nikhil.agarwal@gmail.com",
        "source": {
            "media": "Website",
            "icon": "feather-globe"
        },
        "phone": "+91 98765 43222",
        "date": "2024-01-27, 10:15AM",
        "status": { status, defaultSelect: 'active' }
    },
    {
        "id": 14,
        "customer": {
            "name": "Pooja Kapoor",
            "img": "/images/avatar/2.png"
        },
        "email": "pooja.kapoor@outlook.com",
        "source": {
            "media": "Google Ads",
            "icon": "feather-search"
        },
        "phone": "+91 98765 43223",
        "date": "2024-01-28, 01:40PM",
        "status": { status, defaultSelect: 'active' }
    },
    {
        "id": 15,
        "customer": {
            "name": "Karan Verma",
            "img": "/images/avatar/3.png"
        },
        "email": "karan.verma@yahoo.in",
        "source": {
            "media": "Meta Ads",
            "icon": "feather-facebook"
        },
        "phone": "+91 98765 43224",
        "date": "2024-01-29, 09:55AM",
        "status": { status, defaultSelect: 'active' }
    },
    {
        "id": 16,
        "customer": {
            "name": "Shreya Bhatt",
            "img": "/images/avatar/7.png"
        },
        "email": "shreya.bhatt@gmail.com",
        "source": {
            "media": "Referral",
            "icon": "feather-users"
        },
        "phone": "+91 98765 43225",
        "date": "2024-01-30, 04:10PM",
        "status": { status, defaultSelect: 'inactive' }
    },
    {
        "id": 17,
        "customer": {
            "name": "Aditya Rao",
            "img": "/images/avatar/4.png"
        },
        "email": "aditya.rao@outlook.com",
        "source": {
            "media": "LinkedIn",
            "icon": "feather-linkedin"
        },
        "phone": "+91 98765 43226",
        "date": "2024-01-31, 11:20AM",
        "status": { status, defaultSelect: 'active' }
    },
    {
        "id": 18,
        "customer": {
            "name": "Neha Gupta",
            "img": "/images/avatar/5.png"
        },
        "email": "neha.gupta@yahoo.in",
        "source": {
            "media": "Instagram",
            "icon": "feather-instagram"
        },
        "phone": "+91 98765 43227",
        "date": "2024-02-01, 02:35PM",
        "status": { status, defaultSelect: 'active' }
    },
    {
        "id": 19,
        "customer": {
            "name": "Rohan Chawla",
            "img": "/images/avatar/6.png"
        },
        "email": "rohan.chawla@gmail.com",
        "source": {
            "media": "Website",
            "icon": "feather-globe"
        },
        "phone": "+91 98765 43228",
        "date": "2024-02-02, 10:50AM",
        "status": { status, defaultSelect: 'declined' }
    },
    {
        "id": 20,
        "customer": {
            "name": "Isha Khanna",
            "img": "/images/avatar/9.png"
        },
        "email": "isha.khanna@outlook.com",
        "source": {
            "media": "Google Ads",
            "icon": "feather-search"
        },
        "phone": "+91 98765 43229",
        "date": "2024-02-03, 03:15PM",
        "status": { status, defaultSelect: 'active' }
    },
]
