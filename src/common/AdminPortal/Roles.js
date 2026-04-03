// Role constants
export const ROLES = {
  CAN_VIEW: "CanView",
  CAN_EDIT: "CanEdit",
  CAN_DELETE: "CanDelete",
  CAN_CREATE: "CanCreate",
  RESELLER_ADMIN: "reseller_admin",
  SUPER_ADMIN: "super_admin",
  ACCOUNT_OWNER: "account_owner",

  ALERTS_ACKNOWLEDGE: "alerts.acknowledge",
  ALERTS_DELETE: "alerts.delete",
  ALERTS_EXPORT: "alerts.export",
  ALERTS_RESOLVE: "alerts.resolve",
  ALERTS_SNOOZE: "alerts.snooze",
  ALERTS_VIEW: "alerts.view",

  BILLING_MANAGE: "billing.manage",
  BILLING_VIEW: "billing.view",

  DEVICES_ASSIGN: "devices.assign",
  DEVICES_CREATE: "devices.create",
  DEVICES_DELETE: "devices.delete",
  DEVICES_EXPORT: "devices.export",
  DEVICES_UPDATE: "devices.update",
  DEVICES_VIEW: "devices.view",

  LOCATIONS_CREATE: "locations.create",
  LOCATIONS_DELETE: "locations.delete",
  LOCATIONS_UPDATE: "locations.update",
  LOCATIONS_VIEW: "locations.view",

  PLATFORM_CONFIG: "platform.config",
  PLATFORM_USERS_CREATE: "platform_users.create",
  PLATFORM_USERS_DELETE: "platform_users.delete",
  PLATFORM_USERS_EDIT: "platform_users.edit",
  PLATFORM_USERS_VIEW: "platform_users.view",

  REPORTING_EXPORT: "reporting.export",
  REPORTING_VIEW: "reporting.view",

  RESELLERS_CREATE: "resellers.create",
  RESELLERS_DEACTIVATE: "resellers.deactivate",
  RESELLERS_DELETE: "resellers.delete",
  RESELLERS_UPDATE: "resellers.update",
  RESELLERS_VIEW: "resellers.view",

  ROLEPERMISSIONS_EDIT: "rolepermissions.edit",

  SETTINGS_EDIT: "settings.edit",
  SETTINGS_VIEW: "settings.view",

  TENANT_DATA_ALERTS_VIEW: "tenant.data.alerts.view",
  TENANT_DATA_DEVICES_VIEW: "tenant.data.devices.view",
  TENANT_DATA_LOCATIONS_VIEW: "tenant.data.locations.view",
  TENANT_DATA_REPORTING_VIEW: "tenant.data.reporting.view",
  TENANT_DATA_SUBSCRIPTIONS_VIEW: "tenant.data.subscriptions.view",
  TENANT_DATA_TELEMETRY_VIEW: "tenant.data.telemetry.view",
  TENANT_DATA_USERS_VIEW: "tenant.data.users.view",

  TENANTS_CREATE: "tenants.create",
  TENANTS_DEACTIVATE: "tenants.deactivate",
  TENANTS_MOVE: "tenants.move",
  TENANTS_UPDATE: "tenants.update",
  TENANTS_VIEW: "tenants.view",
  TENANTS_DELETE: "tenants.delete",

  USERS_EDIT: "users.edit",
  USERS_INVITE: "users.invite",
  USERS_REMOVE: "users.remove",
  USERS_VIEW: "users.view",
};

// Route-to-Role mapping
// Empty array or no entry means accessible by all authenticated users
export const ROUTE_PERMISSIONS = {
  DASHBOARD: [], // Accessible by all roles
  RESELLER: [ROLES.SUPER_ADMIN, ROLES.RESELLER_ADMIN, ROLES.ACCOUNT_OWNER],
  RESELLER_DETAIL: [
    ROLES.SUPER_ADMIN,
    ROLES.RESELLER_ADMIN,
    ROLES.ACCOUNT_OWNER,
  ],
  USERS: [ROLES.SUPER_ADMIN, ROLES.RESELLER_ADMIN, ROLES.ACCOUNT_OWNER],
  SECURITY: [ROLES.SUPER_ADMIN],
  TENANTS: [],
  SYSTEM: [], // Accessible by all roles
  PASSWORD: [], // Accessible by all roles,
  DEACTIVATE_ACCOUNT: [], // Accessible by all roles,
  USER_DETAIL: [], // Accessible by all roles,
  TENANT_DETAILS: [], // Accessible by all roles
};

// Menu item visibility based on roles
export const MENU_PERMISSIONS = {
  DASHBOARD: [], // All roles
  RESELLER: [ROLES.SUPER_ADMIN, ROLES.RESELLER_ADMIN],
  USERS: [ROLES.SUPER_ADMIN],
  SYSTEM: [ROLES.SUPER_ADMIN],
  SETTINGS: [], // All roles
  TENANTS: [ROLES.SUPER_ADMIN, ROLES.RESELLER_ADMIN], // All roles
};
