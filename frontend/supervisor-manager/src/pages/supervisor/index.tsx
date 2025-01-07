import { useState, useEffect } from 'react';
import { Collapse, Table, Spin, message, Button, Space, Popconfirm } from 'antd';
import {
    EyeOutlined,
    PoweroffOutlined,
    ReloadOutlined,
    ClusterOutlined,
    CloudServerOutlined,
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
    const [loadingAll, setLoadingAll] = useState<{ [key: string]: boolean }>({});

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

    const handleActionClick = async (url: string, processId: string, actionId: string, serverId: string) => {
        if (actionId === 'log') {
            window.open(`/supervisor/realtime-logs?process=${processId}&server_id=${serverId}`, '_blank');
            return;
        }

        setLoadingActions((prev) => ({ ...prev, [`${processId}-${actionId}`]: true }));

        try {
            await api.post(url, {
                server_id: serverId,
                process: processId,
                action: actionId,
            });
            message.success('Ação realizada com sucesso');
            await fetchData(); // Recarrega os dados após a ação
        } catch (error) {
            message.error('Erro ao executar a ação');
            console.error(error);
        } finally {
            setLoadingActions((prev) => ({ ...prev, [`${processId}-${actionId}`]: false }));
        }
    };

    const handleStopAll = async (serverId: string) => {
        setLoadingAll((prev) => ({ ...prev, [`stop-all-${serverId}`]: true }));

        try {
            await api.post(`/supervisor/stop-all/${serverId}`);
            message.success('Todos os processos foram parados com sucesso!');
            await fetchData(); // Recarrega os dados após a ação
        } catch (error) {
            message.error('Erro ao parar todos os processos');
            console.error(error);
        } finally {
            setLoadingAll((prev) => ({ ...prev, [`stop-all-${serverId}`]: false }));
        }
    };

    const handleRestartAll = async (serverId: string) => {
        setLoadingAll((prev) => ({ ...prev, [`restart-all-${serverId}`]: true }));

        try {
            await api.post(`/supervisor/restart-all/${serverId}`);
            message.success('Todos os processos foram reiniciados com sucesso!');
            await fetchData(); // Recarrega os dados após a ação
        } catch (error) {
            message.error('Erro ao reiniciar todos os processos');
            console.error(error);
        } finally {
            setLoadingAll((prev) => ({ ...prev, [`restart-all-${serverId}`]: false }));
        }
    };

    const groupServersByGroup = (servers: ServerData[]) => {
        return servers.reduce((acc: Record<string, ServerData[]>, server) => {
            acc[server.group] = acc[server.group] || [];
            acc[server.group].push(server);
            return acc;
        }, {});
    };

    const getButtonStyles = (stateName: string) => {
        switch (stateName) {
            case 'Running':
                return { color: 'green', borderColor: 'green' };
            case 'Stopped':
                return { color: 'yellow', borderColor: 'yellow' };
            case 'Failed':
            case 'Fatal':
                return { color: 'red', borderColor: 'red' };
            case 'Starting':
                return { color: 'orange', borderColor: 'orange' };
            default:
                return { color: 'gray', borderColor: 'gray' }; // Default para estados desconhecidos
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
                        style={getButtonStyles(record.stateName)}
                    >
                        {record.stateName}
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
                                loading={loadingActions[`${record.processId}-${action.id}`]}
                                style={{
                                    backgroundColor: action.id === 'start' ? 'green' : action.id === 'stop' ? 'red' : undefined,
                                    color: action.id === 'start' || action.id === 'stop' ? 'white' : undefined,
                                    borderColor: action.id === 'start' ? 'green' : action.id === 'stop' ? 'red' : undefined,
                                }}
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
                        <Panel header={
                            <span>
                                <ClusterOutlined style={{ marginRight: '8px' }}/>
                                {group}
                            </span>
                        } key={group}>
                            <Collapse accordion>
                                {servers.map((server) => (
                                    <Panel
                                        header={
                                            <span>
                                                <CloudServerOutlined style={{ marginRight: '8px' }}/>
                                                {server.server}
                                            </span>
                                        }
                                        key={server.id}
                                        extra={(
                                            <Space>
                                                <Popconfirm
                                                    title="Deseja parar todos os processos deste servidor?"
                                                    onConfirm={() => handleStopAll(server.id)}
                                                    okText="Sim"
                                                    cancelText="Não"
                                                >
                                                    <Button
                                                        type="primary"
                                                        danger
                                                        icon={<PoweroffOutlined />}
                                                        loading={loadingAll[`stop-all-${server.id}`]}
                                                    >
                                                        Stop All
                                                    </Button>
                                                </Popconfirm>
                                                <Popconfirm
                                                    title="Deseja reiniciar todos os processos deste servidor?"
                                                    onConfirm={() => handleRestartAll(server.id)}
                                                    okText="Sim"
                                                    cancelText="Não"
                                                >
                                                    <Button
                                                        type="primary"
                                                        icon={<ReloadOutlined />}
                                                        loading={loadingAll[`restart-all-${server.id}`]}
                                                    >
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
