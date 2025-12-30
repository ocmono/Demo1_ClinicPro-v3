// MessagePage.js
import React from "react";
import Footer from "@/components/shared/Footer";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import PageHeaderWidgets from "@/components/shared/pageHeader/PageHeaderWidgets";
import WhatsappMessage from "./WhatsappMessage";
import FollowUpMessage from "./FollowUpMessage";

const MessagePage = () => {
  return (
    <div className="content-area">
      <PageHeader>
        <PageHeaderWidgets />
      </PageHeader>

      <div className="content-area-body">
        <div className="card mb-0">
          <div className="card-body">
            <WhatsappMessage />
            <FollowUpMessage />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MessagePage;
