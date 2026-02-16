const toggleButton = document.getElementById('toggle-btn')
const sidebar = document.getElementById('sidebar')
const input = document.querySelector("#new-board");
const BoardList = document.getElementById("Boardlist")

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            createBoard(input.value);
            input.value = "";   // Input leeren
        }
    });

    input.addEventListener("blur", () => {
        if (input.value.trim() !== "") {
            createBoard(input.value);
            input.value = "";
        }
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


function getCSRFToken() {
  return document.querySelector('meta[name="csrf-token"]').getAttribute("content");
}
