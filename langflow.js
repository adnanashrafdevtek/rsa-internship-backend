const crypto = require('crypto');
const apiKey = 'sk-5z7pR6umc5pGWVCizHUldMU0X1c7P2GknMrm2GzyIgA';
const payload = {
    "output_type": "chat",
    "input_type": "chat",
    "input_value": "hello world!"
};
payload.session_id = crypto.randomUUID();

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        "x-api-key": apiKey
    },
    body: JSON.stringify(payload)
};

fetch('http://localhost:7860/api/v1/run/65874229-e86b-4945-a74a-51714bd50664', options)
    .then(response => response.json())
    .then(response => console.warn(response))
    .catch(err => console.error(err));