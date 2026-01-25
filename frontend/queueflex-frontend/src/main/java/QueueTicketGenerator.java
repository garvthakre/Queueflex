import java.io.*;
import java.net.*;
import java.text.SimpleDateFormat;
import java.util.*;
import org.json.*;

/**
 * Standalone Core Java Queue Ticket Generator
 * Generates printable text-based tickets for queue bookings
 * No JavaFX dependencies - pure console application
 */
public class QueueTicketGenerator {
    
    private static final String AUTH_URL = "http://localhost:3000";
    private static final String QUEUE_URL = "http://localhost:4000";
    private static String token;
    private static boolean isAdmin;
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        printBanner();
        
        // Login first
        if (!login(scanner)) {
            System.out.println("\n❌ Login failed. Exiting...");
            return;
        }
        
        System.out.println("\n✓ Login successful!");
        
        while (true) {
            printMenu();
            System.out.print("Enter your choice: ");
            String choice = scanner.nextLine().trim();
            
            switch (choice) {
                case "1":
                    printMyQueueTickets(scanner);
                    break;
                case "2":
                    printSpecificTicket(scanner);
                    break;
                case "3":
                    printAllTickets(scanner);
                    break;
                case "4":
                    exportTicketToFile(scanner);
                    break;
                case "5":
                    System.out.println("\n👋 Thank you for using QueueFlex Ticket Generator!");
                    return;
                default:
                    System.out.println("\n❌ Invalid choice. Please try again.");
            }
            
            System.out.println("\nPress Enter to continue...");
            scanner.nextLine();
        }
    }
    
    private static void printBanner() {
        System.out.println("╔════════════════════════════════════════════════════╗");
        System.out.println("║                                                    ║");
        System.out.println("║         🎫  QUEUEFLEX TICKET GENERATOR  🎫         ║");
        System.out.println("║                                                    ║");
        System.out.println("║          Print Your Queue Booking Tickets          ║");
        System.out.println("║                                                    ║");
        System.out.println("╚════════════════════════════════════════════════════╝");
        System.out.println();
    }
    
    private static void printMenu() {
        System.out.println("\n┌────────────────────────────────────────┐");
        System.out.println("│           MAIN MENU                    │");
        System.out.println("├────────────────────────────────────────┤");
        System.out.println("│  1. Print All My Queue Tickets         │");
        System.out.println("│  2. Print Specific Ticket by ID        │");
        System.out.println("│  3. Print All Tickets (Admin Only)     │");
        System.out.println("│  4. Export Ticket to File              │");
        System.out.println("│  5. Exit                               │");
        System.out.println("└────────────────────────────────────────┘");
    }
    
    private static boolean login(Scanner scanner) {
        System.out.println("📧 LOGIN TO QUEUEFLEX");
        System.out.println("─────────────────────");
        System.out.print("Email: ");
        String email = scanner.nextLine().trim();
        
        System.out.print("Password: ");
        String password = scanner.nextLine().trim();
        
        try {
            URL url = new URL(AUTH_URL + "/login");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            
            JSONObject json = new JSONObject();
            json.put("email", email);
            json.put("password", password);
            
            try (OutputStream os = conn.getOutputStream()) {
                os.write(json.toString().getBytes());
                os.flush();
            }
            
            String response = readResponse(conn);
            JSONObject jsonResponse = new JSONObject(response);
            
            if (jsonResponse.has("token")) {
                token = jsonResponse.getString("token");
                isAdmin = jsonResponse.getBoolean("admin");
                return true;
            }
            return false;
            
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return false;
        }
    }
    
    private static void printMyQueueTickets(Scanner scanner) {
        System.out.println("\n📋 YOUR QUEUE TICKETS");
        System.out.println("═════════════════════════════════════════════════════");
        
        try {
            String response = getMyQueues();
            JSONArray queues = new JSONArray(response);
            
            if (queues.length() == 0) {
                System.out.println("\n❌ No queue bookings found.");
                return;
            }
            
            for (int i = 0; i < queues.length(); i++) {
                JSONObject queue = queues.getJSONObject(i);
                printTicket(queue);
                System.out.println();
            }
            
            System.out.println("Total tickets: " + queues.length());
            
        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
        }
    }
    
    private static void printSpecificTicket(Scanner scanner) {
        System.out.println("\n🎫 PRINT SPECIFIC TICKET");
        System.out.println("─────────────────────────");
        System.out.print("Enter Queue ID: ");
        String queueId = scanner.nextLine().trim();
        
        try {
            String response = getQueueById(queueId);
            JSONObject queue = new JSONObject(response);
            
            System.out.println("\n═════════════════════════════════════════════════════");
            printTicket(queue);
            
        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
        }
    }
    
    private static void printAllTickets(Scanner scanner) {
        if (!isAdmin) {
            System.out.println("\n❌ Access Denied: Admin privileges required.");
            return;
        }
        
        System.out.println("\n📋 ALL QUEUE TICKETS (ADMIN VIEW)");
        System.out.println("═════════════════════════════════════════════════════");
        
        try {
            String response = getAllQueues();
            JSONArray queues = new JSONArray(response);
            
            if (queues.length() == 0) {
                System.out.println("\n❌ No queue bookings found in the system.");
                return;
            }
            
            for (int i = 0; i < queues.length(); i++) {
                JSONObject queue = queues.getJSONObject(i);
                printTicket(queue);
                System.out.println();
            }
            
            System.out.println("Total tickets in system: " + queues.length());
            
        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
        }
    }
    
    private static void exportTicketToFile(Scanner scanner) {
        System.out.println("\n💾 EXPORT TICKET TO FILE");
        System.out.println("─────────────────────────");
        System.out.print("Enter Queue ID: ");
        String queueId = scanner.nextLine().trim();
        
        try {
            String response = getQueueById(queueId);
            JSONObject queue = new JSONObject(response);
            
            String filename = "ticket_" + queueId.substring(0, 8) + ".txt";
            
            try (PrintWriter writer = new PrintWriter(new FileWriter(filename))) {
                writer.println("╔════════════════════════════════════════════════════╗");
                writer.println("║                                                    ║");
                writer.println("║              🎫  QUEUE BOOKING TICKET  🎫          ║");
                writer.println("║                                                    ║");
                writer.println("╚════════════════════════════════════════════════════╝");
                writer.println();
                
                writeTicketContent(writer, queue);
                
                writer.println("\n╔════════════════════════════════════════════════════╗");
                writer.println("║  Thank you for using QueueFlex!                    ║");
                writer.println("║  Please arrive 10 minutes before your turn         ║");
                writer.println("╚════════════════════════════════════════════════════╝");
            }
            
            System.out.println("\n✓ Ticket exported successfully!");
            System.out.println("📄 File: " + filename);
            System.out.println("📁 Location: " + new File(filename).getAbsolutePath());
            
        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
        }
    }
    
    private static void printTicket(JSONObject queue) {
        System.out.println("╔════════════════════════════════════════════════════╗");
        System.out.println("║                                                    ║");
        System.out.println("║              🎫  QUEUE BOOKING TICKET  🎫          ║");
        System.out.println("║                                                    ║");
        System.out.println("╚════════════════════════════════════════════════════╝");
        System.out.println();
        
        printTicketContent(queue);
        
        System.out.println("\n╔════════════════════════════════════════════════════╗");
        System.out.println("║  Thank you for using QueueFlex!                    ║");
        System.out.println("║  Please arrive 10 minutes before your turn         ║");
        System.out.println("╚════════════════════════════════════════════════════╝");
    }
    
    private static void printTicketContent(JSONObject queue) {
        String queueId = queue.optString("queue_id", "N/A");
        String name = queue.optString("name", "N/A");
        String serviceType = queue.optString("serviceType", "General");
        String purpose = queue.optString("purpose", "N/A");
        int position = queue.optInt("position", 0);
        String status = queue.optString("status", "waiting");
        int userId = queue.optInt("user_id", 0);
        
        String timestamp = new SimpleDateFormat("dd MMM yyyy, hh:mm a").format(new Date());
        
        System.out.println("  ┌──────────────────────────────────────────────┐");
        System.out.println("  │  SERVICE DETAILS                             │");
        System.out.println("  ├──────────────────────────────────────────────┤");
        System.out.printf("  │  Service: %-35s │%n", truncate(serviceType, 35));
        System.out.printf("  │  Customer: %-34s │%n", truncate(name, 34));
        System.out.printf("  │  Purpose: %-35s │%n", truncate(purpose, 35));
        System.out.println("  └──────────────────────────────────────────────┘");
        System.out.println();
        
        System.out.println("  ┌──────────────────────────────────────────────┐");
        System.out.println("  │  QUEUE INFORMATION                           │");
        System.out.println("  ├──────────────────────────────────────────────┤");
        System.out.printf("  │  Queue Position: #%-26d │%n", position);
        System.out.printf("  │  Status: %-35s │%n", getStatusDisplay(status));
        System.out.printf("  │  User ID: #%-33d │%n", userId);
        System.out.println("  └──────────────────────────────────────────────┘");
        System.out.println();
        
        System.out.println("  ┌──────────────────────────────────────────────┐");
        System.out.println("  │  TICKET DETAILS                              │");
        System.out.println("  ├──────────────────────────────────────────────┤");
        System.out.printf("  │  Ticket ID: %-33s │%n", truncate(queueId, 33));
        System.out.printf("  │  Generated: %-33s │%n", timestamp);
        System.out.println("  └──────────────────────────────────────────────┘");
        
        if (status.equalsIgnoreCase("waiting")) {
            System.out.println();
            System.out.println("  ╔══════════════════════════════════════════════╗");
            System.out.println("  ║                                              ║");
            System.out.println("  ║   ⚠️  PLEASE WAIT FOR YOUR TURN  ⚠️          ║");
            System.out.println("  ║                                              ║");
            System.out.println("  ║   Your position in queue: #" + position + "                 ║");
            System.out.println("  ║                                              ║");
            System.out.println("  ╚══════════════════════════════════════════════╝");
        } else if (status.equalsIgnoreCase("in-progress")) {
            System.out.println();
            System.out.println("  ╔══════════════════════════════════════════════╗");
            System.out.println("  ║                                              ║");
            System.out.println("  ║   ✅  IT'S YOUR TURN NOW!  ✅                ║");
            System.out.println("  ║                                              ║");
            System.out.println("  ║   Please proceed to the service counter      ║");
            System.out.println("  ║                                              ║");
            System.out.println("  ╚══════════════════════════════════════════════╝");
        } else if (status.equalsIgnoreCase("completed")) {
            System.out.println();
            System.out.println("  ╔══════════════════════════════════════════════╗");
            System.out.println("  ║                                              ║");
            System.out.println("  ║   ✓  SERVICE COMPLETED  ✓                   ║");
            System.out.println("  ║                                              ║");
            System.out.println("  ║   Thank you for using our service!           ║");
            System.out.println("  ║                                              ║");
            System.out.println("  ╚══════════════════════════════════════════════╝");
        }
    }
    
    private static void writeTicketContent(PrintWriter writer, JSONObject queue) {
        String queueId = queue.optString("queue_id", "N/A");
        String name = queue.optString("name", "N/A");
        String serviceType = queue.optString("serviceType", "General");
        String purpose = queue.optString("purpose", "N/A");
        int position = queue.optInt("position", 0);
        String status = queue.optString("status", "waiting");
        int userId = queue.optInt("user_id", 0);
        
        String timestamp = new SimpleDateFormat("dd MMM yyyy, hh:mm a").format(new Date());
        
        writer.println("  ┌──────────────────────────────────────────────┐");
        writer.println("  │  SERVICE DETAILS                             │");
        writer.println("  ├──────────────────────────────────────────────┤");
        writer.printf("  │  Service: %-35s │%n", truncate(serviceType, 35));
        writer.printf("  │  Customer: %-34s │%n", truncate(name, 34));
        writer.printf("  │  Purpose: %-35s │%n", truncate(purpose, 35));
        writer.println("  └──────────────────────────────────────────────┘");
        writer.println();
        
        writer.println("  ┌──────────────────────────────────────────────┐");
        writer.println("  │  QUEUE INFORMATION                           │");
        writer.println("  ├──────────────────────────────────────────────┤");
        writer.printf("  │  Queue Position: #%-26d │%n", position);
        writer.printf("  │  Status: %-35s │%n", getStatusDisplay(status));
        writer.printf("  │  User ID: #%-33d │%n", userId);
        writer.println("  └──────────────────────────────────────────────┘");
        writer.println();
        
        writer.println("  ┌──────────────────────────────────────────────┐");
        writer.println("  │  TICKET DETAILS                              │");
        writer.println("  ├──────────────────────────────────────────────┤");
        writer.printf("  │  Ticket ID: %-33s │%n", truncate(queueId, 33));
        writer.printf("  │  Generated: %-33s │%n", timestamp);
        writer.println("  └──────────────────────────────────────────────┘");
    }
    
    private static String getStatusDisplay(String status) {
        switch (status.toLowerCase()) {
            case "waiting": return "⏳ WAITING";
            case "in-progress": return "▶️ IN PROGRESS";
            case "completed": return "✓ COMPLETED";
            case "cancelled": return "✗ CANCELLED";
            default: return status.toUpperCase();
        }
    }
    
    private static String truncate(String str, int maxLength) {
        if (str == null) return "";
        if (str.length() <= maxLength) return str;
        return str.substring(0, maxLength - 3) + "...";
    }
    
    // API Methods
    
    private static String getMyQueues() throws Exception {
        URL url = new URL(QUEUE_URL + "/queue/get");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Authorization", "Bearer " + token);
        return readResponse(conn);
    }
    
    private static String getQueueById(String queueId) throws Exception {
        URL url = new URL(QUEUE_URL + "/queue/get/" + queueId);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Authorization", "Bearer " + token);
        return readResponse(conn);
    }
    
    private static String getAllQueues() throws Exception {
        URL url = new URL("http://localhost:5000/admin/queue/all");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Authorization", "Bearer " + token);
        return readResponse(conn);
    }
    
    private static String readResponse(HttpURLConnection conn) throws Exception {
        int responseCode = conn.getResponseCode();
        InputStream is = (responseCode < 400) ? conn.getInputStream() : conn.getErrorStream();
        
        BufferedReader br = new BufferedReader(new InputStreamReader(is));
        StringBuilder response = new StringBuilder();
        String line;
        
        while ((line = br.readLine()) != null) {
            response.append(line);
        }
        br.close();
        
        if (responseCode >= 400) {
            throw new Exception("HTTP Error " + responseCode + ": " + response.toString());
        }
        
        return response.toString();
    }
}