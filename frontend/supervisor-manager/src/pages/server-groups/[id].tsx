import { Form, Input, Button, Card, message, Checkbox } from 'antd';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import api from "@/services/api";

const EditServerGroupPage: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);
    const [form] = Form.useForm();
    const router = useRouter();
    const { id } = router.query; // Obtém o ID do grupo da URL

    useEffect(() => {
        if (id) {
            fetchGroupDetails();
        }
    }, [id]);

    const fetchGroupDetails = async () => {
        setInitialLoading(true);
        try {
            const response = await api.get(`/server-groups/${id}`);
            const { name, description } = response.data;

            form.setFieldsValue({
                name,
                description
            });
        } catch (error) {
            message.error('Erro ao carregar os detalhes do grupo.');
            console.error(error);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            await api.put(`/server-groups/${id}`, {
                name: values.name,
                description: values.description,
            });

            message.success('Grupo atualizado com sucesso!');
            router.push('/server-groups'); // Redireciona para a listagem de servidores
        } catch (error) {
            message.error('Erro ao atualizar o grupo. Por favor, tente novamente.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card style={{ maxWidth: '600px', margin: '20px auto' }}>
            <h1>Editar Grupo de Servidores</h1>
            {initialLoading ? (
                <p>Carregando...</p>
            ) : (
                <Form layout="vertical" onFinish={handleSubmit} form={form}>
                    <Form.Item
                        label="Nome"
                        name="name"
                        rules={[{ required: true, message: 'Por favor, insira o nome do grupo!' }]}
                    >
                        <Input placeholder="Ex: Produção, Homologação..." />
                    </Form.Item>

                    <Form.Item
                        label="Descrição"
                        name="description"
                        rules={[{ required: true, message: 'Por favor, insira a descrição do grupo!' }]}
                    >
                        <Input placeholder="Breve descrição do grupo de servidores" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Atualizar Grupo
                        </Button>
                    </Form.Item>
                </Form>
            )}
        </Card>
    );
};

export default EditServerGroupPage;
