let promsSelect = document.getElementById("user_proms_select");
let promsLabel = document.getElementById("promsLabel");
let firstYear = parseInt(promsSelect.querySelectorAll("option")[2].value);

checkGadzDisplay(promsSelect);

function checkGadzDisplay(element){
    let value = parseInt(element.value);
    let isGadz = value < firstYear;
    !isGadz ? [...document.querySelectorAll(".localGadzOnly")].map(el => {el.style.display = "none";}) : [...document.querySelectorAll(".localGadzOnly")].map(el => {el.style.display = "block";});
    promsLabel.innerHTML = !isGadz ? "Promotion" : "Prom's";
}

promsSelect.addEventListener("change", (event) => {
    checkGadzDisplay(event.target);
});

document.getElementById("user_proms_text").addEventListener("input", (event) => {
    checkGadzDisplay(event.target);
})