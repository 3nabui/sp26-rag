import { Card, Typography, Form, InputNumber, Button, Space, message } from '../../config';
import { SaveOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Title, Paragraph } = Typography;

export default function AdminConfig() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      // TODO: Save config to API
      setTimeout(() => {
        setLoading(false);
        message.success('Configuration saved successfully!');
      }, 1000);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Title level={2} className="mb-2 text-gray-800">
          AI Config
        </Title>
        <Paragraph type="secondary" className="text-base">
          Adjust RAG parameters to optimize analysis performance
        </Paragraph>
      </div>

      <Card className="shadow-xl border-0 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
          <Title level={4} className="mb-0 text-gray-700">
            RAG Parameters
          </Title>
        </div>
        <div className="p-6">
          <Form form={form} layout="vertical" initialValues={{ chunkSize: 512, topK: 5 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="chunkSize"
                label={<span className="font-semibold text-gray-700">Chunk Size</span>}
                tooltip="Size of each chunk when splitting documents"
                rules={[{ required: true, message: 'Please enter chunk size' }]}
              >
                <InputNumber min={128} max={2048} className="w-full" size="large" />
              </Form.Item>

              <Form.Item
                name="topK"
                label={<span className="font-semibold text-gray-700">Top-K Retrieval</span>}
                tooltip="Maximum number of results returned when searching"
                rules={[{ required: true, message: 'Please enter top-k' }]}
              >
                <InputNumber min={1} max={20} className="w-full" size="large" />
              </Form.Item>

              <Form.Item
                name="embeddingDimension"
                label={<span className="font-semibold text-gray-700">Embedding Dimension</span>}
                tooltip="Dimension of embedding vector"
              >
                <InputNumber min={128} max={1536} className="w-full" size="large" />
              </Form.Item>

              <Form.Item
                name="similarityThreshold"
                label={<span className="font-semibold text-gray-700">Similarity Threshold</span>}
                tooltip="Minimum similarity threshold (0-1)"
              >
                <InputNumber min={0} max={1} step={0.1} className="w-full" size="large" />
              </Form.Item>
            </div>

            <Form.Item className="mt-6">
              <Space size="large">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={loading}
                  onClick={handleSave}
                  size="large"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 px-6 font-semibold"
                >
                  Save Config
                </Button>
                <Button size="large" onClick={() => form.resetFields()} className="px-6">
                  Reset
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Card>
    </div>
  );
}

