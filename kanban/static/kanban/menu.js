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


// Sidebar "active" state toggling for board buttons
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".openBoard-btn");
  if (!btn) return;

  // 1) remove active from ALL sidebar items (or restrict to Boardlist, see below)
  document.querySelectorAll("#sidebar li.active").forEach(li => li.classList.remove("active"));

  // 2) set active on the clicked item's <li>
  const li = btn.closest("li");
  if (li) li.classList.add("active");

  // 3) load the board (data-board-id -> dataset.boardId)
  const boardId = btn.dataset.boardId;
  if (boardId) load_Board(boardId);
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




