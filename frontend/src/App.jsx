import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout";

const routes = [
  {
    path: "/",
    element: <Layout/>,
    children: [
      {
        path: "/",
        // element: <ArticlesListPage />,
      },
    ],
  },
];

const router = createBrowserRouter(routes);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
