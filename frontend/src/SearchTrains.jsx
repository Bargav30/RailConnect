import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

function SearchTrains() {
    const navigate = useNavigate();

    const [source, setSource] = useState("");
    const [destination, setDestination] = useState("");
    const [trains, setTrains] = useState([]);
    const [message, setMessage] = useState("");

    // Station autocomplete uses the trains currently stored in MongoDB.
    const [allTrains, setAllTrains] = useState([]);
    const [sourceSuggestions, setSourceSuggestions] = useState([]);
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);
    const [activeSuggestion, setActiveSuggestion] = useState("");
    const [sourceActiveIndex, setSourceActiveIndex] = useState(-1);
    const [destinationActiveIndex, setDestinationActiveIndex] = useState(-1);

    const stationNames = [
        ...new Set(
            allTrains
                .flatMap((train) => [train.source, train.destination])
                .filter((station) => typeof station === "string" && station.trim())
                .map((station) => station.trim())
        ),
    ].sort((a, b) => a.localeCompare(b));

    const getStationSuggestions = (value) => {
        const query = value.trim().toLowerCase();
        if (!query) return [];

        return stationNames
            .filter((station) => station.toLowerCase().includes(query))
            .slice(0, 7);
    };

    const chooseSourceStation = (station) => {
        setSource(station);
        setSourceSuggestions([]);
        setSourceActiveIndex(-1);
        setActiveSuggestion("");
    };

    const chooseDestinationStation = (station) => {
        setDestination(station);
        setDestinationSuggestions([]);
        setDestinationActiveIndex(-1);
        setActiveSuggestion("");
    };

    useEffect(() => {
        let isMounted = true;

        const fetchStations = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL || "https://railconnect-6xgl.onrender.com"}/api/trains`);
                if (isMounted && Array.isArray(response.data)) {
                    setAllTrains(response.data);
                }
            } catch (error) {
                console.error("Could not load station suggestions:", error);
            }
        };

        fetchStations();
        return () => {
            isMounted = false;
        };
    }, []);

    const [selectedTrain, setSelectedTrain] = useState(null);
    const [journeyDate, setJourneyDate] = useState("");
    const [bookingConfirmation, setBookingConfirmation] = useState(null);

    const searchTrains = async () => {
        setSourceSuggestions([]);
        setDestinationSuggestions([]);
        setActiveSuggestion("");

        if (!source.trim() || !destination.trim()) {
            setMessage("Please enter both source and destination.");
            return;
        }

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL || "https://railconnect-6xgl.onrender.com"}/api/trains/search`,
                {
                    params: {
                        source: source.trim(),
                        destination: destination.trim(),
                    },
                }
            );

            setTrains(response.data);

            if (response.data.length === 0) {
                setMessage("No trains found.");
            } else {
                setMessage("");
            }
        } catch (error) {
            console.error(error);
            setMessage("Failed to search trains.");
        }
    };

    const bookTrain = async (train) => {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user?.id) {
            alert("Please login again.");
            navigate("/");
            return;
        }

        setSelectedTrain(train);
        setJourneyDate("");
    };

    const confirmBooking = async () => {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user?.id) {
            alert("Please login again.");
            navigate("/");
            return;
        }

        if (!selectedTrain || !journeyDate) {
            return;
        }

        const selectedDate = new Date(
            `${journeyDate}T00:00:00`
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            alert("Please select today or a future date.");
            return;
        }

        const [year, month, day] = journeyDate.split("-");
        const formattedDate = `${day}-${month}-${year}`;

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL || "https://railconnect-6xgl.onrender.com"}/api/bookings`,
                {
                    userId: user.id,
                    trainId: selectedTrain._id,
                    passengerName: user.name,
                    journeyDate: formattedDate,
                }
            );

            setBookingConfirmation({
                booking: response.data.booking,
                train: selectedTrain,
            });

            setTrains((currentTrains) =>
                currentTrains.map((item) =>
                    item._id === selectedTrain._id
                        ? {
                              ...item,
                              availableSeats:
                                  item.availableSeats - 1,
                          }
                        : item
                )
            );

            setSelectedTrain(null);
            setJourneyDate("");
        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                    "Booking failed."
            );
        }
    };

    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL || "https://railconnect-6xgl.onrender.com");

        socket.on("trainStatusUpdated", (data) => {
            if (!data) {
                return;
            }

            setTrains((currentTrains) =>
                currentTrains.map((train) => {
                    if (
                        String(train._id) ===
                        String(data.trainId)
                    ) {
                        return {
                            ...train,
                            status:
                                data.status ||
                                data.train?.status ||
                                train.status,
                        };
                    }

                    if (
                        String(train.trainNumber) ===
                        String(data.trainNumber)
                    ) {
                        return {
                            ...train,
                            status:
                                data.status ||
                                data.train?.status ||
                                train.status,
                        };
                    }

                    return train;
                })
            );
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const closeBookingConfirmation = () => {
        setBookingConfirmation(null);
    };

    return (
        <div className="rail-search-page">
            <style>
                {`
                    /* =========================================
                       SEARCH PAGE
                       ========================================= */

                    .rail-search-page {
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

                    /* =========================================
                       ANIMATIONS
                       ========================================= */

                    @keyframes searchPageEnter {
                        from {
                            opacity: 0;
                            transform: translateY(8px);
                        }

                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes searchPanelEnter {
                        from {
                            opacity: 0;
                            transform: translateY(12px);
                        }

                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes trainCardEnter {
                        from {
                            opacity: 0;
                            transform: translateY(12px);
                        }

                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes modalEnter {
                        from {
                            opacity: 0;
                            transform: scale(0.97) translateY(8px);
                        }

                        to {
                            opacity: 1;
                            transform: scale(1) translateY(0);
                        }
                    }

                    @keyframes overlayEnter {
                        from {
                            opacity: 0;
                        }

                        to {
                            opacity: 1;
                        }
                    }

                    .search-content-animation {
                        animation:
                            searchPageEnter
                            420ms
                            ease
                            both;
                    }

                    .search-panel {
                        animation:
                            searchPanelEnter
                            460ms
                            80ms
                            ease
                            both;
                    }

                    .train-card {
                        opacity: 0;
                        animation:
                            trainCardEnter
                            420ms
                            ease
                            both;
                    }

                    .train-card:nth-child(1) {
                        animation-delay: 80ms;
                    }

                    .train-card:nth-child(2) {
                        animation-delay: 130ms;
                    }

                    .train-card:nth-child(3) {
                        animation-delay: 180ms;
                    }

                    .train-card:nth-child(4) {
                        animation-delay: 230ms;
                    }

                    .train-card:nth-child(5) {
                        animation-delay: 280ms;
                    }

                    /* =========================================
                       NAVBAR
                       ========================================= */

                    .dashboard-navbar {
                        width: 100%;
                        height: 68px;
                        background: #ffffff;
                        border-bottom: 1px solid #e5e7eb;
                        position: sticky;
                        top: 0;
                        z-index: 100;
                    }

                    .dashboard-navbar {
                        animation:
                            searchPageEnter
                            350ms
                            ease
                            both;
                    }

                    .dashboard-navbar > * {
                        width: min(
                            1320px,
                            calc(100% - 48px)
                        );
                        height: 100%;
                        margin: 0 auto;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }

                    .brand {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        color: #172033;
                        font-size: 19px;
                        font-weight: 700;
                        letter-spacing: -0.3px;
                        cursor: pointer;
                    }

                    .brand-icon {
                        width: 31px;
                        height: 31px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 7px;
                        background: #1478bd;
                    }

                    .brand-icon svg {
                        width: 18px;
                        height: 18px;
                        fill: none;
                        stroke: #ffffff;
                        stroke-width: 2;
                        stroke-linecap: round;
                        stroke-linejoin: round;
                    }

                    .logout-btn {
                        border: 1px solid #d5dce3;
                        background: #ffffff;
                        color: #344054;
                        padding: 8px 14px;
                        border-radius: 7px;
                        font-size: 13px;
                        font-weight: 600;
                        cursor: pointer;
                        transition:
                            background 160ms ease,
                            border-color 160ms ease,
                            color 160ms ease,
                            transform 160ms ease;
                    }

                    .logout-btn:hover {
                        background: #f8fafc;
                        border-color: #bfcbd5;
                        color: #1478bd;
                    }

                    .logout-btn:active {
                        transform: translateY(1px);
                    }

                    /* =========================================
                       MAIN
                       ========================================= */

                    .dashboard-main {
                        width: min(
                            1320px,
                            calc(100% - 48px)
                        );
                        margin: 0 auto;
                        padding: 38px 0 70px;
                    }

                    /* =========================================
                       BACK BUTTON
                       ========================================= */

                    .page-back-button {
                        display: inline-flex;
                        align-items: center;
                        gap: 7px;
                        margin-bottom: 22px;
                        padding: 8px 12px;
                        border: none;
                        background: transparent;
                        color: #64748b;
                        font-size: 13px;
                        font-weight: 600;
                        cursor: pointer;
                        border-radius: 8px;
                        transition:
                            background 160ms ease,
                            color 160ms ease,
                            transform 160ms ease;
                    }

                    .page-back-button:hover {
                        background: #eaf5fc;
                        color: #1478bd;
                    }

                    .page-back-button:active {
                        transform: translateX(-2px);
                    }

                    .page-back-arrow {
                        font-size: 18px;
                        line-height: 1;
                    }

                    /* =========================================
                       HEADER
                       ========================================= */

                    .search-page-header {
                        margin-bottom: 24px;
                    }

                    .search-page-label {
                        margin: 0 0 7px;
                        color: #1478bd;
                        font-size: 11px;
                        font-weight: 700;
                        letter-spacing: 0.8px;
                    }

                    .search-page-header h1 {
                        margin: 0 0 7px;
                        color: #172033;
                        font-size: 30px;
                        line-height: 1.25;
                        font-weight: 650;
                        letter-spacing: -0.6px;
                    }

                    .search-page-header p {
                        margin: 0;
                        color: #64748b;
                        font-size: 13px;
                        line-height: 1.5;
                    }

                    /* =========================================
                       SEARCH PANEL
                       ========================================= */

                    .search-panel {
                        background: #ffffff;
                        border: 1px solid #dfe5ea;
                        border-radius: 10px;
                        padding: 20px;
                        margin-bottom: 28px;
                        box-shadow:
                            0 4px 14px
                            rgba(16, 24, 40, 0.035);
                    }

                    .search-panel-title {
                        margin-bottom: 14px;
                        color: #172033;
                        font-size: 13px;
                        font-weight: 700;
                    }

                    .search-form {
                        display: grid;
                        grid-template-columns:
                            1fr 1fr auto;
                        gap: 10px;
                        align-items: end;
                    }

                    .search-field {
                        display: flex;
                        flex-direction: column;
                        gap: 6px;
                        min-width: 0;
                    }

                    .station-input-wrap {
                        position: relative;
                        width: 100%;
                    }

                    .station-suggestions {
                        position: absolute;
                        top: calc(100% + 5px);
                        left: 0;
                        right: 0;
                        z-index: 1000;
                        max-height: 230px;
                        overflow-y: auto;
                        padding: 5px;
                        border: 1px solid #e2e8f0;
                        border-radius: 9px;
                        background: #ffffff;
                        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14);
                    }

                    .station-suggestion {
                        display: flex;
                        align-items: center;
                        width: 100%;
                        min-height: 38px;
                        padding: 9px 11px;
                        border: none;
                        border-radius: 6px;
                        background: transparent;
                        color: #172033;
                        text-align: left;
                        font-size: 13px;
                        cursor: pointer;
                    }

                    .station-suggestion:hover,
                    .station-suggestion.active {
                        background: #eaf5fc;
                        color: #1478bd;
                    }

                    .station-suggestion-empty {
                        padding: 10px 11px;
                        color: #667085;
                        font-size: 12px;
                    }

                    .search-field label {
                        color: #475467;
                        font-size: 11px;
                        font-weight: 600;
                    }

                    .search-field input {
                        width: 100%;
                        height: 41px;
                        padding: 0 12px;
                        border: 1px solid #d0d5dd;
                        border-radius: 7px;
                        outline: none;
                        color: #172033;
                        background: #ffffff;
                        font-size: 13px;
                        transition:
                            border-color 160ms ease,
                            box-shadow 160ms ease;
                    }

                    .search-field input::placeholder {
                        color: #98a2b3;
                    }

                    .search-field input:focus {
                        border-color: #1478bd;
                        box-shadow:
                            0 0 0 3px
                            rgba(20, 120, 189, 0.08);
                    }

                    .search-button {
                        height: 41px;
                        padding: 0 20px;
                        border: 1px solid #1478bd;
                        border-radius: 7px;
                        background: #1478bd;
                        color: #ffffff;
                        font-size: 13px;
                        font-weight: 650;
                        cursor: pointer;
                        transition:
                            background 160ms ease,
                            transform 160ms ease,
                            box-shadow 160ms ease;
                    }

                    .search-button:hover {
                        background: #106aa8;
                        box-shadow:
                            0 4px 10px
                            rgba(20, 120, 189, 0.16);
                    }

                    .search-button:active {
                        transform: translateY(1px);
                    }

                    /* =========================================
                       MESSAGE
                       ========================================= */

                    .search-message {
                        background: #ffffff;
                        border: 1px solid #dfe5ea;
                        border-radius: 10px;
                        padding: 18px;
                        color: #667085;
                        text-align: center;
                        font-size: 13px;
                        animation:
                            searchPanelEnter
                            300ms
                            ease
                            both;
                    }

                    /* =========================================
                       RESULTS
                       ========================================= */

                    .results-section {
                        animation:
                            searchPanelEnter
                            350ms
                            ease
                            both;
                    }

                    .results-heading {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 12px;
                    }

                    .results-heading h2 {
                        margin: 0;
                        color: #172033;
                        font-size: 16px;
                        font-weight: 650;
                    }

                    .results-count {
                        color: #98a2b3;
                        font-size: 12px;
                    }

                    .train-card {
                        background: #ffffff;
                        border: 1px solid #dfe5ea;
                        border-radius: 10px;
                        padding: 20px;
                        margin-bottom: 14px;
                        transition:
                            border-color 180ms ease,
                            box-shadow 180ms ease,
                            transform 180ms ease;
                    }

                    .train-card:hover {
                        border-color: #cbd7df;
                        box-shadow:
                            0 8px 22px
                            rgba(16, 24, 40, 0.065);
                        transform: translateY(-2px);
                    }

                    .train-card-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        gap: 16px;
                        padding-bottom: 16px;
                        border-bottom: 1px solid #eef1f4;
                    }

                    .train-number {
                        display: block;
                        margin-bottom: 4px;
                        color: #667085;
                        font-size: 11px;
                        font-weight: 600;
                    }

                    .train-card-header h3 {
                        margin: 0;
                        color: #172033;
                        font-size: 17px;
                        font-weight: 650;
                    }

                    .train-status {
                        padding: 5px 9px;
                        border-radius: 5px;
                        font-size: 11px;
                        font-weight: 700;
                        white-space: nowrap;
                    }

                    .train-status.ontime {
                        background: #ecfdf3;
                        color: #027a48;
                    }

                    .train-status.delayed {
                        background: #fff4e5;
                        color: #b54708;
                    }

                    .train-route {
                        display: grid;
                        grid-template-columns:
                            1fr 40px 1fr;
                        align-items: center;
                        gap: 10px;
                        padding: 18px 0;
                        border-bottom: 1px solid #eef1f4;
                    }

                    .train-route div:not(.route-arrow) {
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                    }

                    .train-route span,
                    .train-details span {
                        color: #98a2b3;
                        font-size: 10px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.4px;
                    }

                    .train-route strong,
                    .train-details strong {
                        color: #172033;
                        font-size: 13px;
                        font-weight: 650;
                    }

                    .route-arrow {
                        text-align: center;
                        color: #1478bd;
                        font-size: 18px;
                        transition:
                            transform 180ms ease;
                    }

                    .train-card:hover .route-arrow {
                        transform: translateX(3px);
                    }

                    .train-details {
                        display: grid;
                        grid-template-columns:
                            repeat(4, 1fr);
                        gap: 20px;
                        padding: 17px 0;
                        border-bottom: 1px solid #eef1f4;
                    }

                    .train-details div {
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                    }

                    .book-row {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 15px;
                        padding-top: 15px;
                    }

                    .seat-note {
                        color: #667085;
                        font-size: 12px;
                    }

                    .book-button {
                        height: 37px;
                        padding: 0 18px;
                        border: 1px solid #1478bd;
                        border-radius: 7px;
                        background: #1478bd;
                        color: #ffffff;
                        font-size: 12px;
                        font-weight: 650;
                        cursor: pointer;
                        transition:
                            background 160ms ease,
                            transform 160ms ease,
                            box-shadow 160ms ease;
                    }

                    .book-button:hover {
                        background: #106aa8;
                        box-shadow:
                            0 4px 10px
                            rgba(20, 120, 189, 0.15);
                    }

                    .book-button:active {
                        transform: translateY(1px);
                    }

                    .book-button:disabled {
                        background: #98a2b3;
                        border-color: #98a2b3;
                        cursor: not-allowed;
                        box-shadow: none;
                    }

                    /* =========================================
                       DATE MODAL
                       ========================================= */

                    .booking-date-overlay,
                    .booking-confirm-overlay {
                        position: fixed;
                        inset: 0;
                        z-index: 1000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 20px;
                        background: rgba(15, 23, 42, 0.42);
                        animation:
                            overlayEnter
                            180ms
                            ease
                            both;
                    }

                    .booking-date-modal,
                    .booking-confirm-card {
                        animation:
                            modalEnter
                            240ms
                            cubic-bezier(
                                0.2,
                                0.8,
                                0.2,
                                1
                            )
                            both;
                    }

                    .booking-date-modal {
                        width: 100%;
                        max-width: 400px;
                        padding: 24px;
                        background: #ffffff;
                        border: 1px solid #dfe5ea;
                        border-radius: 12px;
                        box-shadow:
                            0 20px 50px
                            rgba(16, 24, 40, 0.16);
                    }

                    .booking-date-modal h2 {
                        margin: 0 0 6px;
                        color: #172033;
                        font-size: 19px;
                        font-weight: 650;
                    }

                    .booking-date-modal p {
                        margin: 0 0 20px;
                        color: #667085;
                        font-size: 13px;
                        line-height: 1.5;
                    }

                    .booking-date-label {
                        display: block;
                        margin-bottom: 7px;
                        color: #344054;
                        font-size: 12px;
                        font-weight: 650;
                    }

                    .booking-date-input {
                        width: 100%;
                        height: 44px;
                        padding: 0 12px;
                        border: 1px solid #d0d5dd;
                        border-radius: 7px;
                        background: #ffffff;
                        color: #172033;
                        font-size: 14px;
                        outline: none;
                        transition:
                            border-color 160ms ease,
                            box-shadow 160ms ease;
                    }

                    .booking-date-input:focus {
                        border-color: #1478bd;
                        box-shadow:
                            0 0 0 3px
                            rgba(20, 120, 189, 0.08);
                    }

                    .booking-date-actions {
                        display: flex;
                        justify-content: flex-end;
                        gap: 10px;
                        margin-top: 22px;
                    }

                    .booking-cancel-button,
                    .booking-confirm-button {
                        height: 38px;
                        padding: 0 16px;
                        border-radius: 7px;
                        font-size: 12px;
                        font-weight: 650;
                        cursor: pointer;
                        transition:
                            background 160ms ease,
                            border-color 160ms ease,
                            transform 160ms ease;
                    }

                    .booking-cancel-button {
                        border: 1px solid #d0d5dd;
                        background: #ffffff;
                        color: #475467;
                    }

                    .booking-cancel-button:hover {
                        background: #f8fafc;
                    }

                    .booking-confirm-button {
                        border: 1px solid #1478bd;
                        background: #1478bd;
                        color: #ffffff;
                    }

                    .booking-confirm-button:hover {
                        background: #106aa8;
                    }

                    .booking-confirm-button:disabled {
                        border-color: #98a2b3;
                        background: #98a2b3;
                        cursor: not-allowed;
                    }

                    .booking-cancel-button:active,
                    .booking-confirm-button:active {
                        transform: translateY(1px);
                    }

                    /* =========================================
                       BOOKING CONFIRMATION
                       ========================================= */

                    .booking-confirm-card {
                        width: 100%;
                        max-width: 470px;
                        background: #ffffff;
                        border: 1px solid #dfe5ea;
                        border-radius: 14px;
                        overflow: hidden;
                        box-shadow:
                            0 24px 60px
                            rgba(16, 24, 40, 0.18);
                    }

                    .booking-confirm-top {
                        padding: 26px 26px 22px;
                        text-align: center;
                        border-bottom: 1px solid #eef1f4;
                    }

                    .booking-success-icon {
                        width: 46px;
                        height: 46px;
                        margin: 0 auto 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        background: #ecfdf3;
                        color: #027a48;
                        font-size: 24px;
                        font-weight: 700;
                        animation:
                            successPop
                            350ms
                            120ms
                            cubic-bezier(
                                0.2,
                                0.8,
                                0.2,
                                1.2
                            )
                            both;
                    }

                    @keyframes successPop {
                        from {
                            opacity: 0;
                            transform: scale(0.7);
                        }

                        to {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }

                    .booking-confirm-top h2 {
                        margin: 0 0 5px;
                        color: #172033;
                        font-size: 21px;
                        font-weight: 650;
                    }

                    .booking-confirm-top p {
                        margin: 0;
                        color: #667085;
                        font-size: 13px;
                    }

                    .booking-ticket {
                        padding: 22px 26px;
                    }

                    .booking-ticket-header {
                        display: flex;
                        justify-content: space-between;
                        gap: 15px;
                        margin-bottom: 18px;
                    }

                    .booking-ticket-header span,
                    .booking-ticket-item span {
                        display: block;
                        margin-bottom: 4px;
                        color: #98a2b3;
                        font-size: 10px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.4px;
                    }

                    .booking-ticket-header strong,
                    .booking-ticket-item strong {
                        color: #172033;
                        font-size: 13px;
                    }

                    .booking-route-box {
                        display: grid;
                        grid-template-columns:
                            1fr 32px 1fr;
                        align-items: center;
                        gap: 10px;
                        padding: 16px;
                        margin-bottom: 18px;
                        background: #f7f8fa;
                        border: 1px solid #eef1f4;
                        border-radius: 9px;
                    }

                    .booking-route-box div {
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                    }

                    .booking-route-box small {
                        color: #98a2b3;
                        font-size: 10px;
                        font-weight: 700;
                        text-transform: uppercase;
                    }

                    .booking-route-box strong {
                        color: #172033;
                        font-size: 14px;
                    }

                    .booking-route-arrow {
                        text-align: center;
                        color: #1478bd;
                        font-size: 18px;
                    }

                    .booking-ticket-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 17px;
                    }

                    .booking-confirm-actions {
                        display: flex;
                        justify-content: flex-end;
                        gap: 10px;
                        padding: 16px 26px 22px;
                        border-top: 1px solid #eef1f4;
                    }

                    .booking-view-button,
                    .booking-close-button {
                        height: 38px;
                        padding: 0 16px;
                        border-radius: 7px;
                        font-size: 12px;
                        font-weight: 650;
                        cursor: pointer;
                        transition:
                            background 160ms ease,
                            border-color 160ms ease,
                            transform 160ms ease;
                    }

                    .booking-close-button {
                        border: 1px solid #d0d5dd;
                        background: #ffffff;
                        color: #475467;
                    }

                    .booking-close-button:hover {
                        background: #f8fafc;
                    }

                    .booking-view-button {
                        border: 1px solid #1478bd;
                        background: #1478bd;
                        color: #ffffff;
                    }

                    .booking-view-button:hover {
                        background: #106aa8;
                    }

                    .booking-view-button:active,
                    .booking-close-button:active {
                        transform: translateY(1px);
                    }

                    /* =========================================
                       RESPONSIVE
                       ========================================= */

                    @media (max-width: 800px) {
                        .search-form {
                            grid-template-columns: 1fr;
                        }

                        .train-details {
                            grid-template-columns:
                                repeat(2, 1fr);
                        }
                    }

                    @media (max-width: 560px) {
                        .dashboard-navbar {
                            height: 64px;
                        }

                        .dashboard-navbar > * {
                            width: calc(100% - 32px);
                        }

                        .dashboard-main {
                            width: calc(100% - 32px);
                            padding-top: 28px;
                        }

                        .brand {
                            font-size: 17px;
                        }

                        .logout-btn {
                            padding: 7px 11px;
                            font-size: 12px;
                        }

                        .search-page-header h1 {
                            font-size: 26px;
                        }

                        .train-route {
                            grid-template-columns: 1fr;
                        }

                        .route-arrow {
                            display: none;
                        }

                        .train-details {
                            grid-template-columns: 1fr;
                        }

                        .book-row {
                            align-items: stretch;
                            flex-direction: column;
                        }

                        .book-button {
                            width: 100%;
                        }

                        .booking-ticket-grid {
                            grid-template-columns: 1fr;
                        }

                        .booking-confirm-actions {
                            flex-direction: column-reverse;
                        }

                        .booking-view-button,
                        .booking-close-button {
                            width: 100%;
                        }

                        .booking-date-modal {
                            padding: 20px;
                        }

                        .booking-date-actions {
                            flex-direction: column-reverse;
                        }

                        .booking-cancel-button,
                        .booking-confirm-button {
                            width: 100%;
                        }
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .dashboard-navbar,
                        .search-content-animation,
                        .search-panel,
                        .results-section,
                        .train-card,
                        .search-message,
                        .booking-date-overlay,
                        .booking-confirm-overlay,
                        .booking-date-modal,
                        .booking-confirm-card,
                        .booking-success-icon {
                            animation: none !important;
                            opacity: 1 !important;
                            transform: none !important;
                        }

                        .train-card,
                        .search-button,
                        .book-button,
                        .page-back-button,
                        .booking-cancel-button,
                        .booking-confirm-button,
                        .booking-view-button,
                        .booking-close-button {
                            transition: none !important;
                        }
                    }
                `}
            </style>

            <nav className="dashboard-navbar">
                <div>
                    <div
                        className="brand"
                        onClick={() => navigate("/dashboard")}
                    >
                        <span className="brand-icon">
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
                        className="logout-btn"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        Dashboard
                    </button>
                </div>
            </nav>

            <main className="dashboard-main">
                <div className="search-content-animation">
                    <button
                        className="page-back-button"
                        onClick={() => navigate(-1)}
                    >
                        <span className="page-back-arrow">
                            ←
                        </span>
                        Back
                    </button>

                    <section className="search-page-header">
                        <p className="search-page-label">
                            TRAIN SEARCH
                        </p>

                        <h1>Find your train</h1>

                        <p>
                            Search available trains between your
                            source and destination.
                        </p>
                    </section>

                    <section className="search-panel">
                        <div className="search-panel-title">
                            Search for trains
                        </div>

                        <div className="search-form">
                            <div className="search-field">
                                <label htmlFor="source-station">From</label>

                                <div className="station-input-wrap">
                                    <input
                                        id="source-station"
                                        type="text"
                                        placeholder="Enter source station"
                                        value={source}
                                        autoComplete="off"
                                        role="combobox"
                                        aria-expanded={activeSuggestion === "source" && sourceSuggestions.length > 0}
                                        aria-controls="source-station-suggestions"
                                        onFocus={() => {
                                            setActiveSuggestion("source");
                                            setSourceSuggestions(getStationSuggestions(source));
                                        }}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setSource(value);
                                            setSourceSuggestions(getStationSuggestions(value));
                                            setSourceActiveIndex(-1);
                                            setActiveSuggestion("source");
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "ArrowDown" && sourceSuggestions.length) {
                                                e.preventDefault();
                                                setSourceActiveIndex((index) => (index + 1) % sourceSuggestions.length);
                                            } else if (e.key === "ArrowUp" && sourceSuggestions.length) {
                                                e.preventDefault();
                                                setSourceActiveIndex((index) => index <= 0 ? sourceSuggestions.length - 1 : index - 1);
                                            } else if (e.key === "Enter") {
                                                if (activeSuggestion === "source" && sourceActiveIndex >= 0 && sourceSuggestions[sourceActiveIndex]) {
                                                    e.preventDefault();
                                                    chooseSourceStation(sourceSuggestions[sourceActiveIndex]);
                                                } else {
                                                    setSourceSuggestions([]);
                                                    setActiveSuggestion("");
                                                    searchTrains();
                                                }
                                            } else if (e.key === "Escape") {
                                                setSourceSuggestions([]);
                                                setActiveSuggestion("");
                                            }
                                        }}
                                    />

                                    {activeSuggestion === "source" && sourceSuggestions.length > 0 && (
                                        <div className="station-suggestions" id="source-station-suggestions" role="listbox">
                                            {sourceSuggestions.map((station, index) => (
                                                <button
                                                    type="button"
                                                    className={`station-suggestion ${index === sourceActiveIndex ? "active" : ""}`}
                                                    key={station}
                                                    role="option"
                                                    aria-selected={index === sourceActiveIndex}
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => chooseSourceStation(station)}
                                                >
                                                    <span aria-hidden="true" style={{ marginRight: 9 }}>📍</span>{station}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="search-field">
                                <label htmlFor="destination-station">To</label>

                                <div className="station-input-wrap">
                                    <input
                                        id="destination-station"
                                        type="text"
                                        placeholder="Enter destination station"
                                        value={destination}
                                        autoComplete="off"
                                        role="combobox"
                                        aria-expanded={activeSuggestion === "destination" && destinationSuggestions.length > 0}
                                        aria-controls="destination-station-suggestions"
                                        onFocus={() => {
                                            setActiveSuggestion("destination");
                                            setDestinationSuggestions(getStationSuggestions(destination));
                                        }}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setDestination(value);
                                            setDestinationSuggestions(getStationSuggestions(value));
                                            setDestinationActiveIndex(-1);
                                            setActiveSuggestion("destination");
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "ArrowDown" && destinationSuggestions.length) {
                                                e.preventDefault();
                                                setDestinationActiveIndex((index) => (index + 1) % destinationSuggestions.length);
                                            } else if (e.key === "ArrowUp" && destinationSuggestions.length) {
                                                e.preventDefault();
                                                setDestinationActiveIndex((index) => index <= 0 ? destinationSuggestions.length - 1 : index - 1);
                                            } else if (e.key === "Enter") {
                                                if (activeSuggestion === "destination" && destinationActiveIndex >= 0 && destinationSuggestions[destinationActiveIndex]) {
                                                    e.preventDefault();
                                                    chooseDestinationStation(destinationSuggestions[destinationActiveIndex]);
                                                } else {
                                                    setDestinationSuggestions([]);
                                                    setActiveSuggestion("");
                                                    searchTrains();
                                                }
                                            } else if (e.key === "Escape") {
                                                setDestinationSuggestions([]);
                                                setActiveSuggestion("");
                                            }
                                        }}
                                    />

                                    {activeSuggestion === "destination" && destinationSuggestions.length > 0 && (
                                        <div className="station-suggestions" id="destination-station-suggestions" role="listbox">
                                            {destinationSuggestions.map((station, index) => (
                                                <button
                                                    type="button"
                                                    className={`station-suggestion ${index === destinationActiveIndex ? "active" : ""}`}
                                                    key={station}
                                                    role="option"
                                                    aria-selected={index === destinationActiveIndex}
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => chooseDestinationStation(station)}
                                                >
                                                    <span aria-hidden="true" style={{ marginRight: 9 }}>📍</span>{station}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                className="search-button"
                                onClick={searchTrains}
                            >
                                Search trains
                            </button>
                        </div>
                    </section>

                    {message && (
                        <p className="search-message">
                            {message}
                        </p>
                    )}

                    {trains.length > 0 && (
                        <section className="results-section">
                            <div className="results-heading">
                                <h2>Available trains</h2>

                                <span className="results-count">
                                    {trains.length}{" "}
                                    {trains.length === 1
                                        ? "train"
                                        : "trains"}{" "}
                                    found
                                </span>
                            </div>

                            <div>
                                {trains.map((train) => (
                                    <div
                                        className="train-card"
                                        key={train._id}
                                    >
                                        <div className="train-card-header">
                                            <div>
                                                <span className="train-number">
                                                    TRAIN{" "}
                                                    {train.trainNumber}
                                                </span>

                                                <h3>
                                                    {
                                                        train.trainName
                                                    }
                                                </h3>
                                            </div>

                                            <span
                                                className={`train-status ${
                                                    train.status ===
                                                    "Delayed"
                                                        ? "delayed"
                                                        : "ontime"
                                                }`}
                                            >
                                                {train.status}
                                            </span>
                                        </div>

                                        <div className="train-route">
                                            <div>
                                                <span>From</span>

                                                <strong>
                                                    {train.source}
                                                </strong>
                                            </div>

                                            <div className="route-arrow">
                                                →
                                            </div>

                                            <div>
                                                <span>To</span>

                                                <strong>
                                                    {
                                                        train.destination
                                                    }
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="train-details">
                                            <div>
                                                <span>
                                                    Departure
                                                </span>

                                                <strong>
                                                    {
                                                        train.departureTime
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Arrival
                                                </span>

                                                <strong>
                                                    {
                                                        train.arrivalTime
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Fare</span>

                                                <strong>
                                                    ₹{train.fare}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Available Seats
                                                </span>

                                                <strong>
                                                    {
                                                        train.availableSeats
                                                    }
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="book-row">
                                            <span className="seat-note">
                                                {
                                                    train.availableSeats
                                                }{" "}
                                                seats currently
                                                available
                                            </span>

                                            <button
                                                className="book-button"
                                                onClick={() =>
                                                    bookTrain(
                                                        train
                                                    )
                                                }
                                                disabled={
                                                    train.availableSeats <=
                                                    0
                                                }
                                            >
                                                {train.availableSeats <=
                                                0
                                                    ? "No Seats Available"
                                                    : "Book now"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {bookingConfirmation && (
                    <div className="booking-confirm-overlay">
                        <div className="booking-confirm-card">
                            <div className="booking-confirm-top">
                                <div className="booking-success-icon">
                                    ✓
                                </div>

                                <h2>
                                    Booking confirmed
                                </h2>

                                <p>
                                    Your journey has been
                                    successfully booked.
                                </p>
                            </div>

                            <div className="booking-ticket">
                                <div className="booking-ticket-header">
                                    <div>
                                        <span>Train</span>

                                        <strong>
                                            {bookingConfirmation.train
                                                ?.trainName ||
                                                "RailConnect Train"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Booking ID</span>

                                        <strong>
                                            {String(
                                                bookingConfirmation
                                                    .booking
                                                    ._id
                                            )
                                                .slice(-8)
                                                .toUpperCase()}
                                        </strong>
                                    </div>
                                </div>

                                <div className="booking-route-box">
                                    <div>
                                        <small>From</small>

                                        <strong>
                                            {
                                                bookingConfirmation
                                                    .booking
                                                    .source
                                            }
                                        </strong>
                                    </div>

                                    <div className="booking-route-arrow">
                                        →
                                    </div>

                                    <div>
                                        <small>To</small>

                                        <strong>
                                            {
                                                bookingConfirmation
                                                    .booking
                                                    .destination
                                            }
                                        </strong>
                                    </div>
                                </div>

                                <div className="booking-ticket-grid">
                                    <div className="booking-ticket-item">
                                        <span>
                                            Passenger
                                        </span>

                                        <strong>
                                            {
                                                bookingConfirmation
                                                    .booking
                                                    .passengerName
                                            }
                                        </strong>
                                    </div>

                                    <div className="booking-ticket-item">
                                        <span>
                                            Journey date
                                        </span>

                                        <strong>
                                            {
                                                bookingConfirmation
                                                    .booking
                                                    .journeyDate
                                            }
                                        </strong>
                                    </div>

                                    <div className="booking-ticket-item">
                                        <span>
                                            Departure
                                        </span>

                                        <strong>
                                            {bookingConfirmation
                                                .train
                                                ?.departureTime ||
                                                "—"}
                                        </strong>
                                    </div>

                                    <div className="booking-ticket-item">
                                        <span>
                                            Arrival
                                        </span>

                                        <strong>
                                            {bookingConfirmation
                                                .train
                                                ?.arrivalTime ||
                                                "—"}
                                        </strong>
                                    </div>

                                    <div className="booking-ticket-item">
                                        <span>Fare</span>

                                        <strong>
                                            ₹
                                            {
                                                bookingConfirmation
                                                    .booking
                                                    .fare
                                            }
                                        </strong>
                                    </div>

                                    <div className="booking-ticket-item">
                                        <span>Status</span>

                                        <strong>
                                            {
                                                bookingConfirmation
                                                    .booking
                                                    .status
                                            }
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="booking-confirm-actions">
                                <button
                                    className="booking-close-button"
                                    onClick={
                                        closeBookingConfirmation
                                    }
                                >
                                    Close
                                </button>

                                <button
                                    className="booking-view-button"
                                    onClick={() =>
                                        navigate(
                                            "/my-bookings"
                                        )
                                    }
                                >
                                    View My Bookings
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {selectedTrain && (
                    <div className="booking-date-overlay">
                        <div className="booking-date-modal">
                            <h2>
                                Select journey date
                            </h2>

                            <p>
                                Choose the date you want to
                                travel on{" "}
                                <strong>
                                    {selectedTrain.trainName}
                                </strong>
                                .
                            </p>

                            <label className="booking-date-label">
                                Journey date
                            </label>

                            <input
                                className="booking-date-input"
                                type="date"
                                value={journeyDate}
                                min={
                                    new Date()
                                        .toISOString()
                                        .split("T")[0]
                                }
                                onChange={(e) =>
                                    setJourneyDate(
                                        e.target.value
                                    )
                                }
                            />

                            <div className="booking-date-actions">
                                <button
                                    type="button"
                                    className="booking-cancel-button"
                                    onClick={() => {
                                        setSelectedTrain(null);
                                        setJourneyDate("");
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="booking-confirm-button"
                                    disabled={!journeyDate}
                                    onClick={
                                        confirmBooking
                                    }
                                >
                                    Confirm booking
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default SearchTrains;