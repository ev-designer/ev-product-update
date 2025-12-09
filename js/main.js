// Initialize Lucide Icons
lucide.createIcons();

// Chart Configuration (using Chart.js to simulate the graph in the image)
// Chart Configuration (using Chart.js to simulate the graph in the image)
const chartCanvas = document.getElementById('attendanceChart');
if (chartCanvas) {
    const ctx = chartCanvas.getContext('2d');
    const attendanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Dec 03', 'Dec 06', 'Dec 09', 'Dec 12', 'Dec 15', 'Dec 18', 'Dec 21'],
            datasets: [
                {
                    label: 'Present',
                    data: [0, 0, 2, 0, 0, 0, 0],
                    backgroundColor: '#22c55e', // Green
                    barThickness: 4
                },
                {
                    label: 'Absent',
                    data: [0, 0, 1, 0, 0, 0, 0],
                    backgroundColor: '#ef4444', // Red
                    barThickness: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 4,
                    ticks: { stepSize: 1 },
                    grid: { borderDash: [2, 4], color: '#e5e7eb' }
                },
                x: {
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
            }
        }
    });
}
