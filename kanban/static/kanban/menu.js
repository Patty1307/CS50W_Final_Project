const toggleButton = document.getElementById('toggle-btn')
const sidebar = document.getElementById('sidebar')
const input = document.querySelector("#new-board");
const BoardList = document.getElementById("Boardlist")


// eventlistender to create board / inputfield when pressing enter
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            createBoard(input.value);
            input.value = "";   
        }
    });

// eventlistender to create board / inputfield when leaving field
    input.addEventListener("blur", () => {
        if (input.value.trim() !== "") {
            createBoard(input.value);
            input.value = "";
        }
    });


// eventlistener for sub menu to open the Board
document.addEventListener('click', (e) => {

  const btn = e.target.closest('.openBoard-btn');
  if (!btn) return;

  load_Board(btn.dataset.boardId);

});






function toggleSidebar() {
    sidebar.classList.toggle('close')
    Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
        ul.classList.remove('show')
        ul.previousElementSibling.classList.remove('rotate')
    })

}

function toggleSubMenu(button){
    button.nextElementSibling.classList.toggle('show')
    button.classList.toggle('rotate')

    if(sidebar.classList.contains('close')){
        sidebar.classList.toggle('close')
    }
}

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
            throw new Error(data.error || "Unknown error while posting");
        }
        console.log("Create Board API response:", data);

        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `board/${data.board_id}`;
        a.textContent = name

        li.appendChild(a);
        BoardList.prepend(li);


    } catch (error) {
        console.error("Error creating Post", error.message);
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
        console.log("Create Board API response:", data);

        const columns = data.columns;

        columns.forEach(column => {

            // Column container
            const div = document.createElement('div');
            div.className = "kanban-column";
            div.dataset.columnId = column.id;

            // Header
            const header = document.createElement('header');
            header.className = "kanban-column-header";

            const h2 = document.createElement('h2');
            h2.className = "kanban-head";
            h2.textContent = column.name;

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
  card_body.innerHTML = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet."
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


function makeEditableTitle(h2, columnId){

    h2.addEventListener('click', () => {

        const input = document.createElement('input');
        input.type = "text";
        input.value = h2.textContent;
        input.className = "kanban-head-input";

        h2.replaceWith(input);

        input.focus();
        input.select();

        const save = () => {

            const newTitle = input.value.trim() || "Untitled";

            h2.textContent = newTitle;
            input.replaceWith(h2);

            // später API call möglich
            // updateColumn(columnId, newTitle);
        };

        input.addEventListener('keydown', (e)=>{
            if(e.key === "Enter") save();
            if(e.key === "Escape") input.replaceWith(h2);
        });

        input.addEventListener('blur', save);
    });

}
