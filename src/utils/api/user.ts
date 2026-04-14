import type { Role } from "../../types";

export function useGetAllUserRoles(): Role[] {
  return [];
}

export function useUserMutations() {
  return {
    updateUser: (_payload: {
      id: string;
      updates: {
        role: Role;
      };
    }) => undefined,
  };
}
