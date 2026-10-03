import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const fetchBookings = async () => {
        if (!user) {
            navigate("/");
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:5000/api/bookings/user/${user.id}`
            );

            setBookings(response.data);
        } catch (error) {
            console.error(error);
            alert("Failed to load bookings.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        const socket = io("http://localhost:5000");

        socket.on("bookingUpdated", (data) => {
            if (!data?.userId) {
                return;
            }

            if (String(data.userId) !== String(user.id)) {
                return;
            }

            fetchBookings();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const cancelBooking = async () => {
        if (!cancelTarget) {
            return;
        }

        setCancelling(true);

        try {
            await axios.delete(
                `http://localhost:5000/api/bookings/${cancelTarget._id}`
            );

            setBookings((currentBookings) =>
                currentBookings.filter(
                    (booking) => booking._id !== cancelTarget._id
                )
            );

            setCancelTarget(null);
        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                    "Failed to cancel booking."
            );
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="booking-page">
            <style>
                {`
                    .booking-page {
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

                    .booking-navbar {
                        width: 100%;
                        height: 68px;
                        background: #ffffff;
                        border-bottom: 1px solid #e5e7eb;
                        position: sticky;
                        top: 0;
                        z-index: 100;
                    }

                    .booking-navbar-inner {
                        width: min(1320px, calc(100% - 48px));
                        height: 100%;
                        margin: 0 auto;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }

                    .booking-brand {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        color: #172033;
                        font-size: 19px;
                        font-weight: 700;
                        letter-spacing: -0.3px;
                    }

                    .booking-brand-mark {
                        width: 31px;
                        height: 31px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 7px;
                        background: #1478bd;
                    }

                    .booking-brand-mark svg {
                        width: 18px;
                        height: 18px;
                        fill: none;
                        stroke: #ffffff;
                        stroke-width: 2;
                        stroke-linecap: round;
                        stroke-linejoin: round;
                    }

                    .booking-dashboard-button {
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

                    .booking-dashboard-button:hover {
                        background: #f8fafc;
                        border-color: #bfcbd5;
                        color: #1478bd;
                    }

                    /* =========================
                       MAIN
                    ========================= */

                    .booking-main {
                        width: min(1120px, calc(100% - 48px));
                        margin: 0 auto;
                        padding: 30px 0 70px;
                    }

                    /* =========================
                       BACK BUTTON
                    ========================= */

                    .booking-back-button {
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

                    .booking-back-button:hover {
                        background: #edf6fb;
                        color: #1478bd;
                    }

                    .booking-back-arrow {
                        font-size: 18px;
                        line-height: 1;
                    }

                    /* =========================
                       HEADER
                    ========================= */

                    .booking-header {
                        margin-bottom: 28px;
                    }

                    .booking-eyebrow {
                        margin: 0 0 8px;
                        color: #1478bd;
                        font-size: 11px;
                        font-weight: 700;
                        letter-spacing: 0.8px;
                    }

                    .booking-header h1 {
                        margin: 0;
                        color: #172033;
                        font-size: 29px;
                        line-height: 1.25;
                        font-weight: 650;
                        letter-spacing: -0.6px;
                    }

                    .booking-header p {
                        margin: 8px 0 0;
                        color: #667085;
                        font-size: 14px;
                        line-height: 1.5;
                    }

                    /* =========================
                       LOADING / EMPTY
                    ========================= */

                    .booking-message {
                        padding: 14px 16px;
                        background: #ffffff;
                        border: 1px solid #dfe5ea;
                        border-radius: 9px;
                        color: #667085;
                        font-size: 13px;
                    }

                    .empty-bookings {
                        padding: 42px 30px;
                        text-align: center;
                        background: #ffffff;
                        border: 1px solid #dfe5ea;
                        border-radius: 10px;
                    }

                    .empty-icon {
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

                    .empty-icon svg {
                        width: 20px;
                        height: 20px;
                        fill: none;
                        stroke: currentColor;
                        stroke-width: 1.8;
                        stroke-linecap: round;
                        stroke-linejoin: round;
                    }

                    .empty-bookings h3 {
                        margin: 0;
                        color: #172033;
                        font-size: 16px;
                        font-weight: 650;
                    }

                    .empty-bookings p {
                        margin: 8px 0 20px;
                        color: #667085;
                        font-size: 13px;
                    }

                    .search-trains-button {
                        padding: 9px 16px;
                        border: 1px solid #1478bd;
                        border-radius: 7px;
                        background: #1478bd;
                        color: #ffffff;
                        font-size: 12px;
                        font-weight: 650;
                        cursor: pointer;
                    }

                    .search-trains-button:hover {
                        background: #106aa8;
                        border-color: #106aa8;
                    }

                    /* =========================
                       RESULTS HEADER
                    ========================= */

                    .booking-results-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 13px;
                    }

                    .booking-results-title {
                        margin: 0;
                        color: #172033;
                        font-size: 16px;
                        font-weight: 650;
                    }

                    .booking-count {
                        color: #98a2b3;
                        font-size: 12px;
                    }

                    /* =========================
                       BOOKING CARD
                    ========================= */

                    .booking-list {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                    }

                    .booking-card {
                        background: #ffffff;
                        border: 1px solid #dfe5ea;
                        border-radius: 10px;
                        overflow: hidden;
                        transition:
                            border-color 0.16s ease,
                            box-shadow 0.16s ease;
                    }

                    .booking-card:hover {
                        border-color: #cbd7df;
                        box-shadow:
                            0 5px 18px
                            rgba(16, 24, 40, 0.055);
                    }

                    .booking-card-header {
                        display: flex;
                        align-items: flex-start;
                        justify-content: space-between;
                        gap: 20px;
                        padding: 18px 20px;
                    }

                    .booking-train-number {
                        display: block;
                        margin-bottom: 5px;
                        color: #667085;
                        font-size: 10px;
                        font-weight: 650;
                        letter-spacing: 0.4px;
                    }

                    .booking-train-name {
                        margin: 0;
                        color: #172033;
                        font-size: 17px;
                        font-weight: 650;
                    }

                    .booking-id {
                        margin-top: 5px;
                        color: #98a2b3;
                        font-size: 11px;
                        word-break: break-all;
                    }

                    .booking-status {
                        flex-shrink: 0;
                        padding: 5px 9px;
                        border: 1px solid #abefc6;
                        border-radius: 5px;
                        background: #ecfdf3;
                        color: #067647;
                        font-size: 11px;
                        font-weight: 650;
                    }

                    /* =========================
                       JOURNEY ROUTE
                    ========================= */

                    .booking-route {
                        display: grid;
                        grid-template-columns:
                            minmax(0, 1fr)
                            44px
                            minmax(0, 1fr);
                        align-items: center;
                        gap: 10px;
                        margin: 0 20px;
                        padding: 15px 0;
                        border-top: 1px solid #eef1f4;
                        border-bottom: 1px solid #eef1f4;
                    }

                    .booking-location-label {
                        display: block;
                        margin-bottom: 4px;
                        color: #98a2b3;
                        font-size: 10px;
                        font-weight: 650;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }

                    .booking-location {
                        color: #172033;
                        font-size: 14px;
                        font-weight: 650;
                    }

                    .booking-route-arrow {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #1478bd;
                        font-size: 18px;
                    }

                    /* =========================
                       DETAILS
                    ========================= */

                    .booking-details {
                        display: grid;
                        grid-template-columns:
                            repeat(3, minmax(0, 1fr));
                        gap: 20px;
                        padding: 17px 20px;
                    }

                    .booking-detail-label {
                        display: block;
                        margin-bottom: 5px;
                        color: #98a2b3;
                        font-size: 10px;
                        font-weight: 650;
                        text-transform: uppercase;
                        letter-spacing: 0.45px;
                    }

                    .booking-detail-value {
                        display: block;
                        color: #344054;
                        font-size: 13px;
                        font-weight: 650;
                    }

                    /* =========================
                       FOOTER
                    ========================= */

                    .booking-card-footer {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 20px;
                        padding: 13px 20px;
                        border-top: 1px solid #eef1f4;
                    }

                    .booking-fare {
                        color: #667085;
                        font-size: 12px;
                    }

                    .booking-fare strong {
                        margin-left: 5px;
                        color: #172033;
                        font-size: 14px;
                    }

                    .cancel-button {
                        padding: 8px 14px;
                        border: 1px solid #f0b8b8;
                        border-radius: 7px;
                        background: #ffffff;
                        color: #b42318;
                        font-size: 12px;
                        font-weight: 650;
                        cursor: pointer;
                        transition:
                            background 0.16s ease,
                            border-color 0.16s ease;
                    }

                    .cancel-button:hover {
                        background: #fef3f2;
                        border-color: #e79a96;
                    }

                    /* =========================
                       CANCEL CONFIRMATION MODAL
                    ========================= */

                    .cancel-modal-overlay {
                        position: fixed;
                        inset: 0;
                        z-index: 1000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 20px;
                        background: rgba(15, 23, 42, 0.42);
                    }

                    .cancel-modal {
                        width: 100%;
                        max-width: 420px;
                        padding: 24px;
                        background: #ffffff;
                        border: 1px solid #dfe5ea;
                        border-radius: 12px;
                        box-shadow: 0 20px 55px rgba(16, 24, 40, 0.18);
                    }

                    .cancel-modal-icon {
                        width: 42px;
                        height: 42px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 16px;
                        border: 1px solid #f3c5c1;
                        border-radius: 9px;
                        background: #fef3f2;
                        color: #b42318;
                    }

                    .cancel-modal-icon svg {
                        width: 21px;
                        height: 21px;
                        fill: none;
                        stroke: currentColor;
                        stroke-width: 1.8;
                        stroke-linecap: round;
                        stroke-linejoin: round;
                    }

                    .cancel-modal h2 {
                        margin: 0 0 7px;
                        color: #172033;
                        font-size: 18px;
                        font-weight: 700;
                    }

                    .cancel-modal p {
                        margin: 0;
                        color: #667085;
                        font-size: 13px;
                        line-height: 1.55;
                    }

                    .cancel-modal-train {
                        margin-top: 14px;
                        padding: 11px 12px;
                        border: 1px solid #e4e8ec;
                        border-radius: 8px;
                        background: #f8fafc;
                    }

                    .cancel-modal-train strong {
                        display: block;
                        color: #172033;
                        font-size: 13px;
                    }

                    .cancel-modal-train span {
                        display: block;
                        margin-top: 3px;
                        color: #667085;
                        font-size: 11px;
                    }

                    .cancel-modal-actions {
                        display: flex;
                        justify-content: flex-end;
                        gap: 9px;
                        margin-top: 22px;
                    }

                    .cancel-modal-back,
                    .cancel-modal-confirm {
                        height: 38px;
                        padding: 0 15px;
                        border-radius: 7px;
                        font-size: 12px;
                        font-weight: 650;
                        cursor: pointer;
                    }

                    .cancel-modal-back {
                        border: 1px solid #d0d5dd;
                        background: #ffffff;
                        color: #475467;
                    }

                    .cancel-modal-back:hover {
                        background: #f8fafc;
                    }

                    .cancel-modal-confirm {
                        border: 1px solid #b42318;
                        background: #b42318;
                        color: #ffffff;
                    }

                    .cancel-modal-confirm:hover {
                        background: #9f1d15;
                    }

                    .cancel-modal-confirm:disabled {
                        opacity: 0.65;
                        cursor: not-allowed;
                    }

                    /* =========================
                       RESPONSIVE
                    ========================= */

                    @media (max-width: 700px) {
                        .booking-navbar-inner,
                        .booking-main {
                            width: calc(100% - 32px);
                        }

                        .booking-header h1 {
                            font-size: 25px;
                        }

                        .booking-details {
                            grid-template-columns:
                                repeat(2, minmax(0, 1fr));
                        }

                        .booking-card-header {
                            flex-direction: column;
                            gap: 10px;
                        }
                    }

                    @media (max-width: 520px) {
                        .booking-route {
                            grid-template-columns:
                                minmax(0, 1fr);
                            gap: 8px;
                        }

                        .booking-route-arrow {
                            justify-content: flex-start;
                            transform: rotate(90deg);
                            width: 20px;
                        }

                        .booking-details {
                            grid-template-columns: 1fr;
                            gap: 15px;
                        }

                        .booking-card-footer {
                            align-items: stretch;
                            flex-direction: column;
                        }

                        .cancel-button {
                            width: 100%;
                        }

                        .cancel-modal-actions {
                            flex-direction: column-reverse;
                        }

                        .cancel-modal-back,
                        .cancel-modal-confirm {
                            width: 100%;
                        }
                    }
                `}
            </style>

            <nav className="booking-navbar">
                <div className="booking-navbar-inner">
                    <div
                        className="booking-brand"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                        style={{ cursor: "pointer" }}
                    >
                        <span className="booking-brand-mark">
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
                        className="booking-dashboard-button"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        Dashboard
                    </button>
                </div>
            </nav>

            <main className="booking-main">
                <button
                    className="booking-back-button"
                    onClick={() => navigate(-1)}
                >
                    <span className="booking-back-arrow">
                        ←
                    </span>
                    Back
                </button>

                <section className="booking-header">
                    <p className="booking-eyebrow">
                        PASSENGER BOOKINGS
                    </p>

                    <h1>My Bookings</h1>

                    <p>
                        View and manage your railway journey
                        bookings.
                    </p>
                </section>

                {loading && (
                    <p className="booking-message">
                        Loading bookings...
                    </p>
                )}

                {!loading && bookings.length === 0 && (
                    <div className="empty-bookings">
                        <div className="empty-icon">
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

                        <h3>No bookings yet</h3>

                        <p>
                            Search for a train and make your
                            first booking.
                        </p>

                        <button
                            className="search-trains-button"
                            onClick={() =>
                                navigate("/search-trains")
                            }
                        >
                            Search trains
                        </button>
                    </div>
                )}

                {!loading && bookings.length > 0 && (
                    <section>
                        <div className="booking-results-header">
                            <h2 className="booking-results-title">
                                Your bookings
                            </h2>

                            <span className="booking-count">
                                {bookings.length}{" "}
                                {bookings.length === 1
                                    ? "booking"
                                    : "bookings"}
                            </span>
                        </div>

                        <div className="booking-list">
                            {bookings.map((booking) => (
                                <article
                                    className="booking-card"
                                    key={booking._id}
                                >
                                    <div className="booking-card-header">
                                        <div>
                                            <span className="booking-train-number">
                                                TRAIN{" "}
                                                {booking.trainId
                                                    ?.trainNumber ||
                                                    "N/A"}
                                            </span>

                                            <h3 className="booking-train-name">
                                                {booking.trainId
                                                    ?.trainName ||
                                                    "Train"}
                                            </h3>

                                            <div className="booking-id">
                                                Booking ID:{" "}
                                                {booking._id}
                                            </div>
                                        </div>

                                        <span className="booking-status">
                                            {booking.status}
                                        </span>
                                    </div>

                                    <div className="booking-route">
                                        <div>
                                            <span className="booking-location-label">
                                                From
                                            </span>

                                            <strong className="booking-location">
                                                {booking.source}
                                            </strong>
                                        </div>

                                        <div className="booking-route-arrow">
                                            →
                                        </div>

                                        <div>
                                            <span className="booking-location-label">
                                                To
                                            </span>

                                            <strong className="booking-location">
                                                {booking.destination}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="booking-details">
                                        <div>
                                            <span className="booking-detail-label">
                                                Journey date
                                            </span>

                                            <div className="booking-detail-date-wrap">
                                                <strong className="booking-detail-date">
                                                    {booking.journeyDate}
                                                </strong>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="booking-detail-label">
                                                Train number
                                            </span>

                                            <strong className="booking-detail-value">
                                                {booking.trainId
                                                    ?.trainNumber ||
                                                    "N/A"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span className="booking-detail-label">
                                                Passenger
                                            </span>

                                            <strong className="booking-detail-value">
                                                {booking.passengerName}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="booking-ticket-divider"></div>

                                    <div className="booking-card-footer">
                                        <span className="booking-fare">
                                            Fare
                                            <strong>
                                                ₹{booking.fare}
                                            </strong>
                                        </span>

                                        <button
                                            className="cancel-button"
                                            onClick={() =>
                                                setCancelTarget(booking)
                                            }
                                        >
                                            Cancel booking
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {cancelTarget && (
                    <div
                        className="cancel-modal-overlay"
                        onClick={(e) => {
                            if (e.target === e.currentTarget && !cancelling) {
                                setCancelTarget(null);
                            }
                        }}
                    >
                        <div className="cancel-modal" role="dialog" aria-modal="true">
                            <div className="cancel-modal-icon">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M12 8v5" />
                                    <path d="M12 16h.01" />
                                    <path d="M10.3 4.8 3.7 16.2a2 2 0 0 0 1.7 3h13.2a2 2 0 0 0 1.7-3L13.7 4.8a2 2 0 0 0-3.4 0Z" />
                                </svg>
                            </div>

                            <h2>Cancel this booking?</h2>

                            <p>
                                This action will cancel your confirmed railway
                                booking and release the reserved seat.
                            </p>

                            <div className="cancel-modal-train">
                                <strong>
                                    {cancelTarget.trainId?.trainName || "Train"}
                                </strong>
                                <span>
                                    Train {cancelTarget.trainId?.trainNumber || "N/A"}
                                    {" · "}
                                    {cancelTarget.journeyDate}
                                </span>
                            </div>

                            <div className="cancel-modal-actions">
                                <button
                                    type="button"
                                    className="cancel-modal-back"
                                    disabled={cancelling}
                                    onClick={() => setCancelTarget(null)}
                                >
                                    Keep booking
                                </button>

                                <button
                                    type="button"
                                    className="cancel-modal-confirm"
                                    disabled={cancelling}
                                    onClick={cancelBooking}
                                >
                                    {cancelling
                                        ? "Cancelling..."
                                        : "Yes, cancel booking"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default MyBookings;