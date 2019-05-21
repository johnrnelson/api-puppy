//Stuff our help display since it's so big and the least dynamic.. :-)
WebApp.GetHelpFile('AppCharts.html', function (filecontents) {
    document.getElementById("AppCharts").innerHTML = filecontents;
    //Now show the sys info in the main display...
});
WebApp.AppCharts = {
    Colors: {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)'
    },
    AddErrorsChart() {
        var color = Chart.helpers.color;
  
        var barChartData = {
            labels: ['HTTP/S', 'System'],
            datasets: [{
                label: 'Errors',
                backgroundColor: color(WebApp.AppCharts.Colors.red).alpha(0.5).rgbString(),
                borderColor: WebApp.AppCharts.Colors.red,
                borderWidth: 1,
                data: [
                    (-1) * WebApp.SysInfo.SERVERStatistics.Services.TotalError,
                    (-1) * WebApp.SysInfo.SERVERStatistics.System.TotalError
                ]
            }, {
                label: 'Success',
                backgroundColor: color(WebApp.AppCharts.Colors.blue).alpha(0.5).rgbString(),
                borderColor: WebApp.AppCharts.Colors.blue,
                borderWidth: 1,
                data: [
                    WebApp.SysInfo.SERVERStatistics.Services.TotalSuccess,
                    WebApp.SysInfo.SERVERStatistics.System.TotalSuccess

                ]
            }]

        };

        var ctx = document.getElementById('Chartjs-API-Rates').getContext('2d');
        window.myBar = new Chart(ctx, {
            type: 'bar',
            data: barChartData,
            options: {
                responsive: true,
                legend: {
                    position: 'top',
                },
                // title: {
                //     display: true,
                //     text: 'API Success/Error Rates'
                // }
            }
        });




    },
    AddServicesStatChart() {
 
        var color = Chart.helpers.color;

        const SuccessSets = {

            label: 'Success',
            backgroundColor: color(WebApp.AppCharts.Colors.blue).alpha(0.5).rgbString(),
            borderColor: WebApp.AppCharts.Colors.blue,
            borderWidth: 1,
            data: []
        };
        const ErrorSets = {

            label: 'Errors',
            backgroundColor: color(WebApp.AppCharts.Colors.red).alpha(0.5).rgbString(),
            borderColor: WebApp.AppCharts.Colors.red,
            borderWidth: 1,
            data: []

        };

        const srvChartData = {
            labels: [],
            datasets: []
        };
        const StatMap = WebApp.SysInfo.SERVERStatistics.Services.StatMap;

        // debugger;
        for (var m in StatMap) {
            const mItem = StatMap[m];
            srvChartData.labels.push(m);
            if (mItem.Errors) {
                mItem.Errors = mItem.Errors * -1;
            }
            ErrorSets.data.push(mItem.Errors);
            SuccessSets.data.push(mItem.Success);
        }

        srvChartData.datasets.push(SuccessSets);
        srvChartData.datasets.push(ErrorSets);


        var ctx = document.getElementById('Chartjs-Services-Stats').getContext('2d');
        window.myBar = new Chart(ctx, {
            type: 'bar',

            data: srvChartData,
            options: {
                responsive: true,
                legend: {
                    position: 'top',
                },
                // title: {
                //     display: true,
                //     text: 'API Services Rates'
                // }
            }
        });
    }    
};