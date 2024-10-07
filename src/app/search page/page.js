<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Search Page</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f0f0f0;
    }
    .search-container {
      text-align: center;
    }
    .search-box {
      width: 300px;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .search-button {
      padding: 10px 20px;
      margin-top: 10px;
      border: none;
      border-radius: 4px;
      background-color: #007BFF;
      color: white;
      cursor: pointer;
    }
    .search-button:hover {
      background-color: #0056b3;
    }
  </style>
</head>
<body>
  <div class="search-container">
    <h1>Search Page</h1>
    <input type="text" class="search-box" placeholder="Search...">
    <button class="search-button">Search</button>
  </div>
</body>
</html>