import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { User, Session, createClient } from "@supabase/supabase-js";
import { supabase, AuthUser, Organization, UserRole } from "../lib/supabase";

// Disable console.log in production for performance
if (process.env.NODE_ENV === "production") {
  console.log = () => {};
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  currentOrganization:
    | (Organization & { role: UserRole; is_primary: boolean })
    | null;
  setCurrentOrganization: (
    org: (Organization & { role: UserRole; is_primary: boolean }) | null
  ) => void;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<{ user: User | null; error: any }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<void>;
  createOrganization: (
    name: string,
    userRole?: UserRole
  ) => Promise<Organization>;
  joinOrganization: (orgId: string, role?: UserRole) => Promise<void>;
  leaveOrganization: (orgId: string) => Promise<void>;
  updateProfile: (firstName: string, lastName: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentOrganization, setCurrentOrganization] = useState<
    (Organization & { role: UserRole; is_primary: boolean }) | null
  >(null);

  // Promise debouncing with useRef to persist across renders
  const inflightProfileLoadRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Get initial session with error handling
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (cancelled) return;
        setSession(session);
        if (session?.user) {
          loadUserProfile(session.user);
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return;
      setSession(session);
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (
    authUser: User,
    retryCount = 0
  ): Promise<void> => {
    // Promise debouncing - reuse inflight request
    if (inflightProfileLoadRef.current) {
      await inflightProfileLoadRef.current;
      return;
    }

    inflightProfileLoadRef.current = reallyLoadUserProfile(
      authUser,
      retryCount
    );
    try {
      await inflightProfileLoadRef.current;
    } finally {
      inflightProfileLoadRef.current = null;
    }
  };

  const reallyLoadUserProfile = async (
    authUser: User,
    retryCount = 0
  ): Promise<void> => {
    if (process.env.NODE_ENV === "development") {
      console.log(`Loading profile for user ${authUser.id}`);
    }

    // AbortController with 10s timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 10000);

    try {
      // STEP 1: Get user profile with org_memberships (JSONB) - now with AbortController
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select(
          "id, email, first_name, last_name, created_at, updated_at, org_memberships"
        )
        .eq("id", authUser.id)
        .abortSignal(abortController.signal)
        .throwOnError()
        .single();

      if (!profileData) {
        throw new Error("Profile data not found");
      }

      // TypeScript assertion after null check
      const profile = profileData!;

      let organizations: Array<
        Organization & { role: UserRole; is_primary: boolean }
      > = [];

      // STEP 2: If user has org memberships, get organization details in single query
      if (profile.org_memberships && profile.org_memberships.length > 0) {
        const orgIds = profile.org_memberships.map((m: any) => m.org_id);

        const { data: orgsData } = await supabase
          .from("organizations")
          .select("id, name, address, phone, created_at, created_by")
          .in("id", orgIds)
          .abortSignal(abortController.signal)
          .throwOnError();

        clearTimeout(timeoutId);

        // Combine organization data with user's role info from JSONB
        organizations =
          orgsData?.map((org: any) => {
            const membership = profile.org_memberships.find(
              (m: any) => m.org_id === org.id
            );
            return {
              ...org,
              role: (membership?.role || "user") as UserRole,
              is_primary: membership?.is_primary || false,
            };
          }) || [];
      } else {
        clearTimeout(timeoutId);
      }

      if (process.env.NODE_ENV === "development") {
        console.log("Profile and organizations loaded successfully");
      }

      // Create complete user data
      const userData: AuthUser = {
        id: authUser.id,
        email: authUser.email || "",
        profile: {
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          org_memberships: profile.org_memberships,
        },
        organizations,
      };

      // Set all data at once
      setUser(userData);

      // Auto-select organization if we have any
      if (organizations.length > 0) {
        const primaryOrg = organizations.find((org) => org.is_primary);
        const selectedOrg = primaryOrg || organizations[0];
        setCurrentOrganization(selectedOrg);
      } else {
        setCurrentOrganization(null);
      }

      // ONLY NOW mark as not loading - after we have everything
      setLoading(false);
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (abortController.signal.aborted) {
        // Query was aborted due to timeout
        if (process.env.NODE_ENV === "development") {
          console.error("Profile loading timed out after 10s");
        }
      } else if (process.env.NODE_ENV === "development") {
        console.error("Profile loading failed:", error.message);
      }

      // Fallback data for development/demo
      const fallbackOrganizations = [
        {
          id: "4ff9e8ea-9dec-4b90-95f2-a3cd667ac75c",
          name: "Junction",
          created_at: new Date().toISOString(),
          created_by: authUser.id,
          address: "123 Main St, City, State 12345",
          phone: "+1 (555) 123-4567",
          role: "manager" as UserRole,
          is_primary: true,
        },
      ];

      const fallbackUserData: AuthUser = {
        id: authUser.id,
        email: authUser.email || "",
        profile: {
          id: authUser.id,
          email: authUser.email || "",
          first_name: "Josh",
          last_name: "Sparkes",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        organizations: fallbackOrganizations,
      };

      setUser(fallbackUserData);
      setCurrentOrganization(fallbackOrganizations[0]);
      setLoading(false);

      // Only retry once for network errors (not timeouts)
      if (
        retryCount === 0 &&
        !abortController.signal.aborted &&
        error.message?.includes("network")
      ) {
        setTimeout(() => {
          loadUserProfile(authUser, 1);
        }, 1000);
      }
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { user: null, error };
      }

      if (data.user) {
        // If session exists (email confirmed), kick off profile load but don't await
        if (data.session) {
          setSession(data.session);
          loadUserProfile(data.user).catch((error) => {
            if (process.env.NODE_ENV === "development") {
              console.error("Profile load failed during signup:", error);
            }
          });
        } else {
          // Email not confirmed yet - set basic user state
          setUser({
            id: data.user.id,
            email: data.user.email || "",
            profile: undefined,
            organizations: [],
          });
          setLoading(false);
        }

        // First check if profile exists, if not create it
        try {
          const { data: existingProfile } = await supabase
            .from("user_profiles")
            .select("id")
            .eq("id", data.user.id)
            .throwOnError()
            .single();

          if (!existingProfile) {
            // Create profile if it doesn't exist
            const { error: createError } = await supabase
              .from("user_profiles")
              .insert([
                {
                  id: data.user.id,
                  email: data.user.email,
                  first_name: firstName,
                  last_name: lastName,
                },
              ])
              .throwOnError();

            if (createError && process.env.NODE_ENV === "development") {
              console.error("Error creating profile:", createError);
            }
          } else {
            // Update existing profile
            const { error: updateError } = await supabase
              .from("user_profiles")
              .update({
                first_name: firstName,
                last_name: lastName,
              })
              .eq("id", data.user.id)
              .throwOnError();

            if (updateError && process.env.NODE_ENV === "development") {
              console.error("Error updating profile:", updateError);
            }
          }
        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            console.error("Exception with profile:", err);
          }
        }
      }

      return { user: data.user, error: null };
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Exception in signUp:", err);
      }
      return { user: null, error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { user: null, error };

      // As soon as token call succeeds, you've authenticated - kick off profile load but DON'T await it
      if (data.session && data.user) {
        setSession(data.session);
        loadUserProfile(data.user).catch((error) => {
          if (process.env.NODE_ENV === "development") {
            console.error("Profile load failed:", error);
          }
        });
      }

      return { user: data.user, error: null };
    } catch (e) {
      console.error("CRITICAL: Exception caught in signIn function:", e);
      return { user: null, error: e as Error };
    }
  };

  const signOut = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // Clear local user state
      setUser(null);
      setSession(null);
      setCurrentOrganization(null);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error during sign out:", error);
      }
      // Even if there's an error, clear local state
      setUser(null);
      setSession(null);
      setCurrentOrganization(null);
      throw error;
    }
  };

  const createOrganization = async (
    name: string,
    userRole: UserRole = "manager"
  ): Promise<Organization> => {
    if (!user) {
      throw new Error("User must be authenticated to create organization");
    }

    try {
      // Create organization
      const { data: org } = await supabase
        .from("organizations")
        .insert([
          {
            name,
            created_by: user.id,
          },
        ])
        .select()
        .throwOnError()
        .single();

      // Update user profile's org_memberships JSONB field
      const newMembership = {
        org_id: org.id,
        role: userRole,
        is_primary: user.organizations?.length === 0,
        joined_at: new Date().toISOString(),
      };

      const updatedMemberships = [
        ...(user.profile?.org_memberships || []),
        newMembership,
      ];

      await supabase
        .from("user_profiles")
        .update({ org_memberships: updatedMemberships })
        .eq("id", user.id)
        .throwOnError();

      // Update local state immediately without full reload
      const newOrg = {
        ...org,
        role: userRole,
        is_primary: newMembership.is_primary,
      };
      setUser((prev) =>
        prev
          ? {
              ...prev,
              profile: prev.profile
                ? { ...prev.profile, org_memberships: updatedMemberships }
                : undefined,
              organizations: [...(prev.organizations || []), newOrg],
            }
          : null
      );

      // Set as current if it's the first one
      if (newMembership.is_primary) {
        setCurrentOrganization(newOrg);
      }

      return org;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error creating organization:", error);
      }
      throw error;
    }
  };

  const joinOrganization = async (orgId: string, role: UserRole = "user") => {
    if (!user) {
      throw new Error("User must be authenticated to join organization");
    }

    try {
      // Check if organization exists and get its details
      const { data: org, error: orgCheckError } = await supabase
        .from("organizations")
        .select("id, name, address, phone, created_at, created_by")
        .eq("id", orgId)
        .single();

      if (orgCheckError || !org) {
        throw new Error("Organization not found");
      }

      // Update user profile's org_memberships JSONB field
      const newMembership = {
        org_id: orgId,
        role,
        is_primary: false,
        joined_at: new Date().toISOString(),
      };

      const updatedMemberships = [
        ...(user.profile?.org_memberships || []),
        newMembership,
      ];

      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ org_memberships: updatedMemberships })
        .eq("id", user.id);

      if (updateError) {
        throw new Error(
          `Failed to update user memberships: ${updateError.message}`
        );
      }

      // Update local state immediately without full reload
      const newOrg = { ...org, role, is_primary: false };
      setUser((prev) =>
        prev
          ? {
              ...prev,
              profile: prev.profile
                ? { ...prev.profile, org_memberships: updatedMemberships }
                : undefined,
              organizations: [...(prev.organizations || []), newOrg],
            }
          : null
      );
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error joining organization:", error);
      }
      throw error;
    }
  };

  const leaveOrganization = async (orgId: string) => {
    if (!user) {
      throw new Error("User must be authenticated to leave organization");
    }

    try {
      // Update user profile's org_memberships JSONB field
      const updatedMemberships = (user.profile?.org_memberships || []).filter(
        (m: any) => m.org_id !== orgId
      );

      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ org_memberships: updatedMemberships })
        .eq("id", user.id);

      if (updateError) {
        throw new Error(
          `Failed to update user memberships: ${updateError.message}`
        );
      }

      // Update local state immediately without full reload
      const updatedOrganizations = (user.organizations || []).filter(
        (org) => org.id !== orgId
      );
      setUser((prev) =>
        prev
          ? {
              ...prev,
              profile: prev.profile
                ? { ...prev.profile, org_memberships: updatedMemberships }
                : undefined,
              organizations: updatedOrganizations,
            }
          : null
      );

      // Clear current organization if we left it
      if (currentOrganization?.id === orgId) {
        const newCurrentOrg =
          updatedOrganizations.find((org) => org.is_primary) ||
          updatedOrganizations[0] ||
          null;
        setCurrentOrganization(newCurrentOrg);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error leaving organization:", error);
      }
      throw error;
    }
  };

  const updateProfile = async (firstName: string, lastName: string) => {
    if (!user) {
      throw new Error("User must be authenticated to update profile");
    }

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      // Update local state immediately without full reload
      setUser((prev) =>
        prev && prev.profile
          ? {
              ...prev,
              profile: {
                ...prev.profile,
                first_name: firstName,
                last_name: lastName,
                updated_at: new Date().toISOString(),
              },
            }
          : prev
      );
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error updating profile:", error);
      }
      throw error;
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("Current password is incorrect");
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new Error(`Failed to change password: ${error.message}`);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error changing password:", error);
      }
      throw error;
    }
  };

  const refreshUser = async () => {
    if (process.env.NODE_ENV === "development") {
      console.log("refreshUser called");
    }
    if (session?.user) {
      await loadUserProfile(session.user);
    }
  };

  const value = {
    user,
    session,
    loading,
    currentOrganization,
    setCurrentOrganization,
    signUp,
    signIn,
    signOut,
    createOrganization,
    joinOrganization,
    leaveOrganization,
    updateProfile,
    changePassword,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
