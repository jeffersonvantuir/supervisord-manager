import { Layout, Menu } from 'antd';
import Image from 'next/image';
import {
    DashboardOutlined,
    CloudServerOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
    const router = useRouter();

    const menuItems = [
        {
            key: '/dashboards',
            icon: <DashboardOutlined />,
            label: 'Dashboards',
        },
        {
            key: '/servidores',
            icon: <CloudServerOutlined />,
            label: 'Servidores',
        },
    ];

    const handleMenuClick = ({ key }: { key: string }) => {
        router.push(key);
    };

    return (
        <Sider collapsible>
            <div style={{ height: 64, color: 'white', textAlign: 'center', lineHeight: '64px' }}>
                <Image
                    src="/Brasil_TecPar.png" // Coloque seu arquivo em public/logo.png
                    alt="Logo"
                    width={120}
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
