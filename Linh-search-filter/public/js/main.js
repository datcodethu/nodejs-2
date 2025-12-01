// public/js/main.js
document.addEventListener("DOMContentLoaded", () => {
  const uploadForm = document.getElementById("uploadForm");
  const fileInput = document.getElementById("fileInput");
  const uploadStatus = document.getElementById("uploadStatus");
  const filesList = document.getElementById("filesList");
  // const sampleImage = document.getElementById("sampleImage");

  // -------------------- FETCH FILES --------------------
  async function loadFiles() {
    filesList.innerHTML = "Đang tải...";
    try {
      const res = await fetch("/api/files");
      if (!res.ok) throw new Error("Không lấy được danh sách file");
      const files = await res.json();
      renderFiles(files);
    } catch (err) {
      filesList.innerHTML = `<div class="empty">Lỗi: ${err.message}</div>`;
    }
  }

  function renderFiles(files) {
    if (!files || files.length === 0) {
      filesList.innerHTML = `<div class="empty">Chưa có file nào.</div>`;
      return;
    }
    filesList.innerHTML = "";
    files.forEach(f => {
      const filename = f.filename || f.name || "unknown";
      const fileId = f.id;
      const createdAt = f.created_at ? new Date(f.created_at).toLocaleString() : "";

      const div = document.createElement("div");
      div.className = "file-card";

      const meta = document.createElement("div");
      meta.className = "file-meta";
      const name = document.createElement("div");
      name.className = "name font-medium";
      name.textContent = filename;
      const time = document.createElement("div");
      time.className = "text-gray-500";
      time.style.fontSize = "13px";
      time.textContent = createdAt ? `${createdAt}` : "";

      meta.appendChild(name);
      meta.appendChild(time);

      const actions = document.createElement("div");
      actions.className = "file-actions";

      const openBtn = document.createElement("button");
      openBtn.className = "open";
      openBtn.textContent = "Mở";
      openBtn.onclick = () => {
        if (!filename) return;
        window.open(`/upload/${encodeURIComponent(filename)}`, "_blank");
      };

      const delBtn = document.createElement("button");
      delBtn.className = "delete";
      delBtn.textContent = "Xoá";
      delBtn.onclick = async () => {
        if (!fileId) return;
        if (!confirm("Bạn có chắc muốn xoá file này?")) return;
        try {
          const r = await fetch(`/api/files/${fileId}`, { method: "DELETE" });
          if (!r.ok) {
            let msg = "Xoá thất bại";
            try {
              const err = await r.json();
              msg = err.message || msg;
            } catch {}
            throw new Error(msg);
          }
          loadFiles();
        } catch (e) {
          alert("Lỗi: " + e.message);
        }
      };

      actions.appendChild(openBtn);
      actions.appendChild(delBtn);

      div.appendChild(meta);
      div.appendChild(actions);
      filesList.appendChild(div);
    });
  }

  // -------------------- UPLOAD MULTIPLE FILES --------------------
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const files = Array.from(fileInput.files || []);
    if (files.length === 0) {
      uploadStatus.textContent = "Chọn file trước khi upload.";
      return;
    }
    uploadStatus.textContent = `Đang upload ${files.length} file...`;

    const fd = new FormData();
    files.forEach(f => fd.append("files", f)); // key = 'files' (multiple)

    try {
      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: fd
      });
      if (!res.ok) {
        let msg = "Upload lỗi";
        try {
          const err = await res.json();
          msg = err.message || msg;
        } catch {}
        throw new Error(msg);
      }
      const data = await res.json();
      const uploaded = data.filenames || [];
      uploadStatus.textContent = `Upload xong (${uploaded.length}): ${uploaded.join(", ")}`;
      fileInput.value = "";
      loadFiles();
    } catch (err) {
      uploadStatus.textContent = "Lỗi: " + err.message;
    }
  });

  // -------------------- SEARCH --------------------
  const searchName = document.getElementById("searchName");
  const searchType = document.getElementById("searchType");
  const searchDate = document.getElementById("searchDate");
  const searchBtn = document.getElementById("searchBtn");

  let searchTimeout;
  async function searchFiles() {
    const name = searchName.value.trim();
    const type = searchType.value.trim();
    const date = searchDate.value.trim();

    const params = new URLSearchParams();
    if (name) params.append("name", name);
    if (type) params.append("type", type);
    if (date) params.append("date", date);

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      try {
        const res = await fetch("/api/files/search?" + params.toString());
        if (!res.ok) throw new Error("Search thất bại");
        const data = await res.json();
        renderFiles(data);
      } catch (err) {
        filesList.innerHTML = `<div class="empty">Lỗi: ${err.message}</div>`;
      }
    }, 300); // debounce 300ms
  }

  searchName.addEventListener("keyup", searchFiles);
  searchType.addEventListener("change", searchFiles);
  searchDate.addEventListener("change", searchFiles);
  searchBtn.onclick = searchFiles;

  // -------------------- INITIAL LOAD --------------------
  loadFiles();
});
