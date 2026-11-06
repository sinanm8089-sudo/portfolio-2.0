/**
 * Neon Services Integration Module
 * Handles connections and utilities for Neon Postgres, Auth, Functions,
 * Object Storage (S3-compatible), and Realtime.
 */

import { prisma } from "@/lib/db/prisma";

export interface NeonServicesStatus {
  postgres: {
    connected: boolean;
    provider: string;
    branch: string;
    adminCount?: number;
    error?: string;
  };
  functions: {
    enabled: boolean;
    baseUrl: string;
    helloStatus?: string;
  };
  auth: {
    enabled: boolean;
    baseUrl: string;
    jwksUrl: string;
  };
  objectStorage: {
    enabled: boolean;
    endpoint: string;
    region: string;
    bucket: string;
  };
  realtime: {
    enabled: boolean;
    url: string;
  };
}

export async function getNeonServicesStatus(): Promise<NeonServicesStatus> {
  const branch = process.env.NEON_BRANCH || "production";

  // 1. PostgreSQL Status
  let pgStatus = {
    connected: false,
    provider: "Neon Serverless PostgreSQL",
    branch,
    adminCount: 0,
    error: undefined as string | undefined,
  };

  try {
    const adminCount = await prisma.adminUser.count();
    pgStatus.connected = true;
    pgStatus.adminCount = adminCount;
  } catch (err) {
    pgStatus.error = err instanceof Error ? err.message : "Connection failed";
  }

  // 2. Neon Functions
  const functionBaseUrl = process.env.NEON_FUNCTION_HELLO_BASE_URL || "";
  let helloStatus = "unknown";
  if (functionBaseUrl) {
    try {
      const res = await fetch(functionBaseUrl, { next: { revalidate: 60 } });
      if (res.ok) {
        helloStatus = (await res.text()).trim();
      } else {
        helloStatus = `HTTP ${res.status}`;
      }
    } catch (e) {
      helloStatus = e instanceof Error ? e.message : "Unreachable";
    }
  }

  // 3. Neon Auth
  const authBaseUrl = process.env.NEON_AUTH_BASE_URL || "";
  const authJwksUrl = process.env.NEON_AUTH_JWKS_URL || "";

  // 4. Object Storage
  const s3Endpoint = process.env.AWS_ENDPOINT_URL_S3 || "";
  const s3Region = process.env.AWS_REGION || "ap-southeast-1";

  // 5. Realtime
  const realtimeUrl = process.env.NEON_REALTIME_URL || "";

  return {
    postgres: pgStatus,
    functions: {
      enabled: Boolean(functionBaseUrl),
      baseUrl: functionBaseUrl,
      helloStatus,
    },
    auth: {
      enabled: Boolean(authBaseUrl),
      baseUrl: authBaseUrl,
      jwksUrl: authJwksUrl,
    },
    objectStorage: {
      enabled: Boolean(s3Endpoint),
      endpoint: s3Endpoint,
      region: s3Region,
      bucket: "assets",
    },
    realtime: {
      enabled: Boolean(realtimeUrl),
      url: realtimeUrl,
    },
  };
}
