import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
// import "bootstrap/dist/css/bootstrap.min.css";
// import * as bootstrap from 'bootstrap'
// import './assets/scss/theme.scss'
import "./styles/index.scss";
import { AppointmentProvider } from "./context/AppointmentContext.jsx";
import { MedicinesProvider } from "./context/MedicinesContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { ReceptionistProvider } from "./context/ReceptionistContext";
import { AccountantProvider } from "./context/AccountantContext";
import { LeadsProvider } from "./context/LeadsContext";
import { VaccineProvider } from './context/VaccineContext.jsx';
import { MessageProvider } from "./context/MessageContext.jsx";
import { PatientProvider } from "./context/PatientContext.jsx";
import { AuthProvider } from './contentApi/AuthContext.jsx';
// import { GoogleOAuthProvider } from '@react-oauth/google';

// const GOOGLE_CLIENT_ID = "18351737752-ho07fhh5hl8gfgdsu70rncfkgfng9808.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}> */}
      <AuthProvider>
        <PatientProvider>
          <MessageProvider>
            <AppointmentProvider>
              <MedicinesProvider>
                <NotificationProvider>
                  <ReceptionistProvider>
                    <AccountantProvider>
                      <VaccineProvider >
                        <LeadsProvider>
                          <App />
                        </LeadsProvider>
                      </VaccineProvider>
                    </AccountantProvider>
                  </ReceptionistProvider>
                </NotificationProvider>
              </MedicinesProvider>
            </AppointmentProvider>
          </MessageProvider>
        </PatientProvider>
      </AuthProvider>
    {/* </GoogleOAuthProvider> */}
  </StrictMode>
);