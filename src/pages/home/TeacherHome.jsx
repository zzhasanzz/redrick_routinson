import { Outlet } from "react-router-dom";
import TeacherSidebar from "./sidebars/TeacherSidebar.jsx";

const TeacherHome= () => {
    return <div style={{
        padding: '50px 0px 0px 370px'
    }}>
        <TeacherSidebar/>
        <Outlet />

    </div>;
};

export default TeacherHome;