import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

function TrainStatus() {
    const [trainNumber, setTrainNumber] = useState("");
    const [train, setTrain] = useState(null);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const searchTrain = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/trains"
            );

            const foundTrain = response.data.find(
                (item) => item.trainNumber === trainNumber.trim()
            );

            if (!foundTrain) {
                setTrain(null);
                setMessage("Train not found.");
                return;
            }

            setTrain(foundTrain);
            setMessage("");
        } catch (error) {
            console.error(error);
            setMessage("Failed to fetch train status.");
        }
    };

    useEffect(() => {
        const socket = io("http://localhost:5000");

        socket.on("connect", () => {
            console.log("Connected to RailConnect live updates.");
        });

        socket.on("trainStatusUpdated", (data) => {
            console.log("Live train update received:", data);

            if (!data || !data.train) {
                return;
            }

            setTrain((currentTrain) => {
                if (!currentTrain) {
                    return currentTrain;
                }

                if (
                    String(currentTrain.trainNumber) ===
                    String(data.trainNumber)
                ) {
                    return data.train;
                }

                return currentTrain;
            });
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from live updates.");
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="status-page">
            <style>
                {`
                    .status-page {
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

                    .status-navbar {
                        width: 100%;
                        height: 68px;
                        background: #ffffff;
                        border-bottom: 1px solid #e5e7eb;
                        position: sticky;
                        top: 0;
                        z-index: 100;
                    }

                    .status-navbar-inner {
                        width: min(1320px, calc(100% - 48px));
                        height: 100%;
                        margin: 0 auto;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }

                    .status-brand {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        color: #172033;
                        font-size: 19px;
                        font-weight: 700;
                        letter-spacing: -0.3px;
                    }

                    .status-brand-mark {
                        width: 31px;
                        height: 31px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 7px;
                        background: #1478bd;
                    }

                    .status-brand-mark svg {
                        width: 18px;
                        height: 18px;
                        fill: none;
                        stroke: #ffffff;
                        stroke-width: 2;
                        stroke-linecap: round;
                        stroke-linejoin: round;
                    }

                    .status-dashboard-button {
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

                    .status-dashboard-button:hover {
                        background: #f8fafc;
                        border-color: #bfcbd5;
                        color: #1478bd;
                    }

                    /* =========================
                       MAIN
                    ========================= */

                    .status-main {
                        width: min(1120px, calc(100% - 48px));
                        margin: 0 auto;
                        padding: 30px 0 70px;
                    }

                    /* =========================
                       BACK BUTTON
                    ========================= */

                    .status-back-button {
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

                    .status-back-button:hover {
                        background: #edf6fb;
                        color: #1478bd;
                    }

                    .status-back-arrow {
                        font-size: 18px;
                        line-height: 1;
                    }

                    /* =========================
                       HEADER
                    ========================= */

                    .status-header {
                        margin-bottom: 28px;
                    }

                    .status-eyebrow {
                        margin: 0 0 8px;
                        color: #1478bd;
                        font-size: 11px;
                        font-weight: 700;
                        letter-spacing: 0.8px;
                    }

                    .status-header h1 {
                        margin: 0;
                        color: #172033;
                        font-size: 29px;
                        line-height: 1.25;
                        font-weight: 650;
                        letter-spacing: -0.6px;
                    }

                    .status-header p {
                        margin: 8px 0 0;
                        color: #667085;
                        font-size: 14px;
                        line-height: 1.5;
                    }

                    /* =========================
                       SEARCH
                    ========================= */

                    .status-search-panel {
                        padding: 18px;
                        background: #ffffff;
                        border: 1px solid #dfe5ea;
                        border-radius: 10px;
                        box-shadow:
                            0 3px 12px
                            rgba(16, 24, 40, 0.035);
                    }

                    .status-search-label {
                        display: block;
                        margin-bottom: 11px;
                        color: #344054;
                        font-size: 12px;
                        font-weight: 650;
                    }

                    .status-search-form {
                        display: grid;
                        grid-template-columns: minmax(0, 1fr) auto;
                        gap: 10px;
                    }

                    .status-input {
                        width: 100%;
                        height: 43px;
                        padding: 0 13px;
                        border: 1px solid #d0d5dd;
                        border-radius: 7px;
                        background: #ffffff;
                        color: #172033;
                        font-size: 13px;
                        outline: none;
                        box-sizing: border-box;
                        transition:
                            border-color 0.16s ease,
                            box-shadow 0.16s ease;
                    }

                    .status-input::placeholder {
                        color: #98a2b3;
                    }

                    .status-input:focus {
                        border-color: #1478bd;
                        box-shadow:
                            0 0 0 3px
                            rgba(20, 120, 189, 0.09);
                    }

                    .status-search-button {
                        height: 43px;
                        padding: 0 22px;
                        border: 1px solid #1478bd;
                        border-radius: 7px;
                        background: #1478bd;
                        color: #ffffff;
                        font-size: 13px;
                        font-weight: 650;
                        cursor: pointer;
                        transition:
                            background 0.16s ease,
                            border-color 0.16s ease;
                    }

                    .status-search-button:hover {
                        background: #106aa8;
                        border-color: #106aa8;
                    }

                    .status-message {
                        margin: 16px 0;
                        padding: 11px 13px;
                        border: 1px solid #e3e8ed;
                        border-radius: 7px;
                        background: #ffffff;
                        color: #667085;
                        font-size: 13px;
                    }

                    /* =========================
                       LIVE RESULT
                    ========================= */

                    .status-result-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin: 32px 0 12px;
                    }

                    .status-result-title {
                        margin: 0;
                        color: #172033;
                        font-size: 16px;
                        font-weight: 650;
                    }

                    .status-live-indicator {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        color: #067647;
                        font-size: 11px;
                        font-weight: 650;
                    }

                    .status-live-dot {
                        width: 7px;
                        height: 7px;
                        border-radius: 50%;
                        background: #12b76a;
                    }

                    .status-card {
                        background: #ffffff;
                        border: 1px solid #dfe5ea;
                        border-radius: 10px;
                        overflow: hidden;
                        box-shadow:
                            0 3px 12px
                            rgba(16, 24, 40, 0.035);
                    }

                    .status-card-header {
                        display: flex;
                        align-items: flex-start;
                        justify-content: space-between;
                        gap: 20px;
                        padding: 19px 20px;
                    }

                    .status-train-number {
                        display: block;
                        margin-bottom: 5px;
                        color: #667085;
                        font-size: 10px;
                        font-weight: 650;
                        letter-spacing: 0.5px;
                    }

                    .status-train-name {
                        margin: 0;
                        color: #172033;
                        font-size: 18px;
                        font-weight: 650;
                    }

                    .status-badge {
                        flex-shrink: 0;
                        padding: 5px 9px;
                        border-radius: 5px;
                        font-size: 11px;
                        font-weight: 650;
                    }

                    .status-badge.ontime {
                        background: #ecfdf3;
                        color: #067647;
                        border: 1px solid #abefc6;
                    }

                    .status-badge.delayed {
                        background: #fffaeb;
                        color: #b54708;
                        border: 1px solid #fedf89;
                    }

                    .status-badge-wrap {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-end;
                        gap: 7px;
                    }

                    .status-live-chip {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        color: #067647;
                        font-size: 10px;
                        font-weight: 650;
                    }

                    .status-live-chip-dot {
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: #12b76a;
                    }

                    .status-status-panel {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 18px;
                        margin: 0 20px;
                        padding: 13px 14px;
                        border-radius: 8px;
                        background: #f8fafc;
                        border: 1px solid #e6eaee;
                    }

                    .status-status-panel-label {
                        color: #667085;
                        font-size: 11px;
                    }

                    .status-status-panel-value {
                        color: #172033;
                        font-size: 12px;
                        font-weight: 700;
                    }

                    .status-route-station {
                        display: flex;
                        flex-direction: column;
                        gap: 3px;
                    }

                    .status-time {
                        color: #172033;
                        font-size: 16px;
                        font-weight: 750;
                    }

                    .status-card-footer {
                        background: #fbfcfd;
                    }

                    /* =========================
                       ROUTE
                    ========================= */

                    .status-route {
                        display: grid;
                        grid-template-columns:
                            minmax(0, 1fr)
                            44px
                            minmax(0, 1fr);
                        align-items: center;
                        gap: 10px;
                        margin: 0 20px;
                        padding: 16px 0;
                        border-top: 1px solid #eef1f4;
                        border-bottom: 1px solid #eef1f4;
                    }

                    .status-location-label {
                        display: block;
                        margin-bottom: 4px;
                        color: #98a2b3;
                        font-size: 10px;
                        font-weight: 650;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }

                    .status-location {
                        color: #172033;
                        font-size: 14px;
                        font-weight: 650;
                    }

                    .status-route-arrow {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #1478bd;
                        font-size: 18px;
                    }

                    /* =========================
                       DETAILS
                    ========================= */

                    .status-details {
                        display: grid;
                        grid-template-columns:
                            repeat(4, minmax(0, 1fr));
                        gap: 20px;
                        padding: 18px 20px;
                    }

                    .status-detail-label {
                        display: block;
                        margin-bottom: 5px;
                        color: #98a2b3;
                        font-size: 10px;
                        font-weight: 650;
                        text-transform: uppercase;
                        letter-spacing: 0.45px;
                    }

                    .status-detail-value {
                        display: block;
                        color: #344054;
                        font-size: 13px;
                        font-weight: 650;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .status-detail-value.fare {
                        color: #172033;
                        font-size: 14px;
                    }

                    .status-detail-value.seats {
                        color: #1478bd;
                    }

                    /* =========================
                       LIVE NOTE
                    ========================= */

                    .status-card-footer {
                        display: flex;
                        align-items: center;
                        gap: 9px;
                        padding: 13px 20px;
                        border-top: 1px solid #eef1f4;
                        color: #667085;
                        font-size: 12px;
                    }

                    .status-card-footer svg {
                        flex-shrink: 0;
                        width: 15px;
                        height: 15px;
                        fill: none;
                        stroke: #1478bd;
                        stroke-width: 1.8;
                        stroke-linecap: round;
                        stroke-linejoin: round;
                    }

                    /* =========================
                       RESPONSIVE
                    ========================= */

                    @media (max-width: 700px) {
                        .status-navbar-inner,
                        .status-main {
                            width: calc(100% - 32px);
                        }

                        .status-header h1 {
                            font-size: 25px;
                        }

                        .status-details {
                            grid-template-columns:
                                repeat(2, minmax(0, 1fr));
                        }

                        .status-card-header {
                            flex-direction: column;
                            gap: 10px;
                        }

                        .status-badge-wrap {
                            align-items: flex-start;
                        }

                        .status-status-panel {
                            align-items: flex-start;
                            flex-direction: column;
                            gap: 5px;
                        }
                    }

                    @media (max-width: 520px) {
                        .status-search-form {
                            grid-template-columns: 1fr;
                        }

                        .status-search-button {
                            width: 100%;
                        }

                        .status-route {
                            grid-template-columns:
                                minmax(0, 1fr);
                            gap: 8px;
                        }

                        .status-route-arrow {
                            justify-content: flex-start;
                            transform: rotate(90deg);
                            width: 20px;
                        }

                        .status-details {
                            grid-template-columns: 1fr;
                            gap: 15px;
                        }
                    }
                `}
            </style>

            <nav className="status-navbar">
                <div className="status-navbar-inner">
                    <div
                        className="status-brand"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                        style={{ cursor: "pointer" }}
                    >
                        <span className="status-brand-mark">
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
                        className="status-dashboard-button"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        Dashboard
                    </button>
                </div>
            </nav>

            <main className="status-main">
                <button
                    className="status-back-button"
                    onClick={() => navigate(-1)}
                >
                    <span className="status-back-arrow">
                        ←
                    </span>
                    Back
                </button>

                <section className="status-header">
                    <p className="status-eyebrow">
                        LIVE TRAIN STATUS
                    </p>

                    <h1>Check train status</h1>

                    <p>
                        Get the latest status and journey
                        information for your train.
                    </p>
                </section>

                <section className="status-search-panel">
                    <span className="status-search-label">
                        Search by train number
                    </span>

                    <div className="status-search-form">
                        <input
                            className="status-input"
                            type="text"
                            placeholder="Enter train number"
                            value={trainNumber}
                            onChange={(e) =>
                                setTrainNumber(e.target.value)
                            }
                        />

                        <button
                            className="status-search-button"
                            onClick={searchTrain}
                        >
                            Check status
                        </button>
                    </div>
                </section>

                {message && (
                    <p className="status-message">
                        {message}
                    </p>
                )}

                {train && (
                    <>
                        <div className="status-result-header">
                            <h2 className="status-result-title">
                                Train information
                            </h2>

                            <span className="status-live-indicator">
                                <span className="status-live-dot"></span>
                                Live updates
                            </span>
                        </div>

                        <article className="status-card">
                            <div className="status-card-header">
                                <div>
                                    <span className="status-train-number">
                                        TRAIN{" "}
                                        {train.trainNumber}
                                    </span>

                                    <h3 className="status-train-name">
                                        {train.trainName}
                                    </h3>
                                </div>

                                <div className="status-badge-wrap">
                                    <span
                                        className={`status-badge ${
                                            train.status ===
                                            "Delayed"
                                                ? "delayed"
                                                : "ontime"
                                        }`}
                                    >
                                        {train.status}
                                    </span>

                                    <span className="status-live-chip">
                                        <span className="status-live-chip-dot"></span>
                                        Live
                                    </span>
                                </div>
                            </div>

                            <div className="status-route">
                                <div className="status-route-station">
                                    <span className="status-location-label">
                                        From
                                    </span>

                                    <strong className="status-location">
                                        {train.source}
                                    </strong>

                                    <span className="status-time">
                                        {train.departureTime}
                                    </span>
                                </div>

                                <div className="status-route-arrow">
                                    →
                                </div>

                                <div className="status-route-station">
                                    <span className="status-location-label">
                                        To
                                    </span>

                                    <strong className="status-location">
                                        {train.destination}
                                    </strong>

                                    <span className="status-time">
                                        {train.arrivalTime}
                                    </span>
                                </div>
                            </div>

                            <div className="status-status-panel">
                                <span className="status-status-panel-label">
                                    Current train status
                                </span>

                                <span className="status-status-panel-value">
                                    {train.status === "Delayed"
                                        ? "Service is currently delayed"
                                        : "Train is running on schedule"}
                                </span>
                            </div>

                            <div className="status-details">
                                <div>
                                    <span className="status-detail-label">
                                        Scheduled departure
                                    </span>

                                    <strong className="status-detail-value">
                                        {train.departureTime}
                                    </strong>
                                </div>

                                <div>
                                    <span className="status-detail-label">
                                        Scheduled arrival
                                    </span>

                                    <strong className="status-detail-value">
                                        {train.arrivalTime}
                                    </strong>
                                </div>

                                <div>
                                    <span className="status-detail-label">
                                        Available seats
                                    </span>

                                    <strong className="status-detail-value seats">
                                        {train.availableSeats}
                                    </strong>
                                </div>

                                <div>
                                    <span className="status-detail-label">
                                        Fare
                                    </span>

                                    <strong className="status-detail-value fare">
                                        ₹{train.fare}
                                    </strong>
                                </div>
                            </div>

                            <div className="status-card-footer">
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path d="M12 3v4" />
                                    <path d="M12 17v4" />
                                    <path d="M3 12h4" />
                                    <path d="M17 12h4" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>

                                <span>
                                    Status updates appear
                                    automatically when the railway
                                    admin changes the train status.
                                </span>
                            </div>
                        </article>
                    </>
                )}
            </main>
        </div>
    );
}

export default TrainStatus;