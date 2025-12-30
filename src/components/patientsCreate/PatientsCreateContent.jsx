import React, { useState } from 'react'
import TabProfile from './TabProfile'
// import TabPassword from './TabPassword'
// import TabBilling from './TabBilling'
import TabVaccine from './TabVaccine'
// import TabNotificationsContent from '../customersView/TabNotificationsContent'
// import TabConnections from '../customersView/TabConnections'
// import TabBillingContent from '../customersView/TabBillingContent'

const PatientsCreateContent = () => {
    const [activeTab, setActiveTab] = useState("profile");
    const [currentPatient, setCurrentPatient] = useState(null);

    return (
        <div className="col-lg-8">
            <div className="card border-top-0">
                {/* Tabs Header */}
                <div className="card-header p-0">
                    <ul className="nav nav-tabs flex-wrap w-100 text-center customers-nav-tabs">
                        <li className="nav-item flex-fill border-top">
                            <a
                                className={`nav-link ${activeTab === "profile" ? "active" : ""} px-5`}
                                onClick={() => setActiveTab("profile")}
                            >
                                Profile
                            </a>
                        </li>
                        <li className="nav-item flex-fill border-top">
                            <a
                                className={`nav-link ${activeTab === "vaccines" ? "active" : ""}`}
                                onClick={() => setActiveTab("vaccines")}
                            >
                                Vaccines
                            </a>
                        </li>
                        {/* <li className="nav-item flex-fill border-top">
                            <a
                                className={`nav-link ${activeTab === "password" ? "active" : ""}`}
                                onClick={() => setActiveTab("password")}
                            >
                                Password
                            </a>
                        </li>
                        <li className="nav-item flex-fill border-top">
                            <a
                                className={`nav-link ${activeTab === "billing" ? "active" : ""}`}
                                onClick={() => setActiveTab("billing")}
                            >
                                Billing & Shipping
                            </a>
                        </li>
                        <li className="nav-item flex-fill border-top">
                            <a
                                className={`nav-link ${activeTab === "subscription" ? "active" : ""}`}
                                onClick={() => setActiveTab("subscription")}
                            >
                                Subscription
                            </a>
                        </li>
                        <li className="nav-item flex-fill border-top">
                            <a
                                className={`nav-link ${activeTab === "notifications" ? "active" : ""}`}
                                onClick={() => setActiveTab("notifications")}
                            >
                                Notifications
                            </a>
                        </li>
                        <li className="nav-item flex-fill border-top">
                            <a
                                className={`nav-link ${activeTab === "connection" ? "active" : ""}`}
                                onClick={() => setActiveTab("connection")}
                            >
                                Connection
                            </a>
                        </li> */}
                    </ul>
                </div>

                {/* Tabs Content */}
                <div className="tab-content">
                    {activeTab === "profile" && <TabProfile setActiveTab={setActiveTab} setCurrentPatient={setCurrentPatient} />}
                    {activeTab === "vaccines" && <TabVaccine patient={currentPatient} />}
                    {/* {activeTab === "password" && <TabPassword />}
                    {activeTab === "billing" && <TabBilling />}
                    {activeTab === "subscription" && <TabBillingContent />}
                    {activeTab === "notifications" && <TabNotificationsContent />}
                    {activeTab === "connection" && <TabConnections />} */}
                </div>
            </div>
        </div>
    )
}

export default PatientsCreateContent
