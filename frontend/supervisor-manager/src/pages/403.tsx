import { Button, Typography, Result } from 'antd';
import { useRouter } from 'next/router';
import { FrownOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Error403Page: React.FC = () => {
    const router = useRouter();

    const goToHome = () => {
        router.push('/dashboard');
    };

    return (
        <div style={styles.container}>
            <Result
                status="403"
                icon={<FrownOutlined style={styles.icon} />}
                title={<Title level={2}>Acesso Negado</Title>}
                subTitle={
                    <Paragraph>
                        Você não tem permissão para acessar esta página. Se acredita que isso é um erro, entre em
                        contato com o administrador do sistema.
                    </Paragraph>
                }
                extra={
                    <Button type="primary" size="large" onClick={goToHome}>
                        Voltar para a Página Inicial
                    </Button>
                }
            />
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(to right, #f0f2f5, #e6e6e6)',
        padding: '20px',
    },
    icon: {
        fontSize: '72px',
        color: '#faad14',
    },
};

export default Error403Page;
