import { ConfigProvider } from 'antd';
import vi_VN from 'antd/locale/vi_VN';
import React from 'react';
import 'antd/dist/reset.css';

// eslint-disable-next-line react-refresh/only-export-components
export * from 'antd';

export const ConfigProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ConfigProvider locale={vi_VN} theme={{ token: { colorPrimary: '#1677ff' } }}>
      {children}
    </ConfigProvider>
  );
};

