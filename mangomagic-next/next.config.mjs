import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.resolve(currentDir, "../.env");

function readRootEnvFile() {
  if (!fs.existsSync(rootEnvPath)) {
    return {};
  }

  return dotenv.parse(fs.readFileSync(rootEnvPath));
}

const rootEnv = readRootEnvFile();

function getPublicEnv(name, fallback = "") {
  return process.env[name] ?? rootEnv[name] ?? fallback;
}

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_BASE_URL: getPublicEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:10000"),
    NEXT_PUBLIC_FIREBASE_API_KEY: getPublicEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: getPublicEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: getPublicEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: getPublicEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: getPublicEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    NEXT_PUBLIC_FIREBASE_APP_ID: getPublicEnv("NEXT_PUBLIC_FIREBASE_APP_ID")
  }
};

export default nextConfig;
