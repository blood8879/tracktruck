import { Session, User } from "@supabase/supabase-js";
import { useRouter, useSegments, SplashScreen } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";

import { supabase } from "@/config/supabase";
import { fetchMyFoodTrucks, FoodTruck } from "@/services/foodtruck-api";

SplashScreen.preventAutoHideAsync();

type SupabaseContextProps = {
  user: User | null;
  session: Session | null;
  initialized?: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  foodTruck: FoodTruck | null;
  setFoodTruck: (truck: FoodTruck | null) => void;
  refreshFoodTruck: () => Promise<void>;
};

type SupabaseProviderProps = {
  children: React.ReactNode;
};

export const SupabaseContext = createContext<SupabaseContextProps>({
  user: null,
  session: null,
  initialized: false,
  signUp: async () => {},
  signInWithPassword: async () => {},
  signOut: async () => {},
  foodTruck: null,
  setFoodTruck: () => {},
  refreshFoodTruck: async () => {},
});

export const useSupabase = () => useContext(SupabaseContext);

export const SupabaseProvider = ({ children }: SupabaseProviderProps) => {
  const router = useRouter();
  const segments = useSegments();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [foodTruck, setFoodTruck] = useState<FoodTruck | null>(null);

  const signUp = async (email: string, password: string) => {
    console.log("signUp", email, password);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      console.error("signUp error", JSON.stringify(error, null, 2));
      throw error;
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    console.log("signInWithPassword", email, password);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log("Full error:", {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    router.replace("/(app)/sign-in");
    if (error) {
      throw error;
    }
  };

  const refreshFoodTruck = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: foodTruckData, error } = await supabase
        .from("foodtruck")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setFoodTruck(foodTruckData);
    } catch (error) {
      console.error("Error refreshing food truck:", error);
    }
  };

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) => {
        setSession(session);
        setUser(session ? session.user : null);
        setInitialized(true);
      });

    supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      setUser(session ? session.user : null);
    });
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const inProtectedGroup = segments[1] === "(protected)";

    // console.log("inProtectedGroup", inProtectedGroup);
    // console.log("inRegisterTruck", inRegisterTruck);
    // console.log("segments", segments);

    if (session && !inProtectedGroup) {
      router.replace("/(app)/(protected)");
    } else if (!session) {
      router.replace("/(app)/sign-in");
    }

    const checkFoodTruck = async () => {
      // console.log("checkFoodTruck");

      try {
        const truck = await fetchMyFoodTrucks();
        // console.log("truck", truck);
        setFoodTruck(truck[0] || null);

        if (session) {
          if (!truck.length) {
            router.replace("/(app)/(protected)/(truck)/register-truck");
          } else if (truck.length && !inProtectedGroup) {
            router.replace("/(app)/(protected)");
          }
        } else {
          router.replace("/(app)/sign-in");
        }
      } catch (error) {
        console.error("푸드트럭 조회 실패:", error);
      }
    };

    if (session) {
      checkFoodTruck();
    }

    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500);
  }, [initialized, session]);

  useEffect(() => {
    refreshFoodTruck();
  }, []);

  return (
    <SupabaseContext.Provider
      value={{
        user,
        session,
        initialized,
        signUp,
        signInWithPassword,
        signOut,
        foodTruck,
        setFoodTruck,
        refreshFoodTruck,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};
