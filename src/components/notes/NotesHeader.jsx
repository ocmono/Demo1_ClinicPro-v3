import React, { useState } from 'react'
import Dropdown from '@/components/shared/Dropdown'
import { emailActions, emailMoreOptions, tagsItems } from '../emails/EmailHeader'
import { FiAlignLeft, FiChevronLeft, FiChevronRight, FiEye, FiFolderPlus, FiTag, FiPlus } from 'react-icons/fi'
import { labels, taskFilter } from '../tasks/TaskHeader'
import HeaderSearchForm from '@/components/shared/pageHeader/HeaderSearchForm'

const projectOptions = [
    { label: "All Notes", icon: '' },
    { label: "Lead Notes", icon: '' },
    { label: "Client Notes", icon: '' },
    { label: "Project Notes", icon: '' },
    { label: "Meeting Notes", icon: '' },
    { label: "Personal Notes", icon: '' },
    { label: "Customer Notes", icon: '' },
]
const NotesHeader = ({ setSidebarOpen }) => {
    const [active, setActive] = useState("Newest")
    const [projectFilter, setProjectFilter] = useState("Project Notes")
    const handleFilter = (e) => {
        setActive(e)
    }
    const handleProject = (e) => {
        setProjectFilter(e)
    }
    return (
        <div className="content-area-header sticky-top">
            <div className="page-header-left d-flex align-items-center gap-2">
                <h4 className="fw-bolder mb-0">Notes</h4>
            </div>
            <div className="page-header-right ms-auto">
                <a href="#" className="btn btn-primary w-100" id="add-notes" data-bs-toggle="modal" data-bs-target="#addNewNotes">
                    <FiPlus size={17} className='me-2' />
                    <span>Add Notes</span>
                </a>
            </div>
        </div>
    )
}

export default NotesHeader