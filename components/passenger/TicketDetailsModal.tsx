import React, { useState, useEffect } from 'react';
import { Ticket } from '../../types';
import QrCodeIcon from '../icons/QrCodeIcon';
import XMarkIcon from '../icons/XMarkIcon';
import ShieldExclamationIcon from '../icons/ShieldExclamationIcon';
import ReceiptIcon from '../icons/ReceiptIcon';

interface TicketDetailsModalProps {
    ticket: Ticket | null;
    onClose: () => void;
    onValidate: (ticketId: string) => void;
}

const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({ ticket, onClose, onValidate }) => {
    const [isValidating, setIsValidating] = useState(false);
    const [validationStatus, setValidationStatus] = useState<'pending' | 'success' | 'failed' | 'idle'>('idle');

    useEffect(() => {
        if (ticket) {
            // Reset state when a new ticket is selected
            setIsValidating(false);
            setValidationStatus('idle');
        }
    }, [ticket]);

    const handleValidation = () => {
        setIsValidating(true);
        setValidationStatus('pending');
        setTimeout(() => {
            setValidationStatus('success');
            setTimeout(() => {
                if(ticket) {
                    onValidate(ticket.id);
                }
                // Automatically close the modal after validation is complete
                onClose();
            }, 1500); // Show success message for 1.5s
        }, 2500); // Simulate handshake
    };

    if (!ticket) {
        return null;
    }

    const isExpired = new Date() > new Date(ticket.validUntil);

    const renderValidationContent = () => {
        switch (validationStatus) {
            case 'pending':
                return (
                     <div className="text-center">
                        <div className="flex justify-center items-center space-x-2 text-slate-500 dark:text-slate-400">
                           <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                           <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                           <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
                        </div>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Establishing secure handshake... Printing receipt...</p>
                    </div>
                );
            case 'success':
                return (
                     <div className="text-center text-green-600 dark:text-green-400">
                        <p className="font-bold">Handshake successful! Ticket validated.</p>
                    </div>
                );
            default:
                return (
                     <button
                        onClick={handleValidation}
                        disabled={isExpired || ticket.status === 'validated'}
                        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:bg-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-600"
                    >
                        {isExpired ? 'Ticket Expired' : 'Validate Offline'}
                    </button>
                );
        }
    }


    return (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 transition-opacity"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm m-auto flex flex-col max-h-[90vh] content-animate-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 flex justify-between items-center border-b dark:border-slate-700">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Ticket Details</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700">
                        <XMarkIcon className="w-6 h-6"/>
                    </button>
                </div>
                
                <div className="flex-grow p-6 overflow-y-auto space-y-6">
                     <div className="relative flex flex-col items-center justify-center">
                        {ticket.status === 'validated' ? (
                            <div className="absolute inset-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg text-center">
                                <ReceiptIcon className="w-16 h-16 text-green-500" />
                                <h4 className="text-xl font-bold text-green-600 dark:text-green-400 mt-2">Ticket Validated</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">This ticket has been used.</p>
                            </div>
                        ) : isExpired && (
                             <div className="absolute inset-0 flex items-center justify-center z-10">
                                <div className="transform -rotate-12 border-4 border-red-500 rounded-lg px-4 py-2">
                                    <p className="text-4xl font-bold text-red-500 tracking-widest">EXPIRED</p>
                                </div>
                            </div>
                        )}
                        <QrCodeIcon className={`w-48 h-48 transition-opacity ${ticket.status === 'validated' ? 'text-slate-300 dark:text-slate-600' : 'text-slate-800 dark:text-slate-200'} ${isExpired ? 'opacity-20' : ''}`}/>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            {ticket.status === 'active' ? 'Show this QR code for scanning' : `Validated on ${ticket.validatedOnBus}`}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Route:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{ticket.routeName}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Passengers:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{ticket.passengerCount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Total Fare:</span>
                            <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">₹{ticket.totalFare}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Purchased On:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{ticket.purchaseDate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Valid Until:</span>
                            <span className={`font-semibold ${isExpired ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}`}>
                                {new Date(ticket.validUntil).toLocaleString()}
                            </span>
                        </div>
                    </div>
                     <div className="p-4 bg-slate-50 rounded-lg border dark:bg-slate-700/50 dark:border-slate-700 space-y-3 text-sm">
                        <div className="flex items-center text-slate-600 dark:text-slate-300 font-semibold">
                           <ShieldExclamationIcon className="w-5 h-5 mr-2 text-yellow-500"/>
                           Security Details
                        </div>
                        <div>
                            <p className="font-medium text-slate-500 dark:text-slate-400">Transaction ID:</p>
                            <p className="font-mono text-xs break-all text-slate-700 dark:text-slate-300">{ticket.transactionId}</p>
                        </div>
                         <div>
                            <p className="font-medium text-slate-500 dark:text-slate-400">Digital Signature (ECDSA):</p>
                            <p className="font-mono text-xs break-all text-slate-700 dark:text-slate-300">{ticket.signature}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t dark:border-slate-700">
                     {ticket.status === 'validated' ? (
                        <div className="text-center text-green-600 dark:text-green-400 p-3 bg-green-50 dark:bg-green-500/10 rounded-lg">
                            <p className="font-bold">Validated on {ticket.validatedOnBus}</p>
                            <p className="text-sm">{ticket.validatedAt}</p>
                        </div>
                    ) : (
                        renderValidationContent()
                    )}
                </div>
            </div>
        </div>
    );
};

export default TicketDetailsModal;