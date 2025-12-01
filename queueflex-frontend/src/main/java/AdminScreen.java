// AdminScreen.java
import javafx.geometry.*;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.text.*;
import javafx.stage.Stage;
import org.json.*;

public class AdminScreen {
    private Stage stage;
    private ApiClient apiClient;
    private VBox allQueuesBox;
    private GridPane statsGrid;
    
    public AdminScreen(Stage stage, ApiClient apiClient) {
        this.stage = stage;
        this.apiClient = apiClient;
    }
    
    public void show() {
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: #f5f7fa;");
        
        // Top Navigation Bar
        HBox navbar = createNavBar();
        root.setTop(navbar);
        
        // Main Content - Tabs
        TabPane tabPane = new TabPane();
        tabPane.setTabClosingPolicy(TabPane.TabClosingPolicy.UNAVAILABLE);
        tabPane.setStyle("-fx-background-color: transparent;");
        
        // Tab 1: Dashboard
        Tab dashboardTab = new Tab("📊 Dashboard");
        ScrollPane dashScroll = new ScrollPane();
        dashScroll.setFitToWidth(true);
        dashScroll.setStyle("-fx-background: #f5f7fa; -fx-background-color: transparent;");
        
        VBox dashContainer = new VBox(25);
        dashContainer.setPadding(new Insets(30));
        
        Label dashTitle = new Label("Service Analytics");
        dashTitle.setFont(Font.font("System", FontWeight.BOLD, 24));
        dashTitle.setTextFill(Color.web("#2c3e50"));
        
        statsGrid = new GridPane();
        statsGrid.setHgap(20);
        statsGrid.setVgap(20);
        
        loadStatistics();
        
        dashContainer.getChildren().addAll(dashTitle, statsGrid);
        dashScroll.setContent(dashContainer);
        dashboardTab.setContent(dashScroll);
        
        // Tab 2: All Queues
        Tab queuesTab = new Tab("📋 All Bookings");
        ScrollPane queuesScroll = new ScrollPane();
        queuesScroll.setFitToWidth(true);
        queuesScroll.setStyle("-fx-background: #f5f7fa; -fx-background-color: transparent;");
        
        VBox queuesContainer = new VBox(20);
        queuesContainer.setPadding(new Insets(30));
        
        HBox queuesHeader = new HBox(20);
        queuesHeader.setAlignment(Pos.CENTER_LEFT);
        
        Label queuesTitle = new Label("Manage All Queue Bookings");
        queuesTitle.setFont(Font.font("System", FontWeight.BOLD, 24));
        queuesTitle.setTextFill(Color.web("#2c3e50"));
        
        Button refreshBtn = new Button("🔄 Refresh");
        refreshBtn.setStyle("-fx-background-color: #667eea; -fx-text-fill: white; " +
                           "-fx-background-radius: 8; -fx-padding: 10 20; " +
                           "-fx-font-weight: bold; -fx-cursor: hand;");
        refreshBtn.setOnAction(e -> {
            loadAllQueues();
            loadStatistics();
        });
        
        queuesHeader.getChildren().addAll(queuesTitle, refreshBtn);
        
        allQueuesBox = new VBox(15);
        
        queuesContainer.getChildren().addAll(queuesHeader, allQueuesBox);
        queuesScroll.setContent(queuesContainer);
        queuesTab.setContent(queuesScroll);
        
        tabPane.getTabs().addAll(dashboardTab, queuesTab);
        root.setCenter(tabPane);
        
        Scene scene = new Scene(root, 1100, 750);
        stage.setScene(scene);
        stage.show();
        
        loadAllQueues();
        loadStatistics();
    }
    
    private HBox createNavBar() {
        HBox navbar = new HBox();
        navbar.setPadding(new Insets(15, 30, 15, 30));
        navbar.setStyle("-fx-background-color: white; " +
                       "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");
        navbar.setAlignment(Pos.CENTER_LEFT);
        navbar.setSpacing(20);
        
        Label logo = new Label("🎫 QueueFlex Admin");
        logo.setFont(Font.font("System", FontWeight.BOLD, 20));
        logo.setTextFill(Color.web("#d32f2f"));
        
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        
        Label adminLabel = new Label("👨‍💼 Administrator");
        adminLabel.setFont(Font.font(14));
        adminLabel.setTextFill(Color.web("#555"));
        
        Button logoutBtn = new Button("Logout");
        logoutBtn.setStyle("-fx-background-color: #f44336; -fx-text-fill: white; " +
                          "-fx-background-radius: 8; -fx-padding: 8 20; " +
                          "-fx-cursor: hand; -fx-font-weight: bold;");
        logoutBtn.setOnAction(e -> {
            LoginScreen loginScreen = new LoginScreen(stage);
            loginScreen.show();
        });
        
        navbar.getChildren().addAll(logo, spacer, adminLabel, logoutBtn);
        return navbar;
    }
    
    private void loadStatistics() {
        statsGrid.getChildren().clear();
        
        try {
            String response = apiClient.getQueueStats();
            JSONObject stats = new JSONObject(response);
            
            int total = stats.optInt("total_items", 0);
            int waiting = stats.optInt("waiting", 0);
            
            // Total Bookings Card
            VBox totalCard = createStatCard("📊", "Total Bookings", 
                String.valueOf(total), "#3498db");
            statsGrid.add(totalCard, 0, 0);
            
            // Waiting Card
            VBox waitingCard = createStatCard("⏳", "Waiting", 
                String.valueOf(waiting), "#f39c12");
            statsGrid.add(waitingCard, 1, 0);
            
            // Completed Card
            VBox completedCard = createStatCard("✅", "Completed", 
                String.valueOf(total - waiting), "#2ecc71");
            statsGrid.add(completedCard, 2, 0);
            
            // Services breakdown
            JSONObject byService = stats.optJSONObject("by_service_type");
            if (byService != null) {
                VBox servicesCard = createServicesBreakdown(byService);
                statsGrid.add(servicesCard, 0, 1, 3, 1);
            }
            
        } catch (Exception ex) {
            Label errorLabel = new Label("Error loading statistics: " + ex.getMessage());
            errorLabel.setTextFill(Color.web("#f44336"));
            statsGrid.add(errorLabel, 0, 0);
        }
    }
    
    private VBox createStatCard(String emoji, String title, String value, String color) {
        VBox card = new VBox(10);
        card.setPrefWidth(250);
        card.setPrefHeight(130);
        card.setPadding(new Insets(20));
        card.setStyle("-fx-background-color: white; -fx-background-radius: 12; " +
                     "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 3);");
        
        HBox header = new HBox(10);
        header.setAlignment(Pos.CENTER_LEFT);
        
        Label icon = new Label(emoji);
        icon.setFont(Font.font(30));
        
        Label titleLabel = new Label(title);
        titleLabel.setFont(Font.font("System", FontWeight.NORMAL, 14));
        titleLabel.setTextFill(Color.web("#7f8c8d"));
        
        header.getChildren().addAll(icon, titleLabel);
        
        Label valueLabel = new Label(value);
        valueLabel.setFont(Font.font("System", FontWeight.BOLD, 36));
        valueLabel.setTextFill(Color.web(color));
        
        card.getChildren().addAll(header, valueLabel);
        return card;
    }
    
    private VBox createServicesBreakdown(JSONObject byService) {
        VBox card = new VBox(15);
        card.setPadding(new Insets(25));
        card.setStyle("-fx-background-color: white; -fx-background-radius: 12; " +
                     "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 3);");
        
        Label title = new Label("📈 Bookings by Service Type");
        title.setFont(Font.font("System", FontWeight.BOLD, 16));
        title.setTextFill(Color.web("#2c3e50"));
        
        GridPane grid = new GridPane();
        grid.setHgap(30);
        grid.setVgap(12);
        grid.setPadding(new Insets(10, 0, 0, 0));
        
        String[] colors = {"#e74c3c", "#3498db", "#9b59b6", "#e67e22", "#2ecc71", "#f39c12"};
        int row = 0;
        int col = 0;
        int colorIndex = 0;
        
        for (String key : byService.keySet()) {
            int count = byService.getInt(key);
            HBox item = createServiceItem(key, count, colors[colorIndex % colors.length]);
            grid.add(item, col, row);
            
            col++;
            if (col >= 3) {
                col = 0;
                row++;
            }
            colorIndex++;
        }
        
        card.getChildren().addAll(title, new Separator(), grid);
        return card;
    }
    
    private HBox createServiceItem(String service, int count, String color) {
        HBox item = new HBox(10);
        item.setAlignment(Pos.CENTER_LEFT);
        item.setPrefWidth(220);
        
        Label dot = new Label("●");
        dot.setFont(Font.font(20));
        dot.setTextFill(Color.web(color));
        
        Label nameLabel = new Label(service);
        nameLabel.setFont(Font.font(13));
        nameLabel.setTextFill(Color.web("#555"));
        
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        
        Label countLabel = new Label(String.valueOf(count));
        countLabel.setFont(Font.font("System", FontWeight.BOLD, 14));
        countLabel.setTextFill(Color.web(color));
        countLabel.setMinWidth(30);
        countLabel.setAlignment(Pos.CENTER_RIGHT);
        
        item.getChildren().addAll(dot, nameLabel, spacer, countLabel);
        return item;
    }
    
    private void loadAllQueues() {
        allQueuesBox.getChildren().clear();
        
        try {
            String response = apiClient.getAllQueues();
            JSONArray queueArray = new JSONArray(response);
            
            if (queueArray.length() == 0) {
                Label emptyLabel = new Label("No queue bookings found");
                emptyLabel.setFont(Font.font(14));
                emptyLabel.setTextFill(Color.web("#999"));
                emptyLabel.setPadding(new Insets(40));
                allQueuesBox.getChildren().add(emptyLabel);
                return;
            }
            
            for (int i = 0; i < queueArray.length(); i++) {
                JSONObject item = queueArray.getJSONObject(i);
                VBox queueCard = createAdminQueueCard(item);
                allQueuesBox.getChildren().add(queueCard);
            }
            
        } catch (Exception ex) {
            Label errorLabel = new Label("Error loading queues: " + ex.getMessage());
            errorLabel.setTextFill(Color.web("#f44336"));
            allQueuesBox.getChildren().add(errorLabel);
        }
    }
    
    private VBox createAdminQueueCard(JSONObject item) {
        VBox card = new VBox(15);
        card.setPadding(new Insets(20));
        card.setStyle("-fx-background-color: white; -fx-background-radius: 10; " +
                     "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.08), 8, 0, 0, 2);");
        
        HBox header = new HBox(15);
        header.setAlignment(Pos.CENTER_LEFT);
        
        Label serviceLabel = new Label(item.optString("serviceType", "General"));
        serviceLabel.setFont(Font.font("System", FontWeight.BOLD, 18));
        serviceLabel.setTextFill(Color.web("#2c3e50"));
        
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        
        String status = item.optString("status", "waiting");
        Label statusLabel = new Label(status.toUpperCase());
        statusLabel.setPadding(new Insets(5, 12, 5, 12));
        statusLabel.setStyle("-fx-background-radius: 12; -fx-font-size: 11; " +
                            "-fx-font-weight: bold; " + getStatusStyle(status));
        
        header.getChildren().addAll(serviceLabel, spacer, statusLabel);
        
        GridPane details = new GridPane();
        details.setHgap(25);
        details.setVgap(10);
        
        details.add(createDetailLabel("👤 Name:", item.optString("name", "N/A")), 0, 0);
        details.add(createDetailLabel("👥 User ID:", "#" + item.optInt("user_id", 0)), 1, 0);
        details.add(createDetailLabel("📝 Purpose:", item.optString("purpose", "N/A")), 0, 1, 2, 1);
        details.add(createDetailLabel("📍 Position:", "#" + item.optInt("position", 0)), 0, 2);
        details.add(createDetailLabel("🆔 Queue ID:", 
            item.optString("queue_id", "N/A").substring(0, 13) + "..."), 1, 2);
        
        HBox actions = new HBox(10);
        actions.setAlignment(Pos.CENTER_RIGHT);
        
        String queueId = item.optString("queue_id", "");
        
        Button updateBtn = new Button("Update Status");
        updateBtn.setStyle("-fx-background-color: #FF9800; -fx-text-fill: white; " +
                          "-fx-background-radius: 8; -fx-padding: 8 16; " +
                          "-fx-cursor: hand; -fx-font-weight: bold;");
        updateBtn.setOnAction(e -> showUpdateDialog(queueId));
        
        Button deleteBtn = new Button("Delete");
        deleteBtn.setStyle("-fx-background-color: #f44336; -fx-text-fill: white; " +
                          "-fx-background-radius: 8; -fx-padding: 8 16; " +
                          "-fx-cursor: hand; -fx-font-weight: bold;");
        deleteBtn.setOnAction(e -> deleteQueue(queueId));
        
        actions.getChildren().addAll(updateBtn, deleteBtn);
        
        card.getChildren().addAll(header, new Separator(), details, actions);
        
        return card;
    }
    
    private HBox createDetailLabel(String label, String value) {
        HBox box = new HBox(8);
        box.setAlignment(Pos.CENTER_LEFT);
        
        Label lblLabel = new Label(label);
        lblLabel.setFont(Font.font(12));
        lblLabel.setTextFill(Color.web("#7f8c8d"));
        
        Label valLabel = new Label(value);
        valLabel.setFont(Font.font("System", FontWeight.BOLD, 12));
        valLabel.setTextFill(Color.web("#2c3e50"));
        
        box.getChildren().addAll(lblLabel, valLabel);
        return box;
    }
    
    private String getStatusStyle(String status) {
        switch (status.toLowerCase()) {
            case "waiting":
                return "-fx-background-color: #fff3cd; -fx-text-fill: #856404;";
            case "in-progress":
                return "-fx-background-color: #cfe2ff; -fx-text-fill: #084298;";
            case "completed":
                return "-fx-background-color: #d1e7dd; -fx-text-fill: #0f5132;";
            case "cancelled":
                return "-fx-background-color: #f8d7da; -fx-text-fill: #842029;";
            default:
                return "-fx-background-color: #e2e3e5; -fx-text-fill: #41464b;";
        }
    }
    
    private void showUpdateDialog(String queueId) {
        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle("Update Queue Status");
        dialog.setHeaderText("Select new status for queue: " + queueId.substring(0, 13) + "...");
        
        VBox content = new VBox(15);
        content.setPadding(new Insets(20));
        
        Label label = new Label("Status:");
        
        ComboBox<String> statusBox = new ComboBox<>();
        statusBox.getItems().addAll("waiting", "in-progress", "completed", "cancelled");
        statusBox.setValue("completed");
        statusBox.setPrefWidth(250);
        
        content.getChildren().addAll(label, statusBox);
        
        dialog.getDialogPane().setContent(content);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);
        
        dialog.showAndWait().ifPresent(response -> {
            if (response == ButtonType.OK) {
                try {
                    String status = statusBox.getValue();
                    apiClient.adminUpdateQueue(queueId, null, status);
                    
                    Alert alert = new Alert(Alert.AlertType.INFORMATION);
                    alert.setTitle("Success");
                    alert.setHeaderText("Status Updated");
                    alert.setContentText("Queue status has been updated successfully!");
                    alert.showAndWait();
                    
                    loadAllQueues();
                    loadStatistics();
                } catch (Exception ex) {
                    Alert alert = new Alert(Alert.AlertType.ERROR);
                    alert.setTitle("Error");
                    alert.setContentText("Error: " + ex.getMessage());
                    alert.showAndWait();
                }
            }
        });
    }
    
    private void deleteQueue(String queueId) {
        Alert confirm = new Alert(Alert.AlertType.CONFIRMATION);
        confirm.setTitle("Confirm Delete");
        confirm.setHeaderText("Delete Queue Booking");
        confirm.setContentText("Are you sure you want to delete this queue booking?\nThis action cannot be undone.");
        
        confirm.showAndWait().ifPresent(response -> {
            if (response == ButtonType.OK) {
                try {
                    apiClient.adminDeleteQueue(queueId);
                    
                    Alert alert = new Alert(Alert.AlertType.INFORMATION);
                    alert.setTitle("Success");
                    alert.setHeaderText("Booking Deleted");
                    alert.setContentText("Queue booking has been deleted successfully!");
                    alert.showAndWait();
                    
                    loadAllQueues();
                    loadStatistics();
                    
                } catch (Exception ex) {
                    Alert alert = new Alert(Alert.AlertType.ERROR);
                    alert.setTitle("Error");
                    alert.setContentText("Error: " + ex.getMessage());
                    alert.showAndWait();
                }
            }
        });
    }
}