import { Card, Tabs, Form, Input, Button, Space, Table, Typography, Tag } from '../../config';
import { type ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { mockFAQs, mockWritingTips } from '../../utils/mockData';
import type { FAQ, WritingTip } from '../../utils/mockData';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function StaffCMS() {
  const [faqForm] = Form.useForm();
  const [tipForm] = Form.useForm();

  const faqColumns: ColumnsType<FAQ> = [
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
    },
    {
      title: 'Answer',
      dataIndex: 'answer',
      key: 'answer',
      ellipsis: true,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: 'Actions',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} size="small">
            Edit
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} size="small">
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const tipColumns: ColumnsType<WritingTip> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="green">{category}</Tag>,
    },
    {
      title: 'Actions',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} size="small">
            Edit
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} size="small">
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'faq',
      label: 'FAQ',
      children: (
        <div className="space-y-6 p-6">
          <Card className="shadow-lg border-0 rounded-xl">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 rounded-t-xl border-b border-gray-200 mb-4">
              <Title level={4} className="mb-0 text-gray-700">
                Add New Question
              </Title>
            </div>
            <div className="p-6">
              <Form form={faqForm} layout="vertical">
                <Form.Item name="question" label="Question" rules={[{ required: true }]}>
                  <Input size="large" placeholder="Enter question" className="rounded-lg" />
                </Form.Item>
                <Form.Item name="answer" label="Answer" rules={[{ required: true }]}>
                  <TextArea rows={4} placeholder="Enter answer" className="rounded-lg" />
                </Form.Item>
                <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                  <Input size="large" placeholder="Enter category" className="rounded-lg" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 px-6 font-semibold"
                  >
                    Add FAQ
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Card>

          <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
              <Title level={4} className="mb-0 text-gray-700">
                FAQ List
              </Title>
            </div>
            <div className="p-6">
              <Table columns={faqColumns} dataSource={mockFAQs} rowKey="id" />
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: 'tips',
      label: 'Writing Tips',
      children: (
        <div className="space-y-6 p-6">
          <Card className="shadow-lg border-0 rounded-xl">
            <div className="bg-gradient-to-r from-green-50 to-teal-50 px-6 py-4 rounded-t-xl border-b border-gray-200 mb-4">
              <Title level={4} className="mb-0 text-gray-700">
                Add New Tip
              </Title>
            </div>
            <div className="p-6">
              <Form form={tipForm} layout="vertical">
                <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                  <Input size="large" placeholder="Enter title" className="rounded-lg" />
                </Form.Item>
                <Form.Item name="content" label="Content" rules={[{ required: true }]}>
                  <TextArea rows={6} placeholder="Enter tip content" className="rounded-lg" />
                </Form.Item>
                <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                  <Input size="large" placeholder="Enter category" className="rounded-lg" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    className="bg-gradient-to-r from-green-500 to-teal-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 px-6 font-semibold"
                  >
                    Add Tip
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Card>

          <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-teal-50 px-6 py-4 border-b border-gray-200">
              <Title level={4} className="mb-0 text-gray-700">
                Writing Tips List
              </Title>
            </div>
            <div className="p-6">
              <Table columns={tipColumns} dataSource={mockWritingTips} rowKey="id" />
            </div>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Title level={2} className="mb-2 text-gray-800">
          CMS
        </Title>
        <Text type="secondary" className="text-base">
          Manage FAQ and writing tips for users
        </Text>
      </div>
      <Card className="shadow-xl border-0 rounded-xl overflow-hidden">
        <Tabs
          defaultActiveKey="faq"
          items={tabItems}
          size="large"
          className="custom-tabs"
          tabBarStyle={{
            padding: '0 24px',
            background: 'linear-gradient(to right, #eff6ff, #faf5ff)',
            margin: 0,
          }}
        />
      </Card>
    </div>
  );
}

