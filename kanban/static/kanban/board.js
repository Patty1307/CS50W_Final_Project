
async function createBoard(name){
    console.log("Board", name);

    try{
       const csrfToken = getCSRFToken();

        //API-Call

        const response = await fetch('/board/create',{
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                name
            })
        });

        // Json parsen
        const data = await response.json();

        // Check Http status if everything is okay. Else Error handling
        if (!response.ok) {
            throw new Error(data.error || "Unknown error while creatint board");
        }
        console.log("Create Board API response:", data);

        const li = document.createElement("li");
        const btn = document.createElement("button");

        btn.className = "openBoard-btn";
        btn.textContent = name;
        btn.dataset.boardId = data.board.id;

        li.appendChild(btn);
        BoardList.prepend(li);


    } catch (error) {
        console.error("Error creating board", error.message);
    }
}

async function load_Board(board_id) {

//clear the board completely
const kanban = document.getElementById('kanban-board');
kanban.innerHTML = "";
kanban.dataset.boardId = board_id;

    try{
       const csrfToken = getCSRFToken();

        //API-Call   
        const response = await fetch(`/board/get/${board_id}`,{
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            }
        });

        // Json parsen
        const data = await response.json();

        // Check Http status if everything is okay. Else Error handling
        if (!response.ok) {
            throw new Error(data.error || "Unknown error while posting");
        }
        console.log("Load Board API response:", data);

        const columns = data.columns;

        columns.forEach(column => {

            // Column container
            const div = document.createElement('div');
            div.className = "kanban-column";
            div.dataset.columnId = column.id;

            // Header
            const header = document.createElement('header');
            header.className = "kanban-column-header";

            const h2 = document.createElement('input');
            h2.className = "kanban-head-input";
            h2.value = column.name;

            makeEditableTitle(h2, column.id);

            header.appendChild(h2);

            // Card wrapper (Dropzone)
            const wrapper = document.createElement('div');
            wrapper.className = "kanban-card-wrapper";
            wrapper.dataset.dropzone = "cards";

for (let i = 0; i < 6; i++) {
  const card = document.createElement('div');
  const card_body = document.createElement('div');
  card_body.className="kanban-card-body card-title";
  card.className = "kanban-card";
  card_body.innerHTML = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr,"
  card.appendChild(card_body);
  wrapper.appendChild(card);
}

            // build together
            div.appendChild(header);
            div.appendChild(wrapper);

            kanban.appendChild(div);
        });
    


    } catch (error) {
        console.error("Error loading board", error.message);
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

    // API call to change the column name
    try{
       const csrfToken = getCSRFToken();

        //API-Call

        const response = await fetch(`/board/column/rename/${column_Id}`,{
            method: 'PUT',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                newColumnName
            })
        });

        // Json parsen
        const data = await response.json();

        // Check Http status if everything is okay. Else Error handling
        if (!response.ok) {
            throw new Error(data.error || "Unknown error while rename column");
        }
        console.log("Rename column API response:", data);
    } catch (error) {
        console.error("Error rename column", error.message);
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