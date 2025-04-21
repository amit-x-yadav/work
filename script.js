document.getElementById('orderForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    // Build the order object for products A to I
    const order = {};
    for (let i = 65; i <= 73; i++) { // ASCII codes for A–I
        const product = `product${String.fromCharCode(i)}`;
        const quantity = parseInt(document.getElementById(product).value) || 0;
        order[String.fromCharCode(i)] = quantity; // Use A–I as keys
    }

    try {
        const response = await fetch('https://work-delivery-cost-api.onrender.com/calculate-delivery-cost', {
            // Replace this URL with your deployed backend API (e.g., Render or Glitch)
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        document.getElementById('deliveryCost').innerText = `$${data.deliveryCost}`;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('deliveryCost').innerText = 'Failed to fetch delivery cost.';
    }
});