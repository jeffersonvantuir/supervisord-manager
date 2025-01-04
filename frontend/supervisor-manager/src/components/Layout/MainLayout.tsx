import { Layout } from 'antd';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';

const { Content } = Layout;

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const router = useRouter();

    // Rotas que não precisam de Sidebar
    const noSidebarRoutes = ['/login', '/user-register'];

    // Verifica se a rota atual está na lista de rotas sem Sidebar
    const isNoSidebarRoute = noSidebarRoutes.includes(router.pathname);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {!isNoSidebarRoute && <Sidebar />} {/* Renderiza Sidebar apenas se não for rota sem sidebar */}
            <Layout>
                <Content style={{ margin: isNoSidebarRoute ? '0' : '16px' }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
