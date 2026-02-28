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
  
 
  // DELETE BOARD  
  const deleteBtn = e.target.closest(".deleteBoard-btn");
  if (deleteBtn) {
    const boardId = deleteBtn.dataset.boardId;
    const li = e.target.closest("li");
    if (boardId) deleteBoard(boardId, li);
     console.log("Test")
    return;   // verhindert openBoard
  }
  
  const btn = e.target.closest(".openBoard-btn");
  const navBtn = e.target.closest(".nav-btn");

  // return when neither navbtn or boardbtn
  if (!btn && !navBtn) return;

  // get the clicked button
  const clicked = btn || navBtn;

  // 1) remove active and display of all child views 
  document.querySelectorAll("#sidebar li.active")
    .forEach(li => li.classList.remove("active"));
  
  document.querySelectorAll(".child-view")
    .forEach(div => div.classList.add("hide-child-view"))

  // 2) set active to <li> 
  const li = clicked.closest("li");
  if (li) li.classList.add("active");

  // 3) if board-button: Board laden  ......... notice... this could be named better then btn.... nobody is perfect
  if (btn) {
    const boardId = btn.dataset.boardId;
    if (boardId) {
        load_Board(boardId)
        document.querySelector(".canban-view").classList.remove("hide-child-view")
    };  
  }

  if (navBtn) {
    if (navBtn && navBtn.classList.contains("Home")){
        document.querySelector(".home-view").classList.remove("hide-child-view")
    }
  }

});

 


function toggleSidebar() {
    sidebar.classList.toggle('close')
    closeAllSubMenus()

}

function toggleSubMenu(button){
     
    if(!button.nextElementSibling.classList.contains('show')) {
        closeAllSubMenus()
    }
    button.nextElementSibling.classList.toggle('show')
    button.classList.toggle('rotate')

    if(sidebar.classList.contains('close')){
        sidebar.classList.toggle('close')
    }
}


// When later there could be more sub menus. so make a function only one ist open
function closeAllSubMenus(){
        Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
        ul.classList.remove('show')
        ul.previousElementSibling.classList.remove('rotate')
    })
}

