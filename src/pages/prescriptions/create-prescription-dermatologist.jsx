import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import PrescriptionCreation from '@/components/prescriptions/PrescriptionCreate';
import PrescriptionHeader from '@/components/prescriptions/PrescriptionHeader';
import Footer from '@/components/shared/Footer';
import PrescriptionsCreateDummy from '../../components/prescriptions/PrescriptionsCreateDummy';

const PrescriptionCreateDermatologist = () => {
    const [timerKey, setTimerKey] = useState(0);
    const [activeComponent, setActiveComponent] = useState('B'); // default

    useEffect(() => {
        const isColorTemplate = localStorage.getItem('isColorTemplate') === 'true';
        if (isColorTemplate) {
            setActiveComponent('A');
        }
    }, []);

    const handleTimerReset = () => {
        setTimerKey(prev => prev + 1);
    };

    const handleSwitchComponent = () => {
        setActiveComponent(prev => (prev === 'A' ? 'B' : 'A'));
    };

    return (
        <>
            <PageHeader sticky>
                <PrescriptionHeader
                    key={timerKey}
                    onTimerReset={handleTimerReset}
                    onSwitchComponent={handleSwitchComponent}
                    activeComponent={activeComponent} // optional (for label)
                />
            </PageHeader>

            <div className="main-content">
                {activeComponent === 'A' ? (
                    <PrescriptionCreation onResetTimer={handleTimerReset} />
                ) : (
                    <PrescriptionsCreateDummy onResetTimer={handleTimerReset} />
                )}
            </div>

            <Footer />
        </>
    );
};

export default PrescriptionCreateDermatologist;


