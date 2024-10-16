import { Outlet } from "react-router-dom";
import AdminSidebar from "./sidebars/AdminSidebar.jsx";

const StudentHome= () => {
    return <div style={{
        padding: '50px 0px 0px 370px'
    }}>
        <AdminSidebar />
        <Outlet />

    </div>;
};

export default StudentHome;