import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.*;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * QueueFlex Health Monitor Service
 * Monitors all microservices and queue status in real-time
 */
public class HealthMonitorService {
    
    // Service URLs
    private static final String AUTH_SERVICE = "http://localhost:3000";
    private static final String QUEUE_SERVICE = "http://localhost:4000";
    private static final String ADMIN_SERVICE = "http://localhost:5000";
    
    // Monitoring configuration
    private static final int CHECK_INTERVAL_SECONDS = 30;
    private static final int ALERT_THRESHOLD = 3; // Alert after 3 consecutive failures
    
    // Test credentials (create a test user first)
    private static String authToken = null;
    
    private static int authServiceFailures = 0;
    private static int queueServiceFailures = 0;
    private static int adminServiceFailures = 0;

    public static void main(String[] args) {
     
        System.out.println("  QueueFlex Health Monitor Service v1.0");
       
        
        // Try to authenticate
        authenticateMonitor();
        
        // Create scheduled executor
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        
        // Schedule health checks every 30 seconds
        scheduler.scheduleAtFixedRate(() -> {
            try {
                performHealthCheck();
            } catch (Exception e) {
                logError("Health check failed: " + e.getMessage());
            }
        }, 0, CHECK_INTERVAL_SECONDS, TimeUnit.SECONDS);
        
        // Keep the service running
        System.out.println("✓ Monitor started successfully");
        System.out.println("✓ Health checks running every " + CHECK_INTERVAL_SECONDS + " seconds");
        System.out.println("✓ Press Ctrl+C to stop\n");
        
        // Add shutdown hook
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("\n\n Shutting down Health Monitor Service...");
            scheduler.shutdown();
            System.out.println("✓ Service stopped gracefully");
        }));
    }
    
    private static void authenticateMonitor() {
        System.out.println(" Attempting to authenticate monitor...");
        try {
            // Try to login with test credentials
            JSONObject loginData = new JSONObject();
            loginData.put("email", "monitor@queueflex.com");
            loginData.put("password", "monitor123");
            
            String response = makePostRequest(AUTH_SERVICE + "/login", loginData.toString());
            JSONObject jsonResponse = new JSONObject(response);
            
            if (jsonResponse.has("token")) {
                authToken = jsonResponse.getString("token");
                System.out.println(" Authentication successful\n");
            } else {
                System.out.println(" Authentication failed - running in limited mode");
                System.out.println("  Create user: monitor@queueflex.com / monitor123\n");
            }
        } catch (Exception e) {
            System.out.println(" Could not authenticate - running in limited mode\n");
        }
    }
    
    private static void performHealthCheck() {
        String timestamp = getCurrentTimestamp();

        System.out.println(" Health Check @ " + timestamp);
 
        
        // Check all services
        boolean authOk = checkAuthService();
        boolean queueOk = checkQueueService();
        boolean adminOk = checkAdminService();
        
        // Check queue metrics if authenticated
        if (authToken != null && queueOk) {
            checkQueueMetrics();
        }
        
        // Overall status
        System.out.println("\n Overall Status:");
        if (authOk && queueOk && adminOk) {
            System.out.println("    All services operational");
        } else {
            System.out.println("     Some services are down!");
        }
        System.out.println();
    }
    
    private static boolean checkAuthService() {
        System.out.print(" Auth Service (Port 3000)........... ");
        try {
            // Simple connectivity check
            URL url = new URL(AUTH_SERVICE + "/login");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setConnectTimeout(3000);
            conn.setDoOutput(true);
            conn.getOutputStream().write("{}".getBytes());
            
            int responseCode = conn.getResponseCode();
            conn.disconnect();
            
            // Any response means service is up (even 400/403)
            if (responseCode > 0) {
                authServiceFailures = 0;
                System.out.println("UP");
                return true;
            }
        } catch (Exception e) {
            authServiceFailures++;
            System.out.println(" DOWN");
            if (authServiceFailures >= ALERT_THRESHOLD) {
                sendAlert("Auth Service", authServiceFailures);
            }
        }
        return false;
    }
    
    private static boolean checkQueueService() {
        System.out.print(" Queue Service (Port 4000).......... ");
        try {
            if (authToken == null) {
                // Try basic connectivity without auth
                URL url = new URL(QUEUE_SERVICE + "/services");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(3000);
                int responseCode = conn.getResponseCode();
                conn.disconnect();
                
                if (responseCode == 401) { // Expecting 401 without token
                    queueServiceFailures = 0;
                    System.out.println("UP (no auth)");
                    return true;
                }
            } else {
                // Full check with auth
                String response = makeGetRequest(QUEUE_SERVICE + "/services");
                if (response != null) {
                    queueServiceFailures = 0;
                    System.out.println(" UP");
                    return true;
                }
            }
        } catch (Exception e) {
            queueServiceFailures++;
            System.out.println(" DOWN");
            if (queueServiceFailures >= ALERT_THRESHOLD) {
                sendAlert("Queue Service", queueServiceFailures);
            }
        }
        return false;
    }
    
    private static boolean checkAdminService() {
        System.out.print(" Admin Service (Port 5000).......... ");
        try {
            if (authToken == null) {
                URL url = new URL(ADMIN_SERVICE + "/services");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(3000);
                int responseCode = conn.getResponseCode();
                conn.disconnect();
                
                if (responseCode == 401) {
                    adminServiceFailures = 0;
                    System.out.println(" UP (no auth)");
                    return true;
                }
            } else {
                String response = makeGetRequest(ADMIN_SERVICE + "/services");
                if (response != null) {
                    adminServiceFailures = 0;
                    System.out.println(" UP");
                    return true;
                }
            }
        } catch (Exception e) {
            adminServiceFailures++;
            System.out.println(" DOWN");
            if (adminServiceFailures >= ALERT_THRESHOLD) {
                sendAlert("Admin Service", adminServiceFailures);
            }
        }
        return false;
    }
    
    private static void checkQueueMetrics() {
        System.out.println("\n Queue Metrics:");
        try {
            String response = makeGetRequest(QUEUE_SERVICE + "/queue/get");
            if (response != null) {
                JSONArray queues = new JSONArray(response);
                
                int total = queues.length();
                int waiting = 0;
                int inProgress = 0;
                int completed = 0;
                
                for (int i = 0; i < queues.length(); i++) {
                    JSONObject queue = queues.getJSONObject(i);
                    String status = queue.optString("status", "waiting");
                    
                    switch (status.toLowerCase()) {
                        case "waiting": waiting++; break;
                        case "in-progress": inProgress++; break;
                        case "completed": completed++; break;
                    }
                }
                
                System.out.println("   Total Bookings: " + total);
                System.out.println("    Waiting: " + waiting);
                System.out.println("    In Progress: " + inProgress);
                System.out.println("    Completed: " + completed);
                
                // Alert if too many waiting
                if (waiting > 20) {
                    System.out.println("     HIGH QUEUE VOLUME DETECTED!");
                }
            }
        } catch (Exception e) {
            System.out.println("     Could not fetch metrics");
        }
        
        // Check services capacity
        try {
            String response = makeGetRequest(QUEUE_SERVICE + "/services");
            if (response != null) {
                JSONArray services = new JSONArray(response);
                System.out.println("\n Service Capacity:");
                
                for (int i = 0; i < services.length(); i++) {
                    JSONObject service = services.getJSONObject(i);
                    String name = service.optString("name", "Unknown");
                    int current = service.optInt("current_queue_count", 0);
                    int max = service.optInt("max_capacity", 50);
                    double percentage = (current * 100.0) / max;
                    
                    String status = percentage >= 90 ? "🔴" : 
                                   percentage >= 70 ? "🟡" : "🟢";
                    
                    System.out.printf("   %s %s: %d/%d (%.0f%%)\n", 
                        status, name, current, max, percentage);
                    
                    if (percentage >= 90) {
                        System.out.println("   NEAR CAPACITY!");
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("    Could not fetch service data");
        }
    }
    
    private static void sendAlert(String serviceName, int failureCount) {
        System.out.println("\n ALERT: " + serviceName + " has been down for " + 
                         failureCount + " consecutive checks!");
        System.out.println("   Action required: Check service logs and restart if needed\n");
    }
    
    private static String makeGetRequest(String urlString) throws Exception {
        URL url = new URL(urlString);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(3000);
        conn.setReadTimeout(3000);
        
        if (authToken != null) {
            conn.setRequestProperty("Authorization", "Bearer " + authToken);
        }
        
        int responseCode = conn.getResponseCode();
        if (responseCode >= 200 && responseCode < 300) {
            BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            StringBuilder response = new StringBuilder();
            String line;
            
            while ((line = br.readLine()) != null) {
                response.append(line);
            }
            br.close();
            conn.disconnect();
            
            return response.toString();
        }
        
        conn.disconnect();
        return null;
    }
    
    private static String makePostRequest(String urlString, String jsonBody) throws Exception {
        URL url = new URL(urlString);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(3000);
        conn.setReadTimeout(3000);
        
        conn.getOutputStream().write(jsonBody.getBytes());
        
        BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        StringBuilder response = new StringBuilder();
        String line;
        
        while ((line = br.readLine()) != null) {
            response.append(line);
        }
        br.close();
        conn.disconnect();
        
        return response.toString();
    }
    
    private static String getCurrentTimestamp() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return LocalDateTime.now().format(formatter);
    }
    
    private static void logError(String message) {
        System.err.println("[ERROR " + getCurrentTimestamp() + "] " + message);
    }
}