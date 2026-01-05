import { Card, Typography, Row, Col, Statistic, Table, Tag } from '../../config';
import { UserOutlined, FileTextOutlined, SettingOutlined, DatabaseOutlined } from '@ant-design/icons';
import { type ColumnsType } from 'antd/es/table';
import { mockUsers } from '../../utils/mockData';
import type { User } from '../../interfaces';

const { Title, Text } = Typography;

const columns: ColumnsType<User> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    render: (role: string) => {
      const roleMap: Record<string, { color: string; text: string }> = {
        author: { color: 'blue', text: 'Author' },
        admin: { color: 'red', text: 'Admin' },
        staff: { color: 'green', text: 'Staff' },
      };
      const roleInfo = roleMap[role] || { color: 'default', text: role };
      return <Tag color={roleInfo.color}>{roleInfo.text}</Tag>;
    },
  },
  {
    title: 'Created At',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (date: string) => new Date(date).toLocaleDateString('en-US'),
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Title level={2} className="mb-2 text-gray-800">
          Admin Dashboard
        </Title>
        <Text type="secondary" className="text-base">
          System overview and user management
        </Text>
      </div>

      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-lg border-0 rounded-xl hover:shadow-xl transition-all duration-200 border-l-4 border-l-blue-500">
            <Statistic
              title={<span className="text-gray-600 font-medium">Total Users</span>}
              value={1128}
              prefix={<UserOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1677ff', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-lg border-0 rounded-xl hover:shadow-xl transition-all duration-200 border-l-4 border-l-green-500">
            <Statistic
              title={<span className="text-gray-600 font-medium">Manuscripts</span>}
              value={543}
              prefix={<FileTextOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-lg border-0 rounded-xl hover:shadow-xl transition-all duration-200 border-l-4 border-l-yellow-500">
            <Statistic
              title={<span className="text-gray-600 font-medium">AI Config</span>}
              value={12}
              prefix={<SettingOutlined className="text-yellow-500" />}
              valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-lg border-0 rounded-xl hover:shadow-xl transition-all duration-200 border-l-4 border-l-red-500">
            <Statistic
              title={<span className="text-gray-600 font-medium">Storage</span>}
              value={85}
              suffix="%"
              prefix={<DatabaseOutlined className="text-red-500" />}
              valueStyle={{ color: '#ff4d4f', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="shadow-xl border-0 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
          <Title level={4} className="mb-0 text-gray-700">
            Recent Users
          </Title>
        </div>
        <div className="p-6">
          <Table
            columns={columns}
            dataSource={mockUsers}
            rowKey="id"
            pagination={false}
            className="rounded-lg"
          />
        </div>
      </Card>
    </div>
  );
}

