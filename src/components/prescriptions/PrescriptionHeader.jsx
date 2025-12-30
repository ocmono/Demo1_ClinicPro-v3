import React, { useEffect, useState, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom';
import { FiPlus, FiList, FiArrowLeft, FiPlay, FiPause, FiClock } from 'react-icons/fi';
import { GrPowerReset } from "react-icons/gr";

const PrescriptionHeader = ({ onTimerReset , onSwitchComponent, activeComponent }) => {
    const location = useLocation();

    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        // Start timer automatically when on create prescription page
        if (location.pathname === '/prescriptions/create-prescription') {
            startTimer();
        } else {
            stopTimer();
        }

        // Cleanup on unmount
        return () => stopTimer();
    }, [location.pathname]);

    const startTimer = () => {
        if (!isRunning) {
            setIsRunning(true);
            timerRef.current = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        }
    };

    const stopTimer = () => {
        setIsRunning(false);
        clearInterval(timerRef.current);
        timerRef.current = null;
    };

    const resetTimer = () => {
        stopTimer();
        setSeconds(0);
        // Call the callback if provided
        if (onTimerReset) {
            onTimerReset();
        }
        // Auto-restart if we're still on the create prescription page
        if (location.pathname === '/prescriptions/create-prescription') {
            startTimer();
        }
    };

    // Format as mm:ss
    const formatTime = (sec) => {
        const mins = Math.floor(sec / 60);
        const secs = sec % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };


    return (
        <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
            <button
                type="button"
                onClick={onSwitchComponent}
                className="btn btn-secondary rounded-1"
            >
                {activeComponent === 'A' ? 'Simple' : 'Color'} Template
            </button>
            {location.pathname === '/prescriptions/create-prescription' && (
                <>
                    <div className="d-flex align-items-center border rounded-1 px-3 py-2 bg-light" style={{ minWidth: "90px", justifyContent: "center" }}>
                         {/* Start/Stop Toggle */}
                         <button
                             className={`btn p-1 border-0 me-2 rounded-1 ${isRunning ? 'text-danger' : 'text-success'}`}
                             onClick={isRunning ? stopTimer : startTimer}
                         >
                             {isRunning ? (
                                 <>
                                     <FiPause size={13} />
                                 </>
                             ) : (
                                 <>
                                     <FiPlay size={13} />
                                 </>
                             )}
                         </button>
                        <FiClock className="me-1" />
                        <span
                            className="fw-bold text-center"
                            style={{
                                width: "40px",
                                display: "inline-block",
                                fontVariantNumeric: "tabular-nums"
                            }}
                        >
                            {formatTime(seconds)}
                        </span>
                        {/* Reset Button */}
                    <button className="btn p-1 ms-2 border-0 text-danger" onClick={resetTimer}>
                        <GrPowerReset size={13} />
                    </button>
                    </div>

                    <Link to="/prescriptions/all-prescriptions" className="btn btn-primary ">
                        <FiList size={14} className='me-2' />
                        <span>View All Prescriptions</span>
                    </Link>
                </>
            )}
            {location.pathname === '/prescriptions/all-prescriptions' && (
                <Link to="/prescriptions/create-prescription" className="btn btn-primary ">
                    <FiPlus size={14} className='me-2' />
                    <span>New Prescription</span>
                </Link>
            )}
            {location.pathname.startsWith('/prescription/view/') && (
                <Link to="/prescriptions/all-prescriptions" className="btn btn-outline-secondary">
                    <FiArrowLeft size={14} className='me-2' />
                    <span>Back to Prescriptions</span>
                </Link>
            )}
        </div>
    );
}

export default PrescriptionHeader;