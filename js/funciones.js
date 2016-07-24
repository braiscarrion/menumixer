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

    init();
}


function generarContenidoDia() {

    var div = document.createElement("div");
    div.className = "container";
    div.innerHTML += "<br />";

    var alimentos;

    $.ajax({
        url: 'alimentos.json',
        async: false,
        dataType: 'json',
        success: function (response) {
            alimentos = response;
        }
    });

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
            desayunoBody.className = "panel-body";

            var table = document.createElement("table");
            table.className = "table table-striped table-condensed";

            var thead = document.createElement("thead");
            thead.innerHTML = "<tr><th>#</th><th>Cantidad</th><th>Alimento</th><th>Grupo</th></tr>";

            var tbody = document.createElement("tbody");


            response[menu].desayuno.forEach(function (item) {


                var tr = document.createElement("tr");
                var trid = "tab" + menu + "tr" + item;//itemalimentos[item[0]];
                trid = trid.replace(",","")
                tr.id = trid;
                var td1 = document.createElement("td");
                var btn = document.createElement("a");
                btn.className = "btn btn-xs btn-default";


                btn.setAttribute("tabindex", "0");
                btn.setAttribute("role", "buttom");
                btn.setAttribute("data-html", "true");
                btn.setAttribute("data-toggle", "popover");
                btn.setAttribute("data-trigger", "focus");
                btn.setAttribute("title", "Cambiar ingrediente");

                var content = "";

                for (var i = 0; i < Object.keys(alimentos[item[0]]).length; i++) {
                    var a = document.createElement('a');
                    a.className = "deleteLink";
                    a.setAttribute("role", "buttom");
                    a.innerHTML = alimentos[item[0]][i + 1].nombre;
                   a.setAttribute("trid", trid);
                   a.setAttribute("onclick","cambiaLinea('"+trid+"')");
                   /*a.addEventListener("click", function(){

                        cambiaLinea(trid);
                    });
                    */
                    //content += "<a class='deleteLink' role='buttom' onclick='cambiaLinea(\"" + trid + "\");return false;'>" + alimentos[item[0]][i + 1].nombre + "</a><br />";
                    content += a.outerHTML + "<br />";
                }

                btn.setAttribute("data-content", content);

                btn.innerHTML = '<span class="glyphicon glyphicon-refresh" aria-hidden="true"></span>';


                td1.appendChild(btn);


                var td2 = document.createElement("td");
                td2.innerHTML = item[2] + " " + alimentos[item[0]][item[1]].medida;
                var td3 = document.createElement("td");
                td3.innerHTML = alimentos[item[0]][item[1]].nombre;
                var td4 = document.createElement("td");
                td4.innerHTML = item[0];

                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3);
                tr.appendChild(td4);

                tr.setAttribute("data-categoria",item[0]);
                tr.setAttribute("data-alimento", alimentos[item[0]][item[1]].nombre);

                tbody.appendChild(tr);
            });

            table.appendChild(thead);
            table.appendChild(tbody);
            desayunoBody.appendChild(table);

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

function init() {

    //activar popovers
    $(function () {
        $('[data-toggle="popover"]').popover()
    });


    $(".deleteLink").click(function () {
        //do something necessary here
        //alert("click");
    });


    $(document).ready(function () {
        $(".deleteLink").on("click", function () {
            //alert("a");
            console.log("aaaaaaaaa");
            console.log(this);
            var tr = $(this).closest('tr');
            tr.css("background-color", "#FF3700");
            tr.fadeOut(400, function () {
                tr.remove();
            });
            return false;
        });
    });

}

function cambiaLinea(id) {
    var tr = document.getElementById(id);
    //console.log(a);
    //var td = $(a).closest('td');
    //console.log(td);
    //var tr = $(td).closest('tr');
    
    var table = $(tr).closest('table');

    //$(tr).css("background-color", "#FF3700");
    $(tr).addClass("danger");
    $(tr).fadeOut(200, function () {
        $(tr).remove();
    });

    var nuevo = document.createElement('tr');
    nuevo.innerHTML = "<td></td><td>"+ tr.getAttribute("data-categoria") + "</td><td>" + tr.getAttribute("data-alimento") +"</td>";
    table.append(nuevo);
    return false;
}

function creartr(){
    var tr = document.createElement('tr');

    return tr;

}
