import { Card, Typography, Tabs, Button } from '../../config';
import PacingChart from '../../components/Charts/PacingChart';
import EmotionFlowChart from '../../components/Charts/EmotionFlowChart';
import CharacterPresenceChart from '../../components/Charts/CharacterPresenceChart';
import { mockAnalysisResult, generatePacingData } from '../../utils/mockData';

const { Title, Text } = Typography;

export default function AuthorAnalysis() {
  const pacingData = generatePacingData(mockAnalysisResult.summary.totalChapters, mockAnalysisResult);

  const tabItems = [
    {
      key: 'plot',
      label: 'Plot Structure',
      children: (
        <div className="space-y-6">
          <Card className="border-0 shadow-md bg-white">
            <Title level={4} className="mb-4 text-gray-800">
              Story Arc Overview
            </Title>
            <PacingChart data={pacingData} />
          </Card>
          <Card className="border-0 shadow-md bg-white">
            <Title level={5} className="mb-2 text-gray-800">
              Summary
            </Title>
            <Text className="text-gray-700">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </Text>
          </Card>
          <div className="flex space-x-3">
            <Button type="default" size="large">
              Emotional Flow
            </Button>
            <Button type="default" size="large">
              Emotional Insights
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: 'emotion',
      label: 'Emotional Analysis',
      children: (
        <div className="space-y-6">
          <EmotionFlowChart data={mockAnalysisResult.emotionFlow} />
          <CharacterPresenceChart data={mockAnalysisResult.characters} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Title level={2} className="mb-0 text-gray-800">
        Analysis
      </Title>

      <Card className="shadow-md border-0 bg-white">
        <Tabs
          defaultActiveKey="plot"
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  );
}

