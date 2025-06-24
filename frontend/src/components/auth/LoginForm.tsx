import { useForm } from "antd/es/form/Form";
import type { LoginUserInterface } from "../../schemas/auth";
import { Button, Form, message, Typography } from "antd";
import Input from "antd/es/input/Input";
import AuthService from "../../api/services/authService";
import { axiosClient } from "../../api/client/axiosClient";
import { useNavigate } from "react-router-dom";

function LoginForm() {
    const [form] = useForm<LoginUserInterface>();
    const authService = new AuthService(axiosClient);
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage()
    
    async function onFinish() {
        console.log(1)
        const userForm = await form.validateFields();
        try {
            await authService.loginUser(userForm).then((res) => {
                messageApi.success(res.data?.message || "Успешный вход в систему");
                localStorage.setItem("access_token", res.data?.access_token || "");
                localStorage.setItem("refresh_token", res.data?.refresh_token || "");
            }).catch((error) => {
                if (error.response) {
                    messageApi.error(error.response.data?.error || "Ошибка входа в систему");
                }
            });
        } catch {
            messageApi.error("Что-то пошло не так")
        }
    }

    return (
        <>
            {contextHolder}
            <Form form={form} className="w-[300px]" onFinish={onFinish}>
                <Typography.Title level={3} className="text-center mb-4">
                    Вход в систему
                </Typography.Title>
                <Form.Item
                    name="email"
                    rules={[{ required: true, message: 'Введите email', type: 'email' }]}
                >
                    <Input placeholder="Email" />
                </Form.Item>
                <Form.Item
                    style={{ marginTop: 0 }}
                    name="password"
                    rules={[{ required: true, message: 'Введите пароль' }]}
                >
                    <Input placeholder="Password" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" className="w-full bg-blue-500">
                        Войти
                    </Button>
                    <Typography.Text className="block text-center mt-4" onClick={onFinish}>
                        Нет аккаунта? <a onClick={() => navigate('/auth/register')}>Зарегистрироваться</a>
                    </Typography.Text>
                </Form.Item>
            </Form>
        </>
    );
}

export default LoginForm;