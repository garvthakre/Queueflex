// AdminScreen.java
import javafx.geometry.*;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.Stage;
import org.json.*;

public class AdminScreen {
    private Stage stage;
    private ApiClient apiClient;
    private TextArea queueListArea;
    private TextArea statsArea;
    
    public AdminScreen(Stage stage, ApiClient apiClient) {
        this.stage = stage;
        this.apiClient = apiClient;
    }
    
    public void show() {
        BorderPane layout = new BorderPane();
        layout.setPadding(new Insets(20));
        
        // Top section - Title
        VBox topBox = new VBox(10);
        Label titleLabel = new Label("Admin Dashboard");
        titleLabel.setStyle("-fx-font-size: 24px; -fx-font-weight: bold; -fx-text-fill: #d32f2f;");
        
        Button logoutButton = new Button("Logout");
        logoutButton.setStyle("-fx-background-color: #f44336; -fx-text-fill: white;");
        logoutButton.setOnAction(e -> {
            LoginScreen loginScreen = new LoginScreen(stage);
            loginScreen.show();
        });
        
        topBox.getChildren().addAll(titleLabel, logoutButton);
        topBox.setAlignment(Pos.CENTER);
        layout.setTop(topBox);
        
        // Center section - Tabs
        TabPane tabPane = new TabPane();
        
        // Tab 1: All Queues
        Tab queueTab = new Tab("All Queues");
        queueTab.setClosable(false);
        VBox queueBox = new VBox(10);
        queueBox.setPadding(new Insets(10));
        
        queueListArea = new TextArea();
        queueListArea.setEditable(false);
        queueListArea.setPrefRowCount(20);
        
        HBox queueButtonBox = new HBox(10);
        Button refreshQueuesButton = new Button("Refresh Queues");
        refreshQueuesButton.setStyle("-fx-background-color: #2196F3; -fx-text-fill: white;");
        refreshQueuesButton.setOnAction(e -> loadAllQueues());
        
        Button updateStatusButton = new Button("Update Status");
        updateStatusButton.setStyle("-fx-background-color: #FF9800; -fx-text-fill: white;");
        updateStatusButton.setOnAction(e -> showUpdateDialog());
        
        Button deleteButton = new Button("Delete Item");
        deleteButton.setStyle("-fx-background-color: #f44336; -fx-text-fill: white;");
        deleteButton.setOnAction(e -> showDeleteDialog());
        
        queueButtonBox.getChildren().addAll(refreshQueuesButton, updateStatusButton, deleteButton);
        queueBox.getChildren().addAll(queueListArea, queueButtonBox);
        queueTab.setContent(queueBox);
        
        // Tab 2: Statistics
        Tab statsTab = new Tab("Statistics");
        statsTab.setClosable(false);
        VBox statsBox = new VBox(10);
        statsBox.setPadding(new Insets(10));
        
        statsArea = new TextArea();
        statsArea.setEditable(false);
        statsArea.setPrefRowCount(20);
        
        Button refreshStatsButton = new Button("Refresh Stats");
        refreshStatsButton.setStyle("-fx-background-color: #4CAF50; -fx-text-fill: white;");
        refreshStatsButton.setOnAction(e -> loadStats());
        
        statsBox.getChildren().addAll(statsArea, refreshStatsButton);
        statsTab.setContent(statsBox);
        
        tabPane.getTabs().addAll(queueTab, statsTab);
        layout.setCenter(tabPane);
        
        Scene scene = new Scene(layout, 700, 600);
        stage.setScene(scene);
        stage.show();
        
        // Load data on start
        loadAllQueues();
        loadStats();
    }
    
    private void loadAllQueues() {
        try {
            String response = apiClient.getAllQueues();
            JSONArray queueArray = new JSONArray(response);
            
            StringBuilder sb = new StringBuilder();
            sb.append("Total Items: ").append(queueArray.length()).append("\n\n");
            
            for (int i = 0; i < queueArray.length(); i++) {
                JSONObject item = queueArray.getJSONObject(i);
                sb.append("═══════════════════════════════════\n");
                sb.append("Queue ID: ").append(item.optString("queue_id", "N/A")).append("\n");
                sb.append("User ID: ").append(item.optInt("user_id", 0)).append("\n");
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
            queueListArea.setText("Error loading queues: " + ex.getMessage());
        }
    }
    
    private void loadStats() {
        try {
            String response = apiClient.getQueueStats();
            JSONObject stats = new JSONObject(response);
            
            StringBuilder sb = new StringBuilder();
            sb.append("QUEUE STATISTICS\n");
            sb.append("═══════════════════════════════════\n\n");
            
            sb.append("Total Items: ").append(stats.optInt("total_items", 0)).append("\n");
            sb.append("Waiting: ").append(stats.optInt("waiting", 0)).append("\n\n");
            
            sb.append("By Service Type:\n");
            JSONObject byService = stats.optJSONObject("by_service_type");
            if (byService != null) {
                for (String key : byService.keySet()) {
                    sb.append("  - ").append(key).append(": ").append(byService.getInt(key)).append("\n");
                }
            }
            
            sb.append("\nBy User:\n");
            JSONObject byUser = stats.optJSONObject("by_user");
            if (byUser != null) {
                for (String key : byUser.keySet()) {
                    sb.append("  - User ").append(key).append(": ").append(byUser.getInt(key)).append("\n");
                }
            }
            
            statsArea.setText(sb.toString());
            
        } catch (Exception ex) {
            statsArea.setText("Error loading stats: " + ex.getMessage());
        }
    }
    
    private void showUpdateDialog() {
        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle("Update Queue Item");
        dialog.setHeaderText("Enter Queue ID and new status");
        
        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.setPadding(new Insets(20));
        
        TextField queueIdField = new TextField();
        queueIdField.setPromptText("Queue ID");
        
        ComboBox<String> statusBox = new ComboBox<>();
        statusBox.getItems().addAll("waiting", "in-progress", "completed", "cancelled");
        statusBox.setValue("completed");
        
        grid.add(new Label("Queue ID:"), 0, 0);
        grid.add(queueIdField, 1, 0);
        grid.add(new Label("Status:"), 0, 1);
        grid.add(statusBox, 1, 1);
        
        dialog.getDialogPane().setContent(grid);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);
        
        dialog.showAndWait().ifPresent(response -> {
            if (response == ButtonType.OK) {
                try {
                    String queueId = queueIdField.getText();
                    String status = statusBox.getValue();
                    
                    if (!queueId.isEmpty()) {
                        apiClient.adminUpdateQueue(queueId, null, status);
                        
                        Alert alert = new Alert(Alert.AlertType.INFORMATION);
                        alert.setTitle("Success");
                        alert.setHeaderText(null);
                        alert.setContentText("Queue item updated successfully!");
                        alert.showAndWait();
                        
                        loadAllQueues();
                        loadStats();
                    }
                } catch (Exception ex) {
                    Alert alert = new Alert(Alert.AlertType.ERROR);
                    alert.setTitle("Error");
                    alert.setHeaderText(null);
                    alert.setContentText("Error: " + ex.getMessage());
                    alert.showAndWait();
                }
            }
        });
    }
    
    private void showDeleteDialog() {
        TextInputDialog dialog = new TextInputDialog();
        dialog.setTitle("Delete Queue Item");
        dialog.setHeaderText("Enter Queue ID to delete");
        dialog.setContentText("Queue ID:");
        
        dialog.showAndWait().ifPresent(queueId -> {
            if (!queueId.isEmpty()) {
                try {
                    apiClient.adminDeleteQueue(queueId);
                    
                    Alert alert = new Alert(Alert.AlertType.INFORMATION);
                    alert.setTitle("Success");
                    alert.setHeaderText(null);
                    alert.setContentText("Queue item deleted successfully!");
                    alert.showAndWait();
                    
                    loadAllQueues();
                    loadStats();
                    
                } catch (Exception ex) {
                    Alert alert = new Alert(Alert.AlertType.ERROR);
                    alert.setTitle("Error");
                    alert.setHeaderText(null);
                    alert.setContentText("Error: " + ex.getMessage());
                    alert.showAndWait();
                }
            }
        });
    }
}