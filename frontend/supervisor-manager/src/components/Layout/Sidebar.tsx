import { Layout, Menu, Popconfirm, message } from 'antd';
import Image from 'next/image';
import {
    DashboardOutlined,
    CloudServerOutlined,
    EyeOutlined,
    UserOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        message.success('Logout realizado com sucesso!');
        router.push('/login'); // Redireciona para a página de login
    };

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/servers',
            icon: <CloudServerOutlined />,
            label: 'Servidores',
        },
        {
            key: '/supervisor',
            icon: <EyeOutlined />,
            label: 'Supervisor',
        },
        {
            key: '/users',
            icon: <UserOutlined />,
            label: 'Usuários',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            onClick: handleLogout,
            label: "Logout",
        },
    ];

    const handleMenuClick = ({ key }: { key: string }) => {
        if (key === 'logout') return;
        router.push(key);
    };

    return (
        <Sider collapsible>
            <div style={{ height: 64, color: 'white', textAlign: 'center', lineHeight: '64px' }}>
                <Image
                    src="/btpar-white.png"
                    alt="Logo"
                    width={140}
                    height={40}
                />
            </div>
            <Menu
                theme="dark"
                mode="inline"
                defaultSelectedKeys={[router.pathname]}
                items={menuItems}
                onClick={handleMenuClick}
            />
        </Sider>
    );
};

export default Sidebar;
