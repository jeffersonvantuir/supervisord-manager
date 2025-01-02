import { useState, useEffect } from 'react';
import { Collapse, Table, Spin, message, Button, Space, Popconfirm } from 'antd';
import {
    PlayCircleOutlined,
    StopOutlined,
    FileTextOutlined,
    EyeOutlined,
    PoweroffOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import api from "@/services/api";

const { Panel } = Collapse;

interface Process {
    group: string;
    logfile: string;
    name: string;
    description: string;
    state: number;
    isRunning: boolean;
    processId: string;
    serverId: string;
    actions: { id: string; title: string; url: string }[];
}

interface ServerData {
    server: string;
    id: string;
    group: string;
    processes: Process[];
}

const SupervisorPage: React.FC = () => {
    const [data, setData] = useState<ServerData[]>([]);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingActions, setLoadingActions] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        fetchData();

        const intervalId = setInterval(fetchData, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const fetchData = async () => {
        if (initialLoading) setInitialLoading(true);
        else setLoading(true);

        try {
            const response = await api.get('/supervisor'); // Substitua pelo seu endpoint
            setData(response.data);
        } catch (error) {
            message.error('Erro ao carregar os dados');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStopAll = async (serverId: string) => {
        try {
            await api.post(`/supervisor/stop-all/${serverId}`);
            message.success('Todos os processos foram parados com sucesso!');
            fetchData();
        } catch (error) {
            message.error('Erro ao parar todos os processos');
            console.error(error);
        }
    };

    const handleRestartAll = async (serverId: string) => {
        try {
            await api.post(`/supervisor/restart-all/${serverId}`);
            message.success('Todos os processos foram reiniciados com sucesso!');
            fetchData();
        } catch (error) {
            message.error('Erro ao reiniciar todos os processos');
            console.error(error);
        }
    };

    const groupServersByGroup = (servers: ServerData[]) => {
        return servers.reduce((acc: Record<string, ServerData[]>, server) => {
            acc[server.group] = acc[server.group] || [];
            acc[server.group].push(server);
            return acc;
        }, {});
    };

    const renderTable = (processes: Process[]) => {
        const columns = [
            {
                title: 'Processo',
                dataIndex: 'name',
            },
            {
                title: 'Descrição',
                dataIndex: 'description',
                key: 'description',
            },
            {
                title: 'Status',
                dataIndex: 'state',
                key: 'state',
                render: (_: any, record: Process) => (
                    <Button
                        type="default"
                        style={{
                            color: record.isRunning ? 'green' : 'yellow',
                            borderColor: record.isRunning ? 'green' : 'yellow',
                        }}
                    >
                        {record.isRunning ? 'Running' : 'Stopped'}
                    </Button>
                ),
            },
            {
                title: 'Ações',
                dataIndex: 'action',
                render: (_: any, record: Process) => (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {record.actions.map((action) => (
                            <Button
                                type="default"
                                key={action.id}
                                onClick={() =>
                                    handleActionClick(action.url, record.processId, action.id, record.serverId)
                                }
                            >
                                {action.title}
                            </Button>
                        ))}
                    </div>
                ),
            },
        ];

        return <Table dataSource={processes} columns={columns} rowKey="name" pagination={false} />;
    };

    const groupedServers = groupServersByGroup(data);

    return (
        <div style={{ padding: '20px' }}>
            <h1>
                <span style={{ padding: '10px' }}><EyeOutlined /></span>
                Supervisor Monitor
            </h1>
            {loading ? (
                <Spin size="large" />
            ) : (
                Object.entries(groupedServers).map(([group, servers]) => (
                    <Collapse key={group} style={{ marginBottom: '20px' }}>
                        <Panel header={group} key={group}>
                            <Collapse accordion>
                                {servers.map((server) => (
                                    <Panel
                                        header={server.server}
                                        key={server.id}
                                        extra={(
                                            <Space>
                                                <Popconfirm
                                                    title="Deseja parar todos os processos deste servidor?"
                                                    onConfirm={() => handleStopAll(server.id)}
                                                    okText="Sim"
                                                    cancelText="Não"
                                                >
                                                    <Button type="primary" danger icon={<PoweroffOutlined />}>
                                                        Stop All
                                                    </Button>
                                                </Popconfirm>
                                                <Popconfirm
                                                    title="Deseja reiniciar todos os processos deste servidor?"
                                                    onConfirm={() => handleRestartAll(server.id)}
                                                    okText="Sim"
                                                    cancelText="Não"
                                                >
                                                    <Button type="primary" icon={<ReloadOutlined />}>
                                                        Restart All
                                                    </Button>
                                                </Popconfirm>
                                            </Space>
                                        )}
                                    >
                                        {renderTable(server.processes)}
                                    </Panel>
                                ))}
                            </Collapse>
                        </Panel>
                    </Collapse>
                ))
            )}
        </div>
    );
};

export default SupervisorPage;
