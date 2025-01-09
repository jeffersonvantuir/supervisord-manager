import { useState, useEffect } from 'react';
import { Table, Spin, Button, message, Popconfirm } from 'antd';
import api from "@/services/api";
import { PlusOutlined, EditOutlined, PoweroffOutlined, ClusterOutlined } from "@ant-design/icons";
import { useRouter } from 'next/router';

interface ServerGroup {
    id: number;
    name: string;
    enabled: boolean;
}

const ServerGroupsPage: React.FC = () => {
    const [serverGroups, setServerGroups] = useState<ServerGroup[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const router = useRouter();

    const handleAddServerGroup = () => {
        router.push('/server-groups/new');
    };

    const fetchServerGroups = async () => {
        setLoading(true);
        try {
            const response = await api.get('/server-groups');
            setServerGroups(response.data);
        } catch (error) {
            message.error('Erro ao carregar os grupos');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleServerGroup = async (id: number, enabled: boolean) => {
        try {
            const action = enabled ? 'inativado' : 'ativado';
            await api.post(`/server-groups/${id}/toggle`);
            message.success(`Grupo ${action} com sucesso!`);
            fetchServerGroups();
        } catch (error) {
            message.error('Erro ao realizar a ação no grupo.');
        }
    };

    useEffect(() => {
        fetchServerGroups();
    }, []);

    const columns = [
        {
            title: 'Nome',
            dataIndex: 'name',
            key: 'name',
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
            render: (_: any, record: ServerGroup) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Botão de Edição */}
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => router.push(`/server-groups/${record.id}`)}
                    >
                        Editar
                    </Button>

                    {/* Botão de Ativar/Inativar */}
                    <Popconfirm
                        title={`Você tem certeza que deseja ${record.enabled ? 'inativar' : 'ativar'} este Grupo?`}
                        onConfirm={() => handleToggleServerGroup(record.id, record.enabled)}
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
                    <span style={{ padding: '10px' }}><ClusterOutlined /></span>
                    Grupo de Servidores
                </h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddServerGroup}
                >
                    Adicionar Grupo
                </Button>
            </div>
            {loading ? (
                <Spin size="large" />
            ) : (
                <Table
                    dataSource={serverGroups}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            )}
        </div>
    );
};

export default ServerGroupsPage;
