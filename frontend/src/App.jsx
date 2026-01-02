import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Layout from "./Layout"
import HomePage from "./pages/HomePage"
import ClassesPage from "./pages/ClassesPage"
import SubscriptionPage from "./pages/SubscriptionPage"
import SchedulePage from "./pages/SchedulePage"
import AboutPage from "./pages/AboutPage"
import PaymentResult from "./components/PaymentResult/PaymentResult"
import LoginPage from "./pages/LoginPage"
import CreateAccountPage from "./pages/CreateAccountPage"
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute"

const routes = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
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
  {
    path: "/payment-result",
    element: (
      <ProtectedRoute>
        <PaymentResult />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/create-account",
    element: <CreateAccountPage />,
  },
]

const router = createBrowserRouter(routes)

function App() {
  return <RouterProvider router={router} />
}

export default App
