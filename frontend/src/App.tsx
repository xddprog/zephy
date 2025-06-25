import { ConfigProvider, theme } from 'antd'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import MainPage from './pages/MainPage'
import CreateStream from './pages/stream/CreateStream'
import StreamPage from './pages/stream/StreamPage'
import { UserProvider } from './stores/providers'

function App() {

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    colorPrimary: '#006eff',
                    colorBgContainer: '#17191b',
                },
            }}

        >
            <UserProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/auth/register" element={<RegisterPage></RegisterPage>}></Route>
                        <Route path="/auth/login" element={<LoginPage></LoginPage>}></Route>
                        <Route path="/" element={<MainPage></MainPage>}>
                            <Route path="stream/:streamId" element={<StreamPage></StreamPage>}></Route>
                            <Route path='stream/create' element={<CreateStream></CreateStream>}></Route>
                        </Route>
                    </Routes>
                </BrowserRouter>
            </UserProvider>

        </ConfigProvider>
    )
}

export default App
