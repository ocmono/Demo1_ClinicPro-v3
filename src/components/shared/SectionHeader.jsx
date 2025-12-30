import React from 'react'
import { FiBarChart, FiBriefcase, FiDollarSign, FiEye, FiFilter, FiFlag, FiPaperclip, FiPlus, FiUserCheck, FiUserMinus, FiUsers } from 'react-icons/fi'
import { BsFiletypeCsv, BsFiletypeExe, BsFiletypePdf, BsFiletypeTsx, BsFiletypeXml, BsPrinter } from 'react-icons/bs';
import Dropdown from '@/components/shared/Dropdown';
import { Link } from 'react-router-dom';

const SectionHeader = ({ 
    title = "Section",
    createButtonText = "Create New",
    createButtonPath = "#",
    onCreateClick = null,
    additionalButtonText = null,
    additionalButtonPath = "#",
    onAdditionalClick = null,
    statisticsComponent = null,
    filterActions = [],
    fileTypeActions = []
}) => {
    // Default filter actions if none provided
    const defaultFilterActions = [
        { label: "All", icon: <FiEye /> },
        { label: "Group", icon: <FiUsers /> },
        { label: "Country", icon: <FiFlag /> },
        { label: "Invoice", icon: <FiDollarSign /> },
        { label: "Project", icon: <FiBriefcase /> },
        { label: "Active", icon: <FiUserCheck /> },
        { label: "Inactive", icon: <FiUserMinus /> },
    ];

    // Default file type actions if none provided
    const defaultFileTypeActions = [
        { label: "PDF", icon: <BsFiletypePdf /> },
        { label: "CSV", icon: <BsFiletypeCsv /> },
        { label: "XML", icon: <BsFiletypeXml /> },
        { label: "Text", icon: <BsFiletypeTsx /> },
        { label: "Excel", icon: <BsFiletypeExe /> },
        { label: "Print", icon: <BsPrinter /> },
    ];

    const filterActionsToUse = filterActions.length > 0 ? filterActions : defaultFilterActions;
    const fileTypeActionsToUse = fileTypeActions.length > 0 ? fileTypeActions : defaultFileTypeActions;

    // Render create button based on whether onClick handler is provided
    const renderCreateButton = () => {
        const buttonContent = (
            <>
                <FiPlus size={16} className='me-2' />
                <span>{createButtonText}</span>
            </>
        );

        if (onCreateClick) {
            return (
                <button className="btn btn-primary" onClick={onCreateClick}>
                    {buttonContent}
                </button>
            );
        } else {
            return (
                <Link to={createButtonPath} className="btn btn-primary">
                    {buttonContent}
                </Link>
            );
        }
    };

    // Render additional button if provided
    const renderAdditionalButton = () => {
        if (!additionalButtonText) return null;

        const buttonContent = (
            <>
                <FiPlus size={16} className='me-2' />
                <span>{additionalButtonText}</span>
            </>
        );

        if (onAdditionalClick) {
            return (
                <button className="btn btn-success" onClick={onAdditionalClick}>
                    {buttonContent}
                </button>
            );
        } else {
            return (
                <Link to={additionalButtonPath} className="btn btn-success">
                    {buttonContent}
                </Link>
            );
        }
    };

    return (
        <>
            <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                <a href="#" className="btn btn-icon btn-light-brand" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                    <FiBarChart size={16} strokeWidth={1.6} />
                </a>
                <Dropdown
                    dropdownItems={filterActionsToUse}
                    triggerPosition={"0, 12"}
                    triggerIcon={<FiFilter size={16} strokeWidth={1.6} />}
                    triggerClass='btn btn-icon btn-light-brand'
                    isAvatar={false}
                />
                <Dropdown
                    dropdownItems={fileTypeActionsToUse}
                    triggerPosition={"0, 12"}
                    triggerIcon={<FiPaperclip size={16} strokeWidth={1.6} />}
                    triggerClass='btn btn-icon btn-light-brand'
                    iconStrokeWidth={0}
                    isAvatar={false}
                />
                {renderAdditionalButton()}
                {renderCreateButton()}
            </div>

            {statisticsComponent && (
                <div id="collapseOne" className="accordion-collapse collapse page-header-collapse">
                    <div className="accordion-body pb-2">
                        <div className="row">
                            {statisticsComponent}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default SectionHeader 