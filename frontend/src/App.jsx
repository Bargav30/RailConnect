import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import SearchTrains from "./SearchTrains";
import MyBookings from "./MyBookings";
import TrainStatus from "./TrainStatus";
import AdminDashboard from "./AdminDashboard";
import Notifications from "./Notifications";

function AdminRoute({ children }) {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        return <Navigate to="/" replace />;
    }

    const userRole = String(user.role || "")
        .trim()
        .toLowerCase();

    if (userRole !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/search-trains"
                    element={<SearchTrains />}
                />

                <Route
                    path="/my-bookings"
                    element={<MyBookings />}
                />

                <Route
                    path="/train-status"
                    element={<TrainStatus />}
                />

                <Route
                    path="/notifications"
                    element={<Notifications />}
                />

                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;