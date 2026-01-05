import { Card, Typography, Tag } from '../../config';
import type { CharacterRelation } from '../../interfaces';

const { Title } = Typography;

interface CharacterMapProps {
  relations: CharacterRelation[];
}

export default function CharacterMap({ relations }: CharacterMapProps) {
  return (
    <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
        <Title level={4} className="mb-0 text-gray-700">
          Bản đồ quan hệ nhân vật
        </Title>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {relations.map((relation, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  {relation.character1.charAt(0)}
                </div>
                <span className="text-gray-400 text-xl">→</span>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  {relation.character2.charAt(0)}
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-lg text-gray-800">{relation.character1}</div>
                  <div className="font-semibold text-lg text-gray-800">{relation.character2}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Tag color="blue" className="px-3 py-1 text-sm font-medium rounded-full">
                  {relation.relationship}
                </Tag>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 font-medium">Độ mạnh:</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                        style={{ width: `${(relation.strength / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{relation.strength}/10</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

