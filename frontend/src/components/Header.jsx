import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Header({ onLogout = () => {} }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch workspaces (adjust port/path to match your backend)
    fetch("http://localhost:3000/api/v1/workspaces")
      .then((res) => res.json())
      .then((data) => setWorkspaces(data))
      .catch((err) => console.error("Lỗi workspace:", err));
  }, []);

  const handleSelectWorkspace = (id) => {
    navigate(`/workspaces/${id}`);
  };

  return (
    <div
      className="d-flex flex-column flex-shrink-0 p-3 bg-light border-end"
      style={{ width: "250px", height: "100vh", position: "fixed", top: 0, left: 0, zIndex: 1000 }}
    >
      <Link
        to="/"
        className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none"
      >
        <span className="fs-4">MyDrive</span>
      </Link>
      <hr />

      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <Link to="/" className="nav-link active">
            <i className="bi bi-house-door me-2"></i> Home
          </Link>
        </li>
        <li>
          <a href="#" className="nav-link link-dark">
            <i className="bi bi-cloud-arrow-up me-2"></i> Categories
          </a>
        </li>
        <li>
          <a href="#" className="nav-link link-dark">
            <i className="bi bi-star me-2"></i> Yêu thích
          </a>
        </li>
        <li className="nav-item">
          <Link to="/workspaces" className="nav-link" style={{ color: "black" }}>
            <i className="bi bi-person-workspace me-2"></i> Workspace
          </Link>
        </li>
        <li>
          <a href="#" className="nav-link link-dark">
            <i className="bi bi-trash3 me-2"></i> Trash
          </a>
        </li>
      </ul>
      <hr />

      {/* User Dropdown - controlled by React state */}
      <div className="dropdown position-relative">
        <button
          className="d-flex align-items-center link-dark text-decoration-none dropdown-toggle btn border-0 w-100 text-start"
          onClick={() => setShowDropdown(!showDropdown)}
          aria-expanded={showDropdown}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt=""
            width="32"
            height="32"
            className="rounded-circle me-2"
          />
          <strong>Người dùng</strong>
        </button>

        <ul
          className={`dropdown-menu text-small shadow ${showDropdown ? "show" : ""}`}
          style={{ position: "absolute", left: 0 }}
        >
          <li>
            <a className="dropdown-item" href="#">
              Cài đặt
            </a>
          </li>
          <li>
            <a className="dropdown-item" href="#">
              Hồ sơ
            </a>
          </li>
          <li>
            <hr className="dropdown-divider" />
          </li>
          <li>
            <button
              className="dropdown-item text-danger"
              onClick={() => {
                setShowDropdown(false);
                onLogout();
              }}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Đăng xuất
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
