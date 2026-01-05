import { Card, Table, Tag, Button, Space, Typography, Modal } from '../../config';
import { type ColumnsType } from 'antd/es/table';
import { EyeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { mockFlaggedManuscripts } from '../../utils/mockData';
import type { Manuscript } from '../../interfaces';

const { Title, Paragraph, Text } = Typography;

export default function StaffReview() {
  const [selectedManuscript, setSelectedManuscript] = useState<Manuscript | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const columns: ColumnsType<Manuscript> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: 'Upload Date',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      render: (date: string) => new Date(date).toLocaleDateString('en-US'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color="warning">Under Review</Tag>,
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setSelectedManuscript(record);
              setIsModalVisible(true);
            }}
          >
            View Details
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Title level={2} className="mb-2 text-gray-800">
          Review
        </Title>
        <Text type="secondary" className="text-base">
          Review and respond to manuscripts that need moderation
        </Text>
      </div>

      <Card className="shadow-xl border-0 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-200">
          <Title level={4} className="mb-0 text-gray-700">
            Flagged Manuscripts
          </Title>
        </div>
        <div className="p-6">
          <Table
            columns={columns}
            dataSource={mockFlaggedManuscripts}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => (
                <span className="text-gray-600 font-medium">Total {total} manuscripts</span>
              ),
            }}
            className="rounded-lg"
          />
        </div>
      </Card>

      <Modal
        title={
          <div className="text-lg font-semibold text-gray-800">Manuscript Details</div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedManuscript(null);
        }}
        footer={[
          <Button
            key="reject"
            danger
            icon={<CloseOutlined />}
            size="large"
            className="px-6 font-semibold"
          >
            Reject
          </Button>,
          <Button
            key="approve"
            type="primary"
            icon={<CheckOutlined />}
            size="large"
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 px-6 font-semibold"
          >
            Approve
          </Button>,
        ]}
        width={900}
      >
        {selectedManuscript && (
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Text type="secondary" className="text-sm block mb-1">
                  Title
                </Text>
                <Text strong className="text-base">
                  {selectedManuscript.title}
                </Text>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <Text type="secondary" className="text-sm block mb-1">
                  File Name
                </Text>
                <Text strong className="text-base">
                  {selectedManuscript.fileName}
                </Text>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <Text type="secondary" className="text-sm block mb-1">
                  File Size
                </Text>
                <Text strong className="text-base">
                  {(selectedManuscript.fileSize / 1024 / 1024).toFixed(2)} MB
                </Text>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Text type="secondary" className="text-sm block mb-2">
                Manuscript Content
              </Text>
              <Paragraph className="bg-white p-4 rounded border border-gray-200 min-h-[200px]">
                Manuscript content will be displayed here...
              </Paragraph>
            </div>
            <div>
              <Text strong className="text-base block mb-2">
                Feedback for Author:
              </Text>
              <Paragraph
                editable={{ onChange: (str) => console.log(str) }}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[100px]"
              >
                Enter feedback for the author...
              </Paragraph>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

