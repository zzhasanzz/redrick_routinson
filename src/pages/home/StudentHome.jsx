import { Outlet } from "react-router-dom";
import Sidebar from "./sidebars/StudentSidebar.jsx";

const StudentHome= () => {
    return <div style={{
        padding: '50px 0px 0px 370px'
    }}>
        <Sidebar />
        <Outlet />

    </div>;
};

export default StudentHome;