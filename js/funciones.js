function generarDias() {

    window.usados = [];

    var numeroDias = document.getElementById("input_numerodias").value;

    var tablist = document.getElementById("ul_tablist");
    var tabcontent = document.getElementById("div_tabcontent");

    tablist.innerHTML = "";
    tabcontent.innerHTML = "";

    if (numeroDias < 1)
        numeroDias = 1;

    for (var i = 0; i < numeroDias; i++) {
        var a = document.createElement("a");
        a.setAttribute("href", "#tablist" + i);
        a.setAttribute("aria-controls", "tablist" + i);
        a.setAttribute("role", "tab");
        a.setAttribute("data-toggle", "tab");
        a.innerHTML = "D&iacute;a " + (i + 1);

        var li = document.createElement("li");
        li.role = "presentation";
        li.appendChild(a);
        if (i == 0)
            li.className = "active";

        var div = document.createElement("div");
        div.className = "tab-pane";
        div.setAttribute("id", "tablist" + i);
        div.setAttribute("role", "tabpanel");
        div.appendChild(generarContenidoDia());
        if (i == 0)
            div.className += " active";

        tablist.appendChild(li);
        tabcontent.appendChild(div);

    }


}


function generarContenidoDia() {

    var div = document.createElement("div");
    div.className = "container";
    div.innerHTML += "<br />";



    $.ajax({
        url: 'menus.json',
        async: false,
        dataType: 'json',
        success: function (response) {

            var max = Object.keys(response).length;
            if (window.usados.length == max) {
                window.usados = [];
            }
            var random;
            var menu;
            do {
                random = Math.floor((Math.random() * max));
                menu = Object.keys(response)[random];

            } while (window.usados.indexOf(menu) != -1)

            window.usados.push(menu);

            var desayunoPanel = document.createElement("div");
            desayunoPanel.className = "panel panel-info";
            var desayunoHeading = document.createElement("div");
            desayunoHeading.className = "panel-heading";
            desayunoHeading.innerHTML = "<h3 class='panel-title'>Desayuno</h3>";
            var desayunoBody = document.createElement("div");
            desayunoBody.className = "container";
            desayunoBody.innerHTML = "<ul>";

            response[menu].desayuno.forEach(function (item) {
                desayunoBody.innerHTML += "<li>" + item + "</li>";
            });



            desayunoBody.innerHTML += "</ul>";

            desayunoPanel.appendChild(desayunoHeading);
            desayunoPanel.appendChild(desayunoBody);
            div.appendChild(desayunoPanel);


        },
        error: function (result) {
            //alert("Data not found");
        }
    });



    return div;


}