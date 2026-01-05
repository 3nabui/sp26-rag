import { Layout, Menu } from '../config';
import { useNavigate, useLocation } from 'react-router-dom';
import { PAGE_URL } from '../constants';
import {
  DashboardOutlined,
  UploadOutlined,
  BarChartOutlined,
  MessageOutlined,
  UserOutlined,
  SettingOutlined,
  FileTextOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useMemo } from 'react';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = useMemo(() => {
    const role = 'author';

    if (role === 'author') {
      return [
        {
          key: PAGE_URL.AUTHOR_DASHBOARD,
          icon: <DashboardOutlined />,
          label: 'Dashboard',
        },
        {
          key: PAGE_URL.AUTHOR_UPLOAD,
          icon: <UploadOutlined />,
          label: 'My Manuscripts',
        },
        {
          key: PAGE_URL.AUTHOR_ANALYSIS,
          icon: <BarChartOutlined />,
          label: 'Analysis',
        },
        {
          key: PAGE_URL.AUTHOR_CHATBOT,
          icon: <MessageOutlined />,
          label: 'Ask AI',
        },
      ];
    }

    if (role === 'admin') {
      return [
        {
          key: PAGE_URL.ADMIN_DASHBOARD,
          icon: <DashboardOutlined />,
          label: 'Dashboard',
        },
        {
          key: PAGE_URL.ADMIN_USERS,
          icon: <UserOutlined />,
          label: 'Users',
        },
        {
          key: PAGE_URL.ADMIN_CONFIG,
          icon: <SettingOutlined />,
          label: 'AI Config',
        },
      ];
    }

    if (role === 'staff') {
      return [
        {
          key: PAGE_URL.STAFF_REVIEW,
          icon: <FileTextOutlined />,
          label: 'Review',
        },
        {
          key: PAGE_URL.STAFF_CMS,
          icon: <EditOutlined />,
          label: 'CMS',
        },
      ];
    }

    return [];
  }, []);

  return (
    <Layout.Sider
      width={256}
      className="fixed left-0 top-0 h-screen shadow-lg z-20"
      theme="dark"
      style={{ background: '#1e3a8a' }}
    >
      <div className="h-16 flex items-center justify-center border-b border-blue-700">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
          <span className="text-blue-900 font-bold text-lg">SA</span>
        </div>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        className="border-r-0 pt-4"
        theme="dark"
        style={{
          background: '#1e3a8a',
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
        }}
      />
    </Layout.Sider>
  );
}

