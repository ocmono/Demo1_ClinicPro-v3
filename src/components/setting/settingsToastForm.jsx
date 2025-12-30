import React, { useState } from 'react'
import Footer from '@/components/shared/Footer'
import PageHeaderSetting from '@/components/shared/pageHeader/PageHeaderSetting'
import PerfectScrollbar from 'react-perfect-scrollbar'
import SelectDropdown from '@/components/shared/SelectDropdown'
import InputTopLabel from '@/components/shared/InputTopLabel'
import { settingOptions } from './settingsEmailForm'

const SettingsToastForm = () => {
    const [selectedOption, setSelectedOption] = useState(null)
    const [toastPosition, setToastPosition] = useState(null)
    const [toastDuration, setToastDuration] = useState(3000)

    const positionOptions = [
        { value: "top-start", label: "Top Start" },
        { value: "top", label: "Top" },
        { value: "top-end", label: "Top End" },
        { value: "bottom-start", label: "Bottom Start" },
        { value: "bottom", label: "Bottom" },
        { value: "bottom-end", label: "Bottom End" },
    ]

    const durationOptions = [
        { value: 1000, label: "1 second" },
        { value: 2000, label: "2 seconds" },
        { value: 3000, label: "3 seconds" },
        { value: 4000, label: "4 seconds" },
        { value: 5000, label: "5 seconds" },
        { value: 10000, label: "10 seconds" },
    ]

    return (
        <div className="content-area" data-scrollbar-target="#psScrollbarInit">
            <PerfectScrollbar>
                <PageHeaderSetting />
                <div className="content-area-body">
                    <div className="card mb-0">
                        <div className="card-body">
                            <div className="mb-5">
                                <h4 className="fw-bold">Toast Notifications</h4>
                                <div className="fs-12 text-muted">Configure toast notification settings and behavior</div>
                            </div>

                            <div className="mb-5">
                                <label className="form-label">Enable Toast Notifications</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"yes"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Enable or disable toast notifications system-wide [Ex: Yes/No]</small>
                            </div>

                            <div className="mb-5">
                                <label className="form-label">Toast Position</label>
                                <SelectDropdown
                                    options={positionOptions}
                                    defaultSelect={"top-end"}
                                    selectedOption={toastPosition}
                                    onSelectOption={(option) => setToastPosition(option)}
                                />
                                <small className="form-text text-muted">Select where toast notifications should appear on the screen</small>
                            </div>

                            <div className="mb-5">
                                <label className="form-label">Default Toast Duration (milliseconds)</label>
                                <SelectDropdown
                                    options={durationOptions}
                                    defaultSelect={3000}
                                    selectedOption={toastDuration}
                                    onSelectOption={(option) => setToastDuration(option)}
                                />
                                <small className="form-text text-muted">How long toast notifications should be displayed before auto-dismissing</small>
                            </div>

                            <div className="mb-5">
                                <label className="form-label">Show Progress Bar</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"yes"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Display a progress bar indicating remaining time [Ex: Yes/No]</small>
                            </div>

                            <div className="mb-5">
                                <label className="form-label">Pause on Hover</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"yes"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Pause the timer when user hovers over the toast [Ex: Yes/No]</small>
                            </div>

                            <div className="mb-5">
                                <label className="form-label">Show Close Button</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"no"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Display a close button to manually dismiss toasts [Ex: Yes/No]</small>
                            </div>

                            <div className="mb-5">
                                <label className="form-label">Allow Multiple Toasts</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"yes"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Allow multiple toast notifications to be displayed simultaneously [Ex: Yes/No]</small>
                            </div>

                            <hr className="my-5" />

                            <div className="mb-5">
                                <h4 className="fw-bold">Toast Types</h4>
                                <div className="fs-12 text-muted">Configure default behavior for different toast types</div>
                            </div>

                            <div className="mb-5">
                                <label className="form-label">Success Toast Icon</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"yes"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Show icon for success toast notifications [Ex: Yes/No]</small>
                            </div>

                            <div className="mb-5">
                                <label className="form-label">Error Toast Icon</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"yes"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Show icon for error toast notifications [Ex: Yes/No]</small>
                            </div>

                            <div className="mb-5">
                                <label className="form-label">Warning Toast Icon</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"yes"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Show icon for warning toast notifications [Ex: Yes/No]</small>
                            </div>

                            <div className="mb-5">
                                <label className="form-label">Info Toast Icon</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"yes"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Show icon for info toast notifications [Ex: Yes/No]</small>
                            </div>

                            <div className="mb-0">
                                <label className="form-label">Backdrop</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"no"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Show backdrop behind toast notifications [Ex: Yes/No]</small>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </PerfectScrollbar>
        </div>
    )
}

export default SettingsToastForm


