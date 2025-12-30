import React from 'react'
import Select from 'react-select'
const MultiSelectImg = ({ options, defaultSelect, value, onChange, placeholder }) => {
    return (
        <Select
            isMulti
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            options={options}
            className="basic-multi-select"
            classNamePrefix="select"
            styles={{
                control: (baseStyles, state) => ({
                    ...baseStyles,
                    padding: state.hasValue ? '6px 12px' : '13px',
                }),
            }}
            hideSelectedOptions={false}
            isSearchable={false}
            formatOptionLabel={(opt) => (
                <div className="d-flex align-items-center gap-2">
                    <span>{opt.label}</span>
                </div>
            )}
        />
    )
}

export default MultiSelectImg