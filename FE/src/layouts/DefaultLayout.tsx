import { Layout } from '../config';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { type ReactNode } from 'react';

interface DefaultLayoutProps {
  children: ReactNode;
}

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  return (
    <Layout className="min-h-screen bg-white">
      <Sidebar />
      <Layout className="ml-64" style={{ marginLeft: '256px' }}>
        <Header />
        <Layout.Content 
          className="bg-white" 
          style={{ 
            marginTop: '64px',
            minHeight: 'calc(100vh - 64px)'
          }}
        >
          <div className="p-6 min-w-0">{children}</div>
        </Layout.Content>
        <Footer />
      </Layout>
    </Layout>
  );
}

