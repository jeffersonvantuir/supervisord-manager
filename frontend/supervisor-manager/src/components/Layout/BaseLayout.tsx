import { Layout, Menu } from 'antd';
import { ReactNode } from 'react';

const { Header, Content, Footer } = Layout;

interface BaseLayoutProps {
    children: ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
    return (
        <Layout>
            <Header>
                <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
                    <Menu.Item key="1">Home</Menu.Item>
                    <Menu.Item key="2">Sobre</Menu.Item>
                </Menu>
            </Header>
            <Content style={{ padding: '20px 50px', minHeight: '80vh' }}>{children}</Content>
            <Footer style={{ textAlign: 'center' }}>©2024 Criado por Jefferson</Footer>
        </Layout>
    );
};

export default BaseLayout;
