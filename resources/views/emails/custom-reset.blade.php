<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #121212;
            color: #f1f1f1;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: auto;
            background: #1e1e1e;
            padding: 40px 30px;
            border-radius: 12px;
            box-shadow: 0 0 15px rgba(0,0,0,0.4);
            text-align: center;
        }
        .logo {
            width: 200px;
            margin: 0 auto 30px auto;
            display: block;
        }
        h2 {
            margin-top: 0;
            font-size: 24px;
            color: #ffffff;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            color: #dddddd;
        }
        .btn {
            background: #28a745;
            color: white;
            padding: 14px 25px;
            font-size: 16px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            margin-top: 20px;
        }
        .footer {
            margin-top: 40px;
            font-size: 14px;
            color: #888888;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="https://i.imgur.com/zStiXCo.png" alt="Country Inspector Logo" class="logo">

        <h2>Hello {{ $user->name ?? 'user' }},</h2>

        <p>We received a request to reset your password.</p>

        <p>Click the button below to set a new password:</p>

        <a href="{{ $url }}" class="btn">Reset Password</a>

        <p>If you didn’t request this, you can safely ignore this email.</p>

        <div class="footer">
            <p>Thank you,<br><strong>The Country Inspector Team</strong></p>
        </div>
    </div>
</body>
</html>
