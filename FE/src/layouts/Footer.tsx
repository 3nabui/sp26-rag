import { Layout, Typography } from '../config';

const { Text } = Typography;

export default function Footer() {
  return (
    <Layout.Footer className="bg-white border-t border-gray-200 text-center py-4">
      <div className="flex items-center justify-center space-x-4">
        <Text type="secondary" className="text-sm text-gray-600">
          2026 Story Analyzer
        </Text>
        <Text type="secondary" className="text-sm text-gray-400">
           | 
        </Text>
        <Text type="secondary" className="text-sm text-gray-600">
          Powered by SP_26_SE
        </Text>
      </div>
    </Layout.Footer>
  );
}

