// QueueScreen.java
import javafx.geometry.*;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.Stage;
import org.json.*;

public class QueueScreen {
    private Stage stage;
    private ApiClient apiClient;
    private TextArea queueListArea;
    
    public QueueScreen(Stage stage, ApiClient apiClient) {
        this.stage = stage;
        this.apiClient = apiClient;
    }
    
    public void show() {
        BorderPane layout = new BorderPane();
        layout.setPadding(new Insets(20));
        
        // Top section - Title
        Label titleLabel = new Label("Queue Management");
        titleLabel.setStyle("-fx-font-size: 24px; -fx-font-weight: bold;");
        BorderPane.setAlignment(titleLabel, Pos.CENTER);
        layout.setTop(titleLabel);
        
        // Center section - Queue list
        VBox centerBox = new VBox(10);
        centerBox.setPadding(new Insets(20, 0, 20, 0));
        
        Label listLabel = new Label("Your Queue Items:");
        listLabel.setStyle("-fx-font-size: 16px; -fx-font-weight: bold;");
        
        queueListArea = new TextArea();
        queueListArea.setEditable(false);
        queueListArea.setPrefRowCount(15);
        
        Button refreshButton = new Button("Refresh Queue");
        refreshButton.setStyle("-fx-background-color: #2196F3; -fx-text-fill: white;");
        refreshButton.setOnAction(e -> loadQueue());
        
        centerBox.getChildren().addAll(listLabel, queueListArea, refreshButton);
        layout.setCenter(centerBox);
        
        // Bottom section - Add to queue
        VBox bottomBox = new VBox(10);
        bottomBox.setPadding(new Insets(10));
        bottomBox.setStyle("-fx-border-color: #cccccc; -fx-border-width: 1;");
        
        Label addLabel = new Label("Add to Queue:");
        addLabel.setStyle("-fx-font-size: 16px; -fx-font-weight: bold;");
        
        GridPane form = new GridPane();
        form.setHgap(10);
        form.setVgap(10);
        
        TextField nameField = new TextField();
        nameField.setPromptText("Name");
        
        TextField purposeField = new TextField();
        purposeField.setPromptText("Purpose");
        
        ComboBox<String> serviceTypeBox = new ComboBox<>();
        serviceTypeBox.getItems().addAll("General", "Premium", "VIP");
        serviceTypeBox.setValue("General");
        
        form.add(new Label("Name:"), 0, 0);
        form.add(nameField, 1, 0);
        form.add(new Label("Purpose:"), 0, 1);
        form.add(purposeField, 1, 1);
        form.add(new Label("Service Type:"), 0, 2);
        form.add(serviceTypeBox, 1, 2);
        
        Button addButton = new Button("Add to Queue");
        addButton.setStyle("-fx-background-color: #4CAF50; -fx-text-fill: white;");
        
        Label messageLabel = new Label();
        
        addButton.setOnAction(e -> {
            String name = nameField.getText();
            String purpose = purposeField.getText();
            String serviceType = serviceTypeBox.getValue();
            
            if (name.isEmpty()) {
                messageLabel.setStyle("-fx-text-fill: red;");
                messageLabel.setText("Name is required!");
                return;
            }
            
            try {
                apiClient.addToQueue(name, purpose, serviceType);
                messageLabel.setStyle("-fx-text-fill: green;");
                messageLabel.setText("Added to queue successfully!");
                
                // Clear fields
                nameField.clear();
                purposeField.clear();
                serviceTypeBox.setValue("General");
                
                // Refresh list
                loadQueue();
                
            } catch (Exception ex) {
                messageLabel.setStyle("-fx-text-fill: red;");
                messageLabel.setText("Error: " + ex.getMessage());
            }
        });
        
        Button logoutButton = new Button("Logout");
        logoutButton.setStyle("-fx-background-color: #f44336; -fx-text-fill: white;");
        logoutButton.setOnAction(e -> {
            LoginScreen loginScreen = new LoginScreen(stage);
            loginScreen.show();
        });
        
        bottomBox.getChildren().addAll(addLabel, form, addButton, messageLabel, logoutButton);
        layout.setBottom(bottomBox);
        
        Scene scene = new Scene(layout, 600, 650);
        stage.setScene(scene);
        stage.show();
        
        // Load queue on start
        loadQueue();
    }
    
    private void loadQueue() {
        try {
            String response = apiClient.getQueue();
            JSONArray queueArray = new JSONArray(response);
            
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < queueArray.length(); i++) {
                JSONObject item = queueArray.getJSONObject(i);
                sb.append("═══════════════════════════════════\n");
                sb.append("Queue ID: ").append(item.optString("queue_id", "N/A")).append("\n");
                sb.append("Name: ").append(item.optString("name", "N/A")).append("\n");
                sb.append("Purpose: ").append(item.optString("purpose", "N/A")).append("\n");
                sb.append("Service Type: ").append(item.optString("serviceType", "N/A")).append("\n");
                sb.append("Position: ").append(item.optInt("position", 0)).append("\n");
                sb.append("Status: ").append(item.optString("status", "N/A")).append("\n");
            }
            
            if (queueArray.length() == 0) {
                sb.append("No items in queue.");
            }
            
            queueListArea.setText(sb.toString());
            
        } catch (Exception ex) {
            queueListArea.setText("Error loading queue: " + ex.getMessage());
        }
    }
}