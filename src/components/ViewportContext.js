import { createContext } from "react";

export const ViewportContext = createContext({ dimensions: null, rotated: false, scale: 1 });
