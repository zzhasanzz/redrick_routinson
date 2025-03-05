import { useEffect, useRef, useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext"; // Import the AuthContext
import "./studentSIdebar.scss";
import { db } from "../../../firebase.js"; // Import Firestore
import { doc, getDoc } from "firebase/firestore";

const sidebarNavItems = [
  {
    display: "Dashboard",
    icon: <i className="bx bx-home"></i>,
    to: "/student-home/student-dashboard", // Full route path
    section: "dashboard",
  },
  {
    display: "My Events",
    icon: <i className="bx bx-star"></i>,
    to: "/student-home/myevents", // Add full path
    section: "myevents",
  },
  {
    display: "Calendar",
    icon: <i className="bx bx-calendar"></i>,
    to: "/student-home/calendar", // Add full path
    section: "calendar",
  },
  {
    display: "Scanner",
    icon: <i className="bx bx-calendar"></i>,
    to: "/student-home/scanner", // Add full path
    section: "Scanner",
  },
  {
    display: "User",
    icon: <i className="bx bx-user"></i>,
    to: "/student-home/user", // Add full path
    section: "user",
  },
  {
    display: "Logout",
    icon: <i className="bx bx-receipt"></i>,
    to: "/login", // Add full path
    section: "logout",
  },
];

const Sidebar = () => {
  const { currentUser } = useContext(AuthContext); // Access current user from context
  const [activeIndex, setActiveIndex] = useState(0);
  const [stepHeight, setStepHeight] = useState(0);
  const sidebarRef = useRef();
  const indicatorRef = useRef();
  const location = useLocation();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Fetch user data from Firestore
    const fetchUserData = async () => {
      if (currentUser?.email) {
        const userDocRef = doc(db, "users", currentUser.email);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          setUserData(userSnapshot.data()); // Store user data in state
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    // Set the initial height of the indicator based on the first menu item
    const sidebarItem = sidebarRef.current.querySelector(
      ".sidebar__menu__item"
    );
    if (sidebarItem) {
      indicatorRef.current.style.height = `${sidebarItem.clientHeight}px`;
      setStepHeight(sidebarItem.clientHeight);
    }
  }, []);

  // Update active index based on the current route
  useEffect(() => {
    const curPath = window.location.pathname;
    const activeItem = sidebarNavItems.findIndex((item) =>
      curPath.includes(item.to)
    );
    setActiveIndex(activeItem === -1 ? 0 : activeItem); // Default to first if no match
  }, [location]);

  return (
    <div className="sidebar">
      <div className="sidebar__logo">RoutineSon</div>

      {/* Display User Info (username, email, profile picture) */}
      {currentUser && (
        <div className="sidebar__user-info">
          <img
            src={userData?.profilePic || "https://via.placeholder.com/150"}
            alt="Profile"
            className="sidebar__user-info__image"
          />
          <div className="sidebar__user-info__details">
            <p className="sidebar__user-info__name">{userData?.displayName}</p>
            <p className="sidebar__user-info__email">{currentUser.email}</p>
          </div>
        </div>
      )}

      <div ref={sidebarRef} className="sidebar__menu">
        {/* Indicator bar */}
        <div
          ref={indicatorRef}
          className="sidebar__menu__indicator"
          style={{
            transform: `translateX(-50%) translateY(${
              activeIndex * stepHeight
            }px)`,
            backgroundColor: "#d9f3fc",
          }}
        ></div>

        {/* Render Sidebar Items */}
        {sidebarNavItems.map((item, index) => (
          <Link to={item.to} key={index}>
            <div
              className={`sidebar__menu__item ${
                activeIndex === index ? "active" : ""
              }`}
            >
              <div className="sidebar__menu__item__icon">{item.icon}</div>
              <div className="sidebar__menu__item__text">{item.display}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
