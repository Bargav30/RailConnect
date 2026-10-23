
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://railconnect-6xgl.onrender.com";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [loggingIn, setLoggingIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setMessage("");
        setMessageType("");
        setLoggingIn(true);

        try {
            const response = await axios.post(
                `${API_URL}/api/auth/login`,
                {
                    email,
                    password,
                }
            );

            const loggedInUser = response.data.user;

            localStorage.setItem("token", response.data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(loggedInUser)
            );

            setMessage("Login successful. Redirecting...");
            setMessageType("success");

            setTimeout(() => {
                if (loggedInUser.role === "admin") {
                    window.location.href = "/admin";
                } else {
                    window.location.href = "/dashboard";
                }
            }, 650);
        } catch (error) {
            console.error("Login error:", error);

            setMessage(
                error.response?.data?.message ||
                "Login failed. Please check your email and password."
            );
            setMessageType("error");
            setLoggingIn(false);
        }
    };

    return (
        <div className="login-page">
            <style>
                {`
                    .login-page {
                        min-height: 100vh;
                        width: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #f7f8fa;
                        padding: 32px 20px;
                        box-sizing: border-box;
                        color: #172033;
                        font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                    }

                    .login-wrapper {
                        width: 100%;
                        max-width: 410px;
                    }

                    .login-brand {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        margin-bottom: 26px;
                    }

                    .login-brand-mark {
                        width: 42px;
                        height: 42px;
                        margin-bottom: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 8px;
                        background: #1478bd;
                    }

                    .login-brand-mark svg {
                        width: 23px;
                        height: 23px;
                        fill: none;
                        stroke: #ffffff;
                        stroke-width: 2;
                        stroke-linecap: round;
                        stroke-linejoin: round;
                    }

                    .login-brand-name {
                        margin: 0;
                        color: #172033;
                        font-size: 23px;
                        font-weight: 700;
                        letter-spacing: -0.5px;
                    }

                    .login-brand-description {
                        margin: 6px 0 0;
                        color: #667085;
                        font-size: 12px;
                        text-align: center;
                    }

                    .login-card {
                        background: #ffffff;
                        border: 1px solid #dfe5ea;
                        border-radius: 10px;
                        padding: 28px;
                        box-shadow: 0 6px 20px rgba(16, 24, 40, 0.045);
                    }

                    .login-heading {
                        margin: 0;
                        color: #172033;
                        font-size: 20px;
                        font-weight: 650;
                        letter-spacing: -0.25px;
                    }

                    .login-subheading {
                        margin: 6px 0 24px;
                        color: #667085;
                        font-size: 13px;
                        line-height: 1.5;
                    }

                    .login-field {
                        margin-bottom: 17px;
                    }

                    .login-label {
                        display: block;
                        margin-bottom: 6px;
                        color: #344054;
                        font-size: 12px;
                        font-weight: 650;
                    }

                    .login-input {
                        width: 100%;
                        height: 43px;
                        padding: 0 12px;
                        box-sizing: border-box;
                        border: 1px solid #d0d5dd;
                        border-radius: 7px;
                        background: #ffffff;
                        color: #172033;
                        font-size: 13px;
                        outline: none;
                        transition: border-color 0.16s ease, box-shadow 0.16s ease;
                    }

                    .login-input::placeholder {
                        color: #98a2b3;
                    }

                    .login-input:focus {
                        border-color: #1478bd;
                        box-shadow: 0 0 0 3px rgba(20, 120, 189, 0.09);
                    }

                    /* Password visibility toggle */
                    .password-wrapper {
                        position: relative;
                        width: 100%;
                    }

                    .password-wrapper .login-input {
                        padding-right: 44px;
                    }

                    .password-toggle {
                        position: absolute;
                        top: 50%;
                        right: 11px;
                        transform: translateY(-50%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 4px;
                        border: none;
                        background: transparent;
                        color: #667085;
                        cursor: pointer;
                    }

                    .password-toggle:hover {
                        color: #1478bd;
                    }

                    .password-toggle:focus-visible {
                        outline: 2px solid #1478bd;
                        outline-offset: 2px;
                        border-radius: 4px;
                    }

                    .login-submit {
                        width: 100%;
                        height: 43px;
                        margin-top: 5px;
                        border: 1px solid #1478bd;
                        border-radius: 7px;
                        background: #1478bd;
                        color: #ffffff;
                        font-size: 13px;
                        font-weight: 650;
                        cursor: pointer;
                        transition: background 0.16s ease, border-color 0.16s ease;
                    }

                    .login-submit:hover {
                        background: #106aa8;
                        border-color: #106aa8;
                    }

                    .login-submit:disabled {
                        opacity: 0.7;
                        cursor: not-allowed;
                    }

                    .login-message {
                        display: flex;
                        align-items: flex-start;
                        gap: 9px;
                        margin: 0 0 17px;
                        padding: 10px 12px;
                        border-radius: 7px;
                        font-size: 12px;
                        line-height: 1.45;
                    }

                    .login-message.success {
                        border: 1px solid #abefc6;
                        background: #ecfdf3;
                        color: #067647;
                    }

                    .login-message.error {
                        border: 1px solid #f3c5c1;
                        background: #fef3f2;
                        color: #b42318;
                    }

                    .login-message-icon {
                        flex: 0 0 auto;
                        width: 17px;
                        height: 17px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-top: 1px;
                        border-radius: 50%;
                        font-size: 10px;
                        font-weight: 800;
                    }

                    .login-message.success .login-message-icon {
                        background: #12b76a;
                        color: #ffffff;
                    }

                    .login-message.error .login-message-icon {
                        background: #d92d20;
                        color: #ffffff;
                    }

                    .login-footer {
                        margin-top: 21px;
                        padding-top: 18px;
                        border-top: 1px solid #eef1f4;
                        text-align: center;
                        color: #667085;
                        font-size: 12px;
                    }

                    .login-register-link {
                        color: #1478bd;
                        font-weight: 650;
                        text-decoration: none;
                    }

                    .login-register-link:hover {
                        text-decoration: underline;
                    }

                    @media (max-width: 480px) {
                        .login-page {
                            padding: 24px 16px;
                        }

                        .login-card {
                            padding: 23px 20px;
                        }

                        .login-brand-name {
                            font-size: 21px;
                        }
                    }
                `}
            </style>

            <div className="login-wrapper">
                <div className="login-brand">
                    <div className="login-brand-mark">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M5 4h14v10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V4Z" />
                            <path d="M8 20l2-3" />
                            <path d="M16 20l-2-3" />
                            <path d="M8 8h8" />
                            <path d="M8 12h.01" />
                            <path d="M16 12h.01" />
                        </svg>
                    </div>

                    <h1 className="login-brand-name">RailConnect</h1>

                    <p className="login-brand-description">
                        Smart Railway Passenger Management
                    </p>
                </div>

                <div className="login-card">
                    <h2 className="login-heading">Welcome back</h2>

                    <p className="login-subheading">
                        Sign in to continue to your RailConnect account.
                    </p>

                    <form onSubmit={handleLogin}>
                        {message && (
                            <div
                                className={`login-message ${messageType}`}
                                role="alert"
                            >
                                <span className="login-message-icon">
                                    {messageType === "success" ? "✓" : "!"}
                                </span>
                                <span>{message}</span>
                            </div>
                        )}

                        <div className="login-field">
                            <label className="login-label" htmlFor="email">
                                Email address
                            </label>

                            <input
                                className="login-input"
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="login-field">
                            <label className="login-label" htmlFor="password">
                                Password
                            </label>

                            <div className="password-wrapper">
                                <input
                                    className="login-input"
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                />

                                <button
                                    className="password-toggle"
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((previous) => !previous)
                                    }
                                    aria-label={
                                        showPassword ? "Hide password" : "Show password"
                                    }
                                    title={
                                        showPassword ? "Hide password" : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={19} />
                                    ) : (
                                        <Eye size={19} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            className="login-submit"
                            type="submit"
                            disabled={loggingIn}
                        >
                            {loggingIn ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <div className="login-footer">
                        Don't have an account?{" "}
                        <Link className="login-register-link" to="/register">
                            Create an account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;

