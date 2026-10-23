import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

function Notifications() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [readingId, setReadingId] = useState(null);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL || "https://railconnect-6xgl.onrender.com"}/api/notifications/user/${user.id}`
            );

            setNotifications(response.data);
        } catch (error) {
            console.error(error);
            setErrorMessage("Failed to load notifications. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        const socket = io(import.meta.env.VITE_API_URL || "https://railconnect-6xgl.onrender.com");

        socket.on("notificationCreated", (notification) => {
            if (String(notification.userId) === String(user.id)) {
                setNotifications((current) => [
                    notification,
                    ...current,
                ]);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const markAsRead = async (id) => {
        setReadingId(id);

        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL || "https://railconnect-6xgl.onrender.com"}/api/notifications/${id}/read`
            );

            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) =>
                    notification._id === id
                        ? { ...notification, read: true }
                        : notification
                )
            );
        } catch (error) {
            console.error(error);
            setErrorMessage("Failed to update notification.");
        } finally {
            setReadingId(null);
        }
    };

    return (
        <div className="notification-page">
            <style>
                {`
                    .notification-page {
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

                    /* =========================
                       NAVBAR
                    ========================= */

                    .notification-navbar {
                        width: 100%;
                        height: 68px;
                        background: #ffffff;
                        border-bottom: 1px solid #e5e7eb;
                        position: sticky;
                        top: 0;
                        z-index: 100;
                    }

                    .notification-navbar-inner {
                        width: min(1320px, calc(100% - 48px));
                        height: 100%;
                        margin: 0 auto;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }

                    .notification-brand {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        color: #172033;
                        font-size: 19px;
                        font-weight: 700;
                        letter-spacing: -0.3px;
                    }

                    .notification-brand-mark {
                        width: 31px;
                        height: 31px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 7px;
                        background: #1478bd;
                    }

                    .notification-brand-mark svg {
                        width: 18px;
                        height: 18px;
                        fill: none;
                        stroke: #ffffff;
                        stroke-width: 2;
                        stroke-linecap: round;
                        stroke-linejoin: round;
                    }

                    .notification-dashboard-button {
                        border: 1px solid #d5dce3;
                        background: #ffffff;
                        color: #344054;
                        padding: 8px 14px;
                        border-radius: 7px;
                        font-size: 13px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: 0.16s ease;
                    }

                    .notification-dashboard-button:hover {
                        background: #f8fafc;
                        border-color: #bfcbd5;
                        color: #1478bd;
                    }

                    /* =========================
                       MAIN
                    ========================= */

                    .notification-main {
                        width: min(900px, calc(100% - 48px));
                        margin: 0 auto;
                        padding: 30px 0 70px;
                    }

                    /* =========================
                       BACK BUTTON
                    ========================= */

                    .notification-back-button {
                        display: inline-flex;
                        align-items: center;
                        gap: 7px;
                        margin-bottom: 27px;
                        padding: 7px 9px;
                        border: none;
                        background: transparent;
                        color: #667085;
                        font-size: 13px;
                        font-weight: 600;
                        cursor: pointer;
                        border-radius: 6px;
                    }

                    .notification-back-button:hover {
                        background: #edf6fb;
                        color: #1478bd;
                    }

                    .notification-back-arrow {
                        font-size: 18px;
                        line-height: 1;
                    }

                    /* =========================
                       HEADER
                    ========================= */

                    .notification-header {
                        margin-bottom: 28px;
                    }

                    .notification-eyebrow {
                        margin: 0 0 8px;
                        color: #1478bd;
                        font-size: 11px;
                        font-weight: 700;
                        letter-spacing: 0.8px;
                    }

                    .notification-header h1 {
                        margin: 0;
                        color: #172033;
                        font-size: 29px;
                        line-height: 1.25;
                        font-weight: 650;
                        letter-spacing: -0.6px;
                    }

                    .notification-header p {
                        margin: 8px 0 0;
                        color: #667085;
                        font-size: 14px;
                        line-height: 1.5;
                    }

                    /* =========================
                       SECTION HEADER
                    ========================= */

                    .notification-section-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 13px;
                    }

                    .notification-section-title {
                        margin: 0;
                        color: #172033;
                        font-size: 16px;
                        font-weight: 650;
                    }

                    .notification-count {
                        color: #98a2b3;
                        font-size: 12px;
                    }

                    .notification-summary {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin-top: 5px;
                        color: #667085;
                        font-size: 12px;
                    }

                    .notification-summary-dot {
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: #1478bd;
                    }

                    .notification-error {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 12px;
                        margin-bottom: 16px;
                        padding: 10px 12px;
                        border: 1px solid #f3c5c1;
                        border-radius: 7px;
                        background: #fef3f2;
                        color: #b42318;
                        font-size: 12px;
                    }

                    .notification-error button {
                        border: none;
                        background: transparent;
                        color: #b42318;
                        font-size: 16px;
                        line-height: 1;
                        cursor: pointer;
                    }

                    /* =========================
                       LOADING
                    ========================= */

                    .notification-message {
                        padding: 14px 16px;
                        background: #ffffff;
                        border: 1px solid #dfe5ea;
                        border-radius: 9px;
                        color: #667085;
                        font-size: 13px;
                    }

                    /* =========================
                       EMPTY STATE
                    ========================= */

                    .notification-empty {
                        padding: 42px 30px;
                        text-align: center;
                        background: #ffffff;
                        border: 1px solid #dfe5ea;
                        border-radius: 10px;
                    }

                    .notification-empty-icon {
                        width: 42px;
                        height: 42px;
                        margin: 0 auto 15px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: 1px solid #d9e6ee;
                        border-radius: 8px;
                        background: #f2f8fb;
                        color: #1478bd;
                    }

                    .notification-empty-icon svg {
                        width: 20px;
                        height: 20px;
                        fill: none;
                        stroke: currentColor;
                        stroke-width: 1.8;
                        stroke-linecap: round;
                        stroke-linejoin: round;
                    }

                    .notification-empty h3 {
                        margin: 0;
                        color: #172033;
                        font-size: 16px;
                        font-weight: 650;
                    }

                    .notification-empty p {
                        margin: 8px 0 0;
                        color: #667085;
                        font-size: 13px;
                    }

                    /* =========================
                       NOTIFICATION LIST
                    ========================= */

                    .notification-list {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }

                    .notification-card {
                        display: flex;
                        align-items: flex-start;
                        gap: 14px;
                        padding: 17px 18px;
                        background: #ffffff;
                        border: 1px solid #dfe5ea;
                        border-radius: 9px;
                        transition:
                            border-color 0.16s ease,
                            box-shadow 0.16s ease;
                    }

                    .notification-card:hover {
                        border-color: #cbd7df;
                        box-shadow:
                            0 4px 14px
                            rgba(16, 24, 40, 0.045);
                    }

                    .notification-card.unread {
                        border-left: 3px solid #1478bd;
                        padding-left: 16px;
                        background: #ffffff;
                    }

                    .notification-card.unread .notification-type {
                        font-weight: 700;
                    }

                    .notification-live {
                        display: inline-flex;
                        align-items: center;
                        gap: 5px;
                        color: #067647;
                        font-size: 10px;
                        font-weight: 650;
                    }

                    .notification-live-dot {
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: #12b76a;
                    }

                    .notification-card.read {
                        background: #fbfcfd;
                    }

                    .notification-icon {
                        flex-shrink: 0;
                        width: 34px;
                        height: 34px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: 1px solid #d9e6ee;
                        border-radius: 7px;
                        background: #f2f8fb;
                        color: #1478bd;
                    }

                    .notification-icon.warning {
                        background: #fffaeb;
                        border-color: #fedf89;
                        color: #b54708;
                    }

                    .notification-icon svg {
                        width: 17px;
                        height: 17px;
                        fill: none;
                        stroke: currentColor;
                        stroke-width: 1.8;
                        stroke-linecap: round;
                        stroke-linejoin: round;
                    }

                    .notification-content {
                        min-width: 0;
                        flex: 1;
                    }

                    .notification-card-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 15px;
                        margin-bottom: 6px;
                    }

                    .notification-type {
                        margin: 0;
                        color: #172033;
                        font-size: 14px;
                        font-weight: 650;
                    }

                    .notification-new {
                        flex-shrink: 0;
                        padding: 3px 7px;
                        border-radius: 4px;
                        background: #edf6fb;
                        color: #1478bd;
                        font-size: 9px;
                        font-weight: 700;
                        letter-spacing: 0.4px;
                    }

                    .notification-text {
                        margin: 0;
                        color: #667085;
                        font-size: 13px;
                        line-height: 1.55;
                    }

                    .notification-meta {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 15px;
                        margin-top: 10px;
                    }

                    .notification-time {
                        color: #98a2b3;
                        font-size: 11px;
                    }

                    .mark-read-button {
                        padding: 5px 9px;
                        border: 1px solid #d5dce3;
                        border-radius: 6px;
                        background: #ffffff;
                        color: #344054;
                        font-size: 11px;
                        font-weight: 600;
                        cursor: pointer;
                    }

                    .mark-read-button:hover {
                        border-color: #b9c9d5;
                        background: #f8fafc;
                        color: #1478bd;
                    }

                    .mark-read-button:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                    }

                    /* =========================
                       RESPONSIVE
                    ========================= */

                    @media (max-width: 600px) {
                        .notification-navbar-inner,
                        .notification-main {
                            width: calc(100% - 32px);
                        }

                        .notification-header h1 {
                            font-size: 25px;
                        }

                        .notification-card {
                            padding: 15px;
                        }

                        .notification-card.unread {
                            padding-left: 13px;
                        }

                        .notification-card-header {
                            align-items: flex-start;
                        }

                        .notification-meta {
                            align-items: flex-start;
                            flex-direction: column;
                        }
                    }
                `}
            </style>

            <nav className="notification-navbar">
                <div className="notification-navbar-inner">
                    <div
                        className="notification-brand"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                        style={{ cursor: "pointer" }}
                    >
                        <span className="notification-brand-mark">
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

                    <button
                        className="notification-dashboard-button"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        Dashboard
                    </button>
                </div>
            </nav>

            <main className="notification-main">
                <button
                    className="notification-back-button"
                    onClick={() => navigate(-1)}
                >
                    <span className="notification-back-arrow">
                        ←
                    </span>
                    Back
                </button>

                <section className="notification-header">
                    <p className="notification-eyebrow">
                        NOTIFICATIONS
                    </p>

                    <h1>Journey notifications</h1>

                    <p>
                        Stay updated with important railway
                        journey information.
                    </p>

                    {!loading && notifications.length > 0 && (
                        <div className="notification-summary">
                            <span className="notification-summary-dot"></span>
                            {notifications.filter(
                                (notification) => !notification.read
                            ).length}{" "}
                            unread notification
                            {notifications.filter(
                                (notification) => !notification.read
                            ).length === 1
                                ? ""
                                : "s"}
                        </div>
                    )}
                </section>

                {errorMessage && (
                    <div className="notification-error" role="alert">
                        <span>{errorMessage}</span>
                        <button
                            type="button"
                            onClick={() => setErrorMessage("")}
                            aria-label="Dismiss error"
                        >
                            ×
                        </button>
                    </div>
                )}

                <section>
                    <div className="notification-section-header">
                        <h2 className="notification-section-title">
                            Your notifications
                        </h2>

                        <div>
                            <span className="notification-count">
                                {notifications.length}{" "}
                                {notifications.length === 1
                                    ? "notification"
                                    : "notifications"}
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <p className="notification-message">
                            Loading notifications...
                        </p>
                    ) : notifications.length === 0 ? (
                        <div className="notification-empty">
                            <div className="notification-empty-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                                    <path d="M10 21h4" />
                                </svg>
                            </div>

                            <h3>No notifications yet</h3>

                            <p>
                                Important journey updates will
                                appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="notification-list">
                            {notifications.map(
                                (notification) => (
                                    <article
                                        key={notification._id}
                                        className={`notification-card ${
                                            notification.read
                                                ? "read"
                                                : "unread"
                                        }`}
                                    >
                                        <div
                                            className={`notification-icon ${
                                                notification.type ===
                                                "Train Status"
                                                    ? "warning"
                                                    : ""
                                            }`}
                                        >
                                            {notification.type ===
                                            "Train Status" ? (
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M12 3 2.8 20h18.4L12 3Z" />
                                                    <path d="M12 9v5" />
                                                    <path d="M12 17h.01" />
                                                </svg>
                                            ) : (
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                                                    <path d="M10 21h4" />
                                                </svg>
                                            )}
                                        </div>

                                        <div className="notification-content">
                                            <div className="notification-card-header">
                                                <h3 className="notification-type">
                                                    {
                                                        notification.type
                                                    }
                                                </h3>

                                                {!notification.read && (
                                                    <span className="notification-new">
                                                        NEW
                                                    </span>
                                                )}
                                            </div>

                                            <p className="notification-text">
                                                {
                                                    notification.message
                                                }
                                            </p>

                                            <div className="notification-meta">
                                                <span className="notification-time">
                                                    {new Date(
                                                        notification.createdAt
                                                    ).toLocaleString()}
                                                </span>

                                                <div style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "10px"
                                                }}>
                                                    {!notification.read && (
                                                        <span className="notification-live">
                                                            <span className="notification-live-dot"></span>
                                                            New alert
                                                        </span>
                                                    )}

                                                    {!notification.read && (
                                                        <button
                                                            className="mark-read-button"
                                                            onClick={() =>
                                                                markAsRead(
                                                                    notification._id
                                                                )
                                                            }
                                                            disabled={
                                                                readingId ===
                                                                notification._id
                                                            }
                                                        >
                                                            {readingId ===
                                                            notification._id
                                                                ? "Saving..."
                                                                : "Mark as read"}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                )
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default Notifications;