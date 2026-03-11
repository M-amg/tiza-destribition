import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";
import { TrackOrderPage } from "./pages/TrackOrderPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "profile", Component: ProfilePage },
      { path: "track-order", Component: TrackOrderPage },
    ],
  },
]);