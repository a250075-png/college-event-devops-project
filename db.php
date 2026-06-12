<?php
// MySQL connection for AJ Square. Update these values if your XAMPP/WAMP credentials differ.
$host = "localhost";
$database = "aj_square_events";
$username = "root";
$password = "";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$database;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed.",
        "error" => $error->getMessage()
    ]);
    exit;
}
