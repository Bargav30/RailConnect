import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const [trains, setTrains] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const fetchTrains = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/trains"
            );

            setTrains(response.data);
        } catch (error) {
            console.error(error);
            alert("Failed to load trains.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrains();
    }, []);

    const updateStatus = async (trainId, status) => {
        try {
            await axios.patch(
                `http://localhost:5000/api/trains/${trainId}/status`,
                { status }
            );

            alert("Train status updated successfully!");

            fetchTrains();
        } catch (error) {
            console.error(error);
            alert("Failed to update train status.");
        }
    };

    return (
        <div className="admin-page">
            <style>
                {`
                    .admin-page {
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

                    .admin-navbar {
                        width: 100%;
                        height: 68px;
                        background: #ffffff;
                        border-bottom: 1px solid #e5e7eb;
                        position: sticky;
                        top: 0;
                        z-index: 100;
                    }

                    .admin-navbar-inner {
                        width: min(1320px, calc(100% - 48px));
                        height: 100%;
                        margin: 0 auto;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }

                    .admin-brand {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        color: #172033;
                        font-size: 19px;
                        font-weight: 700;
                        letter-spacing: -0.3px;
                    }

                    .admin-brand-mark {
                        width: 31px;
                        height: 31px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 7px;
                        background: #172033;
                    }

                    .admin-brand-mark svg {
                        width: 18px;
                        height: 18px;
                        fill: none;
                        stroke: #ffffff;
                        stroke-width: 2;
                        stroke-linecap: round;
                        stroke-linejoin: round;
                    }

                    .admin-brand-label {
                        display: flex;
                        align-items: center;
                        gap: 9px;
                    }

                    .admin-label {
                        padding: 4px 7px;
                        border: 1px solid #d5dce3;
                        border-radius: 4px;
                        color: #667085;
                        font-size: 9px;
                        font-weight: 700;
                        letter-spacing: 0.7px;
                    }

                    .admin-passenger-button {
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

                    .admin-passenger-button:hover {
                        background: #f8fafc;
                        border-color: #bfcbd5;
                        color: #1478bd;
                    }

                    /* =========================
                       MAIN
                    ========================= */

                    .admin-main {
                        width: min(1120px, calc(100% - 48px));
                        margin: 0 auto;
                        padding: 38px 0 70px;
                    }

                    /* =========================
                       HEADER
                    ========================= */

                    .admin-header {
                        display: flex;
                        align-items: flex-end;
                        justify-content: space-between;
                        gap: 30px;
                        margin-bottom: 30px;
                    }

                    .admin-eyebrow {
                        margin: 0 0 8px;
                        color: #1478bd;
                        font-size: 11px;
                        font-weight: 700;
                        letter-spacing: 0.8px;
                    }

                    .admin-header h1 {
                        margin: 0;
                        color: #172033;
                        font-size: 29px;
                        line-height: 1.25;
                        font-weight: 650;
                        letter-spacing: -0.6px;
                    }

                    .admin-header-description {
                        margin: 8px 0 0;
                        color: #667085;
                        font-size: 14px;
                        line-height: 1.5;
                    }

                    .admin-summary {
                        flex-shrink: 0;
                        min-width: 130px;
                        padding: 12px 15px;
                        background: #ffffff;
                        border: 1px solid #dfe5ea;
                        border-radius: 8px;
                        text-align: right;
                    }

                    .admin-summary-label {
                        display: block;
                        margin-bottom: 4px;
                        color: #98a2b3;
                        font-size: 9px;
                        font-weight: 700;
                        letter-spacing: 0.6px;
                        text-transform: uppercase;
                    }

                    .admin-summary-value {
                        color: #172033;
                        font-size: 19px;
                        font-weight: 700;
                    }

                    /* =========================
                       SECTION
                    ========================= */

                    .admin-section-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 13px;
                    }

                    .admin-section-title {
                        margin: 0;
                        color: #172033;
                        font-size: 16px;
                        font-weight: 650;
                    }

                    .admin-section-note {
                        color: #98a2b3;
                        font-size: 12px;
                    }

                    /* =========================
                       LOADING
                    ========================= */

                    .admin-message {
                        padding: 14px 16px;
                        background: #ffffff;
                        border: 1px solid #dfe5ea;
                        border-radius: 9px;
                        color: #667085;
                        font-size: 13px;
                    }

                    /* =========================
                       TRAIN LIST
                    ========================= */

                    .admin-train-list {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }

                    .admin-train-card {
                        background: #ffffff;
                        border: 1px solid #dfe5ea;
                        border-radius: 10px;
                        overflow: hidden;
                        transition:
                            border-color 0.16s ease,
                            box-shadow 0.16s ease;
                    }

                    .admin-train-card:hover {
                        border-color: #cbd7df;
                        box-shadow:
                            0 5px 18px
                            rgba(16, 24, 40, 0.05);
                    }

                    .admin-train-top {
                        display: flex;
                        align-items: flex-start;
                        justify-content: space-between;
                        gap: 20px;
                        padding: 18px 20px;
                    }

                    .admin-train-number {
                        display: block;
                        margin-bottom: 5px;
                        color: #667085;
                        font-size: 10px;
                        font-weight: 650;
                        letter-spacing: 0.5px;
                    }

                    .admin-train-name {
                        margin: 0;
                        color: #172033;
                        font-size: 17px;
                        font-weight: 650;
                    }

                    .admin-status {
                        flex-shrink: 0;
                        padding: 5px 9px;
                        border-radius: 5px;
                        font-size: 11px;
                        font-weight: 650;
                    }

                    .admin-status.ontime {
                        background: #ecfdf3;
                        color: #067647;
                        border: 1px solid #abefc6;
                    }

                    .admin-status.delayed {
                        background: #fffaeb;
                        color: #b54708;
                        border: 1px solid #fedf89;
                    }

                    /* =========================
                       ROUTE
                    ========================= */

                    .admin-route {
                        display: grid;
                        grid-template-columns:
                            minmax(0, 1fr)
                            44px
                            minmax(0, 1fr);
                        align-items: center;
                        gap: 10px;
                        margin: 0 20px;
                        padding: 14px 0;
                        border-top: 1px solid #eef1f4;
                        border-bottom: 1px solid #eef1f4;
                    }

                    .admin-route-label {
                        display: block;
                        margin-bottom: 4px;
                        color: #98a2b3;
                        font-size: 10px;
                        font-weight: 650;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }

                    .admin-route-value {
                        color: #344054;
                        font-size: 13px;
                        font-weight: 650;
                    }

                    .admin-route-arrow {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #1478bd;
                        font-size: 18px;
                    }

                    /* =========================
                       DETAILS
                    ========================= */

                    .admin-train-details {
                        display: grid;
                        grid-template-columns:
                            repeat(4, minmax(0, 1fr));
                        gap: 20px;
                        padding: 17px 20px;
                    }

                    .admin-detail-label {
                        display: block;
                        margin-bottom: 5px;
                        color: #98a2b3;
                        font-size: 10px;
                        font-weight: 650;
                        text-transform: uppercase;
                        letter-spacing: 0.45px;
                    }

                    .admin-detail-value {
                        display: block;
                        color: #344054;
                        font-size: 13px;
                        font-weight: 650;
                    }

                    .admin-detail-value.seats {
                        color: #1478bd;
                    }

                    /* =========================
                       ACTIONS
                    ========================= */

                    .admin-actions {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 20px;
                        padding: 12px 20px;
                        border-top: 1px solid #eef1f4;
                    }

                    .admin-action-note {
                        color: #98a2b3;
                        font-size: 11px;
                    }

                    .admin-action-buttons {
                        display: flex;
                        gap: 8px;
                    }

                    .admin-action-button {
                        padding: 8px 13px;
                        border-radius: 6px;
                        font-size: 11px;
                        font-weight: 650;
                        cursor: pointer;
                        transition:
                            background 0.16s ease,
                            border-color 0.16s ease;
                    }

                    .admin-action-button.ontime {
                        border: 1px solid #abefc6;
                        background: #ffffff;
                        color: #067647;
                    }

                    .admin-action-button.ontime:hover {
                        background: #ecfdf3;
                    }

                    .admin-action-button.delayed {
                        border: 1px solid #fedf89;
                        background: #ffffff;
                        color: #b54708;
                    }

                    .admin-action-button.delayed:hover {
                        background: #fffaeb;
                    }

                    /* =========================
                       RESPONSIVE
                    ========================= */

                    @media (max-width: 760px) {
                        .admin-navbar-inner,
                        .admin-main {
                            width: calc(100% - 32px);
                        }

                        .admin-header {
                            align-items: flex-start;
                            flex-direction: column;
                        }

                        .admin-summary {
                            width: 100%;
                            box-sizing: border-box;
                            text-align: left;
                        }

                        .admin-train-top {
                            flex-direction: column;
                            gap: 10px;
                        }

                        .admin-train-details {
                            grid-template-columns:
                                repeat(2, minmax(0, 1fr));
                        }
                    }

                    @media (max-width: 520px) {
                        .admin-brand-label {
                            gap: 6px;
                        }

                        .admin-label {
                            display: none;
                        }

                        .admin-route {
                            grid-template-columns:
                                minmax(0, 1fr);
                            gap: 8px;
                        }

                        .admin-route-arrow {
                            justify-content: flex-start;
                            transform: rotate(90deg);
                            width: 20px;
                        }

                        .admin-train-details {
                            grid-template-columns: 1fr 1fr;
                            gap: 15px;
                        }

                        .admin-actions {
                            align-items: stretch;
                            flex-direction: column;
                        }

                        .admin-action-buttons {
                            width: 100%;
                        }

                        .admin-action-button {
                            flex: 1;
                        }
                    }
                `}
            </style>

            <nav className="admin-navbar">
                <div className="admin-navbar-inner">
                    <div className="admin-brand">
                        <span className="admin-brand-mark">
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

                        <span className="admin-brand-label">
                            <span>RailConnect</span>
                            <span className="admin-label">
                                ADMIN
                            </span>
                        </span>
                    </div>

                    <button
                        className="admin-passenger-button"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        Passenger Dashboard
                    </button>
                </div>
            </nav>

            <main className="admin-main">
                <section className="admin-header">
                    <div>
                        <p className="admin-eyebrow">
                            ADMIN PANEL
                        </p>

                        <h1>Railway management</h1>

                        <p className="admin-header-description">
                            Manage train information and update
                            live train status.
                        </p>
                    </div>

                    {!loading && (
                        <div className="admin-summary">
                            <span className="admin-summary-label">
                                Total trains
                            </span>

                            <span className="admin-summary-value">
                                {trains.length}
                            </span>
                        </div>
                    )}
                </section>

                <section>
                    <div className="admin-section-header">
                        <h2 className="admin-section-title">
                            Train management
                        </h2>

                        {!loading && (
                            <span className="admin-section-note">
                                Status controls
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <p className="admin-message">
                            Loading trains...
                        </p>
                    ) : (
                        <div className="admin-train-list">
                            {trains.map((train) => (
                                <article
                                    className="admin-train-card"
                                    key={train._id}
                                >
                                    <div className="admin-train-top">
                                        <div>
                                            <span className="admin-train-number">
                                                TRAIN{" "}
                                                {
                                                    train.trainNumber
                                                }
                                            </span>

                                            <h3 className="admin-train-name">
                                                {
                                                    train.trainName
                                                }
                                            </h3>
                                        </div>

                                        <span
                                            className={`admin-status ${
                                                train.status ===
                                                "Delayed"
                                                    ? "delayed"
                                                    : "ontime"
                                            }`}
                                        >
                                            {train.status}
                                        </span>
                                    </div>

                                    <div className="admin-route">
                                        <div>
                                            <span className="admin-route-label">
                                                From
                                            </span>

                                            <strong className="admin-route-value">
                                                {train.source}
                                            </strong>
                                        </div>

                                        <div className="admin-route-arrow">
                                            →
                                        </div>

                                        <div>
                                            <span className="admin-route-label">
                                                To
                                            </span>

                                            <strong className="admin-route-value">
                                                {
                                                    train.destination
                                                }
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="admin-train-details">
                                        <div>
                                            <span className="admin-detail-label">
                                                Departure
                                            </span>

                                            <strong className="admin-detail-value">
                                                {
                                                    train.departureTime
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span className="admin-detail-label">
                                                Arrival
                                            </span>

                                            <strong className="admin-detail-value">
                                                {
                                                    train.arrivalTime
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span className="admin-detail-label">
                                                Available seats
                                            </span>

                                            <strong className="admin-detail-value seats">
                                                {
                                                    train.availableSeats
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span className="admin-detail-label">
                                                Fare
                                            </span>

                                            <strong className="admin-detail-value">
                                                ₹{train.fare}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="admin-actions">
                                        <span className="admin-action-note">
                                            Update live train
                                            status
                                        </span>

                                        <div className="admin-action-buttons">
                                            <button
                                                className="admin-action-button ontime"
                                                onClick={() =>
                                                    updateStatus(
                                                        train._id,
                                                        "On Time"
                                                    )
                                                }
                                            >
                                                Set On Time
                                            </button>

                                            <button
                                                className="admin-action-button delayed"
                                                onClick={() =>
                                                    updateStatus(
                                                        train._id,
                                                        "Delayed"
                                                    )
                                                }
                                            >
                                                Set Delayed
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default AdminDashboard;