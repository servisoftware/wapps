// JavaScript for simple interest calculation and result display

// Initial variables
var basecal = 100;
var Status = 1; // Status 1 means calculation mode, 0 means result display mode
var Monthperyear = 12;

// Function to calculate simple interest and display results
function calculate() {
    let Capital = parseInt(document.getElementById("Capital").value);
    let Interes = parseFloat(document.getElementById("Interes").value) / 100; // Parse float for decimal interest rates
    let Periodo = parseInt(document.getElementById("Periodo").value);
    let ITiempo = document.getElementById("Tiempo");
    let Tiempo = parseInt(ITiempo.value);
    var LabTiempo = ITiempo.options[ITiempo.selectedIndex].innerHTML;

    // Calculating interest and total
    let Beneficio = Capital * (Interes / Tiempo) * Periodo;
    let Total = Capital + Beneficio;

    // Displaying results in input fields
    document.getElementById("Beneficio").value = Beneficio;
    document.getElementById("Total").value = Beneficio + Capital;

    // Logging for debugging
    console.log(`Capital: ${Capital}`);
    console.log(`Interes: ${Interes}`);
    console.log(`Periodo: ${Periodo}`);
    console.log(`Tiempo: ${Tiempo}`);
    console.log(`Label: ${Status}`);
    console.log(`Status: ${LabTiempo}`);

    // If in calculation mode, add results to the table
    if (Status === 0) {
        var resultsTable = document.getElementById('ResultsTable');
        var tbody = resultsTable.getElementsByTagName('tbody')[0];

        var row = document.createElement('tr');

        var vCapital = document.createElement('td');
        var vInteres = document.createElement('td');
        var vPeriodo = document.createElement('td');
        var vTiempo = document.createElement('td');
        var vBeneficio = document.createElement('td');
        var vTotal = document.createElement('td');

        // Fill table cells with data
        vCapital.innerHTML = Capital;
        vInteres.innerHTML = Interes;
        vPeriodo.innerHTML = Periodo;
        vTiempo.innerHTML = Tiempo;
        vBeneficio.innerHTML = Beneficio;
        vTotal.innerHTML = Total;

        // Append cells to row and row to table body
        row.appendChild(vCapital);
        row.appendChild(vInteres);
        row.appendChild(vPeriodo);
        row.appendChild(vTiempo);
        row.appendChild(vBeneficio);
        row.appendChild(vTotal);

        tbody.appendChild(row);

        // Change status back to calculation mode
        changeStatus(1);
    }
}

// Function to change the status
function changeStatus(newStatus) {
    Status = newStatus;
    console.log(`new status: ${Status}`);
}
