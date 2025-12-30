import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './route/router'
import 'react-quill/dist/quill.snow.css';
import 'react-circular-progressbar/dist/styles.css';
import "react-perfect-scrollbar/dist/css/styles.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-datetime/css/react-datetime.css";
import NavigationProvider from './contentApi/navigationProvider';
import SideBarToggleProvider from './contentApi/sideBarToggleProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppointmentProvider } from "./context/AppointmentContext";
import { BookingProvider } from "./contentApi/BookingProvider.jsx";
import { ClinicManagementProvider } from "./contentApi/ClinicMnanagementProvider";
import { PrescriptionProvider } from "./contentApi/PrescriptionProvider";
import { AuthProvider } from "./contentApi/AuthContext";
import { PurchaseOrdersProvider } from './contentApi/PurchaseOrdersProvider.jsx';
import { SuppliersProvider } from './contentApi/SuppliersProvider.jsx';
import { ManufacturersProvider } from './contentApi/ManufacturersProvider.jsx';
import { PharmacyProvider } from './contentApi/PharmacyProvider.jsx';
import { PatientProvider } from "./context/PatientContext";
import { ActivityProvider } from './context/ActivityContext';
import { UserProvider } from './context/UserContext';
import { TestProvider } from './context/TestContext';
import { NotificationProvider } from './context/NotificationContext';
// import { WhatsAppProvider } from './context/WhatsAppContext';
// import { ChatProvider } from './context/ChatContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const App = () => {
  return (
    <>
      <AuthProvider>
       <GoogleOAuthProvider clientId="119234893254-uif5komtt25fup3s216qdrcf71alijaq.apps.googleusercontent.com">
          <PrescriptionProvider>
            <ClinicManagementProvider>
              <UserProvider>
                <BookingProvider>
                  <AppointmentProvider>
                    <PatientProvider>
                      <SuppliersProvider>
                        <NotificationProvider>
                          <ManufacturersProvider>
                            <TestProvider>
                              <PharmacyProvider>
                                <ActivityProvider>
                                  {/* <WhatsAppProvider> */}  
                                    {/* <ChatProvider> */}
                                      <PurchaseOrdersProvider>
                                        <NavigationProvider>
                                          <SideBarToggleProvider>
                                            <RouterProvider router={router} />
                                          <ToastContainer
                                            position="bottom-right"
                                            autoClose={3000}
                                            hideProgressBar={false}
                                            newestOnTop={false}
                                            closeOnClick
                                            pauseOnFocusLoss
                                            draggable
                                            pauseOnHover
                                            theme="light"
                                          />
                                          </SideBarToggleProvider>
                                        </NavigationProvider>
                                      </PurchaseOrdersProvider>
                                    {/* </ChatProvider> */}
                                  {/* </WhatsAppProvider> */}
                                </ActivityProvider>
                              </PharmacyProvider>
                            </TestProvider>
                          </ManufacturersProvider>
                        </NotificationProvider>
                      </SuppliersProvider>
                    </PatientProvider>
                    {/* <ThemeCustomizer /> */}
                  </AppointmentProvider>
                </BookingProvider>
              </UserProvider>
            </ClinicManagementProvider>
          </PrescriptionProvider>
        </GoogleOAuthProvider>
      </AuthProvider>
    </>
  )
}

export default App