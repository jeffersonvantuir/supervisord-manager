import { Form, Input, Button, Card } from 'antd';
import { useRouter } from 'next/router';
import { useState } from 'react';

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (values: { email: string; password: string }) => {
        setLoading(true);
        try {
            setTimeout(() => {
                setLoading(false);
                router.push('/dashboard'); // Redireciona após login
            }, 1000);
        } catch (error) {
            setLoading(false);
            console.error('Erro ao fazer login:', error);
        }
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
                            name="email"
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
};

export default LoginPage;
