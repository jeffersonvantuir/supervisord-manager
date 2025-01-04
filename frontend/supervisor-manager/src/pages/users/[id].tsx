import { Form, Input, Button, Card, message, Select, Checkbox } from 'antd';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import api from "@/services/api";

const { Option } = Select;

interface User {
    id: number;
    name: string;
    email: string;
}

const EditUserPage: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [form] = Form.useForm(); // Usar o objeto do formulário para manipulação

    const router = useRouter();
    const { id } = router.query; // Obtemos o ID do servidor a partir da URL

    useEffect(() => {
        if (id) {
            fetchUserDetails();
        }
    }, [id]);

    const fetchUserDetails = async () => {
        try {
            const response = await api.get(`/users/${id}`);
            form.setFieldsValue({
                name: response.data.name,
                email: response.data.email
            });
        } catch (error) {
            message.error('Erro ao carregar os dados.');
            console.error(error);
        }
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            await api.put(`/users/${id}`, {
                name: values.name,
                email: values.email
            });

            message.success('Usuário atualizado com sucesso!');
            router.push('/users'); // Redireciona para a listagem de servidores
        } catch (error) {
            message.error('Erro ao atualizar o Usuário. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card style={{ maxWidth: '600px', margin: '20px auto' }}>
            <h1>Editar Usuário</h1>
            <Form layout="vertical" form={form} onFinish={handleSubmit}>

                <Form.Item
                    label="Nome"
                    name="name"
                    rules={[{ required: true, message: 'Por favor, insira o nome!' }]}
                >
                    <Input placeholder="Ex: João da Silva"/>
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: 'Por favor, insira o email do usuário!' },
                        { type: 'email', message: 'Por favor, insira um email válido!' },
                    ]}
                >
                    <Input placeholder="Digite o email do usuário" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Atualizar
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default EditUserPage;
