import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "https://railconnect-6xgl.onrender.com";

function Register() {
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);


const navigate = useNavigate();

const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        await axios.post(`${API_URL}/api/auth/register`, {
            name,
            email,
            password,
        });

        alert("Registration successful! Please login.");
        navigate("/");
    } catch (error) {
        console.error("Registration error:", error);

        alert(
            error.response?.data?.message ||
            "Registration failed. Please try again."
        );
    } finally {
        setLoading(false);
    }
};

return (
    <div className="register-page">
        <style>{`
            .register-page {
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

            .register-wrapper {
                width: 100%;
                max-width: 410px;
            }

            .register-brand {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-bottom: 26px;
            }

            .register-brand-mark {
                width: 42px;
                height: 42px;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                background: #1478bd;
            }

            .register-brand-mark svg {
                width: 23px;
                height: 23px;
                fill: none;
                stroke: #ffffff;
                stroke-width: 2;
                stroke-linecap: round;
                stroke-linejoin: round;
            }

            .register-brand-name {
                margin: 0;
                color: #172033;
                font-size: 23px;
                font-weight: 700;
                letter-spacing: -0.5px;
            }

            .register-brand-description {
                margin: 6px 0 0;
                color: #667085;
                font-size: 12px;
                text-align: center;
            }

            .register-card {
                background: #ffffff;
                border: 1px solid #dfe5ea;
                border-radius: 10px;
                padding: 28px;
                box-shadow: 0 6px 20px rgba(16, 24, 40, 0.045);
            }

            .register-heading {
                margin: 0;
                color: #172033;
                font-size: 20px;
                font-weight: 650;
                letter-spacing: -0.25px;
            }

            .register-subheading {
                margin: 6px 0 24px;
                color: #667085;
                font-size: 13px;
                line-height: 1.5;
            }

            .register-field {
                margin-bottom: 17px;
            }

            .register-field.password-field {
                margin-bottom: 22px;
            }

            .register-label {
                display: block;
                margin-bottom: 6px;
                color: #344054;
                font-size: 12px;
                font-weight: 650;
            }

            .register-input {
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

            .register-input::placeholder {
                color: #98a2b3;
            }

            .register-input:focus {
                border-color: #1478bd;
                box-shadow: 0 0 0 3px rgba(20, 120, 189, 0.09);
            }

            .register-submit {
                width: 100%;
                height: 43px;
                border: 1px solid #1478bd;
                border-radius: 7px;
                background: #1478bd;
                color: #ffffff;
                font-size: 13px;
                font-weight: 650;
                cursor: pointer;
                transition: background 0.16s ease, border-color 0.16s ease;
            }

            .register-submit:hover {
                background: #106aa8;
                border-color: #106aa8;
            }

            .register-submit:disabled {
                opacity: 0.65;
                cursor: not-allowed;
            }

            .register-footer {
                margin-top: 21px;
                padding-top: 18px;
                border-top: 1px solid #eef1f4;
                text-align: center;
                color: #667085;
                font-size: 12px;
            }

            .register-login-link {
                color: #1478bd;
                font-weight: 650;
                text-decoration: none;
            }

            .register-login-link:hover {
                text-decoration: underline;
            }

            @media (max-width: 480px) {
                .register-page {
                    padding: 24px 16px;
                }

                .register-card {
                    padding: 23px 20px;
                }

                .register-brand-name {
                    font-size: 21px;
                }
            }
        `}</style>

        <div className="register-wrapper">
            <div className="register-brand">
                <div className="register-brand-mark">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 4h14v10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V4Z" />
                        <path d="M8 20l2-3" />
                        <path d="M16 20l-2-3" />
                        <path d="M8 8h8" />
                        <path d="M8 12h.01" />
                        <path d="M16 12h.01" />
                    </svg>
                </div>

                <h1 className="register-brand-name">RailConnect</h1>

                <p className="register-brand-description">
                    Smart Railway Passenger Management
                </p>
            </div>

            <div className="register-card">
                <h2 className="register-heading">Create your account</h2>

                <p className="register-subheading">
                    Create a RailConnect account to manage your railway journeys.
                </p>

                <form onSubmit={handleRegister}>
                    <div className="register-field">
                        <label className="register-label" htmlFor="name">
                            Full name
                        </label>

                        <input
                            className="register-input"
                            id="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="register-field">
                        <label className="register-label" htmlFor="email">
                            Email address
                        </label>

                        <input
                            className="register-input"
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="register-field password-field">
                        <label className="register-label" htmlFor="password">
                            Password
                        </label>

                        <input
                            className="register-input"
                            id="password"
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        className="register-submit"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <div className="register-footer">
                    Already have an account?{" "}
                    <Link className="register-login-link" to="/">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    </div>
);


}

export default Register;
