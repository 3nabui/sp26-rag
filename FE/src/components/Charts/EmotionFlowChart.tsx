import { Card, Typography } from '../../config';
import { Area } from '@ant-design/charts';

const { Title } = Typography;

interface EmotionFlowChartProps {
  data: Array<{ chapter: number; emotion: string; intensity: number }>;
}

export default function EmotionFlowChart({ data }: EmotionFlowChartProps) {
  const config = {
    data,
    xField: 'chapter',
    yField: 'intensity',
    seriesField: 'emotion',
    smooth: true,
    areaStyle: {
      fillOpacity: 0.6,
    },
    legend: {
      position: 'top' as const,
    },
  };

  return (
    <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
        <Title level={4} className="mb-0 text-gray-700">
          Dòng chảy cảm xúc
        </Title>
      </div>
      <div className="p-6">
        <Area {...config} />
      </div>
    </Card>
  );
}

