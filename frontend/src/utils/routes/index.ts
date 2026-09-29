import React from 'react';
export interface SideBarRoute {
  path: string;
  icon: React.ComponentType<any>;
  exact?: boolean;
  routes?: SideBarRoute[];
  name: string;
  altPaths?: string[];
  iconSize?: number;
  roleAcessible?: string[];
  hasSubRoutes?: boolean;
}
