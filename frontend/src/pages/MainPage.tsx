import { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { axiosClientWithAuth } from "../api/client/axiosClient";
import AuthService from "../api/services/authService";

function MainPage() {
    const navigate = useNavigate();
    const authService = new AuthService(axiosClientWithAuth);
    const [user, setUser] = useState<{ id: string, name: string } | null>(null);
    const { streamId } = useParams()

    useEffect(() => {
        authService.getCurrentUser().then((res) => {
            setUser(res.data);
        }).catch((error) => {
            console.error('Error fetching current user:', error);
            navigate('/auth/login');
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])



    return user && (
        <>
            <Outlet />
        </>
    );
}

export default MainPage;