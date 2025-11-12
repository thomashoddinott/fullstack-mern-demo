import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout";
import HomePage from "./pages/HomePage";
import ClassesPage from "./pages/ClassesPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SchedulePage from "./pages/SchedulePage";
import AboutPage from "./pages/AboutPage";

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/classes",
        element: <ClassesPage />,
      },
      {
        path: "/subscriptions",
        element: <SubscriptionPage />,
      },
      {
        path: "/schedule",
        element: <SchedulePage />,
      },
      {
        path: "/about",
        element: <AboutPage />,
      },
    ],
  },
];

const router = createBrowserRouter(routes);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
