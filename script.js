
const stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'PYPL', 'TSLA', 'JPM', 'NVDA', 'NFLX', 'DIS'];  //array of the stocks that need to be dispalyed 
//variables that are used to dynamically change the name and month of the stocks when a button is pressed
let stockName = "AAPL";
let Month = "5y";

//this is the variable that handles the creation and detetion of a chart dynamically
let myLineChart;
//this function is a function that will fetch the stock and populate all the stocks it uses fetch api
function fetchStock() {

    fetch("https://stock-market-api-k9vl.onrender.com/api/stocksdata").then(response => {
        if (!response.ok) alert("Please Check you Internet Connection and Refresh the page");

        return response.json()
    }).then(stocks => populateStock(stocks)).catch(error => console.error(error));

}

// this is a function that will populate the chart with the necessary datapoints
function populateStock(input) {


    //this gets chart element from the html using dom selectors 
    let chart = document.getElementById('myChart').getContext("2d");

    //this is the timestamp that is fetched from the api and used to plot the stocks chart 
    let inputlabelraw = input.stocksData[0][stockName][Month].timeStamp;


    //the below line of code converts raw timestamp data into the date format 
    let inputlabel = inputlabelraw.map(input => new Date(input * 1000).toLocaleDateString());

    //console.log(inputlabel)


    //this is the stock price that is fetch from the api and used in the chart 
    let inputData = input.stocksData[0][stockName][Month].value;

    //extracts the maximum value from the data 

    let maxValue = Math.max(...inputData);

    //extracts the minimum value from the data 

    let minValue = Math.min(...inputData);


    //this is a function that will return the corresponding color for the highest and lowest price in the graph

    let pointColor = inputData.map(input => {
        if (input === maxValue) return ' #FFDF00';
        if (input === minValue) return 'red';
        return 'rgba(23, 203, 17, 1)';
    });

    //the below function will change the pointer color of the max and min values in the graph

    let pointSize = inputData.map(input => {
        if (input === maxValue) return 4;
        if (input === minValue) return 4;
        return 1;
    })
    //this is a plugin for the chart.js to create a vertical line when hovered over the chart
    const verticalHoverLine = {
        id: 'verticalHoverLine',

        afterEvent(chart, args) {
            const { chartArea, scales } = chart;
            const e = args.event;

            const inside =
                e.x >= chartArea.left &&
                e.x <= chartArea.right &&
                e.y >= chartArea.top &&
                e.y <= chartArea.bottom;

            if (!inside) {
                chart.$hoverX = null;
                chart.tooltip.setActiveElements([], { x: 0, y: 0 });
                chart.draw();
                return;
            }

            chart.$hoverX = e.x;

            // Find closest index on the X-axis
            const index = scales.x.getValueForPixel(e.x);

            // Activate default tooltip on the nearest point
            chart.tooltip.setActiveElements(
                [{ datasetIndex: 0, index }],
                { x: e.x, y: args.event.y }
            );

            chart.draw();
        },

        // afterDraw(chart) {
        //     const { ctx, chartArea } = chart;

        //     if (!chart.$hoverX) return;

        //     ctx.save();
        //     ctx.beginPath();
        //     ctx.moveTo(chart.$hoverX, chartArea.top);
        //     ctx.lineTo(chart.$hoverX, chartArea.bottom);

        //     ctx.strokeStyle = "orange";
        //     ctx.lineWidth = 2;
        //     ctx.setLineDash([4, 3]);

        //     ctx.stroke();
        //     ctx.restore();
        // }

        afterDraw(chart) {
            const { ctx, chartArea, scales } = chart;

            if (!chart.$hoverX) return;

            // Draw vertical line
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(chart.$hoverX, chartArea.top);
            ctx.lineTo(chart.$hoverX, chartArea.bottom);
            ctx.strokeStyle = "orange";
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 3]);
            ctx.stroke();
            ctx.restore();

            // big pointer for the closest point
            const tooltip = chart.tooltip;

            // Tooltip inactive
            if (!tooltip?.dataPoints?.length) return;

            const point = tooltip.dataPoints[0];
            const x = point.element.x;
            const y = point.element.y;

            ctx.save();

            // Increase or customize pointer size here
            const pointerSize = 5;  // <--- change this to make it bigger

            ctx.beginPath();
            ctx.arc(x, y, pointerSize, 0, Math.PI * 2);
            ctx.fillStyle = "lime";
            ctx.strokeStyle = "lime";  // optional outline
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }

    };




    //plugin for the highlight label 
    const highlightLabelsPlugin = {
        id: 'highlightLabels',
        afterDraw(chart, args, options) {
            const { ctx } = chart;
            const dataset = chart.data.datasets[0];
            const data = dataset.data;

            if (!data || data.length === 0) return;

            const maxValue = Math.max(...data);
            const minValue = Math.min(...data);

            const maxIndex = data.indexOf(maxValue);
            const minIndex = data.indexOf(minValue);

            const meta = chart.getDatasetMeta(0);




            // Draw MAX
            ctx.save();
            const maxPoint = meta.data[maxIndex];
            ctx.fillStyle = "#FFDF00";
            ctx.font = "bold 12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText(`Max: $${maxValue.toFixed(2)}`, maxPoint.x, maxPoint.y + 7);
            ctx.restore();

            // Draw MIN
            ctx.save();
            const minPoint = meta.data[minIndex];
            ctx.fillStyle = "red";
            ctx.font = "bold 12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText(`Min: $${minValue.toFixed(2)}`, minPoint.x, minPoint.y - 6);
            ctx.restore();
        }
    };




    //chart constructor applied on the chart element in the html to render and display the datapoints in the form of a line chart 
    myLineChart = new Chart(chart, {
        type: 'line',

        data: {
            //label which is the x axis of the chart 
            labels: inputlabel,

            datasets: [
                {
                    label: stockName,

                    data: inputData,
                    pointBackgroundColor: pointColor,
                    borderColor: 'rgba(23, 203, 17, 1)',
                    pointBorderColor: pointColor,
                    borderWidth: 3,
                    color: 'rgba(23, 203, 17, 1)',
                    fill: false,
                    pointRadius: pointSize,    // easier to hover
                    pointHoverRadius: 6
                }
            ],
        },
        options: {

            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        display: false // Hides the X-axis labels
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        callback: (val) => {
                            return '$' + val; // Prepend a dollar sign to the value
                        },
                        display: false // Hides the Y-axis labels
                    }
                }
            },
            plugins: {
                //the below code hides the legend of the chart 
                legend: {
                    display: false,
                },

                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function (context) {
                            return `${stockName}:$${context.parsed.y.toFixed(3)}`;
                        }
                    }
                },



            },

        },

        plugins: [verticalHoverLine, highlightLabelsPlugin]


    })

    return myLineChart;
};


let stockList = document.getElementsByClassName('list');
//will load the stock chart only after all the elements are loaded on to the screen
stocks.forEach(input => {
    let buttonEl = document.createElement('button');
    let individualDiv = document.createElement('div');
    individualDiv.classList.add(input, 'stockDiv');
    buttonEl.classList.add('stockList');
    buttonEl.textContent = input;
    individualDiv.appendChild(buttonEl);
    stockList[0].appendChild(individualDiv);
})



//the below function allows us to destroy the current graph to build a new one dynamically

function destroyGraph() {
    myLineChart.destroy()
}

//an eventlistener to the list div of the page to capture which button is pressed and to display the corresponding stock chart
stockList[0].addEventListener('click', (e) => {
    let element = e.target.closest('.stockList');
    stockName = element.textContent;
    destroyGraph();
    Month = "5y";
    fetchStock();
    fetchDisplay();
});


//a fetch function that will add the stocks stats dynamically
let statsJson;
function stockStats() {
    fetch(' https://stock-market-api-k9vl.onrender.com/api/stocksstatsdata').then(response => {
        if (!response.ok) alert("Please Check you Internet Connection and Refresh the page");

        return response.json()
    }).then(stats => statsInsert(stats)).catch(error => console.error(error));
}


//this is the function that adds the stock stats to the buttons list 

function statsInsert(json) {
    stocks.forEach(input => {
        let parentDiv = document.getElementsByClassName(input);
        let currentPrice = document.createElement('span');
        currentPrice.classList.add('currentPrice');
        let price = json.stocksStatsData[0][input].bookValue;
        if (price < 10) {
            price = '0' + price;
        }
        currentPrice.textContent = `$ ${price}`;
        parentDiv[0].appendChild(currentPrice);

        let profitContainer = document.createElement('span');
        profitContainer.classList.add('profit');

        let profitraw = json.stocksStatsData[0][input].profit;
        profit = profitraw.toFixed(2);
        profitContainer.textContent = `${profit} %`;
        if (profit <= 0) {
            profitContainer.classList.add('noprofit');
        } else {
            profitContainer.classList.add('green');
        }
        parentDiv[0].appendChild(profitContainer);
    })
}

//this is the eventlistener that will load the content only after the doms are properly loaded into the page
document.addEventListener('DOMContentLoaded', () => {


    fetchStock();

    stockStats();
});




//arrays of the timeline for easier creation of buttons
let timeLine = ['1 Month', '3 Month', '1 Year', '5 Years'];

//the div that has chart and will also be used to add the button for the timeline scrubbing
let timlineContainer = document.getElementsByClassName('chart');


timeLine.forEach(input => {
    let newButton = document.createElement('button');
    newButton.textContent = input;
    newButton.classList.add('time');
    timlineContainer[0].appendChild(newButton);
})

//this is the event listener that will fetch the stocks prices based on the timeline selected by the user like 6months or 1year for example

timlineContainer[0].addEventListener('click', (e) => {
    let selectedtime = e.target.closest('.time');
    if (!selectedtime) return;
    if (selectedtime.textContent === "1 Month") {
        destroyGraph();
        Month = "1mo";
        fetchStock();
    } else if (selectedtime.textContent === "3 Month") {
        destroyGraph();
        Month = "3mo";
        fetchStock();
    } else if (selectedtime.textContent === "1 Year") {
        destroyGraph();
        Month = "1y";
        fetchStock();
    } else if (selectedtime.textContent === "5 Years") {
        destroyGraph();
        Month = "5y";
        fetchStock();
    }
});


//now we are creating a fetch function the get the description of each company and display it 

function fetchDisplay() {
    fetch('https://stock-market-api-k9vl.onrender.com/api/profiledata').then(response => {
        if (!response.ok) alert("Please Check you Internet Connection and Refresh the page");

        return response.json()
    }).then(stocks => populateDetails(stocks)).catch(error => console.error(error));
}


//this is function to correctly fetch the data from the json and add it to the corresponding div in the webpage
let details = document.getElementsByClassName('details');

function clearDetails() {
    details.textContent = '';
};

function populateDetails(input) {
    clearDetails();
    let text = input.stocksProfileData[0][stockName].summary;
    details[0].textContent = text;
}

document.addEventListener('DOMContentLoaded', fetchDisplay);

