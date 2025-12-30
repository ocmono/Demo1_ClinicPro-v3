import React from 'react'
import getIcon from '@/utils/getIcon'

const TextArea = ({ label, icon, placeholder, labelId, row = "3", name, value, onChange, required = false }) => {
    return (
        <div className="row mb-4 align-items-center">
            <div className="col-lg-4">
                <label htmlFor={labelId} className="fw-semibold">{label} </label>
                {required && <span className="text-danger ms-1">*</span>}
            </div>
            <div className="col-lg-8">
                <div className="input-group">
                    <div className="input-group-text">{getIcon(icon)}</div>
                    <textarea className="form-control" id={labelId} cols="30" name={name} rows={row} placeholder={placeholder} value={value} onChange={onChange} ></textarea>
                </div>
            </div>
        </div>
    )
}

export default TextArea