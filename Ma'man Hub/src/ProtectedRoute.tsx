import { Navigate, useLocation } from "react-router-dom";


export type UserRole =
  | "Admin"
  | "ContentCreator"
  | "Parent"
  | "Student"
  | "Specialist";

interface StoredUser {
  id: string;
  fullName: string;
  role: UserRole;
  isFirstLogin: boolean;
  profilePictureUrl: string | null;
}


function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}


interface ProtectedRouteProps {
  element: React.ReactElement;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({
  element,
  allowedRoles = [],
}: ProtectedRouteProps) => {
  const location = useLocation();
  const user = getStoredUser();

  // 1. Not authenticated → go to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role not permitted → redirect to role's home page
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return element;
};

export default ProtectedRoute;


export function roleHome(role: UserRole): string {
  switch (role) {
    case "Admin":          return "/admin/profile";
    case "ContentCreator": return "/creator/profile";
    case "Parent":         return "/parent/profile";
    case "Student":        return "/student/profile";
    case "Specialist":     return "/specialist/profile";
    default:               return "/";
  }
}