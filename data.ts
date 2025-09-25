import { Route, Vehicle, RevenueData, PassengerVolumeData, Kpi, Report, User } from './types';

export const users: User[] = [
  { id: 'user123', reputation: 'Trusted' },
  { id: 'user456', reputation: 'Regular' },
  { id: 'user789', reputation: 'Newbie' },
];

export const routes: Route[] = [
  { 
    id: 'R01', 
    name: 'Bus #21G', 
    from: 'T. Nagar', 
    to: 'Marina Beach', 
    stops: ['T. Nagar', 'Saidapet', 'Guindy', 'Adyar', 'Marina Beach'], 
    stopsCoords: [
        { lat: 13.042, lng: 80.236 },
        { lat: 13.021, lng: 80.228 },
        { lat: 13.007, lng: 80.216 },
        { lat: 13.004, lng: 80.255 },
        { lat: 13.053, lng: 80.282 }
    ],
    averageEta: 45, 
    fare: 15 
  },
  { 
    id: 'R02', 
    name: 'Bus #47D', 
    from: 'Guindy', 
    to: 'Anna Nagar', 
    stops: ['Guindy', 'Vadapalani', 'Koyambedu', 'Thirumangalam', 'Anna Nagar'], 
    stopsCoords: [
        { lat: 13.007, lng: 80.216 },
        { lat: 13.049, lng: 80.210 },
        { lat: 13.073, lng: 80.193 },
        { lat: 13.085, lng: 80.198 },
        { lat: 13.087, lng: 80.211 }
    ],
    averageEta: 60, 
    fare: 20 
  },
  { 
    id: 'R03', 
    name: 'Train MRTS', 
    from: 'Chennai Central', 
    to: 'Velachery', 
    stops: ['Chennai Central', 'Mylapore', 'Tiruvanmiyur', 'Taramani', 'Velachery'], 
    stopsCoords: [
        { lat: 13.0827, lng: 80.2707 },
        { lat: 13.033, lng: 80.270 },
        { lat: 12.990, lng: 80.259 },
        { lat: 12.979, lng: 80.244 },
        { lat: 12.971, lng: 80.220 }
    ],
    averageEta: 55, 
    fare: 10 
  },
  { 
    id: 'R04', 
    name: 'Bus #G18', 
    from: 'Airport (MAA)', 
    to: 'Koyambedu', 
    stops: ['Airport (MAA)', 'Guindy', 'Ashok Nagar', 'Vadapalani', 'Koyambedu'], 
    stopsCoords: [
        { lat: 12.994, lng: 80.170 },
        { lat: 13.007, lng: 80.216 },
        { lat: 13.037, lng: 80.212 },
        { lat: 13.049, lng: 80.210 },
        { lat: 13.073, lng: 80.193 }
    ],
    averageEta: 70, 
    fare: 35 
  },
];

export const vehicles: Vehicle[] = [
  { 
    id: 'TN 01 N 1234', 
    routeId: 'R01', 
    type: 'Bus', 
    status: 'On road', 
    location: 'Adyar, Chennai', 
    coords: '13.004° N, 80.255° E',
    lat: 13.004, 
    lng: 80.255,
    driver: { name: 'Kumar Raja', phone: '+91 98765 43210' },
    routeDetails: {
        destination: 'Marina Beach',
        distance: '5 km',
        time: '15m',
        nextStop: 'Light House'
    },
    timeline: [
        { time: '4:35 PM', location: 'Adyar Signal', event: 'Resumed the tour'},
        { time: '4:00 PM', location: 'Guindy Park', event: 'Pause'},
        { time: '3:44 PM', location: 'Saidapet', event: 'City confirmation'},
    ]
  },
  { 
    id: 'TN 07 C 5678', 
    routeId: 'R02', 
    type: 'Bus', 
    status: 'Failure', 
    location: 'Koyambedu, Chennai', 
    coords: '13.073° N, 80.193° E',
    lat: 13.073, 
    lng: 80.193,
    driver: { name: 'Suresh Kumar', phone: '+91 98765 43211' },
    routeDetails: {
        destination: 'Anna Nagar',
        distance: '8 km',
        time: '20m',
        nextStop: 'Thirumangalam'
    },
    timeline: [
        { time: '3:15 PM', location: 'Koyambedu Flyover', event: 'Engine failure reported'},
        { time: '3:00 PM', location: 'Vadapalani', event: 'City confirmation'},
    ]
  },
  { 
    id: 'TN MRTS 9012', 
    routeId: 'R03', 
    type: 'Train', 
    status: 'Pause', 
    location: 'Tiruvanmiyur Station', 
    coords: '12.990° N, 80.259° E',
    lat: 12.990, 
    lng: 80.259,
    driver: { name: 'Anil Das', phone: '+91 98765 43212' },
    routeDetails: {
        destination: 'Velachery',
        distance: '10 km',
        time: '15m',
        nextStop: 'Taramani'
    },
    timeline: [
        { time: '5:00 PM', location: 'Tiruvanmiyur Station', event: 'Signal issue'},
        { time: '4:30 PM', location: 'Mylapore Station', event: 'City confirmation'},
    ]
  },
  { 
    id: 'TN 01 N 3456', 
    routeId: 'R01', 
    type: 'Bus', 
    status: 'On road', 
    location: 'Guindy, Chennai', 
    coords: '13.007° N, 80.216° E',
    lat: 13.007, 
    lng: 80.216,
    driver: { name: 'Meena Priya', phone: '+91 98765 43213' },
     routeDetails: {
        destination: 'Marina Beach',
        distance: '12 km',
        time: '30m',
        nextStop: 'Adyar'
    },
    timeline: [
        { time: '4:35 PM', location: 'Guindy Race Course', event: 'Resumed the tour'},
    ]
  },
  { 
    id: 'TN 09 G 7890', 
    routeId: 'R04', 
    type: 'Bus', 
    status: 'Failure', 
    location: 'Ashok Nagar, Chennai', 
    coords: '13.037° N, 80.212° E',
    lat: 13.037, 
    lng: 80.212,
    driver: { name: 'Vikram Selvam', phone: '+91 98765 43214' },
     routeDetails: {
        destination: 'Koyambedu',
        distance: '10 km',
        time: '25m',
        nextStop: 'Vadapalani'
    },
    timeline: [
        { time: '4:35 PM', location: 'Ashok Pillar', event: 'Tyre puncture'},
    ]
  },
];

export const kpis: Kpi[] = [
    { title: 'Active Vehicles', value: '142', change: '+2', changeType: 'increase' },
    { title: 'Total Revenue (Today)', value: '₹45,231', change: '+5.2%', changeType: 'increase' },
    { title: 'On-Time Performance', value: '89%', change: '-1.5%', changeType: 'decrease' },
    { title: 'Tickets Sold', value: '3,120', change: '+150', changeType: 'increase' },
];

export const revenueData: RevenueData[] = [
  { month: 'Jan', revenue: 40000 },
  { month: 'Feb', revenue: 30000 },
  { month: 'Mar', revenue: 50000 },
  { month: 'Apr', revenue: 48000 },
  { month: 'May', revenue: 60000 },
  { month: 'Jun', revenue: 55000 },
];

export const passengerVolumeData: PassengerVolumeData[] = [
  { day: 'Mon', passengers: 2400 },
  { day: 'Tue', passengers: 2210 },
  { day: 'Wed', passengers: 2290 },
  { day: 'Thu', passengers: 2000 },
  { day: 'Fri', passengers: 2181 },
  { day: 'Sat', passengers: 2500 },
  { day: 'Sun', passengers: 1890 },
];

export const reports: Report[] = [
  {
    id: 'REP001',
    type: 'Traffic',
    location: 'Near Guindy Metro',
    time: '25m ago',
    description: 'Heavy congestion due to a stalled truck. Avoid this route if possible.',
    upvotes: 12,
    reporterId: 'user123',
    verified: true,
  },
  {
    id: 'REP002',
    type: 'Breakdown',
    location: 'Vadapalani Flyover',
    time: '40m ago',
    description: 'Bus #47D has broken down, blocking one lane.',
    upvotes: 8,
    reporterId: 'user456',
    verified: false,
  },
  {
    id: 'REP003',
    type: 'Overcrowded',
    location: 'T. Nagar Bus Terminus',
    time: '5m ago',
    description: 'Extremely crowded, difficult to board buses.',
    upvotes: 25,
    reporterId: 'user789',
    verified: false,
  },
];