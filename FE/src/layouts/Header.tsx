import { Layout, Avatar, Dropdown, Space, Button } from '../config';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

export default function Header() {

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  return (
    <Layout.Header 
      className="bg-white shadow-sm border-b border-gray-200 px-6 fixed top-0 right-0 left-64 z-10 h-16"
      style={{ 
        position: 'fixed',
        top: 0,
        right: 0,
        left: '256px',
        zIndex: 10,
        height: '64px',
        background: '#ffffff'
      }}
    >
      <div className="flex items-center justify-between h-full w-full px-6">
        <h1
          className="project-title"
          style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#1e293b',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          RAG Story Analysis
        </h1>

        <div className="flex items-center space-x-4">
          <Button
            type="text"
            icon={<SettingOutlined />}
            className="flex items-center hover:bg-gray-100 transition-colors rounded-lg text-gray-600"
          />

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
            <Space className="cursor-pointer hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-all duration-200">
              <Avatar
                icon={<UserOutlined />}
                className="bg-blue-600"
                size="default"
              />
            </Space>
          </Dropdown>
        </div>
      </div>
    </Layout.Header>
  );
}

