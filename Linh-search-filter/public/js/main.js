document.getElementById("searchBtn").addEventListener("click", search);

async function search() {
  const keyword = document.getElementById("keyword").value;
  const type = document.getElementById("type").value;
  const resultBox = document.getElementById("result");

  const url = `/api/search?keyword=${keyword}&type=${type}`;
  const res = await fetch(url);
  const data = await res.json();

  resultBox.innerHTML = data.length
    ? data
        .map(
          f => `
        <li>
          <span>${f.name} (${f.type})</span>
          <span>${f.size} KB</span>
        </li>`
        )
        .join("")
    : `<li>Không có kết quả...</li>`;
}
