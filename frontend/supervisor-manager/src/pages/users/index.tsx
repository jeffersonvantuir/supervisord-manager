import { useState, useEffect } from 'react';
import { Table, Spin, Button, message, Popconfirm } from 'antd';
import api from "@/services/api";
import { UserOutlined, PlusOutlined, EditOutlined, PoweroffOutlined } from "@ant-design/icons";
import { useRouter } from 'next/router';

interface User {
    id: number;
    name: string;
    email: string;
    lastLogin: string;
    enabled: boolean;
}

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const router = useRouter();

    const handleAddUser = () => {
        router.push('/user-register'); // Redireciona para página de criação de usuário
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users'); // Endpoint para buscar os usuários
            setUsers(response.data);
        } catch (error) {
            message.error('Erro ao carregar os usuários');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleUser = async (id: number, enabled: boolean) => {
        try {
            const action = enabled ? 'inativar' : 'ativar';
            await api.post(`/users/${id}/toggle`, { enabled: !enabled });
            message.success(`Usuário ${action} com sucesso!`);
            fetchUsers(); // Recarrega os dados da tabela
        } catch (error) {
            message.error('Erro ao realizar a ação no usuário.');
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const columns = [
        {
            title: 'Nome',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Último Login',
            dataIndex: 'lastLogin',
            key: 'lastLogin',
            render: (lastLogin: string) => lastLogin ? new Date(lastLogin).toLocaleString() : '-', // Formata a data
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
            render: (_: any, record: User) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Botão de Edição */}
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => router.push(`/users/${record.id}`)}
                    >
                        Editar
                    </Button>

                    {/* Botão de Ativar/Inativar */}
                    <Popconfirm
                        title={`Você tem certeza que deseja ${record.enabled ? 'inativar' : 'ativar'} este usuário?`}
                        onConfirm={() => handleToggleUser(record.id, record.enabled)}
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
                    <span style={{ padding: '10px' }}><UserOutlined /></span>
                    Usuários
                </h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddUser}
                >
                    Adicionar Usuário
                </Button>
            </div>
            {loading ? (
                <Spin size="large" />
            ) : (
                <Table
                    dataSource={users}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            )}
        </div>
    );
};

export default UsersPage;
