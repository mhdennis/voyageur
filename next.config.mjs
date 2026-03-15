/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/hotels/prices",
        destination: "http://localhost:8000/api/hotels/prices",
      },
      {
        source: "/api/hotels/:slug/history",
        destination: "http://localhost:8000/api/hotels/:slug/history",
      },
      {
        source: "/api/hotels/:slug/live",
        destination: "http://localhost:8000/api/hotels/:slug/live",
      },
      {
        source: "/api/stats",
        destination: "http://localhost:8000/api/stats",
      },
      {
        source: "/api/flights/prices",
        destination: "http://localhost:8000/api/flights/prices",
      },
      {
        source: "/api/flights/:origin/:destination",
        destination: "http://localhost:8000/api/flights/:origin/:destination",
      },
    ];
  },
};

export default nextConfig;
