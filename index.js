const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('🚀 AetherPredict Global Cyclone Shield LIVE!'));
app.listen(3000, () => console.log('🌪️ Cyclone prediction ready'));
