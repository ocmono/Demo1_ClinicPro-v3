import React, { useState } from 'react'
import Footer from '@/components/shared/Footer'
import PageHeaderSetting from '@/components/shared/pageHeader/PageHeaderSetting'
import PerfectScrollbar from 'react-perfect-scrollbar'
import SelectDropdown from '@/components/shared/SelectDropdown'
import InputTopLabel from '@/components/shared/InputTopLabel'
import { settingOptions } from './settingsEmailForm'

const SettingsNotificationsForm = () => {
    const [selectedOption, setSelectedOption] = useState(null)
    const [notificationSound, setNotificationSound] = useState(null)

    const soundOptions = [
        { value: "default", label: "Default" },
        { value: "chime", label: "Chime" },
        { value: "bell", label: "Bell" },
        { value: "none", label: "None" },
    ]

    return (
        <div className="content-area" data-scrollbar-target="#psScrollbarInit">
            <PerfectScrollbar>
                <PageHeaderSetting />
                <div className="content-area-body">
                    <div className="card mb-0">
                        <div className="card-body">
                            <div className="mb-5">
                                <h4 className="fw-bold">Notification Management</h4>
                                <div className="fs-12 text-muted">Configure notification settings and preferences</div>
                            </div>

                            <div className="mb-5">
                                <label className="form-label">Enable Notifications</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"yes"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Enable or disable the notification system [Ex: Yes/No]</small>
                            </div>

                            <div className="mb-5">
                                <label className="form-label">Enable Desktop Notifications</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"no"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Allow browser to show desktop notifications [Ex: Yes/No]</small>
                            </div>

                            <div className="mb-5">
                                <label className="form-label">Enable Real-Time Notifications</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"yes"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Enable real-time push notifications [Ex: Yes/No]</small>
                            </div>

                            <div className="mb-5">
                                <label className="form-label">Notification Sound</label>
                                <SelectDropdown
                                    options={soundOptions}
                                    defaultSelect={"default"}
                                    selectedOption={notificationSound}
                                    onSelectOption={(option) => setNotificationSound(option)}
                                />
                                <small className="form-text text-muted">Select the sound to play when a notification arrives</small>
                            </div>

                            <div className="mb-5">
                                <label className="form-label">Auto-Mark as Read</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"no"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Automatically mark notifications as read after viewing [Ex: Yes/No]</small>
                            </div>

                            <div className="mb-5">
                                <label className="form-label">Show Notification Badge</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"yes"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Display unread count badge on notification icon [Ex: Yes/No]</small>
                            </div>

                            <hr className="my-5" />

                            <div className="mb-5">
                                <h4 className="fw-bold">Notification Types</h4>
                                <div className="fs-12 text-muted">Configure which types of notifications to receive</div>
                            </div>

                            <div className="mb-5">
                                <label className="form-label">Appointment Notifications</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"yes"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Receive notifications for appointment updates [Ex: Yes/No]</small>
                            </div>

                            <div className="mb-5">
                                <label className="form-label">Patient Notifications</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"yes"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Receive notifications for patient-related updates [Ex: Yes/No]</small>
                            </div>

                            <div className="mb-5">
                                <label className="form-label">Prescription Notifications</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"yes"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Receive notifications for prescription updates [Ex: Yes/No]</small>
                            </div>

                            <div className="mb-5">
                                <label className="form-label">Payment Notifications</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"yes"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Receive notifications for payment updates [Ex: Yes/No]</small>
                            </div>

                            <div className="mb-5">
                                <label className="form-label">System Notifications</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"yes"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Receive system and administrative notifications [Ex: Yes/No]</small>
                            </div>

                            <hr className="my-5" />

                            <div className="mb-5">
                                <h4 className="fw-bold">Notification Polling</h4>
                                <div className="fs-12 text-muted">Configure how often the system checks for new notifications</div>
                            </div>

                            <InputTopLabel
                                label={"Polling Interval (seconds)"}
                                placeholder={"60"}
                                info={"How often to check for new notifications (in seconds) [Ex: 60]"}
                            />

                            <div className="mb-5">
                                <label className="form-label">Enable Background Polling</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"yes"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Continue checking for notifications when tab is in background [Ex: Yes/No]</small>
                            </div>

                            <hr className="my-5" />

                            <div className="mb-5">
                                <h4 className="fw-bold">Notification Display</h4>
                                <div className="fs-12 text-muted">Configure how notifications are displayed</div>
                            </div>

                            <div className="mb-5">
                                <InputTopLabel
                                    label={"Maximum Visible Notifications"}
                                    placeholder={"10"}
                                    info={"Maximum number of notifications to display in the notification panel [Ex: 10]"}
                                />
                            </div>

                            <div className="mb-5">
                                <label className="form-label">Group Similar Notifications</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"yes"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Group similar notifications together [Ex: Yes/No]</small>
                            </div>

                            <div className="mb-0">
                                <label className="form-label">Show Timestamp</label>
                                <SelectDropdown
                                    options={settingOptions}
                                    defaultSelect={"yes"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Display timestamp on each notification [Ex: Yes/No]</small>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </PerfectScrollbar>
        </div>
    )
}

export default SettingsNotificationsForm

