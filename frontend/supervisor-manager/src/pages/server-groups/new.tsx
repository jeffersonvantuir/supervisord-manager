import { Form, Input, Button, Card, message, Checkbox } from 'antd';
import { useRouter } from 'next/router';
import { useState } from 'react';
import api from "@/services/api";

const NewServerGroupPage: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);

    const router = useRouter();

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            await api.post('/server-groups', {
                name: values.name,
                description: values.description,
                enabled: values.isActive,
            });

            message.success('Grupo cadastrado com sucesso!');
            router.push('/server-groups'); // Redireciona para a listagem de servidores
        } catch (error) {
            message.error('Erro ao cadastrar o grupo. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card style={{ maxWidth: '600px', margin: '20px auto' }}>
            <h1>Cadastrar Novo Servidor</h1>
            <Form layout="vertical" onFinish={handleSubmit}>

                <Form.Item
                    label="Nome"
                    name="name"
                    rules={[{ required: true, message: 'Por favor, insira o nome do grupo!' }]}
                >
                    <Input placeholder="Ex: Produção, Homologação..."/>
                </Form.Item>

                <Form.Item
                    label="Descrição"
                    name="description"
                    rules={[{ required: true, message: 'Por favor, insira a descrição do grupo!' }]}
                >
                    <Input placeholder="Breve descrição do grupo de servidores"/>
                </Form.Item>

                <Form.Item name="isActive" valuePropName="checked">
                    <Checkbox>Ativo?</Checkbox>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Cadastrar Grupo
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default NewServerGroupPage;
