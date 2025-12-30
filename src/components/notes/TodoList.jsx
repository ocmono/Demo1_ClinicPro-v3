import React, { useState, useEffect } from 'react'
import { FiPlus, FiX, FiCheckSquare } from 'react-icons/fi'

const TodoList = ({ todos = [], onChange, disabled = false }) => {
    const [localTodos, setLocalTodos] = useState(todos || [])
    const [inputValue, setInputValue] = useState("")

    useEffect(() => {
        setLocalTodos(todos || [])
    }, [todos])

    const handleToggleTodo = (id) => {
        if (disabled) return
        
        const updatedTodos = localTodos.map(todo =>
            todo.id === id ? { ...todo, checked: !todo.checked } : todo
        )
        setLocalTodos(updatedTodos)
        if (onChange) {
            onChange(updatedTodos)
        }
    }

    const handleDeleteTodo = (id) => {
        if (disabled) return
        
        const updatedTodos = localTodos.filter(todo => todo.id !== id)
        setLocalTodos(updatedTodos)
        if (onChange) {
            onChange(updatedTodos)
        }
    }

    const handleAddTodo = () => {
        if (disabled || !inputValue.trim()) return
        
        const newTodo = {
            id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            title: inputValue.trim(),
            checked: false
        }
        const updatedTodos = [...localTodos, newTodo]
        setLocalTodos(updatedTodos)
        setInputValue("")
        if (onChange) {
            onChange(updatedTodos)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !disabled) {
            e.preventDefault()
            handleAddTodo()
        }
    }

    return (
        <div className="todo-list-container">
            <div className="mb-2">
                <label className="form-label fw-semibold">
                    <FiCheckSquare size={16} className="me-2" />
                    Todos
                </label>
                <div className="form-text mb-2">Add action items or reminders for this note</div>
            </div>
            
            {localTodos.length > 0 && (
                <div className="todo-items mb-3" id="checklist">
                    {localTodos.map((todo) => (
                        <div key={todo.id} className="d-flex align-items-center mb-2 p-2 border rounded">
                            <div className="form-check me-2">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={todo.checked}
                                    onChange={() => handleToggleTodo(todo.id)}
                                    disabled={disabled}
                                    id={`todo-${todo.id}`}
                                />
                                <label
                                    className={`form-check-label c-pointer mb-0 ${todo.checked ? 'text-decoration-line-through text-muted' : ''}`}
                                    htmlFor={`todo-${todo.id}`}
                                    style={{ flex: 1 }}
                                >
                                    {todo.title}
                                </label>
                            </div>
                            {!disabled && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-link text-danger p-0 ms-auto"
                                    onClick={() => handleDeleteTodo(todo.id)}
                                    style={{ lineHeight: 1 }}
                                >
                                    <FiX size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!disabled && (
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Add a todo item..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button
                        type="button"
                        className="btn btn-outline-primary d-flex align-items-center gap-2"
                        onClick={handleAddTodo}
                        disabled={!inputValue.trim()}
                    >
                        <FiPlus size={16} />
                        <span>Add</span>
                    </button>
                </div>
            )}
        </div>
    )
}

export default TodoList

