<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

require __DIR__ . "/db.php";

$action = $_GET["action"] ?? "";

try {
    if ($action === "state") {
        echo json_encode(["success" => true, "data" => getState($pdo)]);
        exit;
    }

    if ($action === "saveState" && $_SERVER["REQUEST_METHOD"] === "POST") {
        $payload = json_decode(file_get_contents("php://input"), true);
        if (!$payload) {
            throw new Exception("Invalid JSON payload.");
        }

        saveState($pdo, $payload);
        echo json_encode(["success" => true, "message" => "State saved to SQL database."]);
        exit;
    }

    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Unknown API action."]);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $error->getMessage()]);
}

function getState(PDO $pdo): array
{
    $users = $pdo->query("SELECT id, name, role, email, department, phone, bio, avatar, status, joined_on AS joinedOn FROM users ORDER BY id")->fetchAll();
    $events = $pdo->query("SELECT id, name, category, event_date AS date, event_time AS time, venue, capacity, description, status, organizer_name AS organizer, approved_by AS approvedBy, image FROM events ORDER BY event_date, event_time")->fetchAll();

    $participantRows = $pdo->query("SELECT event_id, participant_name, attendance_status FROM event_participants ORDER BY id")->fetchAll();
    $announcementRows = $pdo->query("SELECT event_id, message FROM announcements ORDER BY id")->fetchAll();

    foreach ($events as &$event) {
        $event["participants"] = [];
        $event["announcements"] = [];
        $event["attendance"] = [];

        foreach ($participantRows as $participant) {
            if ((int) $participant["event_id"] === (int) $event["id"]) {
                $event["participants"][] = $participant["participant_name"];
                $event["attendance"][$participant["participant_name"]] = $participant["attendance_status"] ?: "registered";
            }
        }

        foreach ($announcementRows as $announcement) {
            if ((int) $announcement["event_id"] === (int) $event["id"]) {
                $event["announcements"][] = $announcement["message"];
            }
        }
    }

    $activities = array_column(
        $pdo->query("SELECT message FROM activities ORDER BY id DESC")->fetchAll(),
        "message"
    );

    $notifications = [];
    $notificationRows = $pdo->query("SELECT user_name, message FROM notifications ORDER BY id DESC")->fetchAll();
    foreach ($notificationRows as $notification) {
        $notifications[$notification["user_name"]][] = $notification["message"];
    }

    $auditTrail = $pdo->query("SELECT id, actor, action, module, action_time AS time FROM audit_trail ORDER BY id DESC")->fetchAll();

    return [
        "users" => $users,
        "events" => $events,
        "activities" => $activities,
        "notifications" => $notifications,
        "auditTrail" => $auditTrail
    ];
}

function saveState(PDO $pdo, array $state): void
{
    $pdo->beginTransaction();

    $pdo->exec("DELETE FROM notifications");
    $pdo->exec("DELETE FROM activities");
    $pdo->exec("DELETE FROM announcements");
    $pdo->exec("DELETE FROM event_participants");
    $pdo->exec("DELETE FROM events");
    $pdo->exec("DELETE FROM users");
    $pdo->exec("DELETE FROM audit_trail");

    $insertUser = $pdo->prepare(
        "INSERT INTO users (id, name, role, email, department, phone, bio, avatar, status, joined_on)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    foreach ($state["users"] ?? [] as $user) {
        $insertUser->execute([
            $user["id"],
            $user["name"],
            $user["role"],
            $user["email"],
            $user["department"] ?? "General",
            $user["phone"] ?? "",
            $user["bio"] ?? "",
            $user["avatar"] ?? "",
            $user["status"] ?? "active",
            $user["joinedOn"] ?? date("Y-m-d")
        ]);
    }

    $insertEvent = $pdo->prepare(
        "INSERT INTO events (id, name, category, event_date, event_time, venue, capacity, description, status, organizer_name, approved_by, image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $insertParticipant = $pdo->prepare("INSERT INTO event_participants (event_id, participant_name, attendance_status) VALUES (?, ?, ?)");
    $insertAnnouncement = $pdo->prepare("INSERT INTO announcements (event_id, message) VALUES (?, ?)");

    foreach ($state["events"] ?? [] as $event) {
        $insertEvent->execute([
            $event["id"],
            $event["name"],
            $event["category"] ?? "General",
            $event["date"],
            $event["time"],
            $event["venue"],
            $event["capacity"] ?? 100,
            $event["description"],
            $event["status"],
            $event["organizer"],
            $event["approvedBy"] ?? "",
            $event["image"] ?? ""
        ]);

        foreach ($event["participants"] ?? [] as $participant) {
            $insertParticipant->execute([$event["id"], $participant, $event["attendance"][$participant] ?? "registered"]);
        }

        foreach ($event["announcements"] ?? [] as $announcement) {
            $insertAnnouncement->execute([$event["id"], $announcement]);
        }
    }

    $insertActivity = $pdo->prepare("INSERT INTO activities (message) VALUES (?)");
    foreach ($state["activities"] ?? [] as $activity) {
        $insertActivity->execute([$activity]);
    }

    $insertNotification = $pdo->prepare("INSERT INTO notifications (user_name, message) VALUES (?, ?)");
    foreach ($state["notifications"] ?? [] as $userName => $messages) {
        foreach ($messages as $message) {
            $insertNotification->execute([$userName, $message]);
        }
    }

    $insertAudit = $pdo->prepare("INSERT INTO audit_trail (id, actor, action, module, action_time) VALUES (?, ?, ?, ?, ?)");
    foreach ($state["auditTrail"] ?? [] as $audit) {
        $insertAudit->execute([
            $audit["id"],
            $audit["actor"],
            $audit["action"],
            $audit["module"],
            $audit["time"]
        ]);
    }

    $pdo->commit();
}
