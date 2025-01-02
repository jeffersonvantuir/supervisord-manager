import { useState, useEffect } from 'react';
import { Table, Spin, Button, message, Popconfirm } from 'antd';
import api from "@/services/api";
import { CloudServerOutlined, PlusOutlined, EditOutlined, PoweroffOutlined } from "@ant-design/icons";
import { useRouter } from 'next/router';

interface Server {
    id: number;
    group: string;
    name: string;
    fqdn: string;
    enabled: boolean;
}

const ServersPage: React.FC = () => {
    const [servers, setServers] = useState<Server[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const router = useRouter();

    const handleAddServer = () => {
        router.push('/servers/new');
    };

    const fetchServers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/server'); // Endpoint para buscar os servidores
            setServers(response.data);
        } catch (error) {
            message.error('Erro ao carregar os servidores');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleServer = async (id: number, enabled: boolean) => {
        try {
            const action = enabled ? 'inativar' : 'ativar';
            await api.post(`/server/${id}/toggle`, { enabled: !enabled });
            message.success(`Servidor ${action} com sucesso!`);
            fetchServers(); // Recarrega os dados da tabela
        } catch (error) {
            message.error('Erro ao realizar a ação no servidor.');
            console.error(error);
        }
    };

    useEffect(() => {
        fetchServers();
    }, []);

    const columns = [
        {
            title: 'Grupo',
            dataIndex: 'group',
            key: 'group',
        },
        {
            title: 'Nome',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'FQDN',
            dataIndex: 'fqdn',
            key: 'fqdn',
        },
        {
            title: 'Ativo?',
            dataIndex: 'enabled',
            key: 'enabled',
            render: (enabled: boolean) => (
                <Button
                    type="default"
                    style={{
                        color: enabled ? 'green' : 'red',
                        borderColor: enabled ? 'green' : 'red',
                    }}
                >
                    {enabled ? 'Sim' : 'Não'}
                </Button>
            ),
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_: any, record: Server) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Botão de Edição */}
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => router.push(`/servers/${record.id}`)}
                    >
                        Editar
                    </Button>

                    {/* Botão de Ativar/Inativar */}
                    <Popconfirm
                        title={`Você tem certeza que deseja ${record.enabled ? 'inativar' : 'ativar'} este servidor?`}
                        onConfirm={() => handleToggleServer(record.id, record.enabled)}
                        okText="Sim"
                        cancelText="Não"
                    >
                        <Button
                            type="primary"
                            danger={!record.enabled}
                            style={{
                                backgroundColor: record.enabled ? 'red' : 'green',
                                borderColor: record.enabled ? 'red' : 'green',
                            }}
                            icon={<PoweroffOutlined />}
                        >
                            {record.enabled ? 'Inativar' : 'Ativar'}
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>
                    <span style={{ padding: '10px' }}><CloudServerOutlined /></span>
                    Servidores
                </h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddServer}
                >
                    Adicionar Servidor
                </Button>
            </div>
            {loading ? (
                <Spin size="large" />
            ) : (
                <Table
                    dataSource={servers}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            )}
        </div>
    );
};

export default ServersPage;
