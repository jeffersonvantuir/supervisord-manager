import { useState, useEffect } from 'react';
import { Table, Spin, Button, message } from 'antd';
import api from "@/services/api";
import { CloudServerOutlined, PlusOutlined } from "@ant-design/icons";
import { useRouter } from 'next/router';

interface Server {
    group: string;
    name: string;
    enabled: boolean;
}

const ServersPage: React.FC = () => {
    const [servers, setServers] = useState<Server[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const router = useRouter(); // Inicializa o roteador

    const handleAddServer = () => {
        router.push('/servers/new'); // Redireciona para a página de cadastro
    };

    useEffect(() => {
        fetchServers();
    }, []);

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
    ];

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>
                    <span style={{ padding: '10px' }}><CloudServerOutlined/></span>
                    Servidores
                </h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined/>}
                    onClick={handleAddServer}
                >
                    Adicionar Servidor
                </Button>
            </div>
            {loading ? (
                <Spin size="large"/>
            ) : (
                <Table
                    dataSource={servers}
                    columns={columns}
                    rowKey="name"
                    pagination={{ pageSize: 10 }}
                />
            )}
        </div>
    );
};

export default ServersPage;
