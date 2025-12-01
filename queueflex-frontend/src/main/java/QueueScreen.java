// QueueScreen.java
import javafx.geometry.*;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.text.*;
import javafx.stage.Stage;
import org.json.*;

public class QueueScreen {
    private Stage stage;
    private ApiClient apiClient;
    private VBox servicesBox;
    private VBox myQueuesBox;
    
    public QueueScreen(Stage stage, ApiClient apiClient) {
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
        
        // Tab 1: Browse Services
        Tab servicesTab = new Tab("🏥 Available Services");
        ScrollPane servicesScroll = new ScrollPane();
        servicesScroll.setFitToWidth(true);
        servicesScroll.setStyle("-fx-background: #f5f7fa; -fx-background-color: transparent;");
        
        VBox servicesContainer = new VBox(20);
        servicesContainer.setPadding(new Insets(30));
        
        HBox servicesHeader = new HBox(20);
        servicesHeader.setAlignment(Pos.CENTER_LEFT);
        
        Label servicesTitle = new Label("Browse Available Services");
        servicesTitle.setFont(Font.font("System", FontWeight.BOLD, 24));
        servicesTitle.setTextFill(Color.web("#2c3e50"));
        
        Button refreshServicesBtn = new Button("🔄 Refresh");
        refreshServicesBtn.setStyle("-fx-background-color: #667eea; -fx-text-fill: white; " +
                                   "-fx-background-radius: 8; -fx-padding: 10 20; " +
                                   "-fx-font-weight: bold; -fx-cursor: hand;");
        refreshServicesBtn.setOnAction(e -> loadServices());
        
        servicesHeader.getChildren().addAll(servicesTitle, refreshServicesBtn);
        
        servicesBox = new VBox(15);
        
        servicesContainer.getChildren().addAll(servicesHeader, servicesBox);
        servicesScroll.setContent(servicesContainer);
        servicesTab.setContent(servicesScroll);
        
        // Tab 2: My Queue Bookings
        Tab myQueuesTab = new Tab("📋 My Bookings");
        ScrollPane myQueuesScroll = new ScrollPane();
        myQueuesScroll.setFitToWidth(true);
        myQueuesScroll.setStyle("-fx-background: #f5f7fa; -fx-background-color: transparent;");
        
        VBox myQueuesContainer = new VBox(20);
        myQueuesContainer.setPadding(new Insets(30));
        
        HBox myQueuesHeader = new HBox(20);
        myQueuesHeader.setAlignment(Pos.CENTER_LEFT);
        
        Label myQueuesTitle = new Label("My Queue Bookings");
        myQueuesTitle.setFont(Font.font("System", FontWeight.BOLD, 24));
        myQueuesTitle.setTextFill(Color.web("#2c3e50"));
        
        Button refreshMyQueuesBtn = new Button("🔄 Refresh");
        refreshMyQueuesBtn.setStyle("-fx-background-color: #667eea; -fx-text-fill: white; " +
                                   "-fx-background-radius: 8; -fx-padding: 10 20; " +
                                   "-fx-font-weight: bold; -fx-cursor: hand;");
        refreshMyQueuesBtn.setOnAction(e -> loadMyQueues());
        
        myQueuesHeader.getChildren().addAll(myQueuesTitle, refreshMyQueuesBtn);
        
        myQueuesBox = new VBox(15);
        
        myQueuesContainer.getChildren().addAll(myQueuesHeader, myQueuesBox);
        myQueuesScroll.setContent(myQueuesContainer);
        myQueuesTab.setContent(myQueuesScroll);
        
        tabPane.getTabs().addAll(servicesTab, myQueuesTab);
        root.setCenter(tabPane);
        
        Scene scene = new Scene(root, 1100, 750);
        stage.setScene(scene);
        stage.show();
        
        loadServices();
        loadMyQueues();
    }
    
    private HBox createNavBar() {
        HBox navbar = new HBox();
        navbar.setPadding(new Insets(15, 30, 15, 30));
        navbar.setStyle("-fx-background-color: white; " +
                       "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");
        navbar.setAlignment(Pos.CENTER_LEFT);
        navbar.setSpacing(20);
        
        Label logo = new Label("🎫 QueueFlex");
        logo.setFont(Font.font("System", FontWeight.BOLD, 20));
        logo.setTextFill(Color.web("#667eea"));
        
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        
        Label userLabel = new Label("👤 User Dashboard");
        userLabel.setFont(Font.font(14));
        userLabel.setTextFill(Color.web("#555"));
        
        Button logoutBtn = new Button("Logout");
        logoutBtn.setStyle("-fx-background-color: #f44336; -fx-text-fill: white; " +
                          "-fx-background-radius: 8; -fx-padding: 8 20; " +
                          "-fx-cursor: hand; -fx-font-weight: bold;");
        logoutBtn.setOnAction(e -> {
            LoginScreen loginScreen = new LoginScreen(stage);
            loginScreen.show();
        });
        
        navbar.getChildren().addAll(logo, spacer, userLabel, logoutBtn);
        return navbar;
    }
    
    private void loadServices() {
        servicesBox.getChildren().clear();
        
        try {
            String response = apiClient.getServices();
            JSONArray servicesArray = new JSONArray(response);
            
            if (servicesArray.length() == 0) {
                Label emptyLabel = new Label("No services available at this time");
                emptyLabel.setFont(Font.font(14));
                emptyLabel.setTextFill(Color.web("#999"));
                emptyLabel.setPadding(new Insets(40));
                servicesBox.getChildren().add(emptyLabel);
                return;
            }
            
            for (int i = 0; i < servicesArray.length(); i++) {
                JSONObject service = servicesArray.getJSONObject(i);
                VBox serviceCard = createServiceCard(service);
                servicesBox.getChildren().add(serviceCard);
            }
            
        } catch (Exception ex) {
            Label errorLabel = new Label("Error loading services: " + ex.getMessage());
            errorLabel.setTextFill(Color.web("#f44336"));
            servicesBox.getChildren().add(errorLabel);
        }
    }
    
    private VBox createServiceCard(JSONObject service) {
        VBox card = new VBox(15);
        card.setPadding(new Insets(20));
        card.setStyle("-fx-background-color: white; -fx-background-radius: 12; " +
                     "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.08), 8, 0, 0, 2);");
        
        // Header
        HBox header = new HBox(15);
        header.setAlignment(Pos.CENTER_LEFT);
        
        Label nameLabel = new Label(service.optString("name", "Unknown Service"));
        nameLabel.setFont(Font.font("System", FontWeight.BOLD, 20));
        nameLabel.setTextFill(Color.web("#2c3e50"));
        
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        
        Label categoryLabel = new Label(service.optString("category", "General"));
        categoryLabel.setPadding(new Insets(5, 12, 5, 12));
        categoryLabel.setStyle("-fx-background-radius: 12; -fx-font-size: 11; " +
                              "-fx-font-weight: bold; " +
                              "-fx-background-color: #e3f2fd; -fx-text-fill: #1976d2;");
        
        header.getChildren().addAll(nameLabel, spacer, categoryLabel);
        
        // Description
        Label descLabel = new Label(service.optString("description", ""));
        descLabel.setFont(Font.font(13));
        descLabel.setTextFill(Color.web("#666"));
        descLabel.setWrapText(true);
        
        // Details
        GridPane details = new GridPane();
        details.setHgap(30);
        details.setVgap(8);
        
        int maxCapacity = service.optInt("max_capacity", 50);
        int estimatedTime = service.optInt("estimated_time_per_person", 15);
        int currentQueue = service.optInt("current_queue_count", 0);
        
        details.add(createDetailLabel("⏱️ Est. Time:", estimatedTime + " min/person"), 0, 0);
        details.add(createDetailLabel("👥 Capacity:", currentQueue + "/" + maxCapacity), 1, 0);
        
        // Progress bar for queue
        ProgressBar progressBar = new ProgressBar((double) currentQueue / maxCapacity);
        progressBar.setPrefWidth(200);
        progressBar.setStyle("-fx-accent: " + (currentQueue >= maxCapacity ? "#f44336" : "#4caf50") + ";");
        
        HBox progressBox = new HBox(10);
        progressBox.setAlignment(Pos.CENTER_LEFT);
        Label progressLabel = new Label(currentQueue >= maxCapacity ? "Full" : "Available");
        progressLabel.setFont(Font.font("System", FontWeight.BOLD, 11));
        progressLabel.setTextFill(Color.web(currentQueue >= maxCapacity ? "#f44336" : "#4caf50"));
        progressBox.getChildren().addAll(progressBar, progressLabel);
        
        // Book button
        Button bookBtn = new Button("📝 Book Queue");
        bookBtn.setStyle("-fx-background-color: #4caf50; -fx-text-fill: white; " +
                        "-fx-background-radius: 8; -fx-padding: 10 20; " +
                        "-fx-cursor: hand; -fx-font-weight: bold;");
        bookBtn.setDisable(currentQueue >= maxCapacity);
        bookBtn.setOnAction(e -> showBookingDialog(service));
        
        HBox actionBox = new HBox(10);
        actionBox.setAlignment(Pos.CENTER_RIGHT);
        actionBox.getChildren().add(bookBtn);
        
        card.getChildren().addAll(header, new Separator(), descLabel, details, progressBox, actionBox);
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
    
    private void showBookingDialog(JSONObject service) {
        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle("Book Queue");
        dialog.setHeaderText("Book a queue for: " + service.optString("name"));
        
        VBox content = new VBox(15);
        content.setPadding(new Insets(20));
        
        TextField nameField = new TextField();
        nameField.setPromptText("Your Name");
        nameField.setPrefWidth(300);
        
        TextArea purposeField = new TextArea();
        purposeField.setPromptText("Purpose of visit (optional)");
        purposeField.setPrefRowCount(3);
        purposeField.setPrefWidth(300);
        
        content.getChildren().addAll(
            new Label("Name:"),
            nameField,
            new Label("Purpose:"),
            purposeField
        );
        
        dialog.getDialogPane().setContent(content);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);
        
        dialog.showAndWait().ifPresent(response -> {
            if (response == ButtonType.OK) {
                String name = nameField.getText();
                String purpose = purposeField.getText();
                String serviceId = service.optString("service_id");
                
                if (name.isEmpty()) {
                    Alert alert = new Alert(Alert.AlertType.ERROR);
                    alert.setTitle("Error");
                    alert.setContentText("Name is required!");
                    alert.showAndWait();
                    return;
                }
                
                try {
                    apiClient.addToQueue(name, purpose, serviceId);
                    
                    Alert alert = new Alert(Alert.AlertType.INFORMATION);
                    alert.setTitle("Success");
                    alert.setHeaderText("Queue Booked!");
                    alert.setContentText("You have successfully booked a queue for " + service.optString("name"));
                    alert.showAndWait();
                    
                    loadServices();
                    loadMyQueues();
                    
                } catch (Exception ex) {
                    Alert alert = new Alert(Alert.AlertType.ERROR);
                    alert.setTitle("Error");
                    alert.setContentText("Error: " + ex.getMessage());
                    alert.showAndWait();
                }
            }
        });
    }
    
    private void loadMyQueues() {
        myQueuesBox.getChildren().clear();
        
        try {
            String response = apiClient.getQueue();
            JSONArray queueArray = new JSONArray(response);
            
            if (queueArray.length() == 0) {
                Label emptyLabel = new Label("You have no queue bookings");
                emptyLabel.setFont(Font.font(14));
                emptyLabel.setTextFill(Color.web("#999"));
                emptyLabel.setPadding(new Insets(40));
                myQueuesBox.getChildren().add(emptyLabel);
                return;
            }
            
            for (int i = 0; i < queueArray.length(); i++) {
                JSONObject item = queueArray.getJSONObject(i);
                VBox queueCard = createMyQueueCard(item);
                myQueuesBox.getChildren().add(queueCard);
            }
            
        } catch (Exception ex) {
            Label errorLabel = new Label("Error loading queues: " + ex.getMessage());
            errorLabel.setTextFill(Color.web("#f44336"));
            myQueuesBox.getChildren().add(errorLabel);
        }
    }
    
    private VBox createMyQueueCard(JSONObject item) {
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
        details.add(createDetailLabel("📍 Position:", "#" + item.optInt("position", 0)), 1, 0);
        details.add(createDetailLabel("📝 Purpose:", item.optString("purpose", "N/A")), 0, 1, 2, 1);
        
        HBox actions = new HBox(10);
        actions.setAlignment(Pos.CENTER_RIGHT);
        
        String queueId = item.optString("queue_id", "");
        
        Button deleteBtn = new Button("Cancel Booking");
        deleteBtn.setStyle("-fx-background-color: #f44336; -fx-text-fill: white; " +
                          "-fx-background-radius: 8; -fx-padding: 8 16; " +
                          "-fx-cursor: hand; -fx-font-weight: bold;");
        deleteBtn.setOnAction(e -> deleteMyQueue(queueId));
        
        actions.getChildren().add(deleteBtn);
        
        card.getChildren().addAll(header, new Separator(), details, actions);
        
        return card;
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
    
    private void deleteMyQueue(String queueId) {
        Alert confirm = new Alert(Alert.AlertType.CONFIRMATION);
        confirm.setTitle("Confirm Cancellation");
        confirm.setHeaderText("Cancel Queue Booking");
        confirm.setContentText("Are you sure you want to cancel this booking?");
        
        confirm.showAndWait().ifPresent(response -> {
            if (response == ButtonType.OK) {
                try {
                    apiClient.deleteQueue(queueId);
                    
                    Alert alert = new Alert(Alert.AlertType.INFORMATION);
                    alert.setTitle("Success");
                    alert.setHeaderText("Booking Cancelled");
                    alert.setContentText("Your queue booking has been cancelled successfully!");
                    alert.showAndWait();
                    
                    loadServices();
                    loadMyQueues();
                    
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