import React from 'react';
import PageHeader from '../../components/shared/pageHeader/PageHeader';
import VaccineCreateHeader from '../../components/vaccinesCreate/VaccineCreateHeader';
import VaccineCreateContent from '../../components/vaccinesCreate/VaccineCreateContent';

const VaccineAdd = () => {
    return (
        <>
            <PageHeader>
                <VaccineCreateHeader />
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <VaccineCreateContent />
                </div>
            </div>
        </>
    );
};

export default VaccineAdd;