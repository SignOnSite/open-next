// NOTE: add more next config typings as they become relevant

type RemotePattern = {
  protocol?: "http" | "https";
  hostname: string;
  port?: string;
  pathname?: string;
};
declare type ImageFormat = "image/avif" | "image/webp";

type ImageConfigComplete = {
  deviceSizes: number[];
  imageSizes: number[];
  path: string;
  loaderFile: string;
  domains: string[];
  disableStaticImages: boolean;
  minimumCacheTTL: number;
  formats: ImageFormat[];
  dangerouslyAllowSVG: boolean;
  contentSecurityPolicy: string;
  contentDispositionType: "inline" | "attachment";
  remotePatterns: RemotePattern[];
  unoptimized: boolean;
};
type ImageConfig = Partial<ImageConfigComplete>;

export interface NextConfig {
  experimental: {
    serverActions?: boolean;
  };
  images: ImageConfig;
}
