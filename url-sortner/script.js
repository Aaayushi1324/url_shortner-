// const shortenBtn = document.getElementById("shorten-btn");
// const longUrlInputradius: 5px;
//     border: none;
//     background: #fff;
//     color: #4e54c8;
//     font-size: 1. = document.getElementById("long-url");
// const shortUrlContainer = document.getElementById("short-url-container");
// const shortUrl = document.getElementById("short-url");
// 2rem;
//     cursor: pointer;
//   }
//   #short-url-container {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//   }
//   #short-url {
//     color: #fff;
//     font-size: 1.2rem;
//     margin-right: 20px;
//   }
//   .credit {
//     position: fixed;
//     bottom: 20px;
//     left: 20px;
//     font-size: 0.8rem;
//     color: #fff;
//   }
//   .credit a {
//     color: #fff;
//     text-decoration: none;
//   }

// const shortenBtn = document.getElementById("shorten-btn");
// const longUrlInput = document.getElementById("long-url");
// const shortUrlContainer = document.getElementById("short-url-container");
// const shortUrl = document.getElementById("short-url");
// const copyBtn = document.getElementById("copy-btn");

// const baseUrl = "https://api.shrtco.de/v2/shorten?url=";

// shortenBtn.addEventListener("click", async () => {
//   const longUrl = longUrlInput.value;
//   if (!longUrl) {
//     alert("Please enter a URL");
//     return;
//   }

//   try {
//     const response = await fetch(baseUrl + encodeURIComponent(longUrl));
//     const data = await response.json();
//     if (data.ok) {
//       shortUrl.textContent = data.result.full_short_link;
//       shortUrlContainer.style.display = "block";
//     } else {
//       alert("Error: " + data.error);
//     }
//   } catch (error) {
//     console.error(error);
//     alert("Error: Unable to shorten URL");
//   }
// });

// copyBtn.addEventListener("click", () => {
//   shortUrl.select();
//   document.execCommand("copy");
// });


const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Connect to MongoDB
mongoose.connect('mongodb://localhost/url-shortener', { useNewUrlParser: true, useUnifiedTopology: true });

// Define the URL schema
const UrlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

// Create the URL model
const Url = mongoose.model('Url', UrlSchema);

// Generate a unique short URL
function generateShortUrl() {
  return Math.floor(Math.random() * 1000000);
}

// POST route to create a new short URL
app.post('/api/shorturl', async (req, res) => {
  const originalUrl = req.body.url;
  const isRepeateUrl = await Url.findOne({ original_url: originalUrl });

  if (isRepeateUrl) {
    return res.json({
      original_url: isRepeateUrl.original_url,
      short_url: isRepeateUrl.short_url
    });
  }

  const shortUrl = generateShortUrl();
  const newUrl = new Url({ original_url: originalUrl, short_url: shortUrl });
  await newUrl.save();

  res.json({original_url: originalUrl,
    short_url: shortUrl
  });
});

// GET route to redirect to the original URL
app.get('/:shortUrl', async (req, res) => {
  const shortUrl = req.params.shortUrl;
  const url = await Url.findOne({ short_url: shortUrl });

  if (!url) {
    return res.status(404).send('URL not found');
  }

  res.redirect(url.original_url);
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});