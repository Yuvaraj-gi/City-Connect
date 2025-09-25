import React from 'react';

const SteeringWheelIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-8.25 0a8.25 8.25 0 1016.5 0 8.25 8.25 0 10-16.5 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-2.25 0a2.25 2.25 0 104.5 0 2.25 2.25 0 10-4.5 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75v3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.25v3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 12h3" />
    </svg>
);
export default SteeringWheelIcon;
