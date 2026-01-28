import { useAuth } from "./use-auth";
import { getTranslations, Translations } from "@/lib/translations";

export function useTranslations(): Translations {
  const { user } = useAuth();
  return getTranslations(user?.language || "english");
}
