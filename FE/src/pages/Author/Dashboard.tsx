import { Card, Table, Tag, Button, Typography, Row, Col, Statistic } from '../../config';
import { EyeOutlined } from '@ant-design/icons';
import { mockManuscripts } from '../../utils/mockData';

const { Title } = Typography;

export default function AuthorDashboard() {
  const totalManuscripts = mockManuscripts.length;
  const analyzedCount = mockManuscripts.filter(m => m.status === 'completed').length;
  const inProgressCount = mockManuscripts.filter(m => m.status === 'processing').length;

  return (
    <div className="space-y-6">
      <Title level={2} className="mb-0 text-gray-800">
        Dashboard
      </Title>

      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="border-0 shadow-md bg-white">
            <Statistic
              title={<span className="text-gray-600 font-medium">Stories Uploaded</span>}
              value={totalManuscripts}
              valueStyle={{ color: '#1e40af', fontWeight: 'bold', fontSize: '32px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="border-0 shadow-md bg-white">
            <Statistic
              title={<span className="text-gray-600 font-medium">Stories Analyzed</span>}
              value={analyzedCount}
              valueStyle={{ color: '#059669', fontWeight: 'bold', fontSize: '32px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="border-0 shadow-md bg-white">
            <Statistic
              title={<span className="text-gray-600 font-medium">In Progress</span>}
              value={inProgressCount}
              valueStyle={{ color: '#d97706', fontWeight: 'bold', fontSize: '32px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Manuscripts */}
      <Card className="border-0 shadow-md bg-white">
        <Title level={4} className="mb-4 text-gray-800">
          Recent Manuscripts
        </Title>
        <Table
          columns={[
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
                  processing: { color: 'warning', text: 'Analyzed' },
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
                <Button type="link" icon={<EyeOutlined />} size="small">
                  View
                </Button>
              ),
            },
          ]}
          dataSource={mockManuscripts.slice(0, 3)}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
}
