//inicializa aplicación
$(document).ready(function () {
    //inicializador selector de número de dias según la configuración (variables.js)
    $('#input_numerodias').attr("min", window.minDias);
    $('#input_numerodias').attr("max", window.maxDias);
    $('#input_numerodias').val(window.minDias);

    //deshabilitar botones
    //$("#btnExportar").prop("disabled", true);
    //$("#btnBackGenerar").prop("disabled", true);

    //ocultar botones
    $("#btnExportar").hide();
    $("#btnBackGenerar").hide();

    //ocultar divs
    $("#div_exportar").hide();
});

//generar menus
$('#btnGenerar').click(function () {
    reiniciarContenidos();
    resetUsados();
    setNumeroDias();
    generarDias();

    $("#btnExportar").prop("disabled", false);
    $("#btnExportar").show();

});

//exportar menus a tabla html
$('#btnExportar').click(function () {
    $('#div_exportar').empty();
    $('#divDescargar').empty();
    renderMenus();
    toggleVisibility();

    crearBtnDescargar();

});

//volver a vista de generar
$('#btnBackGenerar').click(function () {
    toggleVisibility();
});



// descargar menú como imagen
$("#btnDescargar").on('click', function () {
    alert("hola");
    var newData = window.imagen.replace(/^data:image\/png/, "data:application/octet-stream");
    var dt = new Date();
    var fecha = dt.getFullYear() + "" + ("0" + (dt.getMonth() + 1)).slice(-2) + "" + ("0" + dt.getDay()).slice(-2) + "_" + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
    var nombre = "menus_" + fecha + ".png";
    $("#btnDescargar").attr("download", nombre).attr("href", newData);
});

function crearBtnDescargar(){
    
    alert("aa");
    var innerHTML = '<span class="glyphicon glyphicon-download" aria-hidden="true"></span> Descargar imagen';
    var a = document.createElement("a");
    a.id = "btnDescargar";
    a.className = "btn btn-info btn-margin-top";
    a.innerHTML = innerHTML;
    $('#divDescargar').append(a);


}

//cambiar visibilidad elementos
function toggleVisibility(){
    $("#btnBackGenerar").toggle();
    $("#btnExportar").toggle();
    $("#btnGenerar").toggle();

    $('#div_exportar').toggle();
    $('#div_content').toggle();
}

/**
 * Vacia la lista de pestañas y el contenido de éstas
 */
function reiniciarContenidos() {
    $('#ul_tablist').empty();
    $('#div_tabcontent').empty();
}

/**
 * Comprueba si el número de dias indicado se encuentra dentro de los limites
 *
 * @returns numero de dias a generar
 */
function setNumeroDias() {
    var dias = $('#input_numerodias').val();
    if (dias < window.minDias)
        dias = window.minDias;
    if (dias > window.maxDias)
        dias = window.maxDias;
    $('#input_numerodias').val(dias);

    window.numeroDias = dias;
}

/**
 * Vacía la lista de menus usados
 */
function resetUsados() {
    window.usados = [];
}

function generarDias() {

    for (var i = 1; i <= window.numeroDias; i++) {
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

        $('#ul_tablist').append(li);
        $('#div_tabcontent').append(div);
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
                resetUsados();
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
    body.className = "panel-body panel-resizable";

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

    //$(tr).css("background-color", "#AA3300");
    $(tr).addClass("danger");
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

function renderMenus() {

    var div = document.createElement("div");

    for (var i = 1; i <= window.numeroDias; i++) {
        var tab = document.getElementById("tablist" + i);
        var elementos = tab.getElementsByClassName("panel panel-info");
        for (var j = 0; j < elementos.length; j++) {

            var copia = elementos[j].cloneNode(true);
            var table = copia.getElementsByClassName("table table-striped table-condensed")[0];
            div.appendChild(table);

        }

    }

    document.getElementById("div_exportar").appendChild(div);
    //$('#div_exportar').append($(div));
    menusToImg(document.getElementById("div_exportar"));

}

function menusToImg(lista) {
    html2canvas(lista, {
        onrendered: function (canvas) {
            window.imagen = canvas.toDataURL("image/png");
        }
    });
}