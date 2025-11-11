import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Header() {
  const [workspaces, setWorkspaces] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/api/v1/workspaces")
      .then((res) => res.json())
      .then((data) => setWorkspaces(data))
      .catch((err) => console.error("Lỗi workspace:", err));
  }, []);

  const handleSelectWorkspace = (id) => {
    navigate(`/workspaces/${id}`); // điều hướng đúng cách, không reload
  };

  return (
    <div
      className="d-flex flex-column flex-shrink-0 p-3 bg-light border-end"
      style={{ width: "250px", height: "100vh", position: "fixed" }}
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
            <i className="bi bi-house-door me-2"></i> Trang chủ
          </Link>
        </li>

        <li>
          <div className="dropdown">
            <button
              className="btn btn-light dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Workspaces
            </button>
            <ul className="dropdown-menu">
              {workspaces.length > 0 ? (
                workspaces.map((ws) => (
                  <li key={ws._id || ws.id}>
                    <button
                      className="dropdown-item"
                      onClick={() => handleSelectWorkspace(ws._id || ws.id)}
                    >
                      {ws.name}
                    </button>
                  </li>
                ))
              ) : (
                <li>
                  <span className="dropdown-item text-muted">
                    Đang tải...
                  </span>
                </li>
              )}
            </ul>
          </div>
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
        <li>
          <a href="#" className="nav-link link-dark">
            <i className="bi bi-trash3 me-2"></i> Trash
          </a>
        </li>
      </ul>
      <hr />
      <div className="dropdown">
        <a
          href="#"
          className="d-flex align-items-center link-dark text-decoration-none dropdown-toggle"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt=""
            width="32"
            height="32"
            className="rounded-circle me-2"
          />
          <strong>Người dùng</strong>
        </a>
        <ul className="dropdown-menu text-small shadow">
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
            <a className="dropdown-item" href="#">
              Đăng xuất
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
