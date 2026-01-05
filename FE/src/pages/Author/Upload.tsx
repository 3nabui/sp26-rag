import { Card, Typography, Button, Table, Tag, Space } from '../../config';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { mockManuscripts } from '../../utils/mockData';
import FileUpload from '../../components/FileUpload';
import type { ColumnsType } from 'antd/es/table';
import type { Manuscript } from '../../interfaces';

const { Title } = Typography;

const columns: ColumnsType<Manuscript> = [
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: 'Version',
    dataIndex: 'version',
    key: 'version',
    render: (version) => `V${version}`,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      const statusMap: Record<string, { color: string; text: string }> = {
        completed: { color: 'success', text: 'Analyzed' },
        processing: { color: 'blue', text: 'Uploaded' },
        pending: { color: 'default', text: 'Pending' },
      };
      const statusInfo = statusMap[status] || { color: 'default', text: status };
      return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
    },
  },
  {
    title: 'Actions',
    key: 'action',
    render: () => (
      <Space size="middle">
        <Button type="link" icon={<EyeOutlined />} size="small">
          View
        </Button>
        <Button type="link" danger icon={<DeleteOutlined />} size="small">
          Delete
        </Button>
      </Space>
    ),
  },
];

export default function AuthorUpload() {
  return (
    <div className="space-y-6">
      <Title level={2} className="mb-0 text-gray-800">
        My Manuscripts
      </Title>

      {/* File Upload Area */}
      <Card className="shadow-md border-0 bg-white">
        <FileUpload
          onUploadSuccess={() => {
            // Handle upload success
          }}
        />
      </Card>

      {/* My Manuscripts Table */}
      <Card className="shadow-md border-0 bg-white">
        <Title level={4} className="mb-4 text-gray-800">
          My Manuscripts
        </Title>
        <Table
          columns={columns}
          dataSource={mockManuscripts}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} manuscripts`,
          }}
        />
      </Card>
    </div>
  );
}
