import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const [bookingCount, setBookingCount] = useState(0);
    const [upcomingCount, setUpcomingCount] = useState(0);
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        if (user?.role === "admin") {
            navigate("/admin", { replace: true });
        }
    }, [user?.role, navigate]);

    const fetchDashboardData = async () => {
        if (!user?.id) {
            return;
        }

        try {
            const [bookingResponse, notificationResponse] =
                await Promise.all([
                    axios.get(
                        `${import.meta.env.VITE_API_URL || "https://railconnect-6xgl.onrender.com"}/api/bookings/user/${user.id}`
                    ),
                    axios.get(
                        `${import.meta.env.VITE_API_URL || "https://railconnect-6xgl.onrender.com"}/api/notifications/user/${user.id}`
                    ),
                ]);

            const bookings = bookingResponse.data;

            const confirmedBookings = bookings.filter(
                (booking) => booking.status === "Confirmed"
            );

            setBookingCount(confirmedBookings.length);

            const today = new Date();

            const todayValue =
                today.getFullYear() * 10000 +
                (today.getMonth() + 1) * 100 +
                today.getDate();

            const upcomingBookings = confirmedBookings.filter(
                (booking) => {
                    if (!booking.journeyDate) {
                        return false;
                    }

                    const dateText = String(
                        booking.journeyDate
                    ).trim();

                    let year;
                    let month;
                    let day;

                    if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
                        [year, month, day] = dateText
                            .split("-")
                            .map(Number);
                    } else if (
                        /^\d{2}-\d{2}-\d{4}$/.test(dateText)
                    ) {
                        [day, month, year] = dateText
                            .split("-")
                            .map(Number);
                    } else if (
                        /^\d{2}\/\d{2}\/\d{4}$/.test(dateText)
                    ) {
                        [day, month, year] = dateText
                            .split("/")
                            .map(Number);
                    } else {
                        const parsedDate = new Date(dateText);

                        if (isNaN(parsedDate.getTime())) {
                            return false;
                        }

                        year = parsedDate.getFullYear();
                        month = parsedDate.getMonth() + 1;
                        day = parsedDate.getDate();
                    }

                    const journeyValue =
                        year * 10000 +
                        month * 100 +
                        day;

                    return journeyValue >= todayValue;
                }
            );

            setUpcomingCount(upcomingBookings.length);

            const unreadNotifications =
                notificationResponse.data.filter(
                    (notification) => !notification.read
                );

            setNotificationCount(unreadNotifications.length);
        } catch (error) {
            console.error(
                "Failed to load dashboard data:",
                error
            );
        }
    };

    useEffect(() => {
        if (user?.role === "admin") {
            return;
        }

        fetchDashboardData();

        const socket = io(import.meta.env.VITE_API_URL || "https://railconnect-6xgl.onrender.com");

        socket.on("bookingUpdated", (data) => {
            if (
                data &&
                String(data.userId) === String(user?.id)
            ) {
                fetchDashboardData();
            }
        });

        socket.on("notificationCreated", (notification) => {
            if (
                notification &&
                String(notification.userId) ===
                    String(user?.id)
            ) {
                fetchDashboardData();
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [user?.id, user?.role]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
    };

    return (
        <div className="rail-dashboard">
            <style>
                {`
                    .rail-dashboard {
                        min-height: 100vh;
                        background: #f7f8fa;
                        color: #172033;
                        font-family:
                            Inter,
                            -apple-system,
                            BlinkMacSystemFont,
                            "Segoe UI",
                            sans-serif;
                    }

                    @keyframes railDashboardFadeUp {
                        from {
                            opacity: 0;
                            transform: translateY(10px);
                        }

                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes railDashboardFadeIn {
                        from {
                            opacity: 0;
                        }

                        to {
                            opacity: 1;
                        }
                    }

                    .rail-welcome {
                        animation: railDashboardFadeUp 420ms ease both;
                    }

                    .rail-section:nth-of-type(1) {
                        animation: railDashboardFadeUp 460ms 80ms ease both;
                    }

                    .rail-section:nth-of-type(2) {
                        animation: railDashboardFadeUp 460ms 150ms ease both;
                    }

                    .rail-action {
                        opacity: 0;
                        animation: railDashboardFadeUp 420ms ease both;
                    }

                    .rail-action:nth-child(1) {
                        animation-delay: 130ms;
                    }

                    .rail-action:nth-child(2) {
                        animation-delay: 180ms;
                    }

                    .rail-action:nth-child(3) {
                        animation-delay: 230ms;
                    }

                    .rail-action:nth-child(4) {
                        animation-delay: 280ms;
                    }

                    .rail-stat {
                        animation: railDashboardFadeIn 420ms ease both;
                    }

                    .rail-stat:nth-child(1) {
                        animation-delay: 220ms;
                    }

                    .rail-stat:nth-child(2) {
                        animation-delay: 270ms;
                    }

                    .rail-stat:nth-child(3) {
                        animation-delay: 320ms;
                    }

                    .rail-action-icon {
                        transition:
                            transform 180ms ease,
                            background-color 180ms ease,
                            border-color 180ms ease;
                    }

                    .rail-action:hover .rail-action-icon {
                        transform: translateY(-1px);
                        border-color: #c7dce8;
                        background: #edf6fb;
                    }

                    .rail-action-button {
                        transition:
                            transform 160ms ease,
                            background-color 160ms ease,
                            border-color 160ms ease,
                            color 160ms ease;
                    }

                    .rail-action-button:active {
                        transform: translateY(1px);
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .rail-welcome,
                        .rail-section,
                        .rail-action,
                        .rail-stat {
                            animation: none;
                            opacity: 1;
                        }

                        .rail-action-icon,
                        .rail-action-button {
                            transition: none;
                        }
                    }

                    .rail-navbar {
                        width: 100%;
                        height: 68px;
                        background: #ffffff;
                        border-bottom: 1px solid #e5e7eb;
                        position: sticky;
                        top: 0;
                        z-index: 100;
                    }

                    .rail-navbar-inner {
                        width: min(1320px, calc(100% - 48px));
                        height: 100%;
                        margin: 0 auto;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 24px;
                    }

                    .rail-brand {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        color: #172033;
                        font-size: 19px;
                        font-weight: 700;
                        letter-spacing: -0.3px;
                        white-space: nowrap;
                    }

                    .rail-brand-mark {
                        width: 31px;
                        height: 31px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 7px;
                        background: #1478bd;
                    }

                    .rail-brand-mark svg {
                        width: 18px;
                        height: 18px;
                        fill: none;
                        stroke: #ffffff;
                        stroke-width: 2;
                        stroke-linecap: round;
                        stroke-linejoin: round;
                    }

                    .rail-nav-links {
                        display: flex;
                        align-items: center;
                        gap: 3px;
                    }

                    .rail-nav-button {
                        border: none;
                        background: transparent;
                        color: #667085;
                        padding: 8px 12px;
                        border-radius: 7px;
                        font-size: 13px;
                        font-weight: 500;
                        cursor: pointer;
                        transition:
                            background 0.16s ease,
                            color 0.16s ease;
                    }

                    .rail-nav-button:hover {
                        background: #f1f6f9;
                        color: #1478bd;
                    }

                    .rail-nav-button.active {
                        background: #edf6fb;
                        color: #1478bd;
                        font-weight: 600;
                    }

                    .rail-nav-right {
                        display: flex;
                        align-items: center;
                        gap: 14px;
                    }

                    .rail-user {
                        color: #667085;
                        font-size: 13px;
                        white-space: nowrap;
                    }

                    .rail-logout {
                        border: 1px solid #d5dce3;
                        background: #ffffff;
                        color: #344054;
                        padding: 8px 14px;
                        border-radius: 7px;
                        font-size: 13px;
                        font-weight: 600;
                        cursor: pointer;
                    }

                    .rail-logout:hover {
                        background: #f8fafc;
                        border-color: #bfcbd5;
                        color: #1478bd;
                    }

                    .rail-main {
                        width: min(1320px, calc(100% - 48px));
                        margin: 0 auto;
                        padding: 42px 0 70px;
                    }

                    .rail-welcome {
                        margin-bottom: 34px;
                    }

                    .rail-eyebrow {
                        margin: 0 0 8px;
                        color: #1478bd;
                        font-size: 11px;
                        font-weight: 700;
                        letter-spacing: 0.8px;
                    }

                    .rail-welcome h1 {
                        margin: 0;
                        color: #172033;
                        font-size: 30px;
                        line-height: 1.25;
                        font-weight: 650;
                        letter-spacing: -0.7px;
                    }

                    .rail-welcome-description {
                        margin: 9px 0 0;
                        color: #667085;
                        font-size: 14px;
                        line-height: 1.5;
                    }

                    .rail-section {
                        margin-top: 32px;
                    }

                    .rail-section-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 13px;
                    }

                    .rail-section-title {
                        margin: 0;
                        color: #172033;
                        font-size: 16px;
                        font-weight: 650;
                    }

                    .rail-section-subtitle {
                        color: #98a2b3;
                        font-size: 12px;
                    }

                    .rail-actions {
                        display: grid;
                        grid-template-columns:
                            repeat(4, minmax(0, 1fr));
                        gap: 14px;
                    }

                    .rail-action {
                        min-height: 166px;
                        padding: 19px;
                        background: #ffffff;
                        border: 1px solid #e1e6eb;
                        border-radius: 10px;
                        display: flex;
                        flex-direction: column;
                        transition:
                            border-color 0.16s ease,
                            box-shadow 0.16s ease,
                            transform 0.16s ease;
                    }

                    .rail-action:hover {
                        border-color: #cbd8e1;
                        box-shadow:
                            0 6px 18px
                            rgba(16, 24, 40, 0.06);
                        transform: translateY(-2px);
                    }

                    .rail-action-icon {
                        width: 34px;
                        height: 34px;
                        margin-bottom: 14px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: 1px solid #d9e6ee;
                        border-radius: 7px;
                        background: #f2f8fb;
                        color: #1478bd;
                    }

                    .rail-action-icon svg {
                        width: 17px;
                        height: 17px;
                        fill: none;
                        stroke: currentColor;
                        stroke-width: 1.8;
                        stroke-linecap: round;
                        stroke-linejoin: round;
                    }

                    .rail-action h3 {
                        margin: 0;
                        color: #172033;
                        font-size: 14px;
                        font-weight: 650;
                    }

                    .rail-action p {
                        min-height: 37px;
                        margin: 7px 0 16px;
                        color: #667085;
                        font-size: 12px;
                        line-height: 1.5;
                    }

                    .rail-action-button {
                        width: 100%;
                        margin-top: auto;
                        padding: 9px 12px;
                        border: 1px solid #d2dbe3;
                        border-radius: 7px;
                        background: #ffffff;
                        color: #344054;
                        font-size: 12px;
                        font-weight: 600;
                        cursor: pointer;
                    }

                    .rail-action-button:hover {
                        background: #1478bd;
                        border-color: #1478bd;
                        color: #ffffff;
                    }

                    .rail-overview {
                        display: grid;
                        grid-template-columns:
                            repeat(3, minmax(0, 1fr));
                        background: #ffffff;
                        border: 1px solid #e1e6eb;
                        border-radius: 10px;
                        overflow: hidden;
                    }

                    .rail-stat {
                        min-height: 126px;
                        padding: 22px 25px;
                    }

                    .rail-stat + .rail-stat {
                        border-left: 1px solid #e1e6eb;
                    }

                    .rail-stat-label {
                        display: block;
                        margin-bottom: 10px;
                        color: #667085;
                        font-size: 10px;
                        font-weight: 700;
                        letter-spacing: 0.6px;
                    }

                    .rail-stat-value {
                        margin: 0;
                        color: #172033;
                        font-size: 28px;
                        line-height: 1;
                        font-weight: 650;
                    }

                    .rail-stat-description {
                        margin: 8px 0 0;
                        color: #98a2b3;
                        font-size: 12px;
                    }

                    @media (max-width: 1050px) {
                        .rail-actions {
                            grid-template-columns:
                                repeat(2, minmax(0, 1fr));
                        }
                    }

                    @media (max-width: 760px) {
                        .rail-navbar {
                            height: auto;
                        }

                        .rail-navbar-inner {
                            min-height: 68px;
                            padding-top: 12px;
                            padding-bottom: 12px;
                            flex-wrap: wrap;
                        }

                        .rail-nav-links {
                            order: 3;
                            width: 100%;
                            overflow-x: auto;
                            justify-content: flex-start;
                        }

                        .rail-nav-right {
                            margin-left: auto;
                        }

                        .rail-user {
                            display: none;
                        }

                        .rail-main {
                            padding-top: 30px;
                        }

                        .rail-welcome h1 {
                            font-size: 27px;
                        }

                        .rail-overview {
                            grid-template-columns: 1fr;
                        }

                        .rail-stat + .rail-stat {
                            border-left: none;
                            border-top: 1px solid #e1e6eb;
                        }
                    }

                    @media (max-width: 540px) {
                        .rail-navbar-inner,
                        .rail-main {
                            width: calc(100% - 32px);
                        }

                        .rail-actions {
                            grid-template-columns: 1fr;
                        }

                        .rail-welcome h1 {
                            font-size: 25px;
                        }

                        .rail-brand {
                            font-size: 17px;
                        }

                        .rail-nav-button {
                            padding: 8px 9px;
                            font-size: 12px;
                        }
                    }
                `}
            </style>

            <nav className="rail-navbar">
                <div className="rail-navbar-inner">
                    <div className="rail-brand">
                        <span className="rail-brand-mark">
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path d="M5 4h14v10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V4Z" />
                                <path d="M8 20l2-3" />
                                <path d="M16 20l-2-3" />
                                <path d="M8 8h8" />
                                <path d="M8 12h.01" />
                                <path d="M16 12h.01" />
                            </svg>
                        </span>

                        <span>RailConnect</span>
                    </div>

                    <div className="rail-nav-links">
                        <button
                            className="rail-nav-button active"
                            onClick={() =>
                                navigate("/dashboard")
                            }
                        >
                            Dashboard
                        </button>

                        <button
                            className="rail-nav-button"
                            onClick={() =>
                                navigate("/search-trains")
                            }
                        >
                            Search Trains
                        </button>

                        <button
                            className="rail-nav-button"
                            onClick={() =>
                                navigate("/my-bookings")
                            }
                        >
                            My Bookings
                        </button>

                        <button
                            className="rail-nav-button"
                            onClick={() =>
                                navigate("/train-status")
                            }
                        >
                            Train Status
                        </button>

                        <button
                            className="rail-nav-button"
                            onClick={() =>
                                navigate("/notifications")
                            }
                        >
                            Notifications
                        </button>
                    </div>

                    <div className="rail-nav-right">
                        <span className="rail-user">
                            {user?.name || "Passenger"}
                        </span>

                        <button
                            className="rail-logout"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="rail-main">
                <section className="rail-welcome">
                    <p className="rail-eyebrow">
                        PASSENGER DASHBOARD
                    </p>

                    <h1>
                        Welcome back,{" "}
                        {user?.name || "Passenger"}
                    </h1>

                    <p className="rail-welcome-description">
                        Manage your journeys, bookings and train
                        information from one place.
                    </p>
                </section>

                <section className="rail-section">
                    <div className="rail-section-header">
                        <h2 className="rail-section-title">
                            Quick actions
                        </h2>

                        <span className="rail-section-subtitle">
                            Passenger services
                        </span>
                    </div>

                    <div className="rail-actions">
                        <div className="rail-action">
                            <div className="rail-action-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <circle
                                        cx="10.5"
                                        cy="10.5"
                                        r="6.5"
                                    />
                                    <path d="m16 16 5 5" />
                                </svg>
                            </div>

                            <h3>Search Trains</h3>

                            <p>
                                Find available trains between
                                your stations.
                            </p>

                            <button
                                className="rail-action-button"
                                onClick={() =>
                                    navigate("/search-trains")
                                }
                            >
                                Search trains
                            </button>
                        </div>

                        <div className="rail-action">
                            <div className="rail-action-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <rect
                                        x="5"
                                        y="4"
                                        width="14"
                                        height="16"
                                        rx="2"
                                    />
                                    <path d="M8 8h8" />
                                    <path d="M8 12h8" />
                                    <path d="M8 16h5" />
                                </svg>
                            </div>

                            <h3>My Bookings</h3>

                            <p>
                                View and manage your confirmed
                                journeys.
                            </p>

                            <button
                                className="rail-action-button"
                                onClick={() =>
                                    navigate("/my-bookings")
                                }
                            >
                                View bookings
                            </button>
                        </div>

                        <div className="rail-action">
                            <div className="rail-action-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path d="M4 6h16" />
                                    <path d="M4 12h16" />
                                    <path d="M4 18h16" />
                                    <circle
                                        cx="8"
                                        cy="6"
                                        r="1.5"
                                    />
                                    <circle
                                        cx="15"
                                        cy="12"
                                        r="1.5"
                                    />
                                    <circle
                                        cx="11"
                                        cy="18"
                                        r="1.5"
                                    />
                                </svg>
                            </div>

                            <h3>Train Status</h3>

                            <p>
                                Check the latest status of your
                                train.
                            </p>

                            <button
                                className="rail-action-button"
                                onClick={() =>
                                    navigate("/train-status")
                                }
                            >
                                Check status
                            </button>
                        </div>

                        <div className="rail-action">
                            <div className="rail-action-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
                                    <path d="M10 21h4" />
                                </svg>
                            </div>

                            <h3>Notifications</h3>

                            <p>
                                Review important journey updates
                                and alerts.
                            </p>

                            <button
                                className="rail-action-button"
                                onClick={() =>
                                    navigate("/notifications")
                                }
                            >
                                View notifications
                            </button>
                        </div>
                    </div>
                </section>

                <section className="rail-section">
                    <div className="rail-section-header">
                        <h2 className="rail-section-title">
                            Journey overview
                        </h2>

                        <span className="rail-section-subtitle">
                            Current account activity
                        </span>
                    </div>

                    <div className="rail-overview">
                        <div className="rail-stat">
                            <span className="rail-stat-label">
                                CURRENT BOOKINGS
                            </span>

                            <p className="rail-stat-value">
                                {bookingCount}
                            </p>

                            <p className="rail-stat-description">
                                Confirmed bookings
                            </p>
                        </div>

                        <div className="rail-stat">
                            <span className="rail-stat-label">
                                UPCOMING JOURNEYS
                            </span>

                            <p className="rail-stat-value">
                                {upcomingCount}
                            </p>

                            <p className="rail-stat-description">
                                Future journeys
                            </p>
                        </div>

                        <div className="rail-stat">
                            <span className="rail-stat-label">
                                UNREAD NOTIFICATIONS
                            </span>

                            <p className="rail-stat-value">
                                {notificationCount}
                            </p>

                            <p className="rail-stat-description">
                                Updates requiring attention
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Dashboard;