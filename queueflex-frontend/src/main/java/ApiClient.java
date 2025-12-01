// ApiClient.java
import java.io.*;
import java.net.*;
import org.json.*;

public class ApiClient {
    private static final String AUTH_URL = "http://localhost:3000";
    private static final String QUEUE_URL = "http://localhost:4000";
    private static final String ADMIN_URL = "http://localhost:5000";
    
    private String token;
    private boolean isAdmin;
    
    // Signup
    public String signup(String name, String email, String password, boolean isAdmin) throws Exception {
        URL url = new URL(AUTH_URL + "/signup");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        
        JSONObject json = new JSONObject();
        json.put("name", name);
        json.put("email", email);
        json.put("password", password);
        json.put("is_admin", isAdmin);
        
        try (OutputStream os = conn.getOutputStream()) {
            os.write(json.toString().getBytes());
            os.flush();
        }
        
        return readResponse(conn);
    }
    
    // Login
    public boolean login(String email, String password) throws Exception {
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
            this.token = jsonResponse.getString("token");
            this.isAdmin = jsonResponse.getBoolean("admin");
            return true;
        }
        return false;
    }
    
    // Add to queue
    public String addToQueue(String name, String purpose, String serviceType) throws Exception {
        URL url = new URL(QUEUE_URL + "/queue/add");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Authorization", "Bearer " + token);
        conn.setDoOutput(true);
        
        JSONObject json = new JSONObject();
        json.put("name", name);
        json.put("purpose", purpose);
        json.put("serviceType", serviceType);
        
        try (OutputStream os = conn.getOutputStream()) {
            os.write(json.toString().getBytes());
            os.flush();
        }
        
        return readResponse(conn);
    }
    
    // Get queue items
    public String getQueue() throws Exception {
        URL url = new URL(QUEUE_URL + "/queue/get");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Authorization", "Bearer " + token);
        
        return readResponse(conn);
    }
    
    // Update queue item
    public String updateQueue(String queueId, String name, String purpose, String serviceType) throws Exception {
        URL url = new URL(QUEUE_URL + "/queue/update/" + queueId);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("PUT");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Authorization", "Bearer " + token);
        conn.setDoOutput(true);
        
        JSONObject json = new JSONObject();
        json.put("name", name);
        json.put("purpose", purpose);
        json.put("serviceType", serviceType);
        
        try (OutputStream os = conn.getOutputStream()) {
            os.write(json.toString().getBytes());
            os.flush();
        }
        
        return readResponse(conn);
    }
    
    // Delete queue item
    public String deleteQueue(String queueId) throws Exception {
        URL url = new URL(QUEUE_URL + "/queue/delete/" + queueId);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("DELETE");
        conn.setRequestProperty("Authorization", "Bearer " + token);
        
        return readResponse(conn);
    }
    
    // Admin: Get all queues
    public String getAllQueues() throws Exception {
        URL url = new URL(ADMIN_URL + "/admin/queue/all");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Authorization", "Bearer " + token);
        
        return readResponse(conn);
    }
    
    // Admin: Get queue stats
    public String getQueueStats() throws Exception {
        URL url = new URL(ADMIN_URL + "/admin/queue/stats");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Authorization", "Bearer " + token);
        
        return readResponse(conn);
    }
    
    // Admin: Update queue (admin can update status)
    public String adminUpdateQueue(String queueId, String name, String status) throws Exception {
        URL url = new URL(ADMIN_URL + "/admin/queue/" + queueId);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("PUT");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Authorization", "Bearer " + token);
        conn.setDoOutput(true);
        
        JSONObject json = new JSONObject();
        if (name != null) json.put("name", name);
        if (status != null) json.put("status", status);
        
        try (OutputStream os = conn.getOutputStream()) {
            os.write(json.toString().getBytes());
            os.flush();
        }
        
        return readResponse(conn);
    }
    
    // Admin: Delete queue
    public String adminDeleteQueue(String queueId) throws Exception {
        URL url = new URL(ADMIN_URL + "/admin/queue/" + queueId);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("DELETE");
        conn.setRequestProperty("Authorization", "Bearer " + token);
        
        return readResponse(conn);
    }
    
    // Helper method to read response
    private String readResponse(HttpURLConnection conn) throws Exception {
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
    
    public String getToken() {
        return token;
    }
    
    public boolean isAdmin() {
        return isAdmin;
    }
}