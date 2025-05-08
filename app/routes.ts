import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [index("routes/home.tsx"), route("login", "./routes/login.tsx"), route("dashboard", "./routes/dashboard.tsx")] satisfies RouteConfig;
