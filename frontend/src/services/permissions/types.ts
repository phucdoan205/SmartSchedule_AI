export interface SubPermissionItem {
  id: string;
  code: string;
  name: string;
}

export interface SystemModuleItem {
  id: string;
  code: string;
  name: string;
  path: string;
  iconName: string;
  subPermissions: SubPermissionItem[];
}

export interface SystemRoleItem {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  iconName?: string;
  isSystem?: boolean;
}

export interface ModulePermissionState {
  enabled: boolean;
  subPermissions: Record<string, boolean>; // subPermCode -> boolean
}

export type MatrixState = Record<string, Record<string, ModulePermissionState>>;
// roleCode -> moduleCode -> { enabled, subPermissions }
