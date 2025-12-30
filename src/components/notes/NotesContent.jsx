import React, { useEffect, useState } from 'react'
import { FiStar, FiTrash2, FiFileText, FiDownload, FiEye, FiEdit, FiX, FiCheckSquare } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { BsCircleFill } from 'react-icons/bs';
import NotesHeader from './NotesHeader';
import PerfectScrollbar from "react-perfect-scrollbar";
import Footer from '@/components/shared/Footer';
import NotesSidebar from './NotesSidebar';
import { toast } from 'react-toastify';
import TodoList from './TodoList';

const NotesContent = () => {
    const [data, setData] = useState([])
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [selectTab, setSelectTab] = useState("alls")
    const [selectCategory, setSelectCategory] = useState({ id: "", name: "" })
    const [favourites, setFavourites] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedNote, setSelectedNote] = useState(null)
    const [editFormData, setEditFormData] = useState({
        title: '',
        note: '',
        attachment: null,
        currentAttachment: null,
        todos: []
    })
    const [isEditLoading, setIsEditLoading] = useState(false)

    const fetchClinicalNotes = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem("access_token")
            const response = await fetch('https://bkdemo1.clinicpro.cc/clinical-notes/all', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const result = await response.json()
                console.log("Clinical notes data:", result)
                setData(result)
            } else {
                throw new Error('Failed to fetch clinical notes')
            }
        } catch (error) {
            console.error("Error fetching clinical notes:", error)
            // toast.error("Failed to load clinical notes")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchClinicalNotes()

        // Listen for refresh event
        const handleRefresh = () => {
            fetchClinicalNotes()
        }
        window.addEventListener('refreshNotes', handleRefresh)

        return () => {
            window.removeEventListener('refreshNotes', handleRefresh)
        }
    }, [])

    useEffect(() => {
        if (selectTab === 'alls') {
            // No filtering needed for 'alls'
            return
        } else {
            // You can add category-based filtering if your API supports categories
            // For now, this will show all data since clinical notes might not have categories
            setData(data)
        }
    }, [selectTab])


    const handleDeleteNote = async (id) => {
        try {
            const token = localStorage.getItem("access_token")
            const response = await fetch(`https://bkdemo1.clinicpro.cc/clinical-notes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                setData(data.filter((note) => note.id !== id))
                toast.success("Clinical note deleted successfully!")
            } else {
                throw new Error('Failed to delete note')
            }
        } catch (error) {
            console.error("Error deleting note:", error)
            // toast.error("Failed to delete clinical note")
        }
    }

    const handleFavourite = (id) => {
        if (favourites.includes(id)) {
            setFavourites(favourites.filter(favId => favId !== id));
        } else {
            setFavourites([...favourites, id]);
        }
    }

    const handleViewNote = (note) => {
        setSelectedNote(note)
        setViewModalOpen(true)
    }

    const handleCloseModal = () => {
        setViewModalOpen(false)
        setSelectedNote(null)
    }

    const handleEditNote = (note) => {
        setSelectedNote(note)
        // Parse todos if they exist as JSON string, otherwise use array
        let parsedTodos = []
        if (note.todos) {
            try {
                parsedTodos = typeof note.todos === 'string' ? JSON.parse(note.todos) : note.todos
            } catch (e) {
                parsedTodos = Array.isArray(note.todos) ? note.todos : []
            }
        }
        setEditFormData({
            title: note.title || '',
            note: note.note || '',
            attachment: null, // We'll handle file separately
            currentAttachment: note.attachment || null,
            todos: parsedTodos
        })
        setEditModalOpen(true)
    }

    const handleEditFormChange = (e) => {
        const { name, value } = e.target
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleEditAttachmentChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB")
                e.target.value = ""
                return
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf',
                'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
            if (!allowedTypes.includes(file.type)) {
                toast.error("Please select a valid file type (JPEG, PNG, GIF, PDF, DOC, DOCX)")
                e.target.value = ""
                return
            }

            setEditFormData(prev => ({
                ...prev,
                attachment: file
            }))
        }
    }

    const handleCloseEditModal = () => {
        setEditModalOpen(false)
        setSelectedNote(null)
        setEditFormData({
            title: '',
            note: '',
            attachment: null,
            currentAttachment: null,
            todos: []
        })
    }

    const handleRemoveAttachment = () => {
        setEditFormData(prev => ({
            ...prev,
            attachment: null
        }))
        // Clear the file input
        const fileInput = document.querySelector('input[type="file"]')
        if (fileInput) fileInput.value = ""
    }

    const handleUpdateNote = async (e) => {
        e.preventDefault()

        if (!editFormData.title.trim() || !editFormData.note.trim()) {
            toast.error("Title and note content are required")
            return
        }

        setIsEditLoading(true)
        try {
            const token = localStorage.getItem("access_token")
            const updateData = {
                title: editFormData.title.trim(),
                note: editFormData.note.trim(),
                todos: editFormData.todos && editFormData.todos.length > 0 
                    ? JSON.stringify(editFormData.todos) 
                    : null
            }

            console.log("Sending update data:", updateData)

            const response = await fetch(`https://bkdemo1.clinicpro.cc/clinical-notes/update-note/${selectedNote.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            })

            console.log("Response status:", response.status)

            if (response.ok) {
                const result = await response.json()
                toast.success("Clinical note updated successfully!")

                // Update the local state with the updated note
                setData(data.map(note =>
                    note.id === selectedNote.id ? result : note
                ))

                handleCloseEditModal()
            } else {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to update note')
            }
        } catch (error) {
            console.error("Error updating note:", error)
            // toast.error(error.message || "Failed to update clinical note. Please try again.")
        } finally {
            setIsEditLoading(false)
        }
    }

    const onCategory = (e, name, id) => {
        e.preventDefault()
        setSelectCategory({ id: id, name: name })
    }

    const handleDownloadAttachment = (url, filename) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || url.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const filteredCategory = []
    data?.forEach((note) => {
        // If your clinical notes have categories, you can extract them here
        // For now, we'll use some default categories
        const categories = ['medical', 'examination', 'treatment', 'follow-up']
        categories.forEach(cat => {
            if (!filteredCategory.includes(cat)) {
                filteredCategory.push(cat)
            }
        })
    })

    const formatDate = (dateString) => {
        if (!dateString) return '—';

        const date = new Date(dateString);
        if (isNaN(date)) return dateString;

        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    return (
        <>
            {/* <NotesSidebar selectTab={selectTab} setSelectTab={setSelectTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}
            <div className="content-area">
                <PerfectScrollbar>
                    <NotesHeader setSidebarOpen={setSidebarOpen} />
                    <div className="content-area-body pb-0">
                        {isLoading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-2">Loading clinical notes...</p>
                            </div>
                        ) : data.length === 0 ? (
                            <div className="text-center py-5">
                                <FiFileText size={48} className="text-muted mb-3" />
                                <h5>No Clinical Notes Found</h5>
                                <p className="text-muted">You haven't created any clinical notes yet.</p>
                            </div>
                        ) : (
                                    <div className="row note-has-grid" id="note-full-container">
                                        {
                                            data?.map((note, index) => (
                                                <NoteCard
                                                    key={note.id}
                                                    id={note.id}
                                                    title={note.title}
                                                    date={formatDate(note.created_at)}
                                                    content={note.note}
                                                    handleFavourite={handleFavourite}
                                                    handleDeleteNote={handleDeleteNote}
                                                    handleViewNote={handleViewNote}
                                                    handleEditNote={handleEditNote}
                                                    filteredCategory={filteredCategory}
                                                    favourites={favourites}
                                                    onCategory={onCategory}
                                                    selectCategory={selectCategory}
                                                    note={note}
                                                    index={index} // Pass index for consistent coloring
                                                />
                                            ))
                                        }
                                    </div>
                        )}
                    </div>
                    <Footer />
                </PerfectScrollbar>
            </div>
            {viewModalOpen && selectedNote && (
                <div className="modal fade show d-block">
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-light">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="bg-primary rounded p-2">
                                        <FiFileText size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h5 className="modal-title mb-0">{selectedNote.title}</h5>
                                        <small className="text-muted">Clinical Note #{selectedNote.id}</small>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCloseModal}
                                ></button>
                            </div>

                            <div className="modal-body">
                                <div className="row">
                                    {/* Left Column - Note Details */}
                                    <div className="col-md-8">
                                        <div className="card h-100">
                                            <div className="card-header">
                                                <h6 className="card-title mb-0">Clinical Note Details</h6>
                                            </div>
                                            <div className="card-body">
                                                <div>
                                                    <p className="mb-0" style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                                        {selectedNote.note || (
                                                            <span className="text-muted">No clinical note content available.</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Note Information */}
                                    <div className="col-md-4">
                                        <div className="card">
                                            <div className="card-header">
                                                <h6 className="card-title mb-0">Note Information</h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="mb-3">
                                                    <label className="form-label fw-semibold text-muted small mb-1">Note ID</label>
                                                    <div className="d-flex align-items-center gap-2 text-dark">
                                                        #{selectedNote.id}
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label fw-semibold text-muted small mb-1">Created Date</label>
                                                    <div className="d-flex align-items-center gap-2 text-dark">
                                                        {formatDate(selectedNote.created_at)}
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label fw-semibold text-muted small mb-1">Last Updated</label>
                                                    <div className="d-flex align-items-center gap-2 text-dark">
                                                        {formatDate(selectedNote.updated_at)}
                                                    </div>
                                                </div>

                                                {/* {selectedNote.created_by && (
                                                    <div className="mb-3">
                                                        <label className="form-label fw-semibold text-muted small mb-1">Created By</label>
                                                        <div className="text-dark">
                                                            User #{selectedNote.created_by}
                                                        </div>
                                                    </div>
                                                )} */}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Todos Section */}
                                {(() => {
                                    let noteTodos = []
                                    if (selectedNote.todos) {
                                        try {
                                            noteTodos = typeof selectedNote.todos === 'string' 
                                                ? JSON.parse(selectedNote.todos) 
                                                : selectedNote.todos
                                        } catch (e) {
                                            noteTodos = Array.isArray(selectedNote.todos) ? selectedNote.todos : []
                                        }
                                    }
                                    return noteTodos.length > 0 ? (
                                        <div className="row mt-3">
                                            <div className="col-12">
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h6 className="card-title mb-0">Todos</h6>
                                                    </div>
                                                    <div className="card-body">
                                                        <TodoList
                                                            todos={noteTodos}
                                                            disabled={true}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null
                                })()}

                                {/* Attachment Section */}
                                {selectedNote.attachment && (
                                    <div className="row mt-3">
                                        <div className="col-12">
                                            <div className="card">
                                                <div className="card-header d-flex align-items-center gap-2">
                                                    <h6 className="card-title mb-0">Attachment</h6>
                                                    <FiDownload size={16} />
                                                </div>
                                                <div className="card-body">
                                                    <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <FiFileText size={24} className="text-primary" />
                                                            <div>
                                                                <div className="fw-medium">
                                                                    {selectedNote.attachment.split('/').pop()}
                                                                </div>
                                                                <small className="text-muted">
                                                                    Click download to get the file
                                                                </small>
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="btn btn-primary d-flex align-items-center gap-2"
                                                            onClick={() => handleDownloadAttachment(
                                                                selectedNote.attachment,
                                                                selectedNote.attachment.split('/').pop()
                                                            )}
                                                        >
                                                            <FiDownload size={16} />
                                                            Download
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer bg-light">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCloseModal}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-warning"
                                    onClick={() => {
                                        handleCloseModal()
                                        handleEditNote(selectedNote)
                                    }}
                                >
                                    <FiEdit size={16} className="me-2" />
                                    Edit Note
                                </button>
                                {selectedNote.attachment && (
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => handleDownloadAttachment(
                                            selectedNote.attachment,
                                            selectedNote.attachment.split('/').pop()
                                        )}
                                    >
                                        <FiDownload size={16} className="me-2" />
                                        Download Attachment
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editModalOpen && selectedNote && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-light">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="bg-warning rounded p-2">
                                        <FiEdit size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h5 className="modal-title mb-0">Edit Clinical Note</h5>
                                        <small className="text-muted">Editing Note #{selectedNote.id}</small>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCloseEditModal}
                                    disabled={isEditLoading}
                                ></button>
                            </div>

                            <form onSubmit={handleUpdateNote}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label">
                                                Title <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="title"
                                                className="form-control"
                                                placeholder="Enter clinical note title"
                                                value={editFormData.title}
                                                onChange={handleEditFormChange}
                                                required
                                                minLength={2}
                                            />
                                        </div>

                                        <div className="col-md-12 mb-3">
                                            <label className="form-label">
                                                Clinical Note <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                name="note"
                                                className="form-control"
                                                placeholder="Enter clinical note details"
                                                rows={8}
                                                value={editFormData.note}
                                                onChange={handleEditFormChange}
                                                required
                                                minLength={10}
                                            />
                                            <div className="form-text">
                                                Update the clinical note content as needed. Minimum 10 characters required.
                                            </div>
                                        </div>

                                        <div className="col-md-12 mb-3">
                                            <label className="form-label">
                                                Update Attachment
                                            </label>

                                            {/* Current Attachment Display */}
                                            {editFormData.currentAttachment && !editFormData.attachment && (
                                                <div className="mb-3 p-3 bg-light rounded">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <FiFileText className="text-primary" />
                                                            <span className="fw-medium">
                                                                Current: {editFormData.currentAttachment.split('/').pop()}
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => handleDownloadAttachment(
                                                                editFormData.currentAttachment,
                                                                editFormData.currentAttachment.split('/').pop()
                                                            )}
                                                        >
                                                            <FiDownload size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* New File Input */}
                                            <div className="input-group">
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    onChange={handleEditAttachmentChange}
                                                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                                                />
                                            </div>

                                            {/* New Attachment Preview */}
                                            {editFormData.attachment && (
                                                <div className="mt-2 p-2 bg-success bg-opacity-10 rounded">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <FiFileText className="text-success" />
                                                            <span className="fw-medium text-white">
                                                                New file: {editFormData.attachment.name}
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={handleRemoveAttachment}
                                                        >
                                                            <FiX size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="form-text">
                                                Supported formats: JPEG, PNG, GIF, PDF, DOC, DOCX (Max 5MB).
                                                Select a new file to replace the current attachment.
                                            </div>
                                        </div>

                                        <div className="col-md-12 mb-3">
                                            <TodoList
                                                todos={editFormData.todos}
                                                onChange={(updatedTodos) => {
                                                    setEditFormData(prev => ({
                                                        ...prev,
                                                        todos: updatedTodos
                                                    }))
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer bg-light">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleCloseEditModal}
                                        disabled={isEditLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-warning"
                                        disabled={isEditLoading || !editFormData.title.trim() || !editFormData.note.trim() || editFormData.note.trim().length < 10}
                                    >
                                        {isEditLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <FiEdit size={16} className="me-2" />
                                                Update Note
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Backdrop */}
            {viewModalOpen && (
                <div className="modal-backdrop fade show"></div>
            )}
        </>
    )
}

export default NotesContent


const NoteCard = ({ title, date, content, attachment, note, handleFavourite, handleEditNote, handleViewNote, handleDeleteNote, handleDownloadAttachment, filteredCategory, id, favourites, onCategory, selectCategory, index }) => {
    // Get unique color for each card based on index
    const cardColor = getCardColor(index);
    
    // Parse todos to show indicator
    let noteTodos = []
    let todosCount = 0
    let completedTodosCount = 0
    if (note.todos) {
        try {
            noteTodos = typeof note.todos === 'string' ? JSON.parse(note.todos) : note.todos
            if (Array.isArray(noteTodos)) {
                todosCount = noteTodos.length
                completedTodosCount = noteTodos.filter(t => t.checked).length
            }
        } catch (e) {
            // Ignore parsing errors
        }
    }

    return (
        <div className="col-xxl-4 col-xl-6 col-lg-4 col-sm-6 single-note-item all-category">
            <div className="card card-body mb-4 stretch stretch-full">
                <span className={`side-stick bg-${cardColor}`}></span>
                <h5 className="note-title text-truncate w-75 mb-1 d-flex align-items-center" data-noteheading={title}>
                    {title}
                    <i className={`point ms-2 fs-7 text-${cardColor}`}><BsCircleFill /></i>
                    {todosCount > 0 && (
                        <span className="badge bg-info ms-2 d-flex align-items-center gap-1" title={`${completedTodosCount}/${todosCount} todos completed`}>
                            <FiCheckSquare size={12} />
                            <span>{completedTodosCount}/{todosCount}</span>
                        </span>
                    )}
                </h5>
                <p className="fs-11 text-muted note-date">{date}</p>
                <div className="note-content flex-grow-1">
                    <p className="text-muted note-inner-content" data-notecontent={content}>
                        {content}
                    </p>
                </div>
                <div className="d-flex align-items-center gap-1">
                    <button
                        className="avatar-text avatar-md"
                        onClick={() => handleViewNote(note)}
                        title="View full note"
                    >
                        <FiEye size={14} />
                    </button>
                    <button
                        className="avatar-text avatar-md"
                        onClick={() => handleEditNote(note)}
                        title="Edit note"
                    >
                        <FiEdit size={14} />
                    </button>
                    <button
                        className={`avatar-text avatar-md ${favourites.includes(id) ? 'text-warning' : ''}`}
                        onClick={() => handleFavourite(id)}
                        title={favourites.includes(id) ? "Remove from favorites" : "Add to favorites"}
                    >
                        <FiStar size={14} fill={favourites.includes(id) ? "currentColor" : "none"} />
                    </button>
                    <button
                        className="avatar-text avatar-md text-danger"
                        onClick={() => handleDeleteNote(id)}
                        title="Delete note"
                    >
                        <FiTrash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Function to get different colors for each card
const getCardColor = (index) => {
    const colors = ['primary', 'success', 'warning', 'danger', 'info', 'secondary', 'dark'];
    return colors[index % colors.length];
};

// Keep the original getColor function for other uses if needed
const getColor = (name) => {
    switch (name) {
        case 'medical':
        case 'tasks':
            return "danger"
        case 'examination':
        case 'works':
            return "primary"
        case 'social':
            return "info"
        case 'archive':
            return "dark"
        case 'priority':
            return "danger"
        case 'personal':
            return "primary"
        case 'business':
            return "warning"
        case 'follow-up':
        case 'important':
            return "success"
        default:
            return "primary";
    }
}