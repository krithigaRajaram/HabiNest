import { Outlet, Navigate } from "react-router-dom";
const ProtectedRoutes = () => {
    const token = localStorage.getItem("token");
    const isAuthenticated = token && token.trim().length > 0;
    return isAuthenticated ? <Outlet/> : <Navigate to="/login"/>
}
 
export default ProtectedRoutes;