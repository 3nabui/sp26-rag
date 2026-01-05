import { Card, Table, Button, Space, Tag, Typography, Modal, Form, Input, Select } from '../../config';
import { type ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { mockUsers } from '../../utils/mockData';
import type { User } from '../../interfaces';

const { Title, Text } = Typography;

export default function AdminUsers() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

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
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingUser(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} size="small">
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const handleOk = () => {
    form.validateFields().then(() => {
      // TODO: Save user
      setIsModalVisible(false);
      form.resetFields();
      setEditingUser(null);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={2} className="mb-2 text-gray-800">
            Users
          </Title>
          <Text type="secondary" className="text-base">
            Manage all users in the system
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => {
            setEditingUser(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 h-11 px-6 font-semibold"
        >
          Add User
        </Button>
      </div>

      <Card className="shadow-xl border-0 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
          <Title level={4} className="mb-0 text-gray-700">
            User List
          </Title>
        </div>
        <div className="p-6">
          <Table
            columns={columns}
            dataSource={mockUsers}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => (
                <span className="text-gray-600 font-medium">Total {total} users</span>
              ),
            }}
            className="rounded-lg"
          />
        </div>
      </Card>

      <Modal
        title={
          <div className="text-lg font-semibold text-gray-800">
            {editingUser ? 'Edit User' : 'Add User'}
          </div>
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingUser(null);
        }}
        okButtonProps={{
          className: 'bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg',
        }}
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter name' }]}>
            <Input size="large" className="rounded-lg" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Invalid email' },
            ]}
          >
            <Input size="large" className="rounded-lg" />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Please select role' }]}>
            <Select size="large" className="rounded-lg">
              <Select.Option value="author">Author</Select.Option>
              <Select.Option value="staff">Staff</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

