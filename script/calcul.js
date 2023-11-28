// déclaration des variables global
let ageSaisi;
let genreSaisi;
let bouton = document.getElementById("bouton");
let message = document.getElementById("message");
console.log(ageSaisi);
// fonction de récupération des valeur et traitement 
function verifierImposition () {
    ageSaisi = document.getElementById("ageSaisi").value;
    genreSaisi = document.getElementById("genreSaisi").value;
    if(genreSaisi === "H" && ageSaisi > 20) {
        message.innerHTML = '<div class= "alert alert-danger" role="alert">Vous êtes imposable!</div>';
    }
    else if(genreSaisi === "F" && ageSaisi > 18 && ageSaisi < 35) {
        message.innerHTML = '<div class="alert alert-danger" role="alert">Vous êtes imposable!</div>';
    }
    else {
        message.innerHTML = '<div class="alert alert-success" role="alert">Vous êtes non imposable!</div>';
    }
}
// écoute du bouton de validation
bouton.addEventListener("click", verifierImposition)

// écoute réclamation
