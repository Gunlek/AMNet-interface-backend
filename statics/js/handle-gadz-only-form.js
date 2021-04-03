let promsSelect = document.getElementById("user_proms_select");
let promsLabel = document.getElementById("promsLabel");
let firstYear = promsSelect.querySelectorAll("option")[0].value;

checkGadzDisplay(promsSelect);

function checkGadzDisplay(element){
    let value = promsSelect.value;
    let isGadz = value > firstYear;
    !isGadz ? [...document.querySelectorAll(".localGadzOnly")].map(el => {el.style.display = "none";}) : [...document.querySelectorAll(".localGadzOnly")].map(el => {el.style.display = "block";});
    promsLabel.innerHTML = !isGadz ? "Promotion" : "Prom's";
}

promsSelect.addEventListener("change", (event) => {
    checkGadzDisplay(event.target);
});