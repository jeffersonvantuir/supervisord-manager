import { Layout, Menu } from 'antd';
import Image from 'next/image';
import {
    DashboardOutlined,
    CloudServerOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
    const router = useRouter();

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
    ];

    const handleMenuClick = ({ key }: { key: string }) => {
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
