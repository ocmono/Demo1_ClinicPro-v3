import React from 'react';
import getIcon from '@/utils/getIcon';

const Input = ({
  label,
  icon,
  type = 'text',
  placeholder,
  labelId,
  name,
  centerLink,
  value,
  onChange,
  required = false,
}) => {
  return (
    <div className="row mb-4 align-items-center">
      <div className="col-lg-4">
        <label htmlFor={labelId} className="fw-semibold">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      </div>
      <div className="col-lg-8">
        <div className="input-group">
          <div className="input-group-text">{getIcon(icon)}</div>
          {centerLink && (
            <div className="input-group-text">https://ocmono.com</div>
          )}
          <input
            type={type}
            name={name}
            id={labelId}
            placeholder={placeholder}
            className="form-control"
            value={value}           // ✅ controlled input
            onChange={onChange}     // ✅ connect to form handler
          />
        </div>
      </div>
    </div>
  );
};

export default Input;
