import React, { useEffect, useState } from 'react'
import { addDays, endOfMonth, format, isSameDay, startOfMonth } from "date-fns";
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DateRangePicker, DefinedRange } from 'react-date-range';

const DateRange = ({ toggleDateRange, setToggleDateRange, onDateRangeChange, dateRange }) => {
    const [state, setState] = useState([
        {
            startDate: dateRange?.startDate || startOfMonth(new Date()),
            endDate: dateRange?.endDate || endOfMonth(new Date()),
            key: "selection",
        },
    ]);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Update state when dateRange prop changes
    useEffect(() => {
        if (dateRange?.startDate && dateRange?.endDate) {
            setState([{
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                key: "selection",
            }]);
        }
    }, [dateRange]);

    const handleDateChange = (item) => {
        setState([item.selection]);
        if (onDateRangeChange) {
            onDateRangeChange(item.selection);
        }
        // Close the dropdown when a selection is made
        setToggleDateRange(false);
        setShowDatePicker(false);
    };

    const handlePredefinedRangeClick = (rangeFunction) => {
        const newRange = rangeFunction();
        setState([{
            startDate: newRange.startDate,
            endDate: newRange.endDate,
            key: "selection",
        }]);
        if (onDateRangeChange) {
            onDateRangeChange(newRange);
        }
        // Close the dropdown when a predefined range is selected
        setToggleDateRange(false);
        setShowDatePicker(false);
    };

    const predefinedRanges = [
        {
            label: 'Today',
            range: () => ({
                startDate: new Date(),
                endDate: new Date(),
            }),
            isSelected: (range) => isSameDay(range.startDate, new Date()) && isSameDay(range.endDate, new Date())
        },
        {
            label: 'Yesterday',
            range: () => ({
                startDate: addDays(new Date(), -1),
                endDate: addDays(new Date(), -1),
            }),
            isSelected: (range) => isSameDay(range.startDate, addDays(new Date(), -1)) && isSameDay(range.endDate, addDays(new Date(), -1))
        },
        {
            label: 'This Week',
            range: () => ({
                startDate: addDays(new Date(), -new Date().getDay()),
                endDate: addDays(new Date(), 6 - new Date().getDay()),
            }),
            isSelected: (range) => isSameDay(range.startDate, addDays(new Date(), -new Date().getDay())) && isSameDay(range.endDate, addDays(new Date(), 6 - new Date().getDay()))
        },
        {
            label: 'Last Week',
            range: () => ({
                startDate: addDays(new Date(), -new Date().getDay() - 7),
                endDate: addDays(new Date(), -new Date().getDay() - 1),
            }),
            isSelected: (range) => isSameDay(range.startDate, addDays(new Date(), -new Date().getDay() - 7)) && isSameDay(range.endDate, addDays(new Date(), -new Date().getDay() - 1))
        },
        {
            label: 'This Month',
            range: () => ({
                startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
            }),
            isSelected: (range) => isSameDay(range.startDate, new Date(new Date().getFullYear(), new Date().getMonth(), 1)) && isSameDay(range.endDate, new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0))
        },
        {
            label: 'Last Month',
            range: () => ({
                startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
            }),
            isSelected: (range) => isSameDay(range.startDate, new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)) && isSameDay(range.endDate, new Date(new Date().getFullYear(), new Date().getMonth(), 0))
        },
        {
            label: 'Custom Date',
            range: () => {
                setShowDatePicker(true);
                return {
                    startDate: state[0].startDate,
                    endDate: state[0].endDate,
                };
            },
            isSelected: () => showDatePicker
        },
    ]

    useEffect(() => {
        document.querySelectorAll(".rdrMonthName")[0]?.classList?.add("rdrMonthNameFirst")
        document.querySelectorAll(".rdrMonthName")[1]?.classList?.add("rdrMonthNameSecond")
    }, [showDatePicker, toggleDateRange])

    // Add click outside handler to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (toggleDateRange) {
                const dateRangeElement = document.querySelector('.date-range-labels');
                const datePickerField = document.querySelector('.date-picker-field');
                
                if (dateRangeElement && !dateRangeElement.contains(event.target) && 
                    datePickerField && !datePickerField.contains(event.target)) {
                    setToggleDateRange(false);
                    setShowDatePicker(false);
                }
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && toggleDateRange) {
                setToggleDateRange(false);
                setShowDatePicker(false);
            }
        };

        if (toggleDateRange) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [toggleDateRange]);

    const handlePropagation = (event) => {
        event.stopPropagation();
    };


    return (
        <>
            <span>
                {`${format(state[0].startDate, "MMM dd,yy")} - ${format(state[0].endDate, "MMM dd,yy")}`}
            </span>
            {
                toggleDateRange &&

                <div onClick={handlePropagation} className='bg-white date-range-labels' >
                    <DefinedRange
                        ranges={state}
                        onChange={handleDateChange}
                        staticRanges={predefinedRanges}
                        inputRanges={[]}
                        className='range-dropdown'
                    />
                    {
                        showDatePicker && (
                            <div className='date-dropdown'>
                                <DateRangePicker
                                    onChange={handleDateChange}
                                    showSelectionPreview={true}
                                    moveRangeOnFirstSelection={false}
                                    months={2}
                                    ranges={state}
                                    direction="horizontal"
                                    weekdayDisplayFormat='EEEEEE'
                                    showMonthAndYearPickers={false}
                                    staticRanges={predefinedRanges}
                                />
                                <div className='action-btns'>
                                    <span>{`${format(state[0].startDate, "MM/dd/yy")} - ${format(state[0].endDate, "MM/dd/yy")}`}</span>
                                    <button onClick={() => setToggleDateRange(false)} className='applyBtn btn btn-sm btn-danger'>Calcel</button>
                                    <button onClick={() => setToggleDateRange(false)} className='applyBtn btn btn-sm btn-primary'>Applay</button>
                                </div>
                            </div>
                        )
                    }
                </div>
            }
        </>
    )
}

export default DateRange