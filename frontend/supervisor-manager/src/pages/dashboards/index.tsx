import { useState, useEffect } from 'react';
import { Collapse, Table, Spin, message, Button, Space } from 'antd';
import { PlayCircleOutlined, StopOutlined, FileTextOutlined } from '@ant-design/icons';
import api from "@/services/api";

const { Panel } = Collapse;

interface Process {
    group: string;
    logfile: string;
    name: string;
    description: string;
    state: number;
    isRunning: boolean;
}

interface ServerData {
    server: string;
    processes: Process[];
}

const DashboardsPage: React.FC = () => {
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

    const handleActionClick = async (url: string, processId: string, actionId: string) => {
        if (actionId === 'log') {
            // Abre a URL em uma nova aba
            window.open(`/dashboard/realtime-logs?process=${processId}`, '_blank');
            return;
        }

        setLoadingActions((prev) => ({ ...prev, [`${processId}`]: true }));

        try {
            await api.post(url, {
                process: processId,
                action: actionId
            });
            message.success('Ação realizada com sucesso');
        } catch (error) {
            message.error('Erro ao executar a ação');
        } finally {
            setLoadingActions((prev) => ({ ...prev, [`${processId}`]: true }));
        }
    };

    const renderTable = (processes: Process[]) => {
        const columns = [
            {
                title: 'Processo',
                dataIndex: 'processId',
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
                                    onClick={() => handleActionClick(action.url, record.processId, action.id)}
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
            <h1>Dashboard</h1>
            {loading ? (
                <Spin size="large" />
            ) : (
                <Collapse defaultActiveKey={data.map((server) => server.server)} accordion={false}>
                    {data.map((server) => (
                        <Panel header={server.server} key={server.server}>
                            {renderTable(server.processes)}
                        </Panel>
                    ))}
                </Collapse>
            )}
        </div>
    );
};

export default DashboardsPage;
