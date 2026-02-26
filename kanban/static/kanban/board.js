let draggedCardEl = null;
let dragFromWrapper = null;


const modal = document.getElementById('composeModal');

modal.addEventListener('show.bs.modal', async function (event) {

  const clickedElement = event.relatedTarget; 
  const card = clickedElement.closest('.kanban-card');

  const task_id = card.dataset.cardId
  // API call (dein Django endpoint)
  try{
    const data = await api(`/task/get/${task_id}`, {
        method: "GET",
    });

  console.log("Get task Api response:", data)
  modal.querySelector('#modal_task_title').value = data.card.title;
  modal.querySelector('#modal_task_description').value = data.card.description;
  modal.querySelector('#modal_card_id').value = data.card.id;

  }
  catch (err) {
    console.error("Error getting task data:", err.message);
  }

});

// Save the Content of the Task with API Call
document.querySelector('#compose-form').onsubmit = async (event) => {
    
    // Prevent normal submit
    event.preventDefault();

    try {

      //Get the data from the form 
       const title = document.querySelector('#modal_task_title').value;
       const description = document.querySelector('#modal_task_description').value;
       const task_id = document.querySelector('#modal_card_id').value;

       const data = await api(`/task/update/${task_id}`, {
       method: "PUT",
       body: {
          title: title,
          description: description,
        }
        });

        console.log("Save task API response:", data)

        const card = document.querySelector(`[data-card-id="${task_id}"]`);
        card.querySelector('.kanban-card-body').innerHTML = data.card.title

        // Close the modal 
        const modalElement = document.getElementById("composeModal");
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();

    } catch (err) {
      console.error("Error getting task data:", err.message);
    }
}


// Function for creating a new board
async function createBoard(name) {
  try {
    const data = await api("/board/create", {
      method: "POST",
      body: { name }
    });

   //Build new list item with button for the new board
    console.log("New Board API:", data)
    const li = document.createElement("li");

      const div = document.createElement("div");
      div.className = "board-list"

      // Make the button with relevant data (Click event handled in menu.js)
      const btn = document.createElement("button");
      btn.className = "openBoard-btn";
      btn.textContent = data.board.name;     
      btn.dataset.boardId = data.board.id;

      // create the delete button (Click event handled in menu.js)
      const deletebtn = document.createElement("button");
      deletebtn.className = "deleteBoard-btn";
      deletebtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="m376-300 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Zm-96 180q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Zm-400 0v520-520Z"/></svg>
      `  
      deletebtn.dataset.boardId = data.board.id;

    //Build the elements together
    div.appendChild(btn)
    div.appendChild(deletebtn)

    li.appendChild(div);
    const inputNewBoard = document.getElementById('new-board')
    inputNewBoard.after(li);

  } catch (err) {
    console.error("Error creating board:", err.message);
  }
}

// Function to delete a Board
async function deleteBoard(board_id, list_item) {
  try {
    const data = await api(`/board/delete/${board_id}`, {
        method: "DELETE",
    });

    console.log("Delete board API response", data)
    list_item.remove();
    // Only clear the view if the deleted board is also the current active board
    if (list_item.classList.contains("active")) {
      document.querySelector('#kanban-board').innerHTML = ""
    } 
    

    } catch(err){
    console.error("Rename failed:", err.message);
    }
    };


// Function to render/load the board
async function load_Board(board_id) {

  // Get the board/view from the board and make it empty in case there is already content
  const kanban = document.getElementById('kanban-board');
  kanban.innerHTML = "";
  kanban.dataset.boardId = board_id;

  try {
    const data = await api(`/board/get/${board_id}`, { method: "GET" });

    console.log("Load Board API response:", data);
    // Helper Function to render the kanban
    RenderKanban(kanban, data.columns, board_id);

  } catch (err) {
    console.error("Error loading board:", err.message);
  }
}

// Helper Function to get the csrf token
function getCSRFToken() {
  return document.querySelector('meta[name="csrf-token"]').getAttribute("content");
}


// Helper function to make the Head of a column editable
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

    // When the old value is the new value then make no api call
    if (oldValue === newColumnName) {
      return
    }

    try {
    const data = await api(`/board/column/rename/${column_Id}`, {
        method: "PUT",
        body: { newColumnName }
    });
    console.log("Rename API response", data)
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


// Add a new column
function AddColumnListener(inputEl, board_id, inputColumn) {
  inputEl.type = "text";
  inputEl.spellcheck = false;
  inputEl.autocomplete = "off";
  inputEl.autocapitalize = "off";
  inputEl.autocorrect = "off";


    const savenewcolumn = async () => {
    // API call to add a column
    const newColumnName = inputEl.value.trim()

    // Dont call api if column name ist empty. Worst case api handles empty value also
    if (!newColumnName) return;

    try {
    const data = await api(`/board/column/create/${board_id}`, {
        method: "POST",
        body: { newColumnName }
    });

    console.log("Create new column API response", data)
    div = renderColumn(data);
    inputColumn.before(div);
    inputEl.value = ""


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

// Saves a new created Task in the Database and renders it into the wrapper
function makenewTask(inputEl, column_Id){

  inputEl.type = "text";
  inputEl.spellcheck = false;
  inputEl.autocomplete = "off";
  inputEl.autocapitalize = "off";
  inputEl.autocorrect = "off";


    const savenewTask = async () => {
    // API call to add a column
    const newTaskName = inputEl.value.trim()

    // Dont call api if column name ist empty. Worst case api handles empty value also
    if (!newTaskName) return;

    try {
    const data = await api(`/board/create/task/${column_Id}`, {
        method: "POST",
        body: { newTaskName }
    });

    console.log("Create new Task API response", data) 
    inputEl.value = ""
    const cardEl = renderCard(data.card);

      // Get the column
      const columnEl = document.querySelector(`.kanban-column[data-column-id="${column_Id}"]`);
      if (!columnEl) {
        console.error("Column element not found for", column_Id);
        return;
      }

      // Get the wrapper from the column
      const wrapper = columnEl.querySelector(".kanban-card-wrapper");
      if (!wrapper) {
        console.error("Wrapper not found in column", column_Id);
        return;
      }

    // Make the new taskj in the ui visible
    wrapper.prepend(cardEl);




    } catch(err){
    console.error("Create task failed:", err.message);
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

  inputEl.addEventListener("blur", savenewTask);



}



// Main function to rende the kanban
function RenderKanban(kanban, columns, board_id) {
      
  
    columns.forEach(column => {
        // Helper function to generate the columns
        div = renderColumn(column)


      kanban.appendChild(div);
    });

    // Make an additional column for the Add Column field
    const newColumn = document.createElement('div');
    newColumn.className = "kanban-new-column";

    const newColumnInput = document.createElement('input');
    newColumnInput.placeholder = "New Column";
    newColumnInput.className = "kanban-new-column-input";

    newColumn.appendChild(newColumnInput);
    kanban.appendChild(newColumn);

    AddColumnListener(newColumnInput, board_id, newColumn);
}

// Function to render a column
function renderColumn(column) {

      // Create the base column for the whole status
      const div = document.createElement('div');
      div.className = "kanban-column";
      div.dataset.columnId = column.id;


      // make the head div. 3 Sectins left, middle (Inputfield), right (delete button)
      const header = document.createElement('header');
      header.className = "kanban-column-header";

              // Make the input field
              const titleInput = document.createElement('input');
              titleInput.className = "kanban-head-input middle";
              titleInput.value = column.name;

              // make left div
              const left = document.createElement('div')
              left.className = "left"

              // make right div with deletion button
              const right = document.createElement('div')
              right.className = "right"
              const deleteBtn = document.createElement('button')
              deleteBtn.className = "icon-btn delete-btn"
              deleteBtn.title = "Delete"
              makedeleteButton(deleteBtn, column.id, div)
              deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="m376-300 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Zm-96 180q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Zm-400 0v520-520Z"/></svg>`
              right.appendChild(deleteBtn)

      
      makeEditableTitle(titleInput, column.id);

      // Build Inputfield for new task
      const input_new_card = document.createElement('input');
      input_new_card.placeholder = "New Task";
      input_new_card.className = "kanban-new-card-input"
      makenewTask(input_new_card, column.id)

      // Build header together
      header.appendChild(left);
      header.appendChild(titleInput);
      header.appendChild(right);
      

      // Build the wrapper
      const wrapper = document.createElement('div');
      wrapper.className = "kanban-card-wrapper";
      wrapper.dataset.dropzone = "cards";
      wrapper.dataset.columnId = column.id;     
      wireDropzone(wrapper);                   

      // Build everthing together
      div.appendChild(header);
      div.appendChild(input_new_card);
      div.appendChild(wrapper);
      
      // Create the cards if exist. When function is called for a new column. the exists no cards. Could either crash
      (column.cards || []).forEach(cardData => {
        card = renderCard(cardData)
        wrapper.appendChild(card);
      });

      // Return the created column
      return div
}


// Helper for rendering cards
function renderCard(cardData) {

  const card = document.createElement('div');
  card.className = "kanban-card";
  card.draggable = true;
  card.dataset.cardId = cardData.id;
  card.dataset.columnId = cardData.column_id;

  // Task title
  const body = document.createElement('div');
  body.className = "kanban-card-body card-title";
  body.textContent = cardData.title ?? "(no title)";
  body.setAttribute("data-bs-toggle", "modal");
  body.setAttribute("data-bs-target", "#composeModal");


   // Delete button
  const deletecardbtn = document.createElement('button')
  deletecardbtn.innerHTML =  `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="m376-300 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Zm-96 180q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Zm-400 0v520-520Z"/></svg>`
  deletecardbtn.className = "icon-btn"

  makedeleteCardButton(deletecardbtn, card, cardData.id)

  card.appendChild(body);
  card.appendChild(deletecardbtn);

 


  wireCardDrag(card);

  return card;
}

function wireCardDrag(cardEl) {

  // Attach dragstart handler to a single card element
  cardEl.addEventListener("dragstart", (e) => {

    // Remember the wrapper (column container) the card was dragged from
    dragFromWrapper = cardEl.closest(".kanban-card-wrapper");

    // Add CSS class so the UI can style the currently dragged card
    cardEl.classList.add("dragging");

    // Tell the browser this drag operation represents moving an element
    e.dataTransfer.effectAllowed = "move";

    // Store the card id in the drag payload so it can be read on drop
    e.dataTransfer.setData("text/plain", cardEl.dataset.cardId);
  });

  // When dragging stops (drop OR cancel)
  cardEl.addEventListener("dragend", () => {

    // Remove dragging style from the card
    cardEl.classList.remove("dragging");

    // Clear stored origin wrapper reference
    dragFromWrapper = null;
  });
}

// Function to make the wrapper a dropzone
function wireDropzone(wrapperEl) {

  // Fired continuously while a draggable element is over the wrapper
  wrapperEl.addEventListener("dragover", (e) => {

    // Required so dropping is allowed in this element
    e.preventDefault();

    // Find the card currently being dragged
    const dragging = document.querySelector(".kanban-card.dragging");

    // If nothing is dragged, do nothing
    if (!dragging) return;

    // Determine which element the dragged card should be inserted before
    // based on the mouse Y position
    const afterEl = getDragAfterElement(wrapperEl, e.clientY);

    // If no element found → append at end
    if (afterEl == null) wrapperEl.appendChild(dragging);

    // Otherwise insert before the detected element
    else wrapperEl.insertBefore(dragging, afterEl);
  });


  // Fired once when the card is dropped into this wrapper
  wrapperEl.addEventListener("drop", async (e) => {

    // Prevent browser default handling
    e.preventDefault();

    // Read the dragged card id from the drag payload
    const cardId = Number(e.dataTransfer.getData("text/plain"));

    // Target column id (the wrapper we dropped into)
    const toColumnId = Number(wrapperEl.dataset.columnId);

    // Source column id
    // Comes from dragstart (because the DOM may already be rearranged during dragover)
    const fromColumnId = dragFromWrapper
      ? Number(dragFromWrapper.dataset.columnId)
      : toColumnId;

    // Build the new card order inside the target column
    // Read all card ids in their current DOM order
    const toOrderedIds = Array.from(wrapperEl.querySelectorAll(".kanban-card"))
      .map(el => Number(el.dataset.cardId));

    // Build the remaining order inside the source column
    // Only needed if the card moved between different columns
    const fromOrderedIds = (dragFromWrapper && dragFromWrapper !== wrapperEl)
      ? Array.from(dragFromWrapper.querySelectorAll(".kanban-card"))
          .map(el => Number(el.dataset.cardId))
      : [];

    try {

      // Call backend API to persist the move + new ordering
      const data = await api(`/cards/${cardId}/move`, {
        method: "PUT",
        body: {
          from_column_id: fromColumnId,
          to_column_id: toColumnId,

          // Only send source ordering if the column actually changed
          from_ordered_card_ids: fromColumnId === toColumnId ? [] : fromOrderedIds,

          // Always send the final order of the target column
          to_ordered_card_ids: toOrderedIds
        }
      });

    
      console.log("Move task API response", data);

    } catch (err) {

     
      console.error("Moving task failed:", err.message);

    }
  });
}

function getDragAfterElement(container, y) {

  // Get all cards except the one currently being dragged
  const els = [...container.querySelectorAll(".kanban-card:not(.dragging)")];

  // Find the card that the mouse is currently above
  return els.reduce((closest, child) => {

    // Get the position and size of the card
    const box = child.getBoundingClientRect();

    // Calculate how far the mouse is from the vertical center of the card
    const offset = y - box.top - box.height / 2;

    // If the mouse is above the center and closer than previous matches,
    // this becomes the new closest element
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    }

    return closest;

  }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}

function makedeleteButton(deleteBtn, column_Id, column) {

    const api_delete_column = async () => {

    try {
    const data = await api(`/board/column/delete/${column_Id}`, {
        method: "DELETE",
    });

    console.log("Delete column API response", data)
    column.remove();

    } catch(err){
    console.error("Delete column failed:", err.message);
    }
    };

  deleteBtn.addEventListener("click", api_delete_column)

 }


function makedeleteCardButton(deletecardbtn, cardEl, card_id){
      const api_delete_card = async () => {

    try {
    const data = await api(`/board/card/delete/${card_id}`, {
        method: "DELETE",
    });

    console.log("Delete card API response", data)
    cardEl.remove();

    } catch(err){
    console.error("Delete card failed:", err.message);
    }
    };

  deletecardbtn.addEventListener("click", api_delete_card)

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