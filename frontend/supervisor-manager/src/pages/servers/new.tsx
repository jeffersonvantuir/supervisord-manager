import { Form, Input, Button, Card, message, Select, Checkbox } from 'antd';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import api from "@/services/api";

const { Option } = Select;

interface Group {
    id: number;
    name: string;
}

const NewServerPage: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [groups, setGroups] = useState<Group[]>([]); // Estado para armazenar grupos
    const [groupsLoading, setGroupsLoading] = useState<boolean>(true); // Loading para os grupos

    const router = useRouter();

    useEffect(() => {
        fetchServerGroups();
    }, []);

    const fetchServerGroups = async () => {
        setGroupsLoading(true);
        try {
            const response = await api.get('/server-groups');
            setGroups(response.data);
        } catch (error) {
            message.error('Erro ao carregar os grupos de servidores.');
            console.error(error);
        } finally {
            setGroupsLoading(false);
        }
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            await api.post('/server/new', {
                name: values.name,
                description: values.description,
                fqdn: values.fqdn,
                group_id: values.group, // Passa o ID do grupo selecionado
                ssh_username: values.sshUser,
                ssh_password: values.sshPassword,
                supervisor_username: values.supervisorUsername,
                supervisor_password: values.supervisorPassword,
                supervisor_endpoint: values.supervisorEndpoint,
                enabled: values.isActive,
            });

            message.success('Servidor cadastrado com sucesso!');
            router.push('/servers'); // Redireciona para a listagem de servidores
        } catch (error) {
            message.error('Erro ao cadastrar o servidor. Por favor, tente novamente.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card style={{ maxWidth: '600px', margin: '20px auto' }}>
            <h1>Cadastrar Novo Servidor</h1>
            <Form layout="vertical" onFinish={handleSubmit}>

                <Form.Item
                    label="Grupo de Servidor"
                    name="group"
                    rules={[{ required: true, message: 'Por favor, selecione um grupo!' }]}
                >
                    <Select
                        placeholder="Selecione um grupo"
                        loading={groupsLoading}
                        allowClear
                    >
                        {groups.map((group) => (
                            <Option key={group.id} value={group.id}>
                                {group.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Nome"
                    name="name"
                    rules={[{ required: true, message: 'Por favor, insira o nome do servidor!' }]}
                >
                    <Input placeholder="Ex: Servidor Web"/>
                </Form.Item>

                <Form.Item
                    label="Descrição"
                    name="description"
                    rules={[{ required: true, message: 'Por favor, insira a descrição do servidor!' }]}
                >
                    <Input placeholder="Breve descrição do servidor"/>
                </Form.Item>

                <Form.Item
                    label="FQDN"
                    name="fqdn"
                    rules={[{ required: true, message: 'Por favor, insira o FQDN do servidor!' }]}
                >
                    <Input placeholder="Ex: server.example.com"/>
                </Form.Item>

                <Form.Item name="isActive" valuePropName="checked">
                    <Checkbox>Ativo?</Checkbox>
                </Form.Item>

                <fieldset style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
                    <legend>Informações de SSH</legend>

                    <Form.Item
                        label="Usuário SSH"
                        name="sshUser"
                    >
                        <Input placeholder="Ex: root"/>
                    </Form.Item>

                    <Form.Item
                        label="Senha SSH"
                        name="sshPassword"
                    >
                        <Input.Password placeholder="Senha do SSH"/>
                    </Form.Item>
                </fieldset>

                <fieldset style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
                    <legend>Informações do Supervisor</legend>

                    <Form.Item
                        label="Base URL"
                        name="supervisorEndpoint"
                    >
                        <Input placeholder="Ex: https://supervisor...com/RPC2"/>
                    </Form.Item>

                    <Form.Item
                        label="Usuário"
                        name="supervisorUsername"
                    >
                        <Input placeholder="Ex: admin"/>
                    </Form.Item>

                    <Form.Item
                        label="Senha"
                        name="supervisorPassword"
                    >
                        <Input.Password placeholder="Senha"/>
                    </Form.Item>
                </fieldset>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Cadastrar Servidor
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default NewServerPage;
