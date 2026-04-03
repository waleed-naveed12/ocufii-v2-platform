import { useUser } from "../../context/CustomerPortal/UserContext";

/**
 * Custom hook for authentication and authorization
 * Provides utilities to check user permissions and roles
 */
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, logout } = useUser();

  const hasPermission = (permissionKey) => {
    if (!isAuthenticated || !user || !permissionKey) return false;

    const permissionKeys = user.permissionKeys || [];
    if (permissionKeys.includes(permissionKey)) {
      return true;
    }

    const permissions = user.permissions || [];
    return permissions.some((permission) => permission.key === permissionKey);
  };

  /**
   * Get the current user's role
   * @returns {string|null} The user's role or null if not authenticated
   */
  const getUserRole = () => {
    if (!user) return null;
    return user.role || user.userType || null;
  };

  /**
   * Check if user has any of the specified roles
   * @param {string|string[]} allowedRoles - Single role or array of roles
   * @returns {boolean} True if user has one of the allowed roles
   */
  const hasRole = (allowedRoles) => {
    if (!isAuthenticated || !user) return false;

    const userRole = getUserRole();
    if (!userRole) return false;

    // If no roles specified, allow all authenticated users
    if (
      !allowedRoles ||
      (Array.isArray(allowedRoles) && allowedRoles.length === 0)
    ) {
      return true;
    }

    // Convert to array if single role provided
    const rolesArray = Array.isArray(allowedRoles)
      ? allowedRoles
      : [allowedRoles];

    // Check if user's role is in the allowed roles
    return rolesArray.includes(userRole);
  };

  /**
   * Check if user can access a specific route
   * @param {string[]} allowedRoles - Array of roles allowed to access the route
   * @returns {boolean} True if user can access the route
   */
  const canAccessRoute = (allowedRoles) => {
    return hasRole(allowedRoles);
  };

  /**
   * Check if a menu item should be visible
   * @param {string[]} allowedRoles - Array of roles allowed to see the menu item
   * @returns {boolean} True if menu item should be visible
   */
  const canViewMenuItem = (allowedRoles) => {
    return hasRole(allowedRoles);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    getUserRole,
    hasRole,
    hasPermission,
    canAccessRoute,
    canViewMenuItem,
  };
};
