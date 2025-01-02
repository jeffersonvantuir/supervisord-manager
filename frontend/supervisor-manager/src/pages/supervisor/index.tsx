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

        fetchData();

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

    const handleActionClick = async (url: string, processId: string, actionId: string, serverId: string) => {
        if (actionId === 'log') {
            window.open(`/supervisor/realtime-logs?process=${processId}&server_id=${serverId}`, '_blank');
            return;
        }

        setLoadingActions((prev) => ({ ...prev, [`${processId}`]: true }));

        try {
            await api.post(url, {
                server_id: serverId,
                process: processId,
                action: actionId,
            });
            message.success('Ação realizada com sucesso');
        } catch (error) {
            message.error('Erro ao executar a ação');
        } finally {
            setLoadingActions((prev) => ({ ...prev, [`${processId}`]: false }));
        }
    };

    const handleStopAll = async (serverId: string) => {
        try {
            await api.post(`/supervisor/stop-all/${serverId}`);
            message.success('Todos os processos foram parados com sucesso!');
            fetchData(); // Recarrega os dados
        } catch (error) {
            message.error('Erro ao parar todos os processos');
            console.error(error);
        }
    };

    const handleRestartAll = async (serverId: string) => {
        try {
            await api.post(`/supervisor/restart-all/${serverId}`);
            message.success('Todos os processos foram reiniciados com sucesso!');
            fetchData(); // Recarrega os dados
        } catch (error) {
            message.error('Erro ao reiniciar todos os processos');
            console.error(error);
        }
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
                        {record.actions.map((action) => {
                            let buttonProps = {};
                            let icon;

                            switch (action.id) {
                                case 'start':
                                    buttonProps = {
                                        type: 'primary',
                                        style: { backgroundColor: 'green', borderColor: 'green' },
                                    };
                                    icon = <PlayCircleOutlined />;
                                    break;
                                case 'stop':
                                    buttonProps = {
                                        type: 'primary',
                                        danger: true,
                                    };
                                    icon = <StopOutlined />;
                                    break;
                                case 'log':
                                    buttonProps = {
                                        type: 'default',
                                    };
                                    icon = <FileTextOutlined />;
                                    break;
                            }

                            const isLoading = loadingActions[`${record.processId}-${action.id}`];

                            return (
                                <Button
                                    {...buttonProps}
                                    icon={icon}
                                    key={action.id}
                                    loading={isLoading}
                                    onClick={() => handleActionClick(action.url, record.processId, action.id, record.serverId)}
                                >
                                    {action.title}
                                </Button>
                            );
                        })}
                    </div>
                ),
            },
        ];

        return <Table dataSource={processes} columns={columns} rowKey="name" pagination={false} />;
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>
                <span style={{ padding: '10px' }}><EyeOutlined /></span>
                Supervisor Monitor
            </h1>
            {loading ? (
                <Spin size="large" />
            ) : (
                <Collapse defaultActiveKey={data.map((server) => server.server)} accordion={false}>
                    {data.map((server) => (
                        <Panel
                            header={server.server}
                            key={server.server}
                            extra={(
                                <Space>
                                    <Popconfirm
                                        title="Deseja parar todos os processos deste servidor?"
                                        onConfirm={(e) => {
                                            e?.stopPropagation(); // Impede o acionamento do Collapse
                                            handleStopAll(server.id);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        okText="Sim"
                                        cancelText="Não"
                                    >
                                        <Button type="primary" danger icon={<PoweroffOutlined />} onClick={(e) => e.stopPropagation()}>
                                            Stop All
                                        </Button>
                                    </Popconfirm>
                                    <Popconfirm
                                        title="Deseja reiniciar todos os processos deste servidor?"
                                        onConfirm={(e) => {
                                            e?.stopPropagation(); // Impede o acionamento do Collapse
                                            handleRestartAll(server.id);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        okText="Sim"
                                        cancelText="Não"
                                    >
                                        <Button type="primary" icon={<ReloadOutlined />} onClick={(e) => e.stopPropagation()}>
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
            )}
        </div>
    );
};

export default SupervisorPage;
