import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // A publications index listing two entries looks smaller than the same
      // two entries sitting under the claims they support, so /research#papers
      // is the index. The redirect means a link written today keeps working if
      // that ever becomes a page of its own.
      {
        source: "/research/papers",
        destination: "/research#papers",
        permanent: true,
      },
      {
        source: "/research/releases",
        destination: "/research#release",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
