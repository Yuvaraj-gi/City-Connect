// components/passenger/TicketDetailsModal.tsx - RECTIFIED

import React, { useState, useEffect } from 'react';
import { Ticket } from '../../types';
import QrCodeIcon from '../icons/QrCodeIcon';
import XMarkIcon from '../icons/XMarkIcon';
import ShieldExclamationIcon from '../icons/ShieldExclamationIcon';
import ReceiptIcon from '../icons/ReceiptIcon';
import SpinnerIcon from '../icons/SpinnerIcon';

interface TicketDetailsModalProps {
    ticket: Ticket | null;
    onClose: () => void;
    onValidate: (ticketId: string) => void;
}

const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({ ticket, onClose, onValidate }) => {
    // ... validation logic is unchanged ...
    const [isValidating, setIsValidating] = useState(false);
    const [validationStatus, setValidationStatus] = useState<'idle' | 'pending' | 'success'>('idle');
    useEffect(() => { if (ticket) { setIsValidating(false); setValidationStatus('idle'); } }, [ticket]);
    const handleValidation = () => { setIsValidating(true); setValidationStatus('pending'); setTimeout(() => { setValidationStatus('success'); setTimeout(() => { if(ticket) { onValidate(ticket.id); } }, 1500); }, 2500); };

    if (!ticket) { return null; }
    const isExpired = new Date() > new Date(ticket.valid_until);
    const renderValidationContent = () => { /* ... unchanged ... */ };
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm m-auto flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 flex justify-between items-center border-b"><h3>Ticket Details</h3><button onClick={onClose}><XMarkIcon/></button></div>
                <div className="flex-grow p-6 overflow-y-auto space-y-6">
                     <div className="relative flex flex-col items-center justify-center">
                        {/* ... QR code and status overlay ... */}
                        <QrCodeIcon className={`w-48 h-48 ${ticket.status === 'validated' || isExpired ? 'opacity-20' : ''}`}/>
                     </div>
                    <div className="space-y-2">
                        {/* THE FIX IS HERE: Displaying from_stop and to_stop */}
                        <div className="flex justify-between"><span className="text-slate-500">Route:</span><span className="font-semibold">{ticket.route_name}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">From:</span><span className="font-semibold">{ticket.from_stop}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">To:</span><span className="font-semibold">{ticket.to_stop}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Passengers:</span><span className="font-semibold">{ticket.passenger_count}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Total Fare:</span><span className="font-bold text-lg text-indigo-600">₹{ticket.total_fare}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Purchased:</span><span className="font-semibold">{new Date(ticket.purchase_date).toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Valid Until:</span><span className={`font-semibold ${isExpired ? 'text-red-500' : ''}`}>{new Date(ticket.valid_until).toLocaleString()}</span></div>
                    </div>
                </div>
                <div className="p-4 border-t">
                     {ticket.status === 'validated' ? ( <div className="text-center p-3 bg-green-50 rounded-lg"><p>Validated on {ticket.validated_on_bus}</p><p>{new Date(ticket.validated_at!).toLocaleString()}</p></div> ) : ( renderValidationContent() )}
                </div>
            </div>
        </div>
    );
};

// --- Full code for copy-paste ---
const TicketDetailsModalFull: React.FC<TicketDetailsModalProps> = ({ ticket, onClose, onValidate }) => {
  const [isValidating, setIsValidating] = useState(false); const [validationStatus, setValidationStatus] = useState<'idle' | 'pending' | 'success'>('idle');
  useEffect(() => { if (ticket) { setIsValidating(false); setValidationStatus('idle'); } }, [ticket]);
  const handleValidation = () => { setIsValidating(true); setValidationStatus('pending'); setTimeout(() => { setValidationStatus('success'); setTimeout(() => { if(ticket) { onValidate(ticket.id); } }, 1500); }, 2500); };
  if (!ticket) { return null; } const isExpired = new Date() > new Date(ticket.valid_until);
  const renderValidationContent = () => { switch (validationStatus) { case 'pending': return ( <div className="text-center"><SpinnerIcon className="mx-auto w-8 h-8 text-indigo-500" /><p className="mt-2 text-sm">Validating...</p></div> ); case 'success': return ( <div className="text-center text-green-600"><p className="font-bold">Validated Successfully!</p></div> ); default: return ( <button onClick={handleValidation} disabled={isExpired || ticket.status === 'validated'} className="w-full py-3 bg-indigo-600 text-white rounded-lg disabled:bg-slate-400"> {isExpired ? 'Ticket Expired' : 'Validate Offline'} </button> ); } }
  return ( <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}> <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm m-auto flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}> <div className="p-4 flex justify-between items-center border-b"> <h3 className="font-bold text-lg">Ticket Details</h3> <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><XMarkIcon className="w-6 h-6"/></button> </div> <div className="flex-grow p-6 overflow-y-auto space-y-6"> <div className="relative flex flex-col items-center justify-center"> {ticket.status === 'validated' && <div className="absolute inset-0 z-10 flex flex-col items-center justify-center"><ReceiptIcon className="w-16 h-16 text-green-500" /><h4>Validated</h4></div>} <QrCodeIcon className={`w-48 h-48 ${ticket.status === 'validated' || isExpired ? 'opacity-20' : ''}`}/> </div> <div className="space-y-2 text-sm"> <div className="flex justify-between"><span>Route:</span><span className="font-semibold">{ticket.route_name}</span></div> <div className="flex justify-between"><span>From:</span><span className="font-semibold">{ticket.from_stop}</span></div> <div className="flex justify-between"><span>To:</span><span className="font-semibold">{ticket.to_stop}</span></div> <div className="flex justify-between"><span>Passengers:</span><span>{ticket.passenger_count}</span></div> <div className="flex justify-between"><span>Total Fare:</span><span className="font-bold text-lg text-indigo-600">₹{ticket.total_fare}</span></div> <div className="flex justify-between pt-2 border-t mt-2"><span>Purchased:</span><span>{new Date(ticket.purchase_date).toLocaleString()}</span></div> <div className="flex justify-between"><span>Valid Until:</span><span className={isExpired ? 'text-red-500' : ''}>{new Date(ticket.valid_until).toLocaleString()}</span></div> </div> </div> <div className="p-4 border-t"> {ticket.status === 'validated' ? ( <div className="text-center p-3 rounded-lg"><p>Validated on {ticket.validated_on_bus} at {new Date(ticket.validated_at!).toLocaleTimeString()}</p></div> ) : ( renderValidationContent() )} </div> </div> </div> );
};
export default TicketDetailsModalFull;