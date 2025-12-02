// London Uber Driver Earnings Calculator
// Main JavaScript file

console.log('London Uber Driver Earnings Calculator loaded');

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeApp();
});

function initializeApp() {
    console.log('App initialized');
    
    // Check if we're on the form page or results page
    const form = document.getElementById('earningsForm');
    const resultArea = document.getElementById('resultArea');
    
    if (form) {
        // We're on the form page (index.html)
        initializeFormPage();
    } else if (resultArea) {
        // We're on the results page (results.html)
        initializeResultsPage();
    }
}

function initializeFormPage() {
    const form = document.getElementById('earningsForm');
    const hoursSlider = document.getElementById('hours');
    const hoursValue = document.getElementById('hoursValue');
    
    // Update slider value display
    hoursSlider.addEventListener('input', function() {
        hoursValue.textContent = `${this.value} hours`;
    });
    
    // Handle form submission - navigate to results page
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const hours = parseInt(hoursSlider.value);
        
        // Validate hours
        if (isNaN(hours) || hours < 20 || hours > 90) {
            alert('Please select valid hours (20-90)');
            return;
        }
        
        // Get work times
        const selectedTimeIds = [];
        const workTimeCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        workTimeCheckboxes.forEach(checkbox => {
            selectedTimeIds.push(checkbox.id);
        });
        
        if (selectedTimeIds.length === 0) {
            alert('Please select at least one work time');
            return;
        }
        
        // Get weekend work
        const weekendRadio = document.querySelector('input[name="weekend"]:checked');
        if (!weekendRadio) {
            alert('Please select weekend work option');
            return;
        }
        const weekendWork = weekendRadio.value === 'yes';
        
        // Get car category
        const carRadio = document.querySelector('input[name="carCategory"]:checked');
        if (!carRadio) {
            alert('Please select a car category');
            return;
        }
        const carCategory = carRadio.value;
        
        // Build URL with parameters
        const currentPath = window.location.pathname;
        const basePath = currentPath.endsWith('index.html') 
            ? currentPath.replace('index.html', 'results.html')
            : currentPath.replace(/\/$/, '') + '/results.html';
        const baseUrl = window.location.origin + basePath;
        const urlParams = new URLSearchParams();
        urlParams.set('hours', hours.toString());
        urlParams.set('weekend', weekendWork ? 'yes' : 'no');
        urlParams.set('car', carCategory);
        if (selectedTimeIds.length > 0) {
            urlParams.set('times', selectedTimeIds.join(','));
        }
        
        // Navigate to results page
        window.location.href = `${baseUrl}?${urlParams.toString()}`;
    });
}

function initializeResultsPage() {
    // Read URL parameters and calculate results
    const urlParams = new URLSearchParams(window.location.search);
    const hoursParam = urlParams.get('hours');
    const weekend = urlParams.get('weekend');
    const carCategory = urlParams.get('car');
    const timesParam = urlParams.get('times');
    
    // Validate required parameters
    if (!hoursParam || !weekend || !carCategory || !timesParam) {
        document.getElementById('resultArea').innerHTML = '<p style="color: #dc3545;">Invalid parameters. Please use the calculator form.</p>';
        return;
    }
    
    const hours = parseInt(hoursParam);
    
    // Calculate and display results
    calculateEarningsFromParams(hours, weekend === 'yes', carCategory, timesParam.split(','));
}

// Calculate earnings from URL parameters (for results page)
function calculateEarningsFromParams(hours, weekendWork, carCategory, selectedTimeIds) {
    const resultArea = document.getElementById('resultArea');
    
    // Validate hours
    if (isNaN(hours) || hours < 20 || hours > 90) {
        resultArea.innerHTML = '<p style="color: #dc3545;">Invalid hours parameter</p>';
        return;
    }
    
    // Get work time multipliers from IDs
    const timeMultipliers = {
        'earlyMorning': 1.1,
        'afternoon': 1.0,
        'evening': 1.0,
        'lateNight': 1.2
    };
    
    const workTimes = [];
    selectedTimeIds.forEach(id => {
        if (timeMultipliers[id]) {
            workTimes.push(timeMultipliers[id]);
        }
    });
    
    if (workTimes.length === 0) {
        resultArea.innerHTML = '<p style="color: #dc3545;">Invalid work times parameter</p>';
        return;
    }
    
    // Calculate average work time multiplier
    const workTimeMultiplier = workTimes.reduce((sum, val) => sum + val, 0) / workTimes.length;
    const weekendMultiplier = weekendWork ? 1.1 : 1.0;
    
    // Car multipliers and costs
    const carMultipliers = {
        normal: 1.0,
        executive: 1.25,
        seater: 1.2
    };
    const carCosts = {
        normal: 230,
        executive: 300,
        seater: 270
    };
    
    const carMultiplier = carMultipliers[carCategory];
    const vehicleCost = carCosts[carCategory];
    
    if (!carMultiplier || !vehicleCost) {
        resultArea.innerHTML = '<p style="color: #dc3545;">Invalid car category parameter</p>';
        return;
    }
    
    // Base rate
    const baseRate = 18; // £18/hour
    
    // Calculate gross earnings
    const grossHourly = baseRate * workTimeMultiplier * weekendMultiplier * carMultiplier;
    const grossWeekly = grossHourly * hours;
    
    // Calculate costs
    const fuelCost = 2.5 * hours; // £2.50 per hour
    const otherCosts = 40; // £40/week for cleaning, parking, data
    const totalWeeklyCost = vehicleCost + fuelCost + otherCosts;
    
    // Calculate net earnings
    const netWeekly = grossWeekly - totalWeeklyCost;
    const netHourly = netWeekly / hours;
    const netMonthly = netWeekly * 4.33;
    
    // Round values
    const grossHourlyRounded = Math.round(grossHourly * 100) / 100;
    const grossWeeklyRounded = Math.round(grossWeekly * 100) / 100;
    const netWeeklyRounded = Math.round(netWeekly * 100) / 100;
    const netHourlyRounded = Math.round(netHourly * 100) / 100;
    const netMonthlyRounded = Math.round(netMonthly * 100) / 100;
    
    // Create share message
    const shareMessage = `I just estimated my London Uber driver earnings: £${netWeeklyRounded}/week after costs. Try it yourself: [link]`;
    
    // Build shareable URL (current URL with parameters)
    const shareUrl = window.location.href;
    
    // Get work time descriptions for display
    const workTimeDescriptions = [];
    selectedTimeIds.forEach(id => {
        if (id === 'earlyMorning') workTimeDescriptions.push('early mornings');
        if (id === 'afternoon') workTimeDescriptions.push('afternoons');
        if (id === 'evening') workTimeDescriptions.push('evenings');
        if (id === 'lateNight') workTimeDescriptions.push('late nights');
    });
    
    const workTimeDescription = workTimeDescriptions.length === 1 
        ? workTimeDescriptions[0]
        : workTimeDescriptions.length === 2
        ? workTimeDescriptions.join(' & ')
        : workTimeDescriptions.slice(0, -1).join(', ') + ' & ' + workTimeDescriptions[workTimeDescriptions.length - 1];
    
    const carDescriptions = {
        normal: 'normal car',
        executive: 'executive car',
        seater: '7-seater car'
    };
    const carDescription = carDescriptions[carCategory] || 'normal car';
    
    // Display results
    displayResults(
        grossHourlyRounded,
        grossWeeklyRounded,
        netWeeklyRounded,
        netHourlyRounded,
        netMonthlyRounded,
        hours,
        workTimeDescription,
        weekendWork,
        carDescription,
        carCategory,
        vehicleCost,
        fuelCost,
        otherCosts,
        totalWeeklyCost,
        shareMessage,
        shareUrl
    );
}

// Display results (shared function for both pages)
function displayResults(
    grossHourlyRounded,
    grossWeeklyRounded,
    netWeeklyRounded,
    netHourlyRounded,
    netMonthlyRounded,
    hours,
    workTimeDescription,
    weekendWork,
    carDescription,
    carCategory,
    vehicleCost,
    fuelCost,
    otherCosts,
    totalWeeklyCost,
    shareMessage,
    shareUrl
) {
    const resultArea = document.getElementById('resultArea');
    
    resultArea.innerHTML = `
        <div style="color: #21398F; font-weight: 600; font-size: 1.2rem; margin-bottom: 12px;">
            Your Earnings Estimate
        </div>
        
        <div style="background: white; padding: 18px; border-radius: 10px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                <span style="color: #000; font-weight: 600; font-size: 1rem;">Gross Hourly</span>
                <span style="color: #000; font-weight: 600; font-size: 1rem;">£${grossHourlyRounded}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                <span style="color: #000; font-weight: 600; font-size: 1rem;">Gross Weekly</span>
                <span style="color: #000; font-weight: 600; font-size: 1rem;">£${grossWeeklyRounded}</span>
            </div>
            <div style="color: #6c757d; font-size: 0.9rem; line-height: 1.4; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e9ecef;">
                Based on: ${hours} hours/week, ${workTimeDescription}, ${weekendWork ? 'weekend work' : 'weekdays only'}, ${carDescription}
            </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 18px; border-radius: 10px; margin-bottom: 12px;">
            <div style="color: #000; font-weight: 600; margin-bottom: 8px;">Weekly Costs</div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                <span style="color: #6c757d; font-size: 0.9rem;">Vehicle with insurance ${getCarLink(carCategory)}</span>
                <span style="color: #6c757d; font-size: 0.9rem; font-weight: 600;">£${vehicleCost}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                <span style="color: #6c757d; font-size: 0.9rem;">Fuel</span>
                <span style="color: #6c757d; font-size: 0.9rem; font-weight: 600;">£${fuelCost.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                <span style="color: #6c757d; font-size: 0.9rem;">Cleaning, parking & data</span>
                <span style="color: #6c757d; font-size: 0.9rem; font-weight: 600;">£${otherCosts}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; border-top: 1px solid #dee2e6; padding-top: 6px; margin-top: 8px;">
                <span style="color: #000; font-weight: 600;">Total Weekly Costs</span>
                <span style="color: #000; font-weight: 600;">£${totalWeeklyCost.toFixed(2)}</span>
            </div>
        </div>
        
        <div class="net-block" style="background: #21398F; color: white; padding: 18px; border-radius: 10px; text-align: left; margin-bottom: 16px;">
            <div class="net-weekly" style="display: flex; justify-content: space-between; align-items: baseline; font-size: 1.1rem; font-weight: 600; margin-bottom: 6px;">
                <span>Net Weekly</span>
                <span>£${netWeeklyRounded}</span>
            </div>
            <div class="net-hourly" style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.95rem; margin-bottom: 6px;">
                <span>Net Hourly</span>
                <span>£${netHourlyRounded}</span>
            </div>
            <div class="net-monthly" style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.95rem;">
                <span>Net Monthly</span>
                <span>£${netMonthlyRounded}</span>
            </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 10px;">
            <a href="index.html" style="background: none; border: none; color: #21398F; text-decoration: underline; cursor: pointer; font-weight: 600; font-size: 1rem;">Calculate Again</a>
        </div>
        
        <div style="background: white; padding: 18px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
            <div style="color: #000; font-weight: 600; margin-bottom: 12px; text-align: center;">Share Your Results</div>
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: nowrap;">
                <button onclick="shareWhatsApp('${shareMessage}', '${shareUrl}')" class="share-btn whatsapp-btn" title="Share on WhatsApp">
                    <i class="fab fa-whatsapp"></i>
                </button>
                <button onclick="shareEmail('${shareMessage}', '${shareUrl}')" class="share-btn email-btn" title="Share via Email">
                    <i class="fas fa-envelope"></i>
                </button>
                <button onclick="copyLink('${shareUrl}')" class="share-btn copy-btn" title="Copy Link">
                    <i class="fas fa-link"></i>
                </button>
            </div>
        </div>
    `;
}

// Helper function to get car rental links
function getCarLink(category) {
    const links = {
        normal: '<a href="https://ottocar.co.uk/cars?branch_region=London+%26+South+East&plan=RENTAL&uberEligibility=Uber+X" target="_blank" style="color: #007bff; text-decoration: none;">View rentals →</a>',
        executive: '<a href="https://fleeto.co.uk/car-listing/mercedes-benz-e300e/" target="_blank" style="color: #007bff; text-decoration: none;">View rentals →</a>',
        seater: '<a href="https://www.splend.com/en-GB/vehicles/?vehicles_gb%5BrefinementList%5D%5Buber_elligibility%5D%5B0%5D=uber-xl&vehicles_gb%5BrefinementList%5D%5Blocations%5D%5B0%5D=London" target="_blank" style="color: #007bff; text-decoration: none;">View rentals →</a>'
    };
    return links[category] || '';
}

// Share functions
function shareWhatsApp(message, url) {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message.replace('[link]', url))}`;
    window.open(whatsappUrl, '_blank');
}

function shareEmail(message, url) {
    const subject = 'My London Uber Driver Earnings Estimate';
    const body = message.replace('[link]', url);
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = emailUrl;
}

function copyLink(url) {
    navigator.clipboard.writeText(url).then(function() {
        // Show success message
        const copyBtn = event.target;
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = 'Copied!';
        copyBtn.style.backgroundColor = '#28a745';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.backgroundColor = '';
        }, 2000);
    }).catch(function(err) {
        console.error('Could not copy text: ', err);
        alert('Could not copy link. Please copy manually: ' + url);
    });
}
