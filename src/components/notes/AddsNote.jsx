import React, { useState } from 'react'
import { toast } from 'react-toastify'
import TodoList from './TodoList'

const AddsNote = () => {
    const [title, setTitle] = useState("")
    const [note, setNote] = useState("")
    const [attachment, setAttachment] = useState(null)
    const [todos, setTodos] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const validateForm = () => {
        const newErrors = {}

        if (!title.trim()) {
            newErrors.title = "Title is required"
        } else if (title.length < 2) {
            newErrors.title = "Title must be at least 2 characters long"
        }

        if (!note.trim()) {
            newErrors.note = "Note is required"
        } else if (note.length < 10) {
            newErrors.note = "Note must be at least 10 characters long"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleAttachmentChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB")
                e.target.value = "" // Clear the file input
                return
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf',
                'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
            if (!allowedTypes.includes(file.type)) {
                toast.error("Please select a valid file type (JPEG, PNG, GIF, PDF, DOC, DOCX)")
                e.target.value = "" // Clear the file input
                return
            }

            setAttachment(file)
            setErrors(prev => ({ ...prev, attachment: "" }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsLoading(true)
        try {
            const token = localStorage.getItem("access_token")
            const formData = new FormData()

            // Append form data
            formData.append('title', title.trim())
            formData.append('note', note.trim())
            if (attachment) {
                formData.append('attachment', attachment)
            }
            // Append todos as JSON string
            if (todos && todos.length > 0) {
                formData.append('todos', JSON.stringify(todos))
            }

            const response = await fetch('https://bkdemo1.clinicpro.cc/clinical-notes/add-note', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Don't set Content-Type for FormData, let browser set it with boundary
                },
                body: formData
            })

            if (response.ok) {
                const result = await response.json()
                toast.success("Clinical note added successfully!")

                // Reset form
                setTitle("")
                setNote("")
                setAttachment(null)
                setTodos([])
                setErrors({})

                // Close modal
                const modal = document.getElementById('addNewNotes')
                if (modal) {
                    // Remove the 'show' class and add 'hide'
                    modal.classList.remove('show')
                    modal.classList.add('hide')
                    // Set display to none
                    modal.style.display = 'none'
                    // Remove the backdrop
                    const backdrops = document.getElementsByClassName('modal-backdrop')
                    while (backdrops.length > 0) {
                        backdrops[0].remove()
                    }
                    // Enable body scrolling
                    document.body.classList.remove('modal-open')
                    document.body.style.overflow = 'auto'
                    document.body.style.paddingRight = '0px'
                }

                // Trigger refresh event for NotesContent
                window.dispatchEvent(new CustomEvent('refreshNotes'))

            } else {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to add note')
            }
        } catch (error) {
            console.error("Error adding note:", error)
            // toast.error(error.message || "Failed to add note. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDiscard = () => {
        setTitle("")
        setNote("")
        setAttachment(null)
        setTodos([])
        setErrors({})
    }

    const getFileName = () => {
        if (!attachment) return "No file chosen"
        return attachment.name
    }

    const handleModalClose = () => {
        handleDiscard()
    }

    const closeModalProgrammatically = () => {
        const closeButton = document.querySelector('#addNewNotes [data-bs-dismiss="modal"]')
        if (closeButton) {
            closeButton.click()
        }
    }
    return (
        <div
            className="modal fade"
            id="addNewNotes"
            tabIndex={-1}
            data-bs-keyboard="false"
            role="dialog"

        >
            <div
                className="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-lg"
                role="document"
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="modalTitleId">
                            Add Clinical Note
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            onClick={handleModalClose}
                        />
                    </div>
                    <div className="modal-body">
                        <div className="notes-box">
                            <div className="notes-content">
                                <form action="#" id="addnotesmodalTitle">
                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <div className="note-title">
                                                <label className="form-label">Note Title</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                                    placeholder="Enter clinical note title"
                                                    value={title}
                                                    onChange={(e) => {
                                                        setTitle(e.target.value)
                                                        if (errors.title) {
                                                            setErrors(prev => ({ ...prev, title: "" }))
                                                        }
                                                    }}
                                                />
                                                {errors.title && (
                                                    <div className="invalid-feedback">
                                                        {errors.title}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="note-description">
                                                <label className="form-label">Note Description</label>
                                                <textarea
                                                    className={`form-control ${errors.note ? 'is-invalid' : ''}`}
                                                    placeholder="Enter note description"
                                                    rows={5}
                                                    value={note}
                                                    onChange={(e) => {
                                                        setNote(e.target.value)
                                                        if (errors.note) {
                                                            setErrors(prev => ({ ...prev, note: "" }))
                                                        }
                                                    }}
                                                />
                                                {errors.note && (
                                                    <div className="invalid-feedback">
                                                        {errors.note}
                                                    </div>
                                                )}
                                                <div className="form-text">
                                                    Minimum 10 characters required
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-12 mb-3">
                                            <div className="attachment-upload">
                                                <label className="form-label">
                                                    Attachment <span className="text-muted">(Optional)</span>
                                                </label>
                                                <div className="input-group">
                                                    <input
                                                        type="file"
                                                        className={`form-control ${errors.attachment ? 'is-invalid' : ''}`}
                                                        onChange={handleAttachmentChange}
                                                        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                                                    />
                                                </div>
                                                {errors.attachment && (
                                                    <div className="invalid-feedback d-block">
                                                        {errors.attachment}
                                                    </div>
                                                )}
                                                {attachment && (
                                                    <div className="mt-2">
                                                        <small className="text-muted">
                                                            Selected file: {getFileName()}
                                                        </small>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger ms-2"
                                                            onClick={() => setAttachment(null)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                )}
                                                <div className="form-text">
                                                    Supported formats: JPEG, PNG, GIF, PDF, DOC, DOCX (Max 5MB)
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-12 mb-3">
                                            <div className="border-top pt-3 mt-3">
                                                <TodoList
                                                    todos={todos}
                                                    onChange={setTodos}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        {/* <button id="btn-n-save" className="float-left btn btn-success">
                            Save
                        </button> */}
                        <button
                            type="button"
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                            onClick={handleModalClose}
                            disabled={isLoading}
                        >
                            Discard
                        </button>
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={handleSubmit}
                            disabled={isLoading || title.length < 2 || note.length < 10}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Adding...
                                </>
                            ) : (
                                'Add Clinical Note'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddsNote