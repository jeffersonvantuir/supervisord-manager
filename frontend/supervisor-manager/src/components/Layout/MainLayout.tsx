import { Layout } from 'antd';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import Head from 'next/head';

const { Content } = Layout;

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const router = useRouter();

    // Rotas que não precisam de Sidebar
    const noSidebarRoutes = ['/login', '/register'];

    // Verifica se a rota atual está na lista de rotas sem Sidebar
    const isNoSidebarRoute = noSidebarRoutes.includes(router.pathname);
    const siteTitle = process.env.NEXT_PROJECT_NAME;
    const siteDescription = process.env.NEXT_PROJECT_DESCRIPTION;

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {!isNoSidebarRoute && <Sidebar />} {/* Renderiza Sidebar apenas se não for rota sem sidebar */}

            <Layout>
                <Content style={{ margin: isNoSidebarRoute ? '0' : '16px' }}>
                    <Head>
                        <title>{siteTitle}</title>
                        <meta name="description" content={ siteDescription }/>
                    </Head>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
