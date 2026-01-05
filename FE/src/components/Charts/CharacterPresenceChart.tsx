import { Card, Typography } from '../../config';
import { Column } from '@ant-design/charts';

const { Title } = Typography;

interface CharacterPresenceChartProps {
  data: Array<{ name: string; appearances: number }>;
}

export default function CharacterPresenceChart({ data }: CharacterPresenceChartProps) {
  const config = {
    data,
    xField: 'name',
    yField: 'appearances',
    columnWidthRatio: 0.8,
    label: {
      position: 'top' as const,
    },
    color: '#1677ff',
  };

  return (
    <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 to-teal-50 px-6 py-4 border-b border-gray-200">
        <Title level={4} className="mb-0 text-gray-700">
          Sự hiện diện của nhân vật
        </Title>
      </div>
      <div className="p-6">
        <Column {...config} />
      </div>
    </Card>
  );
}

