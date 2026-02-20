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




