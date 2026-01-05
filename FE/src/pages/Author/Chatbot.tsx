import { Card, Input, Button, Typography, Divider } from '../../config';

const { Title, Text } = Typography;

export default function AuthorChatbot() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Title level={2} className="mb-0 text-gray-800">
        Ask AI
      </Title>

      <Card className="shadow-md border-0 bg-white">
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Input
                placeholder="Enter your question here..."
                size="large"
                className="flex-1"
              />
              <Button type="primary" size="large">
                Submit
              </Button>
            </div>
          </div>

          <Divider />

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <Title level={5} className="mb-2 text-gray-800">
                AI Response
              </Title>
              <Text className="text-gray-700">
                In Chapter 5, the pace of the story slows down as the protagonist spends time reflecting on past-events and engaging in lengthy dialogues.
              </Text>
            </div>

            <Divider />

            <div className="bg-gray-50 p-4 rounded-lg">
              <Title level={5} className="mb-2 text-gray-800">
                Relevant Excerpt
              </Title>
              <Text className="text-gray-700 italic">
                "Chapter 5: 'The moonlight bathed the room as he sat silently, pondering the choices he had made...'"
              </Text>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
