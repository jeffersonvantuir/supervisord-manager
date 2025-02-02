import { Form, Input, Button, Card } from 'antd';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { setItemToStorage } from '@/helpers/sessionStorage/setItemToStorage';
import { SessionStorageKeys } from '@/interface/SessionStorageKeys';

import api from '@/services/api';

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (values: { email: string; password: string }) => {
        setLoading(true);
        try {
            const response = await api.post('/api/login', values);
            const token = response.data.token;

            setItemToStorage(SessionStorageKeys.JwtToken, token)

            setLoading(false);
            router.push('/dashboard');
        } catch (error) {
            setLoading(false);
        }
    };

    const handleRegisterRedirect = () => {
        router.push('/register');
    };

    return (
        <div style={styles.container}>
            <div style={styles.backgroundOverlay}>
                <Card style={styles.card}>
                    <div style={styles.logoContainer}>
                        {/* Substitua pelo seu logo */}
                        <img src="/Brasil_TecPar.png" alt="Logo" style={styles.logo} />
                        <h1 style={styles.title}>Bem-vindo</h1>
                    </div>
                    <Form
                        layout="vertical"
                        onFinish={handleLogin}
                        style={styles.form}
                    >
                        <Form.Item
                            label="Usuário"
                            name="username"
                            rules={[{ required: true, message: 'Por favor, insira seu usuário!' }]}
                        >
                            <Input placeholder="Digite seu usuário" />
                        </Form.Item>

                        <Form.Item
                            label="Senha"
                            name="password"
                            rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
                        >
                            <Input.Password placeholder="Digite sua senha" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} block>
                                Entrar
                            </Button>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="link"
                                onClick={handleRegisterRedirect}
                                style={styles.registerButton}
                                block
                            >
                                Cadastre-se
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'rgb(0, 21, 41)',
    },
    backgroundOverlay: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to right, rgba(0, 21, 41, 0.85), rgba(0, 41, 85, 0.85))',
    },
    card: {
        width: 400,
        padding: 20,
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        borderRadius: 10,
        backgroundColor: '#fff',
    },
    logoContainer: {
        textAlign: 'center' as const,
        marginBottom: 20,
    },
    logo: {
        width: 80,
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'rgb(0, 21, 41)',
    },
    form: {
        width: '100%',
    },
    registerButton: {
        textAlign: 'center' as const,
        color: 'rgb(0, 21, 41)',
        fontWeight: 'bold',
    },
};

export default LoginPage;
