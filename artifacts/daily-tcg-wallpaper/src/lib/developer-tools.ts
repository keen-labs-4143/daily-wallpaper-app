// Release builds use Vite's default production mode. Only the dev server or
// an explicitly requested, non-release developer bundle enables these controls.
export const DEVELOPER_TOOLS_ENABLED =
  import.meta.env?.DEV === true || import.meta.env?.MODE === "developer";
