
async function createBoard(name) {
  console.log("Board", name);

  try {
    const data = await api("/board/create", {
      method: "POST",
      body: { name }
    });

    const li = document.createElement("li");
    const btn = document.createElement("button");

    btn.className = "openBoard-btn";
    btn.textContent = data.board.name;      // oder name
    btn.dataset.boardId = data.board.id;

    li.appendChild(btn);
    BoardList.prepend(li);

  } catch (err) {
    console.error("Error creating board:", err.message);
  }
}


async function load_Board(board_id) {

  const kanban = document.getElementById('kanban-board');
  kanban.innerHTML = "";
  kanban.dataset.boardId = board_id;

  try {
    const data = await api(`/board/get/${board_id}`, { method: "GET" });

    console.log("Load Board API response:", data);

    const columns = data.columns;

    columns.forEach(column => {
      const div = document.createElement('div');
      div.className = "kanban-column";
      div.dataset.columnId = column.id;

      const header = document.createElement('header');
      header.className = "kanban-column-header";

      const titleInput = document.createElement('input');
      titleInput.className = "kanban-head-input";
      titleInput.value = column.name;

      makeEditableTitle(titleInput, column.id);

      header.appendChild(titleInput);

      const wrapper = document.createElement('div');
      wrapper.className = "kanban-card-wrapper";
      wrapper.dataset.dropzone = "cards";

      // Test cards
      for (let i = 0; i < 6; i++) {
        const card = document.createElement('div');
        const card_body = document.createElement('div');
        card_body.className = "kanban-card-body card-title";
        card.className = "kanban-card";
        card_body.innerHTML = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr,";
        card.appendChild(card_body);
        wrapper.appendChild(card);
      }

      div.appendChild(header);
      div.appendChild(wrapper);
      kanban.appendChild(div);
    });

    const newColumn = document.createElement('div');
    newColumn.className = "kanban-new-column";

    const newColumnInput = document.createElement('input');
    newColumnInput.placeholder = "New Column";
    newColumnInput.className = "kanban-new-column-input";

    newColumn.appendChild(newColumnInput);
    kanban.appendChild(newColumn);

    AddColumnListener(newColumnInput, board_id);

  } catch (err) {
    console.error("Error loading board:", err.message);
  }
}


function getCSRFToken() {
  return document.querySelector('meta[name="csrf-token"]').getAttribute("content");
}


function makeEditableTitle(inputEl, column_Id) {
  inputEl.type = "text";
  inputEl.spellcheck = false;
  inputEl.autocomplete = "off";
  inputEl.autocapitalize = "off";
  inputEl.autocorrect = "off";

  let oldValue = inputEl.value;

  // Click: Cursor mark whole Column name 
  inputEl.addEventListener("focus", () => {
    oldValue = inputEl.value;
    inputEl.select();
  });

  const save = async () => {
    const newColumnName = inputEl.value.trim() || "Untitled";
    inputEl.value = newColumnName;

    try {
    await api(`/board/column/rename/${column_Id}`, {
        method: "PUT",
        body: { newColumnName }
    });
    } catch(err){
    console.error("Rename failed:", err.message);
    }
};

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputEl.blur();      // triggert save with blur
    }
    if (e.key === "Escape") {
      inputEl.value = oldValue; // revert
      inputEl.blur();
    }
  });

  inputEl.addEventListener("blur", save);
}

function AddColumnListener(inputEl, board_id) {
  inputEl.type = "text";
  inputEl.spellcheck = false;
  inputEl.autocomplete = "off";
  inputEl.autocapitalize = "off";
  inputEl.autocorrect = "off";


    const savenewcolumn = async () => {
    // API call to change the column name
    const newColumnName = inputEl.value.trim()
    try {
    await api(`/board/column/create/${board_id}`, {
        method: "Post",
        body: { newColumnName }
    });
    } catch(err){
    console.error("Rename failed:", err.message);
    }
    };

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputEl.blur();      // triggert save with blur
    }
    if (e.key === "Escape") {
      inputEl.value = ""; // revert
    }
  });

  inputEl.addEventListener("blur", savenewcolumn);
}


// Generic helper for making API requests to the backend.
// Handles JSON conversion, CSRF token, and error handling in one place.
async function api(url, { method = "GET", body } = {}) {

  // Default headers for JSON communication
  const headers = { "Content-Type": "application/json" };

  // Attach CSRF token if available (needed for Django POST/PUT/PATCH/DELETE)
  const csrf = getCSRFToken();
  if (csrf) headers["X-CSRFToken"] = csrf;

  // Perform the HTTP request
  const res = await fetch(url, {
    method,                      
    credentials: "same-origin",   
    headers,
    // Only attach body if provided, convert JS object -> JSON string
    body: body ? JSON.stringify(body) : undefined,
  });

  // Read response as plain text first.
  // This avoids crashes when the server returns HTML instead of JSON (e.g. 404/500 pages).
  const text = await res.text();

  let data = null;

  // Try to parse JSON safely (may fail if response is HTML or empty)
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // If parsing fails, keep data as null
  }

  // If HTTP status is not OK (e.g. 400/404/500),
  // throw a readable error message (from backend if available)
  if (!res.ok) {
    const msg = data?.error || `HTTP ${res.status} for ${url}`;
    throw new Error(msg);
  }

  // Return parsed JSON data (or null if empty response)
  return data;
}