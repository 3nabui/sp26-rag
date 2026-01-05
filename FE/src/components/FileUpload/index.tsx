import { Upload, message, Typography } from '../../config';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';

const { Dragger } = Upload;
const { Text } = Typography;

interface FileUploadProps {
  onUploadSuccess?: (file: UploadFile) => void;
  onUploadError?: (error: Error) => void;
}

export default function FileUpload({ onUploadSuccess, onUploadError }: FileUploadProps) {
  const props: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.txt,.docx,.pdf',
    action: '/api/upload', // TODO: Replace with actual API endpoint
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} uploaded successfully.`);
        onUploadSuccess?.(info.file);
      } else if (status === 'error') {
        message.error(`${info.file.name} upload failed.`);
        onUploadError?.(new Error('Upload failed'));
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <div className="w-full">
      <Dragger
        {...props}
        className="bg-white border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg transition-all duration-300"
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined className="text-4xl text-gray-400" />
        </p>
        <p className="ant-upload-text text-lg font-medium text-gray-700 mt-4">
          Drag & Drop files here or Click to upload
        </p>
        <p className="ant-upload-hint mt-2">
          <Text type="secondary" className="text-sm">
            TXT, DOCX, PDF
          </Text>
        </p>
      </Dragger>
    </div>
  );
}

