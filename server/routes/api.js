const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

// Detailed Mock Database for Bitnob Payout Capabilities by Country
const MOCK_BITNOB_CAPABILITIES = {
  NG: {
    country: 'Nigeria',
    currency: 'NGN',
    channels: ['Bank Transfer (NIP)', 'OPay Wallet', 'Paga Wallet'],
    fee: '1.0% (Min $0.50 USD)',
    limits: { min: '$1.00 USD', max: '$5,000.00 USD' },
    settlement: 'Instant (Under 2 mins)',
    status: 'Active',
    description: 'Direct payouts to all commercial bank accounts and main mobile wallets in Nigeria.'
  },
  KE: {
    country: 'Kenya',
    currency: 'KES',
    channels: ['M-Pesa Mobile Money', 'Airtel Money'],
    fee: '1.2% (Min $0.50 USD)',
    limits: { min: '$1.00 USD', max: '$1,000.00 USD' },
    settlement: 'Instant (Under 5 mins)',
    status: 'Active',
    description: 'Instant mobile money payments to Safaricom M-Pesa and Airtel wallets across Kenya.'
  },
  GH: {
    country: 'Ghana',
    currency: 'GHS',
    channels: ['MTN Mobile Money', 'Telecel Cash', 'AirtelTigo Money'],
    fee: '1.5%',
    limits: { min: '$1.00 USD', max: '$500.00 USD' },
    settlement: 'Within 10 mins',
    status: 'Active',
    description: 'Reliable mobile wallet deposits across Ghana major carrier networks.'
  },
  RW: {
    country: 'Rwanda',
    currency: 'RWF',
    channels: ['MTN Mobile Money', 'Airtel Money'],
    fee: '1.5%',
    limits: { min: '$1.00 USD', max: '$500.00 USD' },
    settlement: 'Instant (Under 5 mins)',
    status: 'Active',
    description: 'Direct remittance to Rwandan MTN and Airtel subscribers.'
  },
  UG: {
    country: 'Uganda',
    currency: 'UGX',
    channels: ['MTN Mobile Money', 'Airtel Money'],
    fee: '1.5%',
    limits: { min: '$1.00 USD', max: '$500.00 USD' },
    settlement: 'Instant',
    status: 'Active',
    description: 'Instant payouts supporting MTN and Airtel mobile money numbers.'
  }
};

const SUPPORTED_COUNTRIES = {
  NG: { name: 'Nigeria', flag: '🇳🇬', flagUrl: 'https://flagcdn.com/w80/ng.png', currency: 'NGN' },
  KE: { name: 'Kenya', flag: '🇰🇪', flagUrl: 'https://flagcdn.com/w80/ke.png', currency: 'KES' },
  GH: { name: 'Ghana', flag: '🇬🇭', flagUrl: 'https://flagcdn.com/w80/gh.png', currency: 'GHS' },
  RW: { name: 'Rwanda', flag: '🇷🇼', flagUrl: 'https://flagcdn.com/w80/rw.png', currency: 'RWF' },
  UG: { name: 'Uganda', flag: '🇺🇬', flagUrl: 'https://flagcdn.com/w80/ug.png', currency: 'UGX' }
};

function normalizeCountryCode(countryCode) {
  const code = String(countryCode || 'NG').trim().toUpperCase();
  return SUPPORTED_COUNTRIES[code] ? code : 'NG';
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, storedHash) {
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

function publicUserRow(row) {
  if (!row) return null;
  return {
    email: row.email,
    name: row.name,
    country_code: normalizeCountryCode(row.country_code),
    country: SUPPORTED_COUNTRIES[normalizeCountryCode(row.country_code)]?.name || 'Nigeria',
    flag: SUPPORTED_COUNTRIES[normalizeCountryCode(row.country_code)]?.flag || '🇳🇬',
    flagUrl: SUPPORTED_COUNTRIES[normalizeCountryCode(row.country_code)]?.flagUrl || 'https://flagcdn.com/w80/ng.png',
    currency: SUPPORTED_COUNTRIES[normalizeCountryCode(row.country_code)]?.currency || 'NGN',
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

// ----------------------------------------------------
// 0. AUTH ENDPOINTS (PostgreSQL)
// ----------------------------------------------------

router.post('/auth/register', (req, res) => {
  const db = req.app.get('db');
  const { name, email, password, country_code } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const trimmedName = String(name || '').trim();
  const trimmedPassword = String(password || '');
  const normalizedCountry = normalizeCountryCode(country_code);

  if (!trimmedName || !normalizedEmail || !trimmedPassword) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (trimmedPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  db.get('SELECT email FROM users WHERE email = $1', [normalizedEmail], (lookupErr, existing) => {
    if (lookupErr) {
      console.error('Registration lookup error:', lookupErr.message);
      return res.status(500).json({ error: 'Failed to check existing user' });
    }

    if (existing) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }

    const { salt, hash } = hashPassword(trimmedPassword);

    db.run(
      `INSERT INTO users (email, name, country_code, password_salt, password_hash, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [normalizedEmail, trimmedName, normalizedCountry, salt, hash],
      function (insertErr) {
        if (insertErr) {
          console.error('Registration insert error:', insertErr.message);
          return res.status(500).json({ error: 'Failed to create account' });
        }

        db.get('SELECT email, name, country_code, created_at, updated_at FROM users WHERE email = $1', [normalizedEmail], (userErr, row) => {
          if (userErr) {
            return res.status(500).json({ error: 'Account created, but failed to load profile' });
          }

          res.status(201).json({ success: true, user: publicUserRow(row) });
        });
      }
    );
  });
});

router.post('/auth/login', (req, res) => {
  const db = req.app.get('db');
  const { email, password } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const trimmedPassword = String(password || '');

  if (!normalizedEmail || !trimmedPassword) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = $1', [normalizedEmail], (err, row) => {
    if (err) {
      console.error('Login lookup error:', err.message);
      return res.status(500).json({ error: 'Failed to sign in' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Account not found' });
    }

    try {
      const valid = verifyPassword(trimmedPassword, row.password_salt, row.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      res.json({ success: true, user: publicUserRow(row) });
    } catch (verifyErr) {
      console.error('Password verification error:', verifyErr.message);
      return res.status(500).json({ error: 'Failed to verify password' });
    }
  });
});

router.get('/auth/user/:email', (req, res) => {
  const db = req.app.get('db');
  const email = String(req.params.email || '').trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  db.get('SELECT email, name, country_code, created_at, updated_at FROM users WHERE email = $1', [email], (err, row) => {
    if (err) {
      console.error('Profile lookup error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: publicUserRow(row) });
  });
});

// ----------------------------------------------------
// 1. USER SETTINGS ENDPOINTS (PostgreSQL)
// ----------------------------------------------------

router.get('/user/settings', (req, res) => {
  const db = req.app.get('db');
  db.get('SELECT * FROM user_settings WHERE id = 1', [], (err, row) => {
    if (err) {
      console.error('Database read error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch user settings' });
    }
    res.json(row || { username: 'Guest Developer', country_code: 'NG', base_currency: 'USD', theme: 'dark', bitnob_api_key: '' });
  });
});

router.post('/user/settings', (req, res) => {
  const db = req.app.get('db');
  const { username, country_code, base_currency, theme, bitnob_api_key } = req.body;

  db.run(
    `UPDATE user_settings 
     SET username = $1, country_code = $2, base_currency = $3, theme = $4, bitnob_api_key = $5, updated_at = NOW() 
     WHERE id = 1`,
    [
      username || 'Guest Developer', 
      country_code || 'NG',
      base_currency || 'USD', 
      theme || 'dark', 
      bitnob_api_key || ''
    ],
    function(err) {
      if (err) {
        console.error('Database update error:', err.message);
        return res.status(500).json({ error: 'Failed to save settings' });
      }
      
      // Fetch the updated settings and return it
      db.get('SELECT * FROM user_settings WHERE id = 1', [], (err2, row) => {
        if (err2) {
          return res.status(500).json({ error: 'Failed to retrieve updated settings' });
        }
        res.json({ success: true, settings: row });
      });
    }
  );
});

// ----------------------------------------------------
// 2. COINGECKO MARKET ROUTE (Coinbase Fallback for Rate Limits)
// ----------------------------------------------------
router.get('/market', async (req, res) => {
  try {
    // Attempt fetching from CoinGecko
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,usd-coin&vs_currencies=usd&include_24hr_change=true',
      { timeout: 5000 }
    );
    
    const data = response.data;
    res.json({
      source: 'CoinGecko',
      bitcoin: {
        price: data.bitcoin.usd,
        change24h: data.bitcoin.usd_24h_change
      },
      ethereum: {
        price: data.ethereum.usd,
        change24h: data.ethereum.usd_24h_change
      },
      tether: {
        price: data.tether.usd,
        change24h: data.tether.usd_24h_change
      },
      usdc: {
        price: data['usd-coin'].usd,
        change24h: data['usd-coin'].usd_24h_change
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.warn('CoinGecko failed or rate-limited. Trying Coinbase fallback...');
    try {
      // Coinbase Fallback (highly stable and free)
      const btcRes = await axios.get('https://api.coinbase.com/v2/prices/BTC-USD/spot');
      const ethRes = await axios.get('https://api.coinbase.com/v2/prices/ETH-USD/spot');
      
      res.json({
        source: 'Coinbase (Fallback)',
        bitcoin: {
          price: parseFloat(btcRes.data.data.amount),
          change24h: 0.0 // Coinbase simple ticker doesn't return 24h change directly
        },
        ethereum: {
          price: parseFloat(ethRes.data.data.amount),
          change24h: 0.0
        },
        tether: {
          price: 1.0,
          change24h: 0.0
        },
        usdc: {
          price: 1.0,
          change24h: 0.0
        },
        timestamp: new Date().toISOString()
      });
    } catch (fallbackError) {
      console.error('All market APIs failed. Serving offline mock market data.');
      res.json({
        source: 'Mock Offline Database',
        bitcoin: { price: 67250.0, change24h: 1.25 },
        ethereum: { price: 3480.0, change24h: -0.45 },
        tether: { price: 1.0, change24h: 0.01 },
        usdc: { price: 1.0, change24h: 0.0 },
        timestamp: new Date().toISOString()
      });
    }
  }
});

// ----------------------------------------------------
// 3. MEMPOOL.SPACE BLOCKCHAIN ROUTE
// ----------------------------------------------------
router.get('/mempool', async (req, res) => {
  try {
    const feesPromise = axios.get('https://mempool.space/api/v1/fees/recommended', { timeout: 4000 });
    const heightPromise = axios.get('https://mempool.space/api/blocks/tip/height', { timeout: 4000 });
    
    const [feesRes, heightRes] = await Promise.all([feesPromise, heightPromise]);
    
    res.json({
      recommendedFees: feesRes.data,
      blockHeight: heightRes.data,
      congestion: feesRes.data.fastestFee > 50 ? 'High' : feesRes.data.fastestFee > 25 ? 'Medium' : 'Low',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Mempool.space fetch failed:', error.message);
    // Serve fallback network data
    res.json({
      source: 'Mock Offline Network Database',
      recommendedFees: {
        fastestFee: 15,
        halfHourFee: 12,
        hourFee: 10,
        economyFee: 5,
        minimumFee: 2
      },
      blockHeight: 848329,
      congestion: 'Low',
      timestamp: new Date().toISOString()
    });
  }
});

// ----------------------------------------------------
// 4. EXCHANGE RATE API ROUTE (USD basis)
// ----------------------------------------------------
router.get('/rates', async (req, res) => {
  try {
    const response = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 4000 });
    const rates = response.data.rates;
    
    res.json({
      base: 'USD',
      rates: {
        NGN: rates.NGN || 1510.0,
        KES: rates.KES || 131.0,
        GHS: rates.GHS || 15.2,
        RWF: rates.RWF || 1315.0,
        UGX: rates.UGX || 3720.0,
        EUR: rates.EUR,
        GBP: rates.GBP
      },
      updated: response.data.time_last_update_utc,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('ExchangeRate-API failed:', error.message);
    res.json({
      source: 'Mock Offline Exchange Database',
      base: 'USD',
      rates: {
        NGN: 1515.0,
        KES: 130.5,
        GHS: 15.1,
        RWF: 1310.0,
        UGX: 3715.0,
        EUR: 0.93,
        GBP: 0.79
      },
      updated: 'Offline standard rates',
      timestamp: new Date().toISOString()
    });
  }
});

// ----------------------------------------------------
// 5. REST COUNTRIES PROXY (Bitnob supported countries only)
// ----------------------------------------------------
router.get('/countries', async (req, res) => {
  try {
    const response = await axios.get('https://restcountries.com/v3.1/alpha?codes=ng,ke,gh,rw,ug', { timeout: 5000 });
    const countries = response.data.map(c => ({
      code: c.cca2, // NG, KE, etc.
      name: c.name.common,
      fullName: c.name.official,
      flag: c.flag, // Emoji flag
      flagUrl: c.flags?.svg || c.flags?.png,
      currency: Object.keys(c.currencies || {})[0],
      dialCode: `${c.idd?.root || ''}${(c.idd?.suffixes || [])[0] || ''}`
    }));
    
    res.json(countries);
  } catch (error) {
    console.error('REST Countries API failed:', error.message);
    // Serve offline static countries list
    res.json([
      { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN', dialCode: '+234' },
      { code: 'KE', name: 'Kenya', flag: '🇰🇪', currency: 'KES', dialCode: '+254' },
      { code: 'GH', name: 'Ghana', flag: '🇬🇭', currency: 'GHS', dialCode: '+233' },
      { code: 'RW', name: 'Rwanda', flag: '🇷🇼', currency: 'RWF', dialCode: '+250' },
      { code: 'UG', name: 'Uganda', flag: '🇺🇬', currency: 'UGX', dialCode: '+256' }
    ]);
  }
});

// ----------------------------------------------------
// 6. BITNOB CAPABILITIES PROXY
// ----------------------------------------------------
router.get('/bitnob/payout-rules/:countryCode', async (req, res) => {
  const countryCode = req.params.countryCode.toUpperCase();
  const db = req.app.get('db');

  // Check if country code is supported in our database mapping
  if (!MOCK_BITNOB_CAPABILITIES[countryCode]) {
    return res.status(400).json({ error: 'Country not supported by Bitnob rails' });
  }

  // Check database first to see if an API key has been saved
  db.get('SELECT bitnob_api_key FROM user_settings WHERE id = 1', [], async (dbErr, row) => {
    // Determine active API Key (checks SQLite settings first, fallback to .env)
    const apiKey = (row && row.bitnob_api_key) || process.env.BITNOB_API_KEY;
    const isMockMode = !apiKey;

    if (isMockMode) {
      // Respond with our detailed mock capability database
      return res.json({
        mode: 'Mock Simulator',
        capability: MOCK_BITNOB_CAPABILITIES[countryCode]
      });
    }

    try {
      // Bitnob Sandbox base URL
      const bitnobUrl = process.env.BITNOB_ENV === 'production' 
        ? 'https://api.bitnob.com/api/v1' 
        : 'https://sandboxapi.bitnob.co/api/v1';

      // Call Bitnob Sandbox Payout rules API (e.g. corridors info)
      // Note: Real Bitnob integration requires headers signatures or authorization tokens.
      // Standard Authorization format:
      const response = await axios.get(`${bitnobUrl}/payouts/corridors`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 4000
      });

      // Filter/Format Bitnob corridors list to match requested country
      // Usually Bitnob returns a list of all corridors.
      const rawCorridors = response.data;
      
      // Send the real data combined with our metadata, or if the API doesn't give this exact structure, format it.
      res.json({
        mode: 'Live Sandbox',
        capability: MOCK_BITNOB_CAPABILITIES[countryCode], // Combine static explanation metadata
        rawBitnobCorridors: rawCorridors.data || rawCorridors
      });
    } catch (apiError) {
      console.warn(`Bitnob Sandbox API call failed: ${apiError.message}. Falling back to mock details...`);
      res.json({
        mode: 'Mock Simulator (Live Fallback)',
        capability: MOCK_BITNOB_CAPABILITIES[countryCode],
        errorDetail: apiError.response?.data?.message || apiError.message
      });
    }
  });
});

module.exports = router;
