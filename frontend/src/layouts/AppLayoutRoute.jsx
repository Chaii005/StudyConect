import { Outlet } from 'react-router-dom';
import AppLayout from './AppLayout';

export default function AppLayoutRoute() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
