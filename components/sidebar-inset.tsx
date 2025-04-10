import React from 'react';
import { SidebarInset as BaseSidebarInset } from './ui/sidebar';

interface CustomSidebarInsetProps extends React.ComponentProps<typeof BaseSidebarInset> {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function SidebarInset({ activeTab, onTabChange, ...props }: CustomSidebarInsetProps) {
  return <BaseSidebarInset {...props} />;
}
