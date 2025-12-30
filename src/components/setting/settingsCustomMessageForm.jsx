import React, { useState } from 'react'
import PageHeaderSetting from '@/components/shared/pageHeader/PageHeaderSetting'
import InputTopLabel from '@/components/shared/InputTopLabel'
import TextAreaTopLabel from '@/components/shared/TextAreaTopLabel'
import Footer from '@/components/shared/Footer'
import SelectDropdown from '@/components/shared/SelectDropdown'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { settingOptions } from './settingsEmailForm'
import WhatsappMessage from './CustomMessage/WhatsappMessage'
import FollowUpMessage from './CustomMessage/FollowUpMessage'

const SettingCustomMessageForm = () => {
    const [selectedOption, setSelectedOption] = useState(null)
    const options = settingOptions
    return (
        <div className="content-area setting-form">
            <PerfectScrollbar>
                <PageHeaderSetting />
                <div className="content-area-body">
                    <WhatsappMessage />
                    <FollowUpMessage />
                </div>
                <Footer />
            </PerfectScrollbar>
        </div>

    )
}

export default SettingCustomMessageForm