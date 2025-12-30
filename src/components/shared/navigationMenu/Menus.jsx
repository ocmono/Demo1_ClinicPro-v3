// import React, { Fragment, useEffect, useState } from "react";
// import { FiChevronRight } from "react-icons/fi";
// import { Link, useLocation } from "react-router-dom";
// import { menuList } from "@/utils/fackData/menuList";
// import getIcon from "@/utils/getIcon";


// const Menus = () => {
//     const [openDropdown, setOpenDropdown] = useState(null);
//     const [openSubDropdown, setOpenSubDropdown] = useState(null);
//     const [activeParent, setActiveParent] = useState("");
//     const [activeChild, setActiveChild] = useState("");
//     const pathName = useLocation().pathname;

//     const handleMainMenu = (e, name) => {
//         e.stopPropagation(); // Prevent bubbling to parent
//         if (openDropdown === name) {
//             setOpenDropdown(null);
//             setOpenSubDropdown(null);
//         } else {
//             setOpenDropdown(name);
//             setOpenSubDropdown(null);
//         }
//     };

//     const handleDropdownMenu = (e, name) => {
//         e.stopPropagation();
//         if (openSubDropdown === name) {
//             setOpenSubDropdown(null);
//         } else {
//             setOpenSubDropdown(name);
//         }
//     };

//     useEffect(() => {
//         if (pathName !== "/") {
//             const x = pathName.split("/");
//             setActiveParent(x[1]);
//             setActiveChild(x[2]);
//             setOpenDropdown(x[1]);
//             setOpenSubDropdown(x[2]);
//         } else {
//             setActiveParent("dashboards");
//             setOpenDropdown("dashboards");
//         }
//     }, [pathName]);

//     return (
//         <>
//             {menuList.map(({ dropdownMenu, name, path, icon }, i) => {
//                 return (
//                     <li
//                         key={`main-${i}`}
//                         onClick={(e) => handleMainMenu(e, name)}
//                         className={`nxl-item nxl-hasmenu ${activeParent === name ? "active nxl-trigger" : ""}`}
//                     >
//                         <Link to={path} className="nxl-link text-capitalize">
//                             <span className="nxl-micon"> {getIcon(icon)} </span>
//                             <span className="nxl-mtext" style={{ paddingLeft: "2.5px" }}>
//                                 {name}
//                             </span>
//                             {/* <span className="nxl-arrow fs-16">
//                                 <FiChevronRight />
//                             </span> */}
//                             {Array.isArray(dropdownMenu) && dropdownMenu.length > 0 && (
//                                 <span className="nxl-arrow fs-16">
//                                     <FiChevronRight />
//                                 </span>
//                             )}
//                         </Link>
//                         <ul
//                             className={`nxl-submenu ${openDropdown === name ? "nxl-menu-visible" : "nxl-menu-hidden"}`}
//                         >
//                             {dropdownMenu.map(({ id, name, path, subdropdownMenu }, i) => {
//                                 const x = name;
//                                 return (
//                                     <Fragment key={`dropdown-${id}-${i}`}>
//                                         {subdropdownMenu.length ? (
//                                             <li
//                                                 className={`nxl-item nxl-hasmenu ${activeChild === name ? "active" : ""
//                                                     }`}
//                                                 onClick={(e) => { e.stopPropagation(); handleDropdownMenu(e, x); }}
//                                             >
//                                                 <Link to={path} className={`nxl-link text-capitalize`}>
//                                                     <span className="nxl-mtext">{name}</span>
//                                                     <span className="nxl-arrow">
//                                                         <i>
//                                                             {" "}
//                                                             <FiChevronRight />
//                                                         </i>
//                                                     </span>
//                                                 </Link>
//                                                 {subdropdownMenu.map(({ id, name, path }, j) => {
//                                                     return (
//                                                         <ul
//                                                             key={`subdropdown-${id}-${j}`}
//                                                             className={`nxl-submenu ${openSubDropdown === x ? "nxl-menu-visible" : "nxl-menu-hidden "}`}
//                                                         >
//                                                             <li className={`nxl-item ${pathName === path ? "active" : ""}`}
//                                                                 onClick={e => e.stopPropagation()} // Prevent bubbling for sub-submenu
//                                                             >
//                                                                 <Link className="nxl-link text-capitalize" to={path}>{name}</Link>
//                                                             </li>
//                                                         </ul>
//                                                     );
//                                                 })}
//                                             </li>
//                                         ) : (
//                                             <li className={`nxl-item ${pathName === path ? "active" : ""}`}>
//                                                 <Link className="nxl-link text-capitalize" to={path}>{name}</Link>
//                                             </li>
//                                         )}
//                                     </Fragment>
//                                 );
//                             })}
//                         </ul>
//                     </li>
//                 );
//             })}
//         </>
//     );
// };

// export default Menus;

import React, { Fragment, useEffect, useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { menuList } from "@/utils/fackData/menuList";
import getIcon from "@/utils/getIcon";
import { useAuth } from "../../../contentApi/AuthContext";

const Menus = () => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [openSubDropdown, setOpenSubDropdown] = useState(null);
    const [activeParent, setActiveParent] = useState("");
    const [activeChild, setActiveChild] = useState("");
    const pathName = useLocation().pathname;
    const { user } = useAuth();

    const isMenuItemAllowed = (menuItem) => {
        // If no allowedRoles specified, allow for all roles
        if (!menuItem.allowedRoles || menuItem.allowedRoles.length === 0) {
            return true;
        }

        // Check if current user's role is in allowedRoles
        const userRole = user?.role?.toLowerCase();
        return menuItem.allowedRoles.map(role => role.toLowerCase()).includes(userRole);
    };

    const filteredMenuList = menuList.map(menu => {
        // If menu has dropdown items, filter them
        if (menu.dropdownMenu && menu.dropdownMenu.length > 0) {
            const filteredDropdown = menu.dropdownMenu.filter(isMenuItemAllowed);

            // Only show the main menu if it has at least one allowed dropdown item
            if (filteredDropdown.length > 0) {
                return {
                    ...menu,
                    dropdownMenu: filteredDropdown
                };
            }
            return null; // Hide entire menu if no allowed dropdown items
        }

        // For menus without dropdown, check if allowed
        return isMenuItemAllowed(menu) ? menu : null;
    }).filter(menu => menu !== null); // Remove null items

    const handleMainMenu = (e, name) => {
        e.stopPropagation();
        if (openDropdown === name) {
            setOpenDropdown(null);
            setOpenSubDropdown(null); // Close subdropdown when main menu closes
        } else {
            setOpenDropdown(name);
            setOpenSubDropdown(null); // Reset subdropdown when opening new main menu
        }
    };

    const handleDropdownMenu = (e, name) => {
        e.stopPropagation();
        if (openSubDropdown === name) {
            setOpenSubDropdown(null);
        } else {
            setOpenSubDropdown(name);
        }
    };

    // Handle direct link clicks (items without submenus)
    const handleDirectLinkClick = (e) => {
        e.stopPropagation();
        // Close all dropdowns when clicking a direct link
        setOpenDropdown(null);
        setOpenSubDropdown(null);
    };

    useEffect(() => {
        if (pathName !== "/") {
            const pathParts = pathName.split("/").filter(part => part !== "");
            setActiveParent(pathParts[0] || "");
            setActiveChild(pathParts[1] || "");

            // Find the current menu item and set appropriate dropdown states
            const currentMenu = menuList.find(menu =>
                menu.path === pathName ||
                (menu.dropdownMenu && menu.dropdownMenu.some(item => item.path === pathName)) ||
                (menu.dropdownMenu && menu.dropdownMenu.some(item =>
                    item.subdropdownMenu &&
                    Array.isArray(item.subdropdownMenu) &&
                    item.subdropdownMenu.some(sub => sub.path === pathName)
                ))
            );

            if (currentMenu) {
                setOpenDropdown(currentMenu.name);

                // Find if current path is in a subdropdown
                const subMenuItem = currentMenu.dropdownMenu?.find(item =>
                    item.subdropdownMenu &&
                    Array.isArray(item.subdropdownMenu) &&
                    item.subdropdownMenu.some(sub => sub.path === pathName)
                );

                if (subMenuItem) {
                    setOpenSubDropdown(subMenuItem.name);
                } else {
                    setOpenSubDropdown(null);
                }
            }
        } else {
            setActiveParent("dashboards");
            setOpenDropdown("dashboards");
            setOpenSubDropdown(null);
        }
    }, [pathName]);

    return (
        <>
            {filteredMenuList.map(({ dropdownMenu, name, path, icon }, i) => {
                return (
                    <li
                        key={`main-${i}`}
                        className={`nxl-item nxl-hasmenu ${activeParent === name ? "active nxl-trigger" : ""}`}
                    >
                        <Link
                            to={path}
                            className="nxl-link text-capitalize"
                            onClick={(e) => {
                                if (dropdownMenu && dropdownMenu.length > 0) {
                                    handleMainMenu(e, name);
                                } else {
                                    handleDirectLinkClick(e);
                                }
                            }}
                        >
                            <span className="nxl-micon"> {getIcon(icon)} </span>
                            <span className="nxl-mtext" style={{ paddingLeft: "2.5px" }}>
                                {name}
                            </span>
                            {Array.isArray(dropdownMenu) && dropdownMenu.length > 0 && (
                                <span className="nxl-arrow fs-16">
                                    <FiChevronRight />
                                </span>
                            )}
                        </Link>
                        <ul
                            className={`nxl-submenu ${openDropdown === name ? "nxl-menu-visible" : "nxl-menu-hidden"}`}
                        >
                            {dropdownMenu.map(({ id, name, path, subdropdownMenu }, i) => {
                                // Check if subdropdownMenu exists and is an array with items
                                const hasSubmenu = subdropdownMenu &&
                                    Array.isArray(subdropdownMenu) &&
                                    subdropdownMenu.length > 0;

                                return (
                                    <Fragment key={`dropdown-${id}-${i}`}>
                                        {hasSubmenu ? (
                                            <li
                                                className={`nxl-item nxl-hasmenu ${activeChild === name ? "active" : ""}`}
                                            >
                                                <Link
                                                    to={path}
                                                    className="nxl-link text-capitalize"
                                                    onClick={(e) => {
                                                        e.preventDefault(); // Prevent navigation for parent items with submenus
                                                        handleDropdownMenu(e, name);
                                                    }}
                                                >
                                                    <span className="nxl-mtext">{name}</span>
                                                    <span className="nxl-arrow">
                                                        <i>
                                                            <FiChevronRight />
                                                        </i>
                                                    </span>
                                                </Link>
                                                <ul
                                                    className={`nxl-submenu ${openSubDropdown === name ? "nxl-menu-visible" : "nxl-menu-hidden"}`}
                                                >
                                                    {subdropdownMenu.map(({ id, name, path }, j) => {
                                                        return (
                                                            <li
                                                                key={`subdropdown-${id}-${j}`}
                                                                className={`nxl-item ${pathName === path ? "active" : ""}`}
                                                            >
                                                                <Link
                                                                    className="nxl-link text-capitalize"
                                                                    to={path}
                                                                    onClick={handleDirectLinkClick}
                                                                >
                                                                    {name}
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </li>
                                        ) : (
                                                <li
                                                    className={`nxl-item ${pathName === path ? "active" : ""}`}
                                                >
                                                    <Link
                                                        className="nxl-link text-capitalize"
                                                        to={path}
                                                        onClick={handleDirectLinkClick}
                                                    >
                                                        {name}
                                                    </Link>
                                            </li>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </ul>
                    </li>
                );
            })}
        </>
    );
};

export default Menus;