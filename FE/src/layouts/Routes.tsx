import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Spin } from '../config';
import DefaultLayout from './DefaultLayout';

const AuthorDashboard = lazy(() => import('../pages/Author/Dashboard'));
const AuthorUpload = lazy(() => import('../pages/Author/Upload'));
const AuthorAnalysis = lazy(() => import('../pages/Author/Analysis'));
const AuthorChatbot = lazy(() => import('../pages/Author/Chatbot'));
const AdminDashboard = lazy(() => import('../pages/Admin/Dashboard'));
const AdminUsers = lazy(() => import('../pages/Admin/Users'));
const AdminConfig = lazy(() => import('../pages/Admin/Config'));
const StaffReview = lazy(() => import('../pages/Staff/Review'));
const StaffCMS = lazy(() => import('../pages/Staff/CMS'));

const Wrap = (element: ReactNode) => (
  <DefaultLayout>
    <Suspense fallback={<Spin className="w-screen h-screen" spinning={true} />}>{element}</Suspense>
  </DefaultLayout>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/author/dashboard" replace />,
  },
  {
    path: '/author/dashboard',
    element: Wrap(<AuthorDashboard />),
  },
  {
    path: '/author/upload',
    element: Wrap(<AuthorUpload />),
  },
  {
    path: '/author/analysis',
    element: Wrap(<AuthorAnalysis />),
  },
  {
    path: '/author/chatbot',
    element: Wrap(<AuthorChatbot />),
  },
  {
    path: '/admin/dashboard',
    element: Wrap(<AdminDashboard />),
  },
  {
    path: '/admin/users',
    element: Wrap(<AdminUsers />),
  },
  {
    path: '/admin/config',
    element: Wrap(<AdminConfig />),
  },
  {
    path: '/staff/review',
    element: Wrap(<StaffReview />),
  },
  {
    path: '/staff/cms',
    element: Wrap(<StaffCMS />),
  },
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}

