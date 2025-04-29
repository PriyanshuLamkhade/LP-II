google.charts.load("current", { packages: ["corechart", "gauge"] }); 
google.charts.setOnLoadCallback(drawCharts);

function drawCharts() {
    drawChart();
    drawGauge();
    drawThreatChart(); 
}


function drawChart() {
    var data = google.visualization.arrayToDataTable([
        ['Threat Type', 'Percentage'],
        ['Ransomware', 30],
        ['Trojans', 25],
        ['Spyware', 15],
        ['Adware', 10],
        ['Worms', 10],
        ['Rootkits', 10]
    ]);

    var options = {
        pieHole: 0.4,
        chartArea: { width: '90%', height: '80%' },
        legend: { position: 'bottom', textStyle: { color: 'white' } },
        backgroundColor: '#111828',
        titleTextStyle: { color: 'white' },
        pieSliceTextStyle: { color: 'white' }
    };

    var chart = new google.visualization.PieChart(document.getElementById('donutchart'));
    chart.draw(data, options);
}


function drawGauge() {
    var data = google.visualization.arrayToDataTable([
        [ ''],
        [ 65] 
    ]);

    var options = {
        
       
        greenFrom: 0,
        greenTo: 30,
        yellowFrom: 31,
        yellowTo: 60,
        redFrom: 61,
        redTo: 100,
        minorTicks: 5,
        max: 100,
        backgroundColor: "#111828",
        animation: { duration: 1000, easing: 'out' }
    };

    var chart = new google.visualization.Gauge(document.getElementById('gauge_chart'));
    chart.draw(data, options);
}


window.addEventListener('resize', drawCharts);


function drawThreatChart() {
    var data = google.visualization.arrayToDataTable([
        ['Month', '2023 Threats', '2024 Threats'],
        ['Jan', 100, 120],
        ['Feb', 150, 180],
        ['Mar', 200, 220],
        ['Apr', 250, 280],
        ['May', 300, 350],
        ['Jun', 350, 400],
        ['Jul', 400, 450],
        ['Aug', 450, 470],
        ['Sep', 420, 440],
        ['Oct', 380, 410],
        ['Nov', 350, 380],
        ['Dec', 300, 350]
    ]);

    var options = {
      
        curveType: 'function',
        backgroundColor: '#111828',
        titleTextStyle: { color: 'white' },
        legend: { position: 'bottom', textStyle: { color: 'white' } },
        hAxis: {
            title: 'Month',
            textStyle: { color: 'white' },
            titleTextStyle: { color: 'white' }
        },
        vAxis: {
            title: 'Threat Level (%)',
            minValue: 0,
            maxValue: 500,
            gridlines: { count: 6 },
            textStyle: { color: 'white' },
            titleTextStyle: { color: 'white' }
        }
    };

    var chart = new google.visualization.LineChart(document.getElementById('threat_chart'));
    chart.draw(data, options);
}


window.addEventListener('resize', drawThreatChart);

