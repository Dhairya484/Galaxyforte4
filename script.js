/* ==========================================================
   Galaxy Task Sphere
   Main JavaScript
========================================================== */

"use strict";

/* ==========================================================
   ELEMENTS
========================================================== */

const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".navButton");
const openCards = document.querySelectorAll(".openPage");

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const menuButton = document.getElementById("menuButton");

/* ==========================================================
   PAGE NAVIGATION
========================================================== */

function openPage(pageName){

    pages.forEach(page=>{

        page.classList.remove("active");

    });

    navButtons.forEach(button=>{

        button.classList.remove("active");

    });

    const page=document.getElementById(pageName);

    if(page){

        page.classList.add("active");

    }

    const activeButton=document.querySelector(

        `.navButton[data-page="${pageName}"]`

    );

    if(activeButton){

        activeButton.classList.add("active");

    }

    if(window.innerWidth<900){

        sidebar.classList.remove("open");

        overlay.classList.remove("active");

    }

}

/* ==========================================================
   SIDEBAR BUTTONS
========================================================== */

navButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        openPage(button.dataset.page);

    });

});

openCards.forEach(card=>{

    card.addEventListener("click",()=>{

        openPage(card.dataset.open);

    });

});

/* ==========================================================
   MOBILE MENU
========================================================== */

menuButton.addEventListener("click",()=>{

    sidebar.classList.toggle("open");

    overlay.classList.toggle("active");

});

overlay.addEventListener("click",()=>{

    sidebar.classList.remove("open");

    overlay.classList.remove("active");

});

/* ==========================================================
   NOVA AI
========================================================== */

const chatMessages=document.getElementById("chatMessages");

const prompt=document.getElementById("prompt");

const sendButton=document.getElementById("sendButton");

const newChatBtn=document.getElementById("newChatBtn");

const clearChatBtn=document.getElementById("clearChatBtn");

/* ==========================================================
   ADD MESSAGE
========================================================== */

function addMessage(role,text){

    const message=document.createElement("div");

    message.className=`message ${role}`;

    const avatar=document.createElement("div");

    avatar.className=`avatar ${
        role==="user"
        ? "userAvatar"
        : "aiAvatar"
    }`;

    avatar.innerHTML=role==="user"
        ? '<i class="fa-solid fa-user"></i>'
        : '<i class="fa-solid fa-robot"></i>';

    const bubble=document.createElement("div");

    bubble.className="bubble";

    if(role==="ai"){

        bubble.innerHTML=marked.parse(text);

    }else{

        bubble.textContent=text;

    }

    message.appendChild(avatar);

    message.appendChild(bubble);

    chatMessages.appendChild(message);

    chatMessages.scrollTop=chatMessages.scrollHeight;

    document.querySelectorAll("pre code").forEach(block=>{

        hljs.highlightElement(block);

    });

}

/* ==========================================================
   TYPING
========================================================== */

function showTyping(){

    const typing=document.createElement("div");

    typing.className="message ai";

    typing.id="typing";

    typing.innerHTML=`

        <div class="avatar aiAvatar">

            <i class="fa-solid fa-robot"></i>

        </div>

        <div class="bubble">

            Nova AI is thinking...

        </div>

    `;

    chatMessages.appendChild(typing);

    chatMessages.scrollTop=chatMessages.scrollHeight;

}

function hideTyping(){

    const typing=document.getElementById("typing");

    if(typing){

        typing.remove();

    }

}
/* ==========================================================
   AUTO RESIZE TEXTAREA
========================================================== */

prompt.addEventListener("input",()=>{

    prompt.style.height="auto";

    prompt.style.height=prompt.scrollHeight+"px";

});

/* ==========================================================
   SEND MESSAGE
========================================================== */

async function sendMessage(){

    const text=prompt.value.trim();

    if(!text){

        return;

    }

    addMessage("user",text);

    prompt.value="";

    prompt.style.height="58px";

    showTyping();

    sendButton.disabled=true;

    try{

        const response=await fetch("/api/chat",{

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                message:text

            })

        });

        hideTyping();

        if(!response.ok){

            throw new Error("Server Error");

        }

        const data=await response.json();

        addMessage(

            "ai",

            data.reply || "No response received."

        );

    }

    catch(error){

        hideTyping();

        addMessage(

            "ai",

            "❌ An error occurred while contacting Nova AI.\n\n"+

            error.message

        );

        console.error(error);

    }

    finally{

        sendButton.disabled=false;

        prompt.focus();

    }

}

/* ==========================================================
   SEND EVENTS
========================================================== */

sendButton.addEventListener("click",sendMessage);

prompt.addEventListener("keydown",(event)=>{

    if(

        event.key==="Enter"

        &&

        !event.shiftKey

    ){

        event.preventDefault();

        sendMessage();

    }

});

/* ==========================================================
   SUGGESTION BUTTONS
========================================================== */

document

.querySelectorAll(".suggestion")

.forEach(button=>{

    button.addEventListener("click",()=>{

        prompt.value=button.textContent;

        prompt.focus();

    });

});

/* ==========================================================
   NEW CHAT
========================================================== */

newChatBtn.addEventListener("click",()=>{

    chatMessages.innerHTML=`

    <div class="message ai">

        <div class="avatar aiAvatar">

            <i class="fa-solid fa-robot"></i>

        </div>

        <div class="bubble">

            <h3>New Chat Started</h3>

            <p>

            Hello! 👋

            Ask me anything.

            </p>

        </div>

    </div>

    `;

});

/* ==========================================================
   CLEAR CHAT
========================================================== */

clearChatBtn.addEventListener("click",()=>{

    if(

        confirm("Clear the current chat?")

    ){

        newChatBtn.click();

    }

});

/* ==========================================================
   CALCULATOR
========================================================== */

const display=document.getElementById(

    "calcDisplay"

);

const calcButtons=document.querySelectorAll(

    ".calcButtons button"

);

calcButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        const value=button.textContent;

        if(value==="="){

            return;

        }

        if(value==="C"){

            return;

        }

        display.value+=value
            .replace("×","*")
            .replace("÷","/")
            .replace("−","-");

    });

});

document

.getElementById("calcClear")

.addEventListener("click",()=>{

    display.value="";

});

document

.getElementById("calcEqual")

.addEventListener("click",()=>{

    try{

        display.value=eval(display.value);

    }

    catch{

        display.value="Error";

    }

});
/* ==========================================================
   DIGITAL CLOCK
========================================================== */

const digitalClock=document.getElementById("digitalClock");
const clockDate=document.getElementById("clockDate");

function updateClock(){

    const now=new Date();

    digitalClock.textContent=now.toLocaleTimeString();

    clockDate.textContent=now.toLocaleDateString(
        undefined,
        {
            weekday:"long",
            year:"numeric",
            month:"long",
            day:"numeric"
        }
    );

}

setInterval(updateClock,1000);

updateClock();

/* ==========================================================
   STOPWATCH
========================================================== */

const stopwatchDisplay=document.getElementById("stopwatchDisplay");

const startStopwatch=document.getElementById("startStopwatch");
const pauseStopwatch=document.getElementById("pauseStopwatch");
const resetStopwatch=document.getElementById("resetStopwatch");
const lapStopwatch=document.getElementById("lapStopwatch");
const laps=document.getElementById("laps");

let stopwatchRunning=false;

let stopwatchStart=0;

let stopwatchElapsed=0;

let stopwatchInterval;

function updateStopwatch(){

    stopwatchElapsed=Date.now()-stopwatchStart;

    const ms=stopwatchElapsed%1000;

    const totalSeconds=Math.floor(stopwatchElapsed/1000);

    const seconds=totalSeconds%60;

    const minutes=Math.floor(totalSeconds/60)%60;

    const hours=Math.floor(totalSeconds/3600);

    stopwatchDisplay.textContent=

        `${String(hours).padStart(2,"0")}:`+

        `${String(minutes).padStart(2,"0")}:`+

        `${String(seconds).padStart(2,"0")}.`+

        `${String(ms).padStart(3,"0")}`;

}

startStopwatch.addEventListener("click",()=>{

    if(stopwatchRunning)return;

    stopwatchRunning=true;

    stopwatchStart=Date.now()-stopwatchElapsed;

    stopwatchInterval=setInterval(updateStopwatch,10);

});

pauseStopwatch.addEventListener("click",()=>{

    stopwatchRunning=false;

    clearInterval(stopwatchInterval);

});

resetStopwatch.addEventListener("click",()=>{

    stopwatchRunning=false;

    clearInterval(stopwatchInterval);

    stopwatchElapsed=0;

    stopwatchDisplay.textContent="00:00:00.000";

    laps.innerHTML="";

});

lapStopwatch.addEventListener("click",()=>{

    if(!stopwatchElapsed)return;

    const lap=document.createElement("div");

    lap.textContent=stopwatchDisplay.textContent;

    laps.prepend(lap);

});

/* ==========================================================
   TIMER
========================================================== */

const timerDisplay=document.getElementById("timerDisplay");

const timerHours=document.getElementById("timerHours");
const timerMinutes=document.getElementById("timerMinutes");
const timerSeconds=document.getElementById("timerSeconds");

const timerStart=document.getElementById("timerStart");
const timerPause=document.getElementById("timerPause");
const timerReset=document.getElementById("timerReset");

let timerInterval;

let timerRemaining=0;

function updateTimerDisplay(){

    const hours=Math.floor(timerRemaining/3600);

    const minutes=Math.floor((timerRemaining%3600)/60);

    const seconds=timerRemaining%60;

    timerDisplay.textContent=

        `${String(hours).padStart(2,"0")}:`+

        `${String(minutes).padStart(2,"0")}:`+

        `${String(seconds).padStart(2,"0")}`;

}

timerStart.addEventListener("click",()=>{

    if(timerRemaining===0){

        timerRemaining=

            (+timerHours.value||0)*3600+

            (+timerMinutes.value||0)*60+

            (+timerSeconds.value||0);

    }

    clearInterval(timerInterval);

    updateTimerDisplay();

    timerInterval=setInterval(()=>{

        if(timerRemaining<=0){

            clearInterval(timerInterval);

            alert("Time's up!");

            return;

        }

        timerRemaining--;

        updateTimerDisplay();

    },1000);

});

timerPause.addEventListener("click",()=>{

    clearInterval(timerInterval);

});

timerReset.addEventListener("click",()=>{

    clearInterval(timerInterval);

    timerRemaining=0;

    timerHours.value="";

    timerMinutes.value="";

    timerSeconds.value="";

    updateTimerDisplay();

});

updateTimerDisplay();
/* ==========================================================
   NOTES (LOCAL STORAGE)
========================================================== */

const notesArea=document.getElementById("notesArea");
const saveNotes=document.getElementById("saveNotes");

notesArea.value=localStorage.getItem("gts_notes")||"";

saveNotes.addEventListener("click",()=>{

    localStorage.setItem(

        "gts_notes",

        notesArea.value

    );

    alert("Notes saved successfully.");

});

/* ==========================================================
   TODO LIST
========================================================== */

const todoText=document.getElementById("todoText");
const addTodo=document.getElementById("addTodo");
const todoList=document.getElementById("todoList");

let todos=JSON.parse(

    localStorage.getItem("gts_todos")

)||[];

function saveTodos(){

    localStorage.setItem(

        "gts_todos",

        JSON.stringify(todos)

    );

}

function renderTodos(){

    todoList.innerHTML="";

    todos.forEach((task,index)=>{

        const li=document.createElement("li");

        li.innerHTML=`

            <span>${task}</span>

            <button data-index="${index}">

                Delete

            </button>

        `;

        todoList.appendChild(li);

    });

}

addTodo.addEventListener("click",()=>{

    const task=todoText.value.trim();

    if(!task)return;

    todos.push(task);

    saveTodos();

    renderTodos();

    todoText.value="";

});

todoList.addEventListener("click",(event)=>{

    if(event.target.tagName==="BUTTON"){

        todos.splice(

            event.target.dataset.index,

            1

        );

        saveTodos();

        renderTodos();

    }

});

renderTodos();

/* ==========================================================
   QR GENERATOR
========================================================== */

const qrText=document.getElementById("qrText");
const qrResult=document.getElementById("qrResult");
const generateQR=document.getElementById("generateQR");

generateQR.addEventListener("click",()=>{

    const text=qrText.value.trim();

    if(!text)return;

    qrResult.innerHTML=`

        <img
        src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(text)}"
        alt="QR Code">

    `;

});

/* ==========================================================
   WEATHER
========================================================== */

const weatherCity=document.getElementById("weatherCity");
const weatherResult=document.getElementById("weatherResult");
const getWeather=document.getElementById("getWeather");

getWeather.addEventListener("click",async()=>{

    const city=weatherCity.value.trim();

    if(!city)return;

    weatherResult.innerHTML="Loading...";

    try{

        const response=await fetch(

            `/api/weather?city=${encodeURIComponent(city)}`

        );

        const data=await response.json();

        if(data.error){

            weatherResult.textContent=data.error;

            return;

        }

        weatherResult.innerHTML=`

            <h3>${data.city}</h3>

            <p>${data.temperature}°C</p>

            <p>${data.description}</p>

            <p>Humidity: ${data.humidity}%</p>

            <p>Wind: ${data.wind} km/h</p>

        `;

    }

    catch{

        weatherResult.textContent=

        "Unable to fetch weather.";

    }

});

/* ==========================================================
   GAME LAUNCHER
========================================================== */

/* ==========================================================
   GAME LAUNCHER
========================================================== */

const gameArea = document.getElementById("gameArea");

document.querySelectorAll(".launchGame").forEach(card => {

    card.addEventListener("click", () => {

        const game = card.dataset.game;

        gameArea.innerHTML = "";

        switch (game) {

            case "snake":

                if (typeof window.loadSnakeGame === "function") {

                    window.loadSnakeGame(gameArea);

                } else {

                    gameArea.innerHTML = "<h2>Snake not loaded.</h2>";

                }

                break;

            case "tictactoe":

                if (typeof window.loadTicTacToeGame === "function") {

                    window.loadTicTacToeGame(gameArea);

                } else {

                    gameArea.innerHTML = "<h2>Tic Tac Toe not loaded.</h2>";

                }

                break;

            case "memory":

                if(typeof window.loadMemoryGame === "function"){

                    window.loadMemoryGame(gameArea);

                }else{

                    gameArea.innerHTML = "<h2>Memory Game not loaded.</h2>";

                }

                break;

            default:

                gameArea.innerHTML = `
                    <div style="text-align:center;padding:70px">
                        <h2>${game.toUpperCase()}</h2>
                        <p>This game is coming soon.</p>
                    </div>
                `;

        }

    });

});
/* ==========================================================
   WINDOW RESIZE
========================================================== */

window.addEventListener("resize",()=>{

    if(window.innerWidth>=900){

        sidebar.classList.remove("open");

        overlay.classList.remove("active");

    }

});

/* ==========================================================
   STARTUP
========================================================== */

document.addEventListener("DOMContentLoaded",()=>{

    openPage("home");

    updateClock();

    renderTodos();

});

/* ==========================================================
   END
========================================================== */