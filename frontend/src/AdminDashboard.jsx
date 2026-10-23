import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = (import.meta.env.VITE_API_URL || "https://railconnect-6xgl.onrender.com").replace(/\/$/, "");
const TRAINS_API = `${API}/api/trains`;

function getTrainArray(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.trains)) return data.trains;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

const emptyTrain = {
    trainNumber: "",
    trainName: "",
    source: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    fare: "",
    availableSeats: "",
    status: "On Time",
};

function AdminDashboard() {
    const [trains, setTrains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTrain, setNewTrain] = useState(emptyTrain);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    const navigate = useNavigate();

    const fetchTrains = async () => {
        try {
            const response = await axios.get(TRAINS_API);
            const trainList = getTrainArray(response.data);
            setTrains(trainList);
            if (trainList.length === 0) {
                console.warn("Train API did not return a non-empty train array:", response.data);
            }
        } catch (error) {
            console.error(error);
            setMessage("Failed to load trains. Check your backend.");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrains();
    }, []);

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setNewTrain((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const addTrain = async (event) => {
        event.preventDefault();
        setMessage("");

        if (
            !newTrain.trainNumber.trim() ||
            !newTrain.trainName.trim() ||
            !newTrain.source.trim() ||
            !newTrain.destination.trim() ||
            !newTrain.departureTime.trim() ||
            !newTrain.arrivalTime.trim()
        ) {
            setMessage("Please fill in all train details.");
            setMessageType("error");
            return;
        }

        if (
            newTrain.source.trim().toLowerCase() ===
            newTrain.destination.trim().toLowerCase()
        ) {
            setMessage("Source and destination must be different.");
            setMessageType("error");
            return;
        }

        if (newTrain.fare === "" || Number(newTrain.fare) < 0) {
            setMessage("Enter a valid fare.");
            setMessageType("error");
            return;
        }

        if (
            newTrain.availableSeats === "" ||
            !Number.isInteger(Number(newTrain.availableSeats)) ||
            Number(newTrain.availableSeats) < 0
        ) {
            setMessage("Enter a valid whole number of available seats.");
            setMessageType("error");
            return;
        }

        try {
            setSaving(true);

            const response = await axios.post(TRAINS_API, {
                ...newTrain,
                trainNumber: newTrain.trainNumber.trim(),
                trainName: newTrain.trainName.trim(),
                source: newTrain.source.trim(),
                destination: newTrain.destination.trim(),
                departureTime: newTrain.departureTime.trim(),
                arrivalTime: newTrain.arrivalTime.trim(),
                fare: Number(newTrain.fare),
                availableSeats: Number(newTrain.availableSeats),
            });

            const createdTrain = response.data?.train || response.data?.data || response.data;
            if (createdTrain && typeof createdTrain === "object" && createdTrain._id) {
                setTrains((previous) => [
                    createdTrain,
                    ...(Array.isArray(previous) ? previous : []),
                ]);
            } else {
                await fetchTrains();
            }

            setNewTrain(emptyTrain);
            setShowAddForm(false);
            setMessage("Train added successfully!");
            setMessageType("success");
        } catch (error) {
            console.error(error);

            setMessage(
                error.response?.data?.message ||
                    "Failed to add train. Check your backend connection."
            );
            setMessageType("error");
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (trainId, status) => {
        try {
            await axios.patch(`${TRAINS_API}/${trainId}/status`, { status });

            setMessage("Train status updated successfully!");
            setMessageType("success");

            await fetchTrains();
        } catch (error) {
            console.error(error);

            setMessage(
                error.response?.data?.message ||
                    "Failed to update train status."
            );
            setMessageType("error");
        }
    };

    return (
        <div className="admin-page">
            <style>{`
                .admin-page {
                    min-height: 100vh;
                    background: #f7f8fa;
                    color: #172033;
                    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                }

                .admin-navbar {
                    width: 100%;
                    height: 68px;
                    background: #fff;
                    border-bottom: 1px solid #e5e7eb;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .admin-navbar-inner {
                    width: min(1320px, calc(100% - 48px));
                    height: 100%;
                    margin: auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .admin-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 19px;
                    font-weight: 700;
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
                    stroke: #fff;
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
                    letter-spacing: .7px;
                }

                .admin-passenger-button,
                .admin-add-button {
                    border: 1px solid #d5dce3;
                    background: #fff;
                    color: #344054;
                    padding: 9px 14px;
                    border-radius: 7px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .admin-passenger-button:hover {
                    background: #f8fafc;
                    color: #1478bd;
                }

                .admin-main {
                    width: min(1120px, calc(100% - 48px));
                    margin: auto;
                    padding: 38px 0 70px;
                }

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
                    letter-spacing: .8px;
                }

                .admin-header h1 {
                    margin: 0;
                    font-size: 29px;
                    line-height: 1.25;
                    font-weight: 650;
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
                    background: #fff;
                    border: 1px solid #dfe5ea;
                    border-radius: 8px;
                    text-align: right;
                }

                .admin-summary-label,
                .admin-detail-label,
                .admin-route-label {
                    display: block;
                    margin-bottom: 5px;
                    color: #98a2b3;
                    font-size: 10px;
                    font-weight: 650;
                    text-transform: uppercase;
                    letter-spacing: .45px;
                }

                .admin-summary-value {
                    font-size: 19px;
                    font-weight: 700;
                }

                .admin-section {
                    margin-top: 26px;
                }

                .admin-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    margin-bottom: 13px;
                }

                .admin-section-title {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 650;
                }

                .admin-section-note {
                    color: #98a2b3;
                    font-size: 12px;
                }

                .admin-add-button {
                    background: #1478bd;
                    border-color: #1478bd;
                    color: #fff;
                }

                .admin-add-button:hover {
                    background: #11669f;
                }

                .admin-form-card {
                    margin-bottom: 24px;
                    padding: 24px;
                    background: #fff;
                    border: 1px solid #dfe5ea;
                    border-radius: 10px;
                }

                .admin-form-card h3 {
                    margin: 0 0 6px;
                    font-size: 18px;
                }

                .admin-form-description {
                    margin: 0 0 22px;
                    color: #667085;
                    font-size: 13px;
                }

                .admin-form-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 17px;
                }

                .admin-field {
                    display: flex;
                    flex-direction: column;
                    gap: 7px;
                }

                .admin-field label {
                    color: #344054;
                    font-size: 12px;
                    font-weight: 650;
                }

                .admin-field input,
                .admin-field select {
                    width: 100%;
                    min-height: 42px;
                    box-sizing: border-box;
                    padding: 10px 11px;
                    border: 1px solid #d0d5dd;
                    border-radius: 7px;
                    background: #fff;
                    color: #172033;
                    font: inherit;
                    font-size: 13px;
                    outline: none;
                }

                .admin-field input:focus,
                .admin-field select:focus {
                    border-color: #1478bd;
                    box-shadow: 0 0 0 3px rgba(20, 120, 189, .12);
                }

                .admin-form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 22px;
                }

                .admin-cancel-button,
                .admin-submit-button {
                    padding: 10px 16px;
                    border-radius: 7px;
                    font-size: 13px;
                    font-weight: 650;
                    cursor: pointer;
                }

                .admin-cancel-button {
                    background: #fff;
                    border: 1px solid #d0d5dd;
                    color: #344054;
                }

                .admin-submit-button {
                    background: #1478bd;
                    border: 1px solid #1478bd;
                    color: #fff;
                }

                .admin-submit-button:disabled {
                    opacity: .6;
                    cursor: not-allowed;
                }

                .admin-feedback {
                    margin: 0 0 18px;
                    padding: 12px 15px;
                    border: 1px solid;
                    border-radius: 8px;
                    font-size: 13px;
                }

                .admin-feedback.success {
                    background: #ecfdf3;
                    border-color: #abefc6;
                    color: #067647;
                }

                .admin-feedback.error {
                    background: #fef3f2;
                    border-color: #fecdca;
                    color: #b42318;
                }

                .admin-message {
                    padding: 14px 16px;
                    background: #fff;
                    border: 1px solid #dfe5ea;
                    border-radius: 9px;
                    color: #667085;
                    font-size: 13px;
                }

                .admin-train-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .admin-train-card {
                    background: #fff;
                    border: 1px solid #dfe5ea;
                    border-radius: 10px;
                    overflow: hidden;
                    transition: border-color .16s ease, box-shadow .16s ease;
                }

                .admin-train-card:hover {
                    border-color: #cbd7df;
                    box-shadow: 0 5px 18px rgba(16, 24, 40, .05);
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
                    letter-spacing: .5px;
                }

                .admin-train-name {
                    margin: 0;
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

                .admin-route {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) 44px minmax(0, 1fr);
                    align-items: center;
                    gap: 10px;
                    margin: 0 20px;
                    padding: 14px 0;
                    border-top: 1px solid #eef1f4;
                    border-bottom: 1px solid #eef1f4;
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

                .admin-train-details {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 20px;
                    padding: 17px 20px;
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
                }

                .admin-action-button.ontime {
                    border: 1px solid #abefc6;
                    background: #fff;
                    color: #067647;
                }

                .admin-action-button.delayed {
                    border: 1px solid #fedf89;
                    background: #fff;
                    color: #b54708;
                }

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

                    .admin-form-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }

                    .admin-train-top {
                        flex-direction: column;
                    }

                    .admin-train-details {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }

                @media (max-width: 520px) {
                    .admin-brand-label {
                        gap: 6px;
                    }

                    .admin-label {
                        display: none;
                    }

                    .admin-form-grid {
                        grid-template-columns: 1fr;
                    }

                    .admin-route {
                        grid-template-columns: minmax(0, 1fr);
                        gap: 8px;
                    }

                    .admin-route-arrow {
                        justify-content: flex-start;
                        transform: rotate(90deg);
                        width: 20px;
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
            `}</style>

            <nav className="admin-navbar">
                <div className="admin-navbar-inner">
                    <div className="admin-brand">
                        <span className="admin-brand-mark">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
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
                            <span className="admin-label">ADMIN</span>
                        </span>
                    </div>

                    <button
                        className="admin-passenger-button"
                        onClick={() => navigate("/dashboard")}
                    >
                        Passenger Dashboard
                    </button>
                </div>
            </nav>

            <main className="admin-main">
                <section className="admin-header">
                    <div>
                        <p className="admin-eyebrow">ADMIN PANEL</p>
                        <h1>Railway management</h1>
                        <p className="admin-header-description">
                            Manage train information and update live train status.
                        </p>
                    </div>

                    {!loading && (
                        <div className="admin-summary">
                            <span className="admin-summary-label">Total trains</span>
                            <span className="admin-summary-value">{trains.length}</span>
                        </div>
                    )}
                </section>

                {message && (
                    <div
                        className={`admin-feedback ${messageType}`}
                        role="status"
                    >
                        {message}
                    </div>
                )}

                <section className="admin-section">
                    <div className="admin-section-header">
                        <h2 className="admin-section-title">Train management</h2>

                        <button
                            className="admin-add-button"
                            onClick={() => {
                                setShowAddForm((previous) => !previous);
                                setMessage("");
                            }}
                        >
                            {showAddForm ? "Close form" : "+ Add Train"}
                        </button>
                    </div>

                    {showAddForm && (
                        <form className="admin-form-card" onSubmit={addTrain}>
                            <h3>Add a new train</h3>
                            <p className="admin-form-description">
                                Enter the train details below. The new train will be
                                saved to the database.
                            </p>

                            <div className="admin-form-grid">
                                <div className="admin-field">
                                    <label htmlFor="trainNumber">Train number *</label>
                                    <input
                                        id="trainNumber"
                                        name="trainNumber"
                                        value={newTrain.trainNumber}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 12677"
                                        required
                                    />
                                </div>

                                <div className="admin-field">
                                    <label htmlFor="trainName">Train name *</label>
                                    <input
                                        id="trainName"
                                        name="trainName"
                                        value={newTrain.trainName}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Intercity Express"
                                        required
                                    />
                                </div>

                                <div className="admin-field">
                                    <label htmlFor="source">Source *</label>
                                    <input
                                        id="source"
                                        name="source"
                                        value={newTrain.source}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Chennai"
                                        required
                                    />
                                </div>

                                <div className="admin-field">
                                    <label htmlFor="destination">Destination *</label>
                                    <input
                                        id="destination"
                                        name="destination"
                                        value={newTrain.destination}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Madurai"
                                        required
                                    />
                                </div>

                                <div className="admin-field">
                                    <label htmlFor="departureTime">Departure time *</label>
                                    <input
                                        id="departureTime"
                                        name="departureTime"
                                        value={newTrain.departureTime}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 06:30 AM"
                                        required
                                    />
                                </div>

                                <div className="admin-field">
                                    <label htmlFor="arrivalTime">Arrival time *</label>
                                    <input
                                        id="arrivalTime"
                                        name="arrivalTime"
                                        value={newTrain.arrivalTime}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 01:00 PM"
                                        required
                                    />
                                </div>

                                <div className="admin-field">
                                    <label htmlFor="fare">Fare (₹) *</label>
                                    <input
                                        id="fare"
                                        name="fare"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={newTrain.fare}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 450"
                                        required
                                    />
                                </div>

                                <div className="admin-field">
                                    <label htmlFor="availableSeats">Available seats *</label>
                                    <input
                                        id="availableSeats"
                                        name="availableSeats"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={newTrain.availableSeats}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 100"
                                        required
                                    />
                                </div>

                                <div className="admin-field">
                                    <label htmlFor="status">Initial status</label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={newTrain.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="On Time">On Time</option>
                                        <option value="Delayed">Delayed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="admin-form-actions">
                                <button
                                    type="button"
                                    className="admin-cancel-button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setNewTrain(emptyTrain);
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="admin-submit-button"
                                    disabled={saving}
                                >
                                    {saving ? "Adding train..." : "Save Train"}
                                </button>
                            </div>
                        </form>
                    )}
                </section>

                <section className="admin-section">
                    <div className="admin-section-header">
                        <h2 className="admin-section-title">Existing trains</h2>
                        <span className="admin-section-note">
                            Update train status
                        </span>
                    </div>

                    {loading ? (
                        <p className="admin-message">Loading trains...</p>
                    ) : trains.length === 0 ? (
                        <p className="admin-message">
                            No trains found. Use Add Train to create your first train.
                        </p>
                    ) : (
                        <div className="admin-train-list">
                            {(Array.isArray(trains) ? trains : []).map((train) => (
                                <article className="admin-train-card" key={train._id}>
                                    <div className="admin-train-top">
                                        <div>
                                            <span className="admin-train-number">
                                                TRAIN {train.trainNumber}
                                            </span>
                                            <h3 className="admin-train-name">
                                                {train.trainName}
                                            </h3>
                                        </div>

                                        <span
                                            className={`admin-status ${
                                                train.status === "Delayed"
                                                    ? "delayed"
                                                    : "ontime"
                                            }`}
                                        >
                                            {train.status || "On Time"}
                                        </span>
                                    </div>

                                    <div className="admin-route">
                                        <div>
                                            <span className="admin-route-label">From</span>
                                            <strong className="admin-route-value">
                                                {train.source}
                                            </strong>
                                        </div>

                                        <div className="admin-route-arrow">→</div>

                                        <div>
                                            <span className="admin-route-label">To</span>
                                            <strong className="admin-route-value">
                                                {train.destination}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="admin-train-details">
                                        <div>
                                            <span className="admin-detail-label">
                                                Departure
                                            </span>
                                            <strong className="admin-detail-value">
                                                {train.departureTime}
                                            </strong>
                                        </div>

                                        <div>
                                            <span className="admin-detail-label">
                                                Arrival
                                            </span>
                                            <strong className="admin-detail-value">
                                                {train.arrivalTime}
                                            </strong>
                                        </div>

                                        <div>
                                            <span className="admin-detail-label">
                                                Available seats
                                            </span>
                                            <strong className="admin-detail-value seats">
                                                {train.availableSeats}
                                            </strong>
                                        </div>

                                        <div>
                                            <span className="admin-detail-label">Fare</span>
                                            <strong className="admin-detail-value">
                                                ₹{train.fare}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="admin-actions">
                                        <span className="admin-action-note">
                                            Update live train status
                                        </span>

                                        <div className="admin-action-buttons">
                                            <button
                                                className="admin-action-button ontime"
                                                onClick={() =>
                                                    updateStatus(train._id, "On Time")
                                                }
                                            >
                                                Set On Time
                                            </button>

                                            <button
                                                className="admin-action-button delayed"
                                                onClick={() =>
                                                    updateStatus(train._id, "Delayed")
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