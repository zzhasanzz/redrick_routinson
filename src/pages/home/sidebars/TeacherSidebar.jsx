import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './teacherSidebar.scss';

const sidebarNavItems = [
    {
        display: 'Dashboard',
        icon: <i className='bx bx-home'></i>,
        to: '/teacher-home/teacher-dashboard', // Full route path
        section: 'dashboard'
    },
    {
        display: 'My Events',
        icon: <i className='bx bx-star'></i>,
        to: '/teacher-home/myevents', // Add full path
        section: 'myevents'
    },
    {
        display: 'Calendar',
        icon: <i className='bx bx-calendar'></i>,
        to: '/teacher-home/calendar', // Add full path
        section: 'calendar'
    },
    {
        display: 'User',
        icon: <i className='bx bx-user'></i>,
        to: '/login', // Add full path
        section: 'user'
    },
    {
        display: 'Logout',
        icon: <i className='bx bx-receipt'></i>,
        to: '/teacher-home/logout', // Add full path
        section: 'logout'
    },
];

const TeacherSidebar = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [stepHeight, setStepHeight] = useState(0);
    const sidebarRef = useRef();
    const indicatorRef = useRef();
    const location = useLocation();

    useEffect(() => {
        // Set the initial height of the indicator based on the first menu item
        const sidebarItem = sidebarRef.current.querySelector('.sidebar__menu__item');
        if (sidebarItem) {
            indicatorRef.current.style.height = `${sidebarItem.clientHeight}px`;
            setStepHeight(sidebarItem.clientHeight);
        }
    }, []);

    // Update active index based on the current route
    useEffect(() => {
        const curPath = window.location.pathname;
        const activeItem = sidebarNavItems.findIndex(item => curPath.includes(item.to));
        setActiveIndex(activeItem === -1 ? 0 : activeItem); // Default to first if no match
    }, [location]);

    return (
        <div className='sidebar'>
            <div className="sidebar__logo">
                RoutineSon
            </div>
            <div ref={sidebarRef} className="sidebar__menu">
                {/* Indicator bar */}
                <div
                    ref={indicatorRef}
                    className="sidebar__menu__indicator"
                    style={{
                        transform: `translateX(-50%) translateY(${activeIndex * stepHeight}px)`
                    }}
                ></div>

                {/* Render Sidebar Items */}
                {sidebarNavItems.map((item, index) => (
                    <Link to={item.to} key={index}>
                        <div className={`sidebar__menu__item ${activeIndex === index ? 'active' : ''}`}>
                            <div className="sidebar__menu__item__icon">
                                {item.icon}
                            </div>
                            <div className="sidebar__menu__item__text">
                                {item.display}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default TeacherSidebar;
