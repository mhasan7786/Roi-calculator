document.addEventListener('DOMContentLoaded', function () {
    // Get references to the elements
    const useDatesRadio = document.getElementById('useDates');
    const usePeriodRadio = document.getElementById('usePeriod');
    const dateInput = document.getElementById('dateInput');
    const periodInput = document.getElementById('periodInput');
    const menuBtn = document.querySelector('.menu-btn');
    const navMenu = document.querySelector('.nav-menu');

    // Event listeners for toggling time input fields
    useDatesRadio.addEventListener('change', toggleTimeInputs);
    usePeriodRadio.addEventListener('change', toggleTimeInputs);

    // Function to show/hide input fields based on the selected option
    function toggleTimeInputs() {
        if (useDatesRadio.checked) {
            dateInput.style.display = 'block';
            periodInput.style.display = 'none';
        } else {
            dateInput.style.display = 'none';
            periodInput.style.display = 'block';
        }
    }

    // Function to set random dates with a difference of 2.353 years
    function setRandomDates() {
        const today = new Date();
        const futureDate = new Date(today);

        // Add 2 years, 4 months, and 8 days to the current date
        futureDate.setFullYear(today.getFullYear() + 2);
        futureDate.setMonth(today.getMonth() + 4);
        futureDate.setDate(today.getDate() + 8);

        // Set the values of the date inputs
        document.getElementById('startDate').valueAsDate = today;
        document.getElementById('endDate').valueAsDate = futureDate;
    }

    // Function to clear all input fields
    window.clearInputs = function () {
        // Clear input fields and reset values
        document.getElementById('initialInvestment').value = '';
        document.getElementById('finalValue').value = '';
        document.getElementById('additionalCosts').value = '';

        // Clear date inputs
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';

        // Clear period inputs
        document.getElementById('years').value = '';
        document.getElementById('months').value = '';
        document.getElementById('days').value = '';

        // Reset selected time input type to 'dates'
        document.getElementById('useDates').checked = true;
        toggleTimeInputs(); // Show date inputs by default

        // Scroll to the top of the input section
        document.querySelector('h1').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Initialize the chart with Chart.js
    const ctx = document.getElementById('roiChart').getContext('2d');

    window.roiChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Initial Investment', 'Final Value', 'Net Returns'],
            datasets: [{
                label: 'Amount ($)',
                data: [0, 0, 0], // Initial values for the chart
                backgroundColor: ['#1E90FF', '#32CD32', '#FFd700'] // Colors for the chart bars
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow canvas to grow with the container
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        autoSkip: false,
                        font: {
                            size: window.innerWidth <= 768 ? 10 : 12 // Adjust font size based on screen size
                        }
                    },
                    barPercentage: 0.6, // Default bar percentage
                    categoryPercentage: 0.9 // Default category percentage
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            size: window.innerWidth <= 768 ? 10 : 12 // Adjust font size based on screen size
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top', // Position the legend at the top
                    labels: {
                        font: {
                            size: window.innerWidth <= 768 ? 10 : 14 // Adjust label font size based on screen size
                        },
                        boxWidth: window.innerWidth <= 768 ? 10 : 20, // Adjust box size for small screens
                        padding: window.innerWidth <= 768 ? 5 : 10 // Adjust padding for small screens
                    }
                }
            }
        }
    });

    // Adjust chart settings based on screen size
    function adjustChartSettings() {
        const width = window.innerWidth;

        // Smaller bars on smaller screens
        const barPercentage = width <= 768 ? 0.2 : 0.6;
        const categoryPercentage = width <= 768 ? 0.6 : 0.8;

        // Update chart options dynamically
        window.roiChart.options.scales.x.barPercentage = barPercentage;
        window.roiChart.options.scales.x.categoryPercentage = categoryPercentage;
        window.roiChart.options.scales.x.ticks.font.size = width <= 768 ? 8 : 10;
        window.roiChart.options.scales.y.ticks.font.size = width <= 768 ? 8 : 10;
        window.roiChart.options.plugins.legend.labels.font.size = width <= 768 ? 10 : 12;

        window.roiChart.update();
    }

    // Initial call to adjust chart settings
    adjustChartSettings();

    // Listen for window resize to adjust chart settings
    window.addEventListener('resize', adjustChartSettings);



    // Function to calculate ROI and update the result section
    window.calculateROI = function () {
        const initialInvestment = parseFloat(document.getElementById('initialInvestment').value) || 0;
        const finalValue = parseFloat(document.getElementById('finalValue').value) || 0;
        const additionalCosts = parseFloat(document.getElementById('additionalCosts').value) || 0;
    
        let investmentPeriodLength;
        let investmentPeriodText;
    
        // Calculate the investment period length
        if (useDatesRadio.checked) {
            const startDate = new Date(document.getElementById('startDate').value);
            const endDate = new Date(document.getElementById('endDate').value);
            const timeDiff = endDate - startDate;
            const days = timeDiff / (1000 * 60 * 60 * 24);
            investmentPeriodLength = parseFloat((days / 365.25).toFixed(2));
            investmentPeriodText = `${Math.floor(days / 365.25)} years, ${Math.floor((days % 365.25) / 30)} months, ${Math.floor((days % 365.25) % 30)} days`;
        } else {
            const years = parseFloat(document.getElementById('years').value) || 0;
            const months = parseFloat(document.getElementById('months').value) || 0;
            const days = parseFloat(document.getElementById('days').value) || 0;
            const totalDays = (years * 365.25) + (months * 30.4375) + days;
            investmentPeriodLength = parseFloat((totalDays / 365.25).toFixed(2));
            investmentPeriodText = `${years} years, ${months} months, ${days} days`;
        }
    
        // Calculate ROI and Annualized ROI
        const netReturns = finalValue - initialInvestment - additionalCosts;
        const roi = (netReturns / initialInvestment) * 100;
        const annualizedROI = ((1 + roi / 100) ** (1 / investmentPeriodLength) - 1) * 100;
    
        // Update result table with calculated values
        document.querySelector('.result-table tbody').innerHTML = `
            <tr>
                <td>Net Returns (Profit)</td>
                <td>$${netReturns.toFixed(2)}</td>
            </tr>
            <tr>
                <td>ROI</td>
                <td>${roi.toFixed(2)}%</td>
            </tr>
            <tr>
                <td>Annualized ROI</td>
                <td>${annualizedROI.toFixed(2)}%</td>
            </tr>
            <tr>
                <td>Investment Period Length (Decimal)</td>
                <td>${investmentPeriodLength.toFixed(2)} years</td>
            </tr>
            <tr>
                <td>Investment Period Length (Detailed)</td>
                <td>${investmentPeriodText}</td>
            </tr>
        `;
    
        // Update the chart with new data
        window.roiChart.data.datasets[0].data = [initialInvestment, finalValue, netReturns];
        window.roiChart.update();
       
    };

    
    // Function to ensure the header is at the top of the page on load
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Call scrollToTop on page load to ensure header is visible
    scrollToTop();

    // Set initial random dates
    setRandomDates();

    // Trigger the initial calculation with preloaded values
    calculateROI();

    // Hamburger menu toggle functionality for mobile screens
    menuBtn.addEventListener('click', function () {
        navMenu.classList.toggle('show-menu');
    });


    // Ensure hamburger menu is hidden on larger screens
    function handleResize() {
        if (window.innerWidth > 768) {
            navMenu.classList.remove('show-menu');
        }
    }

    window.addEventListener('resize', handleResize);
});