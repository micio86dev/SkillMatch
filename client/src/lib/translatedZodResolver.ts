import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import type { ZodSchema } from "zod";

// Custom Zod resolver that translates validation error messages
export function useTranslatedZodResolver<T>(schema: ZodSchema<T>) {
  const { t } = useTranslation();
  
  return zodResolver(schema, {
    // Custom error message resolver
    errorMap: (issue, ctx) => {
      // If the error message looks like a translation key, translate it
      if (typeof ctx.defaultError === 'string' && ctx.defaultError.includes('.')) {
        return {
          message: t(ctx.defaultError)
        };
      }
      
      // Otherwise return the default error
      return { message: ctx.defaultError };
    }
  });
}