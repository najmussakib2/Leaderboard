export const mediaIcons = {
    facebook: "https://res.cloudinary.com/dozenwhei/image/upload/v1746418054/facebook.png",
    instrgram: "https://res.cloudinary.com/dozenwhei/image/upload/v1746417867/instagram.png",
    twitter: "https://res.cloudinary.com/dozenwhei/image/upload/v1746418019/twitter-x.png",
    linkedin: "https://res.cloudinary.com/dozenwhei/image/upload/v1746417986/linkedin.png"
}

export const paymentSuccess = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Success</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background-color: #f0fdf4;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
    .icon {
      font-size: 60px;
      color: #10b981;
    }
    h1 {
      color: #10b981;
      margin-top: 10px;
    }
    p {
      font-size: 1.1rem;
      color: #4b5563;
    }
    a {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #10b981;
      color: white;
      text-decoration: none;
      border-radius: 5px;
    }
    a:hover {
      background-color: #059669;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">✅</div>
    <h1>Payment Successful</h1>
    <p>Thank you for your purchase. Your payment has been processed successfully.</p>
    <a href="/">Return to Home</a>
  </div>
</body>
</html>
`