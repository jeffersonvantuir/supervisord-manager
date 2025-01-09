import { useState, useEffect } from 'react';
import { Collapse, Card, Row, Col, Statistic, Spin, message } from 'antd';
import api from '@/services/api';

const { Panel } = Collapse;

const DashboardPage: React.FC = () => {
    const [serviceSummary, setServiceSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Função para buscar os dados
    const fetchData = async (isUpdating = false) => {
        if (!isUpdating) setLoading(true); // Apenas mostrar loading na carga inicial
        else setUpdating(true); // Indicar que está atualizando

        try {
            const response = await api.get('/supervisor/summary');
            setServiceSummary(response.data);
        } catch (error) {
            message.error('Erro ao carregar os dados do dashboard.');
            console.error('Erro ao buscar dados:', error);
        } finally {
            if (!isUpdating) setLoading(false);
            setUpdating(false);
        }
    };

    // useEffect para carregar os dados ao montar o componente
    useEffect(() => {
        fetchData();

        // Configurar intervalo para atualizar os dados a cada 5 segundos
        const interval = setInterval(() => {
            fetchData(true); // Atualizar sem loading
        }, 5000);

        // Limpar intervalo ao desmontar o componente
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Dashboard</h1>
            {loading ? (
                <Spin size="large" style={{ display: 'block', margin: 'auto' }} />
            ) : (
                <Collapse
                    accordion={false}
                    defaultActiveKey={serviceSummary.map((group: any) => group.group)} // Abre todos os grupos inicialmente
                >
                    {serviceSummary.map((group: any) => (
                        <Panel
                            header={`${group.group} (Total: ${group.total_processes})`}
                            key={group.group}
                            extra={
                                <Row gutter={16}>
                                    <Col>
                                        <Statistic
                                            title="Running"
                                            value={group.total_processes_running}
                                            valueStyle={{ color: '#52c41a' }}
                                        />
                                    </Col>
                                    <Col>
                                        <Statistic
                                            title="Stopped"
                                            value={group.total_processes_stopped}
                                            valueStyle={{ color: '#ff4d4f' }}
                                        />
                                    </Col>
                                </Row>
                            }
                        >
                            <Row gutter={[8, 8]} justify="start">
                                {group.servers.map((server: any) => (
                                    <Col
                                        xs={24}
                                        sm={12}
                                        md={8}
                                        lg={6}
                                        key={server.id}
                                    >
                                        <Card
                                            title={server.name}
                                            bordered
                                            style={{
                                                fontSize: '12px',
                                                textAlign: 'center',
                                                padding: '8px',
                                                borderRadius: '8px',
                                            }}
                                            bodyStyle={{ padding: '12px' }}
                                        >
                                            <Statistic
                                                title={<span style={{ fontSize: '12px' }}>Total</span>} // Customizando o título
                                                value={server.processes.total}
                                                suffix="Processos"
                                                valueStyle={{ fontSize: '14px' }} // Customizando o valor
                                            />
                                            <Row
                                                justify="space-around"
                                                style={{
                                                    marginTop: 8,
                                                }}
                                            >
                                                <Statistic
                                                    title="Running"
                                                    value={server.processes.running}
                                                    valueStyle={{ color: '#52c41a' }}
                                                />
                                                <Statistic
                                                    title="Stopped"
                                                    value={server.processes.stopped}
                                                    valueStyle={{ color: '#ff4d4f' }}
                                                />
                                            </Row>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Panel>
                    ))}
                </Collapse>
            )}
        </div>
    );
};

export default DashboardPage;
