
function init() {
    /**
     * Ocultar popovers abiertos al abrir uno nuevo
     */
    $('[data-toggle="popover"]').click(function () {
        //$('[data-toggle="popover"]').not(this).popover('hide'); //all but this
    });

    //activar popovers
    $(function () {
        //$('[data-toggle="popover"]').popover();
    });
}

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

    init();
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

            for (comida in response[menu]) {
                div.appendChild(getPanelComida(response[menu], comida, dia));
            }
        },
        error: function (result) {
        }
    });

    return div;
}

function getPanelComida(menu, comida, dia) {

    var panel = document.createElement("div");
    panel.className = "panel panel-info";

    var heading = document.createElement("div");
    heading.className = "panel-heading";
    heading.innerHTML = "<h3 class='panel-title capital'>" + comida + "</h3>";

    var body = document.createElement("div");
    body.className = "panel-body";

    var divComida = document.createElement('div');
    divComida.className = "divComida";
    var divIngredientes = document.createElement('div');
    divIngredientes.className = "divIngredientes";
    var divReceta = document.createElement('div');
    divReceta.className = "alert alert-info divReceta";

    var table = document.createElement("table");
    table.className = "table table-striped table-condensed";

    var thead = document.createElement("thead");
    thead.innerHTML = "<tr><th>#</th><th>Cantidad</th><th>Alimento</th><th>Grupo</th></tr>";

    var tbody = document.createElement("tbody");

    var conttr = 0;
    menu[comida].ingredientes.forEach(function (item) {

        var id_tr = "dia" + dia + "_" + comida + "_tr" + conttr;

        var cantidad = item[2];
        var id_alimento = item[1];
        var categoria = item[0]

        var tr = crearTR(id_tr, cantidad, id_alimento, categoria);
        conttr++;
        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    divIngredientes.appendChild(table);
    divReceta.innerHTML = menu[comida].receta;
    divComida.appendChild(divIngredientes);
    divComida.appendChild(divReceta);
    body.appendChild(divComida);

    panel.appendChild(heading);
    panel.appendChild(body);

    return panel;
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
        var nuevo = crearTR(id_tr, nuevacantidad, id_alimento, categoria_tr);
        $(tr).replaceWith(nuevo);
    });

    return false;
}

function crearTR(id, cantidad, id_alimento, categoria) {

    var alimento = getAlimento(categoria, id_alimento);

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
