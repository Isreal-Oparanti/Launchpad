import { createCivicAuthPlugin } from "@civic/auth/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {};

const withCivicAuth = createCivicAuthPlugin({
  clientId: "b92782ac-5eb3-42e4-9a3d-6843e070a2ff",
   include: ["/*"],
  // Exclude public routes (adjust these based on ur public pages)
  exclude: [
    "/", // landing page
    "/about",
    "/contact", 
    "/pricing",
    "/login",
    "/register",
    "/public/*",
    "/_next/*",
    "/favicon.ico",
    "/api/public/*"
  ]
});

export default withCivicAuth(nextConfig);