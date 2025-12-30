import React from 'react'

/**
 * StandardTabs Component - Consistent tab design across the application
 * 
 * @param {Array} tabs - Array of tab objects with { id, label, isActive?, onClick? }
 * @param {string} activeTab - Currently active tab id (optional if using isActive in tabs)
 * @param {function} onTabChange - Callback function when tab is clicked (optional if using onClick in tabs)
 * @param {string} tabsId - Unique ID for the tabs (default: 'standardTabs')
 * @param {string} className - Additional CSS classes for the ul element
 * 
 * @example
 * const tabs = [
 *   { id: 'profile', label: 'Profile' },
 *   { id: 'settings', label: 'Settings' },
 *   { id: 'notifications', label: 'Notifications' }
 * ]
 * 
 * <StandardTabs 
 *   tabs={tabs} 
 *   activeTab={activeTab} 
 *   onTabChange={setActiveTab} 
 * />
 */
const StandardTabs = ({ 
  tabs = [], 
  activeTab = '', 
  onTabChange = null, 
  tabsId = 'standardTabs',
  className = ''
}) => {
  const handleTabClick = (tab) => {
    // Use tab's own onClick if provided, otherwise use onTabChange prop
    if (tab.onClick) {
      tab.onClick(tab)
    } else if (onTabChange) {
      onTabChange(tab.id)
    }
  }

  const isTabActive = (tab) => {
    // Use tab's own isActive if provided, otherwise check against activeTab prop
    return tab.isActive !== undefined ? tab.isActive : tab.id === activeTab
  }

  return (
    <div className="card-header p-0">
      <ul 
        className={`nav nav-tabs flex-wrap w-100 text-center customers-nav-tabs ${className}`} 
        id={tabsId} 
        role="tablist"
      >
        {tabs.map((tab) => (
          <li className="nav-item flex-fill border-top" role="presentation" key={tab.id}>
            <button
              className={`nav-link ${isTabActive(tab) ? 'active' : ''}`}
              onClick={() => handleTabClick(tab)}
              type="button"
              data-bs-toggle="tab"
              data-bs-target={tab.target ? `#${tab.target}` : `#${tab.id}Tab`}
              role="tab"
              aria-controls={tab.target || `${tab.id}Tab`}
              aria-selected={isTabActive(tab)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default StandardTabs