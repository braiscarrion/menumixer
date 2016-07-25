function generarDias() {

    window.usados = [];

    var numeroDias = document.getElementById("input_numerodias").value;

    var tablist = document.getElementById("ul_tablist");
    var tabcontent = document.getElementById("div_tabcontent");

    tablist.innerHTML = "";
    tabcontent.innerHTML = "";

    if (numeroDias < 1)
        numeroDias = 1;

    for (var i = 1; i <= numeroDias; i++) {
        var a = document.createElement("a");
        a.setAttribute("href", "#tablist" + i);
        a.setAttribute("aria-controls", "tablist" + i);
        a.setAttribute("role", "tab");
        a.setAttribute("data-toggle", "tab");
        a.innerHTML = "D&iacute;a " + (i);

        var li = document.createElement("li");
        li.role = "presentation";
        li.appendChild(a);
        if (i == 1)
            li.className = "active";

        var div = document.createElement("div");
        div.className = "tab-pane";
        div.setAttribute("id", "tablist" + i);
        div.setAttribute("role", "tabpanel");
        div.appendChild(generarContenidoDia(i));
        if (i == 1)
            div.className += " active";

        tablist.appendChild(li);
        tabcontent.appendChild(div);

    }
}


function generarContenidoDia(dia) {

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

            var conttr = 0;
            response[menu].desayuno.forEach(function (item) {

                var id_tr = "dia" + dia + "_desayuno_tr" + conttr;

                var cantidad = item[2];
                var alimento = alimentos[item[0]][item[1]].nombre;
                var id_alimento = item[1];
                var categoria = item[0]

                var tr = crearNuevoTR(id_tr, cantidad, id_alimento, categoria);
                conttr++;
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
        }
    });



    return div;


}

function cambiaLinea(id_tr, id_alimento) {
    var tr = document.getElementById(id_tr);
    var table = $(tr).closest('table');

    var cantidad_tr = tr.getAttribute("data-cantidad");
    var categoria_tr = tr.getAttribute("data-categoria");
    var id_alimento_tr = tr.getAttribute("data-id_alimento");

    var nuevoalimento = getAlimento(categoria_tr, id_alimento);

    var nuevacantidad = getCantidadNuevo(cantidad_tr, getAlimento(categoria_tr, id_alimento_tr), nuevoalimento);

    $(tr).css("background-color", "#AA3300");
    $(tr).fadeOut(200, function () {
        var nuevo = crearNuevoTR(id_tr, nuevacantidad, id_alimento, categoria_tr);
        $(tr).replaceWith(nuevo);
    });

    return false;
}

function crearNuevoTR(id, cantidad, id_alimento, categoria) {

    var alimento = getAlimento(categoria,id_alimento);

    var tr = document.createElement('tr');
    tr.setAttribute("id", id);

    var td1 = document.createElement("td");
    var td2 = document.createElement("td");
    var td3 = document.createElement("td");
    var td4 = document.createElement("td");

    var btn = document.createElement("a");
    btn.setAttribute("title", "Cambiar ingrediente");
    btn.setAttribute("class", "btn btn-xs btn-default");
    btn.setAttribute("tabindex", "0");
    btn.setAttribute("role", "buttom");
    btn.setAttribute("data-html", "true");
    btn.setAttribute("data-toggle", "popover");
    btn.setAttribute("data-trigger", "focus");

    btn.innerHTML = '<span class="glyphicon glyphicon-refresh" aria-hidden="true"></span>';

    td1.appendChild(btn);
    var content = getAlternativas(id, categoria, id_alimento);
    $(btn).popover({
        html: true,
        content: content
    });

    td2.innerHTML = cantidad + " " + alimento.medida;
    td3.innerHTML = alimento.nombre;
    td4.innerHTML = categoria;

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);

    tr.setAttribute("data-categoria", categoria);
    tr.setAttribute("data-id_alimento", id_alimento);
    tr.setAttribute("data-cantidad", cantidad);

    return tr;
}

/**
 * Busca en el json el alimento correspondiente a la categoria e id
 *
 * @param {any} categoria
 * @param {any} id
 * @returns alimento
 */
function getAlimento(categoria, id) {
    var toret;
    $.ajax({
        url: 'alimentos.json',
        async: false,
        dataType: 'json',
        success: function (response) {
            var cat = response[categoria];
            toret = cat[id];
        }
    });
    return toret;
}

/**
 * Devuelve la cantidad del nuevo alimento basandose en las relaciones entre ellos
 *
 * @param {any} cantidad - cantidad del alimento a substituir
 * @param {any} viejo - alimento a substituir
 * @param {any} nuevo - nuevo alimento
 * @returns float
 */
function getCantidadNuevo(cantidad, viejo, nuevo) {
    return Math.round(((cantidad * nuevo.cantidad) / viejo.cantidad) * 100) / 100;
}

/**
 * Devuelve un string con la lista de enlaces de alimentos alternativos al indicado
 *
 * @param {any} id_tr - id del tr al que pertenece la lista
 * @param {any} categoria - categoria del elimento
 * @param {any} id_alimento - id del alimento
 * @returns string
 */
function getAlternativas(id_tr, categoria, id_alimento) {
    var lista = "";
    $.ajax({
        url: 'alimentos.json',
        async: false,
        dataType: 'json',
        success: function (response) {
            var cat = response[categoria];
            for (var i = 1; i <= Object.keys(cat).length; i++) {
                if (i != id_alimento) {
                    var a = document.createElement('a');
                    a.className = "deleteLink";
                    a.setAttribute("role", "buttom");
                    a.innerHTML = cat[i].nombre;
                    a.setAttribute("onclick", "cambiaLinea('" + id_tr + "','" + i + "')");
                    lista += a.outerHTML + "<br />";
                }
            }
        }
    });
    return lista;
}