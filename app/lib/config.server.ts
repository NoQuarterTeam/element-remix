import { z } from "zod"

import { IS_PRODUCTION } from "./config"

// Only use on the server
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  APP_ENV: z.enum(["development", "production", "test"]),
  APP_SECRET: z.string(),
  OPEN_WEATHER_KEY: z.string(),
  SESSION_SECRET: z.string(),
  PRICE_ID: z.string(),
  FLASH_SESSION_SECRET: z.string(),
  THEME_SESSION_SECRET: z.string(),
  SENTRY_DSN: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  SENDGRID_API_KEY: z.string(),
  WEB_URL: z.string(),
  REDIS_URL: z.string(),
  AWS_ACCESS_KEY_USER: z.string(),
  AWS_SECRET_KEY_USER: z.string(),
})

export const {
  NODE_ENV,
  APP_ENV,
  APP_SECRET,
  OPEN_WEATHER_KEY,
  SESSION_SECRET,
  PRICE_ID,
  FLASH_SESSION_SECRET,
  THEME_SESSION_SECRET,
  SENTRY_DSN,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  SENDGRID_API_KEY,
  WEB_URL,
  REDIS_URL,
  AWS_ACCESS_KEY_USER,
  AWS_SECRET_KEY_USER,
} = envSchema.parse(process.env)

// WEB URL
export const FULL_WEB_URL = `${IS_PRODUCTION ? "https://" : "http://"}${WEB_URL}`
