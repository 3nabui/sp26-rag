import { Card, Typography } from '../../config';
import { Line } from '@ant-design/charts';

const { Title } = Typography;

interface PacingChartProps {
  data: Array<{ chapter: number; pacing: string }>;
}

export default function PacingChart({ data }: PacingChartProps) {
  const config = {
    data,
    xField: 'chapter',
    yField: 'pacing',
    point: {
      size: 5,
      shape: 'circle',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
    smooth: true,
    color: '#1677ff',
  };

  return (
    <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
        <Title level={4} className="mb-0 text-gray-700">
          Nhịp độ truyện theo chương
        </Title>
      </div>
      <div className="p-6">
        <Line {...config} />
      </div>
    </Card>
  );
}

