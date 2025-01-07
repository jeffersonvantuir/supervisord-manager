import { Form, Input, Button, Card, message } from 'antd';
import { useRouter } from 'next/router';
import { useState } from 'react';
import api from "@/services/api";

const RegisterPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (values: { name: string; email: string; password: string; enabled: boolean }) => {
        setLoading(true);
        try {
            await api.post('/user/registration', {
                name: values.name,
                email: values.email,
                password: values.password,
                enabled: values.enabled,
            });
            message.success('Cadastro realizado com sucesso!');
            router.push('/login'); // Redireciona para a listagem de usuários
        } catch (error) {
            message.error('Erro ao cadastrar o usuário.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginRedirect = () => {
        router.push('/login');
    }

    return (
        <div style={styles.container}>
            <Card style={styles.card}>
                <h1 style={styles.title}>Cadastro</h1>
                <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                    style={styles.form}
                >
                    <Form.Item
                        label="Nome"
                        name="name"
                        rules={[{ required: true, message: 'Por favor, insira o nome do usuário!' }]}
                    >
                        <Input placeholder="Digite o nome do usuário" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Por favor, insira o email do usuário!' },
                            { type: 'email', message: 'Por favor, insira um email válido!' },
                        ]}
                    >
                        <Input placeholder="Digite o email do usuário" />
                    </Form.Item>

                    <Form.Item
                        label="Senha"
                        name="password"
                        rules={[{ required: true, message: 'Por favor, insira uma senha!' }]}
                    >
                        <Input.Password placeholder="Digite a senha" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Cadastrar
                        </Button>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="link"
                            onClick={handleLoginRedirect}
                            style={styles.loginButton}
                            block
                        >
                            Já possui uma conta? Faça Login!
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f2f5',
    },
    card: {
        width: 400,
        padding: 20,
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        borderRadius: 10,
        backgroundColor: '#fff',
    },
    title: {
        textAlign: 'center' as const,
        marginBottom: 20,
        fontWeight: 'bold',
        fontSize: 20,
        color: '#001529',
    },
    form: {
        width: '100%',
    },
    loginButton: {
        textAlign: 'center' as const,
        color: 'rgb(0, 21, 41)',
        fontWeight: 'bold',
    },
};

export default RegisterPage;
