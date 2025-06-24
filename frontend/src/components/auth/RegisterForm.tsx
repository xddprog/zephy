import { useForm } from "antd/es/form/Form";
import type { RegisterUserInterface } from "../../schemas/auth";
import { axiosClient } from "../../api/client/axiosClient";
import AuthService from "../../api/services/authService";
import { Button, Form, Input, message, Typography } from "antd";
import { useNavigate } from "react-router-dom";

function RegisterForm() {
    const [form] = useForm<RegisterUserInterface>();
    const authService = new AuthService(axiosClient);
    const navigate = useNavigate();

    async function onFinish() {
        const userForm = await form.validateFields();
        try {
            await authService.registerUser(userForm).then((res) => {
                message.success(res.data?.message || "Успешная регистрация");
                localStorage.setItem("access_token", res.data?.access_token || "");
                localStorage.setItem("refresh_token", res.data?.refresh_token || "");
            }).catch((error) => {
                if (error.response) {
                    message.error(error.response.data?.message || "Ошибка регистрации");
                }
            });
        } catch {
            message.error("Что-то пошло не так")
        }
    }

    return (
        <Form form={form} className="w-[300px]" onFinish={onFinish}>
            <Typography.Title level={3} className="text-center mb-4">
                Регистрация
            </Typography.Title>
            <Form.Item
                name="username"
                rules={[{ required: true, message: 'Введите username' }]}
            >
                    <Input placeholder="Username" />
            </Form.Item>
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
                    Зарегистрироваться
                </Button>
                <Typography.Text className="block text-center mt-4">
                    Уже есть аккаунт? <a onClick={() => navigate('/auth/login')}>Войти</a>
                </Typography.Text>
            </Form.Item>
        </Form>
    );
}

export default RegisterForm;