import type { NextConfig } from "next";
import { execSync } from "child_process";

const getGitCommitHash = () => {
  const envHash = 
    process.env.VERCEL_GIT_COMMIT_SHA || 
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 
    process.env.RENDER_GIT_COMMIT || 
    process.env.RAILWAY_GIT_COMMIT_SHA ||
    process.env.GIT_COMMIT_SHA ||
    process.env.GIT_COMMIT;
    
  if (envHash) {
    return envHash.substring(0, 7);
  }

  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch (e) {
    return "unknown";
  }
};

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GIT_COMMIT: getGitCommitHash(),
  },
};

export default nextConfig;
