document.addEventListener("DOMContentLoaded", () => {

load_Board()


});




async function load_Board() {

    try{
       const csrfToken = getCSRFToken();

        //API-Call

        const board_id = 38
        const response = await fetch(`/board/${board_id}/get`,{
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

        const kanban = document.getElementById('kanban-board');
        kanban.dataset.boardId = board_id;

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

            header.appendChild(h2);

            // Card wrapper (Dropzone)
            const wrapper = document.createElement('div');
            wrapper.className = "kanban-card-wrapper";
            wrapper.dataset.dropzone = "cards";

            // Zusammenbauen
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
    
