import javafx.application.Platform;
import javafx.concurrent.Task;
import javafx.geometry.*;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.text.*;
import javafx.stage.Stage;
import org.json.*;

import java.io.FileWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

public class AdminScreen {
    private final Stage stage;
    private final ApiClient apiClient;

    // UI Containers
    private VBox allQueuesBox;
    private VBox servicesBox;
    private GridPane statsGrid;

    // Filter fields
    private TextField servicesSearchField;
    private ComboBox<String> servicesStatusFilter;
    private ComboBox<String> servicesCategoryFilter;

    private TextField queuesSearchField;
    private ComboBox<String> queuesStatusFilter;
    private ComboBox<String> queuesServiceFilter;
    private CheckBox liveRefreshToggle;

    // Data caches
    private List<JSONObject> cachedServices = new ArrayList<>();
    private List<JSONObject> cachedQueues = new ArrayList<>();

    // Live refresh
    private java.util.Timer liveTimer;

    public AdminScreen(Stage stage, ApiClient apiClient) {
        this.stage = stage;
        this.apiClient = apiClient;
    }

    public void show() {
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: #f5f7fa;");

        root.setTop(createNavBar());

        TabPane tabPane = new TabPane();
        tabPane.setTabClosingPolicy(TabPane.TabClosingPolicy.UNAVAILABLE);
        tabPane.setStyle("-fx-background-color: transparent;");

        tabPane.getTabs().addAll(
            createDashboardTab(),
            createServicesTab(),
            createQueuesTab(),
            createSettingsTab()
        );
        root.setCenter(tabPane);

        Scene scene = new Scene(root, 1200, 800);
        stage.setTitle("QueueFlex Admin");
        stage.setScene(scene);
        stage.show();

        reloadAllAsync();
    }

    // ========== HELPERS ==========
    private void reloadAllAsync() {
        System.out.println("\n🔄 [RELOAD] Starting data reload...");
        loadAllQueuesAsync();
        loadStatisticsAsync();
        loadServicesAsync();
    }

    private void showInfo(String title, String header, String text) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(header);
        alert.setContentText(text);
        alert.showAndWait();
    }

    private void showError(String text) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle("Error");
        alert.setContentText(text);
        alert.showAndWait();
    }

    private String shortId(String id) {
        if (id == null || id.isEmpty()) return "N/A";
        return id.length() > 13 ? id.substring(0, 13) + "..." : id;
    }

    private String createButtonStyle(String type) {
        switch (type) {
            case "primary":
                return "-fx-background-color: #667eea; -fx-text-fill: white; -fx-background-radius: 8; -fx-padding: 8 16; -fx-font-weight: bold; -fx-cursor: hand;";
            case "success":
                return "-fx-background-color: #4caf50; -fx-text-fill: white; -fx-background-radius: 8; -fx-padding: 8 16; -fx-font-weight: bold; -fx-cursor: hand;";
            case "warning":
                return "-fx-background-color: #ff9800; -fx-text-fill: white; -fx-background-radius: 8; -fx-padding: 8 16; -fx-font-weight: bold; -fx-cursor: hand;";
            case "danger":
                return "-fx-background-color: #f44336; -fx-text-fill: white; -fx-background-radius: 8; -fx-padding: 8 16; -fx-font-weight: bold; -fx-cursor: hand;";
            default:
                return "-fx-background-color: #2196f3; -fx-text-fill: white; -fx-background-radius: 8; -fx-padding: 8 16; -fx-font-weight: bold; -fx-cursor: hand;";
        }
    }

    private String csv(String v) {
        String s = v == null ? "" : v;
        if (s.contains(",") || s.contains("\"")) {
            s = "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }

    // ========== NAVIGATION ==========
    private HBox createNavBar() {
        HBox navbar = new HBox(20);
        navbar.setPadding(new Insets(15, 30, 15, 30));
        navbar.setStyle("-fx-background-color: white; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");
        navbar.setAlignment(Pos.CENTER_LEFT);

        Label logo = new Label("🎫 QueueFlex Admin");
        logo.setFont(Font.font("System", FontWeight.BOLD, 20));
        logo.setTextFill(Color.web("#d32f2f"));

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        Label adminLabel = new Label("👨‍💼 Administrator");
        adminLabel.setFont(Font.font(14));
        adminLabel.setTextFill(Color.web("#555"));

        Button logoutBtn = new Button("Logout");
        logoutBtn.setStyle(createButtonStyle("danger"));
        logoutBtn.setOnAction(e -> logout());

        navbar.getChildren().addAll(logo, spacer, adminLabel, logoutBtn);
        return navbar;
    }

    private void logout() {
        if (liveTimer != null) {
            liveTimer.cancel();
        }
        LoginScreen loginScreen = new LoginScreen(stage);
        loginScreen.show();
    }

    // ========== DASHBOARD ==========
    private Tab createDashboardTab() {
        Tab tab = new Tab("📊 Dashboard");
        ScrollPane scroll = new ScrollPane();
        scroll.setFitToWidth(true);
        scroll.setStyle("-fx-background: transparent;");

        VBox container = new VBox(25);
        container.setPadding(new Insets(30));

        HBox titleRow = new HBox(10);
        titleRow.setAlignment(Pos.CENTER_LEFT);

        Label title = new Label("Service Analytics");
        title.setFont(Font.font("System", FontWeight.BOLD, 24));
        title.setTextFill(Color.web("#2c3e50"));

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        Button exportBtn = new Button("📊 Export CSV");
        exportBtn.setStyle(createButtonStyle("primary"));
        exportBtn.setOnAction(e -> exportStatsCsv());

        liveRefreshToggle = new CheckBox("🔄 Live mode (5s)");
        liveRefreshToggle.setSelected(false);
        liveRefreshToggle.setOnAction(e -> toggleLiveRefresh(liveRefreshToggle.isSelected()));

        titleRow.getChildren().addAll(title, spacer, exportBtn, liveRefreshToggle);

        statsGrid = new GridPane();
        statsGrid.setHgap(20);
        statsGrid.setVgap(20);

        VBox healthPanel = createHealthPanel();

        container.getChildren().addAll(titleRow, statsGrid, new Separator(), healthPanel);
        scroll.setContent(container);
        tab.setContent(scroll);
        return tab;
    }

    private void toggleLiveRefresh(boolean enabled) {
        if (liveTimer != null) {
            liveTimer.cancel();
            liveTimer = null;
        }
        if (enabled) {
            liveTimer = new java.util.Timer(true);
            liveTimer.scheduleAtFixedRate(new java.util.TimerTask() {
                @Override
                public void run() {
                    Platform.runLater(() -> reloadAllAsync());
                }
            }, 0, 5000);
        }
    }

    private VBox createHealthPanel() {
        VBox panel = new VBox(12);
        panel.setPadding(new Insets(20));
        panel.setStyle("-fx-background-color: white; -fx-background-radius: 12; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 3);");

        Label title = new Label("🏥 System Health");
        title.setFont(Font.font("System", FontWeight.BOLD, 16));
        title.setTextFill(Color.web("#2c3e50"));

        HBox indicators = new HBox(20);
        indicators.setAlignment(Pos.CENTER_LEFT);
        indicators.getChildren().addAll(
            healthDot("Auth Service", true),
            healthDot("Queue Service", true),
            healthDot("Admin Service", true)
        );

        Label note = new Label("💡 Tip: Check console logs for API connection status");
        note.setTextFill(Color.web("#7f8c8d"));
        note.setFont(Font.font(12));

        panel.getChildren().addAll(title, new Separator(), indicators, note);
        return panel;
    }

    private HBox healthDot(String name, boolean up) {
        Label dot = new Label("●");
        dot.setTextFill(Color.web(up ? "#2ecc71" : "#e74c3c"));
        dot.setFont(Font.font(18));
        Label label = new Label(name);
        label.setFont(Font.font(13));
        label.setTextFill(Color.web("#555"));
        HBox box = new HBox(8, dot, label);
        box.setAlignment(Pos.CENTER_LEFT);
        return box;
    }

    private void loadStatisticsAsync() {
        if (statsGrid == null) return;

        Task<String> task = new Task<String>() {
            @Override
            protected String call() throws Exception {
                System.out.println("🔄 [DEBUG] Calling apiClient.getQueueStats()...");
                String response = apiClient.getQueueStats();
                System.out.println("✅ [DEBUG] getQueueStats() returned: " + (response != null ? response.substring(0, Math.min(100, response.length())) + "..." : "NULL"));
                return response;
            }

            @Override
            protected void succeeded() {
                try {
                    String rawResponse = getValue();
                    if (rawResponse == null || rawResponse.trim().isEmpty()) {
                        throw new Exception("Empty response from API");
                    }
                    
                    JSONObject stats = new JSONObject(rawResponse);
                    System.out.println("📈 [DEBUG] Stats - total: " + stats.optInt("total_items", 0) + 
                                     ", waiting: " + stats.optInt("waiting", 0));
                    
                    Platform.runLater(() -> updateStatsGrid(stats));
                } catch (Exception ex) {
                    System.err.println("❌ [ERROR] Stats parse failed: " + ex.getMessage());
                    ex.printStackTrace();
                    Platform.runLater(() -> showEmptyStatsWithError("Parse error: " + ex.getMessage()));
                }
            }

            @Override
            protected void failed() {
                Throwable ex = getException();
                System.err.println("💥 [API ERROR] getQueueStats() failed: " + ex.getMessage());
                ex.printStackTrace();
                Platform.runLater(() -> showEmptyStatsWithError("API Error: " + ex.getMessage()));
            }
        };
        new Thread(task).start();
    }

    private void updateStatsGrid(JSONObject stats) {
        statsGrid.getChildren().clear();

        int total = stats.optInt("total_items", 0);
        int waiting = stats.optInt("waiting", 0);

        statsGrid.add(createStatCard("📊", "Total Bookings", String.valueOf(total), "#3498db"), 0, 0);
        statsGrid.add(createStatCard("⏳", "Waiting", String.valueOf(waiting), "#f39c12"), 1, 0);
        statsGrid.add(createStatCard("✅", "Completed", String.valueOf(Math.max(0, total - waiting)), "#2ecc71"), 2, 0);
        statsGrid.add(createStatCard("📅", "Today", String.valueOf(stats.optInt("today", 0)), "#9b59b6"), 3, 0);

        JSONObject byService = stats.optJSONObject("by_service_type");
        if (byService != null && byService.length() > 0) {
            VBox servicesCard = createServicesBreakdown(byService);
            statsGrid.add(servicesCard, 0, 1, 4, 1);
        }
    }

    private void showEmptyStatsWithError(String error) {
        statsGrid.getChildren().clear();
        VBox errorBox = new VBox(10);
        errorBox.setPadding(new Insets(30));
        errorBox.setAlignment(Pos.CENTER);
        
        Label errorIcon = new Label("⚠️");
        errorIcon.setFont(Font.font(40));
        
        Label errorLabel = new Label(error);
        errorLabel.setTextFill(Color.web("#f44336"));
        errorLabel.setFont(Font.font(14));
        errorLabel.setWrapText(true);
        errorLabel.setMaxWidth(600);
        
        Label hint = new Label("Check: 1) Backend running? 2) ApiClient base URL correct? 3) Console logs");
        hint.setTextFill(Color.web("#999"));
        hint.setFont(Font.font(12));
        
        errorBox.getChildren().addAll(errorIcon, errorLabel, hint);
        statsGrid.add(errorBox, 0, 0, 4, 1);
    }

    private VBox createStatCard(String emoji, String title, String value, String color) {
        VBox card = new VBox(10);
        card.setPrefWidth(250);
        card.setPrefHeight(130);
        card.setPadding(new Insets(20));
        card.setStyle("-fx-background-color: white; -fx-background-radius: 12; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 3);");

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
        card.setStyle("-fx-background-color: white; -fx-background-radius: 12; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 3);");

        Label title = new Label("📈 Bookings by Service Type");
        title.setFont(Font.font("System", FontWeight.BOLD, 16));
        title.setTextFill(Color.web("#2c3e50"));

        GridPane grid = new GridPane();
        grid.setHgap(30);
        grid.setVgap(12);
        grid.setPadding(new Insets(10, 0, 0, 0));

        String[] colors = {"#e74c3c", "#3498db", "#9b59b6", "#e67e22", "#2ecc71", "#f39c12"};
        int row = 0, col = 0, colorIndex = 0;

        for (String key : byService.keySet()) {
            int count = byService.optInt(key, 0);
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

    private void exportStatsCsv() {
        try {
            Path tmp = Files.createTempFile("queueflex-stats-", ".csv");
            try (FileWriter fw = new FileWriter(tmp.toFile())) {
                fw.write("Metric,Value\n");
                fw.write("Note,Use backend CSV endpoint for full export\n");
            }
            showInfo("Exported", "CSV created", "Temporary CSV: " + tmp.toAbsolutePath());
        } catch (Exception ex) {
            showError("CSV export failed: " + ex.getMessage());
        }
    }

    // ========== SERVICES TAB ==========
    private Tab createServicesTab() {
        Tab tab = new Tab("🏥 Services");
        ScrollPane scroll = new ScrollPane();
        scroll.setFitToWidth(true);
        scroll.setStyle("-fx-background: transparent;");

        VBox container = new VBox(20);
        container.setPadding(new Insets(30));

        HBox header = new HBox(10);
        header.setAlignment(Pos.CENTER_LEFT);

        Label title = new Label("Manage Services");
        title.setFont(Font.font("System", FontWeight.BOLD, 24));
        title.setTextFill(Color.web("#2c3e50"));

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        Button createBtn = new Button("➕ Create Service");
        createBtn.setStyle(createButtonStyle("success"));
        createBtn.setOnAction(e -> showCreateServiceDialog());

        Button refreshBtn = new Button("🔄 Refresh");
        refreshBtn.setStyle(createButtonStyle("primary"));
        refreshBtn.setOnAction(e -> loadServicesAsync());

        header.getChildren().addAll(title, spacer, createBtn, refreshBtn);

        HBox filters = new HBox(10);
        filters.setAlignment(Pos.CENTER_LEFT);

        servicesSearchField = new TextField();
        servicesSearchField.setPromptText("🔍 Search by name or description...");
        servicesSearchField.setPrefWidth(260);
        servicesSearchField.textProperty().addListener((obs, o, n) -> applyServiceFilters());

        servicesStatusFilter = new ComboBox<>();
        servicesStatusFilter.getItems().addAll("All statuses", "active", "inactive");
        servicesStatusFilter.setValue("All statuses");
        servicesStatusFilter.setOnAction(e -> applyServiceFilters());

        servicesCategoryFilter = new ComboBox<>();
        servicesCategoryFilter.getItems().addAll("All categories", "Hospital", "Clinic", "Government Office", "Bank", "Restaurant", "Salon", "Other");
        servicesCategoryFilter.setValue("All categories");
        servicesCategoryFilter.setOnAction(e -> applyServiceFilters());

        Button exportBtn = new Button("📄 Export CSV");
        exportBtn.setStyle(createButtonStyle("primary"));
        exportBtn.setOnAction(e -> exportServicesCsv());

        filters.getChildren().addAll(servicesSearchField, servicesStatusFilter, servicesCategoryFilter, exportBtn);

        servicesBox = new VBox(15);

        container.getChildren().addAll(header, filters, servicesBox);
        scroll.setContent(container);
        tab.setContent(scroll);

        return tab;
    }

    private void loadServicesAsync() {
        Task<String> task = new Task<String>() {
            @Override
            protected String call() throws Exception {
                System.out.println("🔄 [DEBUG] Calling apiClient.getServices()...");
                String response = apiClient.getServices();
                System.out.println("✅ [DEBUG] getServices() returned: " + (response != null ? response.substring(0, Math.min(100, response.length())) + "..." : "NULL"));
                return response;
            }

            @Override
            protected void succeeded() {
                try {
                    String rawResponse = getValue();
                    if (rawResponse == null || rawResponse.trim().isEmpty()) {
                        throw new Exception("Empty response from API");
                    }
                    
                    JSONArray arr = new JSONArray(rawResponse);
                    System.out.println("📈 [DEBUG] Parsed " + arr.length() + " services");
                    
                    cachedServices = new ArrayList<>();
                    for (int i = 0; i < arr.length(); i++) {
                        cachedServices.add(arr.getJSONObject(i));
                    }
                    Platform.runLater(() -> applyServiceFilters());
                } catch (Exception ex) {
                    System.err.println("❌ [ERROR] Services parse failed: " + ex.getMessage());
                    ex.printStackTrace();
                    Platform.runLater(() -> showEmptyServicesWithError("Parse error: " + ex.getMessage()));
                }
            }

            @Override
            protected void failed() {
                Throwable ex = getException();
                System.err.println("💥 [API ERROR] getServices() failed: " + ex.getMessage());
                ex.printStackTrace();
                Platform.runLater(() -> showEmptyServicesWithError("API Error: " + ex.getMessage()));
            }
        };
        new Thread(task).start();
    }

    private void showEmptyServicesWithError(String error) {
        servicesBox.getChildren().clear();
        VBox errorBox = new VBox(10);
        errorBox.setPadding(new Insets(30));
        errorBox.setAlignment(Pos.CENTER);
        
        Label errorIcon = new Label("⚠️");
        errorIcon.setFont(Font.font(40));
        
        Label errorLabel = new Label(error);
        errorLabel.setTextFill(Color.web("#f44336"));
        errorLabel.setFont(Font.font(14));
        errorLabel.setWrapText(true);
        
        Label hint = new Label("Is your backend running on the correct port?");
        hint.setTextFill(Color.web("#999"));
        hint.setFont(Font.font(12));
        
        errorBox.getChildren().addAll(errorIcon, errorLabel, hint);
        servicesBox.getChildren().add(errorBox);
    }

    private void applyServiceFilters() {
        servicesBox.getChildren().clear();

        if (cachedServices.isEmpty()) {
            Label emptyLabel = new Label("No services yet. Click 'Create Service' to add one.");
            emptyLabel.setFont(Font.font(14));
            emptyLabel.setTextFill(Color.web("#999"));
            emptyLabel.setPadding(new Insets(40));
            servicesBox.getChildren().add(emptyLabel);
            return;
        }

        String q = servicesSearchField != null ? servicesSearchField.getText().trim().toLowerCase() : "";
        String statusSel = servicesStatusFilter != null ? servicesStatusFilter.getValue() : "All statuses";
        String catSel = servicesCategoryFilter != null ? servicesCategoryFilter.getValue() : "All categories";

        List<JSONObject> filtered = cachedServices.stream().filter(s -> {
            String name = s.optString("name", "").toLowerCase();
            String desc = s.optString("description", "").toLowerCase();
            String status = s.optString("status", "active");
            String category = s.optString("category", "");

            boolean textMatch = q.isEmpty() || name.contains(q) || desc.contains(q);
            boolean statusMatch = "All statuses".equals(statusSel) || statusSel.equalsIgnoreCase(status);
            boolean categoryMatch = "All categories".equals(catSel) || catSel.equalsIgnoreCase(category);
            return textMatch && statusMatch && categoryMatch;
        }).collect(Collectors.toList());

        if (filtered.isEmpty()) {
            Label none = new Label("No services match current filters.");
            none.setTextFill(Color.web("#999"));
            none.setPadding(new Insets(20));
            servicesBox.getChildren().add(none);
            return;
        }

        for (JSONObject service : filtered) {
            servicesBox.getChildren().add(createServiceCard(service));
        }
    }

    private VBox createServiceCard(JSONObject service) {
        VBox card = new VBox(15);
        card.setPadding(new Insets(20));
        card.setStyle("-fx-background-color: white; -fx-background-radius: 12; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.08), 8, 0, 0, 2);");

        HBox header = new HBox(15);
        header.setAlignment(Pos.CENTER_LEFT);

        Label nameLabel = new Label(service.optString("name", "Unknown"));
        nameLabel.setFont(Font.font("System", FontWeight.BOLD, 18));
        nameLabel.setTextFill(Color.web("#2c3e50"));

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        String status = service.optString("status", "active");
        Label statusLabel = new Label(status.toUpperCase());
        statusLabel.setPadding(new Insets(5, 12, 5, 12));
        statusLabel.setStyle("-fx-background-radius: 12; -fx-font-size: 11; -fx-font-weight: bold; " +
                (status.equalsIgnoreCase("active")
                        ? "-fx-background-color: #d1e7dd; -fx-text-fill: #0f5132;"
                        : "-fx-background-color: #f8d7da; -fx-text-fill: #842029;"));

        header.getChildren().addAll(nameLabel, spacer, statusLabel);

        String desc = service.optString("description", "");
        if (!desc.isEmpty()) {
            Label descLabel = new Label(desc);
            descLabel.setFont(Font.font(13));
            descLabel.setTextFill(Color.web("#666"));
            descLabel.setWrapText(true);
            card.getChildren().add(descLabel);
        }

        GridPane details = new GridPane();
        details.setHgap(25);
        details.setVgap(10);

        details.add(createDetailRow("📁 Category:", service.optString("category", "General")), 0, 0);
        details.add(createDetailRow("👥 Max Capacity:", String.valueOf(service.optInt("max_capacity", 50))), 1, 0);
        details.add(createDetailRow("⏱️ Time/Person:", service.optInt("estimated_time_per_person", 15) + " min"), 0, 1);
        details.add(createDetailRow("🆔 ID:", shortId(service.optString("service_id", "N/A"))), 1, 1);

        HBox actions = new HBox(10);
        actions.setAlignment(Pos.CENTER_RIGHT);

        String serviceId = service.optString("service_id", "");

        Button toggleBtn = new Button(status.equalsIgnoreCase("active") ? "🔴 Deactivate" : "🟢 Activate");
        toggleBtn.setStyle(status.equalsIgnoreCase("active") ? createButtonStyle("warning") : createButtonStyle("success"));
        toggleBtn.setOnAction(e -> toggleServiceStatus(serviceId, status));

        Button editBtn = new Button("✏️ Edit");
        editBtn.setStyle(createButtonStyle("default"));
        editBtn.setOnAction(e -> showEditServiceDialog(service));

        Button deleteBtn = new Button("🗑️ Delete");
        deleteBtn.setStyle(createButtonStyle("danger"));
        deleteBtn.setOnAction(e -> deleteService(serviceId));

        actions.getChildren().addAll(toggleBtn, editBtn, deleteBtn);

        card.getChildren().addAll(header, new Separator(), details, actions);
        return card;
    }

    private HBox createDetailRow(String label, String value) {
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

    private void showCreateServiceDialog() {
        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle("Create Service");
        dialog.setHeaderText("Create a New Service");

        VBox content = new VBox(15);
        content.setPadding(new Insets(20));

        TextField nameField = new TextField();
        nameField.setPromptText("Service Name (e.g., City Hospital)");
        nameField.setPrefWidth(400);

        TextArea descField = new TextArea();
        descField.setPromptText("Description");
        descField.setPrefRowCount(3);
        descField.setPrefWidth(400);

        ComboBox<String> categoryBox = new ComboBox<>();
        categoryBox.getItems().addAll("Hospital", "Clinic", "Government Office", "Bank", "Restaurant", "Salon", "Other");
        categoryBox.setValue("Hospital");
        categoryBox.setPrefWidth(400);

        Spinner<Integer> capacitySpinner = new Spinner<>(1, 500, 50);
        capacitySpinner.setEditable(true);
        capacitySpinner.setPrefWidth(400);

        Spinner<Integer> timeSpinner = new Spinner<>(5, 120, 15);
        timeSpinner.setEditable(true);
        timeSpinner.setPrefWidth(400);

        content.getChildren().addAll(
                new Label("Service Name:"), nameField,
                new Label("Description:"), descField,
                new Label("Category:"), categoryBox,
                new Label("Max Queue Capacity:"), capacitySpinner,
                new Label("Estimated Time per Person (minutes):"), timeSpinner
        );

        dialog.getDialogPane().setContent(content);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.showAndWait().ifPresent(response -> {
            if (response == ButtonType.OK) {
                String name = nameField.getText();
                if (name == null || name.trim().isEmpty()) {
                    showError("Service name is required!");
                    return;
                }

                Task<Void> task = new Task<Void>() {
                    @Override
                    protected Void call() throws Exception {
                        apiClient.createService(name, descField.getText(), categoryBox.getValue(),
                                capacitySpinner.getValue(), timeSpinner.getValue());
                        return null;
                    }

                    @Override
                    protected void succeeded() {
                        showInfo("Success", "Service Created", "Service created successfully!");
                        loadServicesAsync();
                        loadStatisticsAsync();
                    }

                    @Override
                    protected void failed() {
                        showError("Error: " + getException().getMessage());
                    }
                };
                new Thread(task).start();
            }
        });
    }

    private void showEditServiceDialog(JSONObject service) {
        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle("Edit Service");
        dialog.setHeaderText("Edit: " + service.optString("name"));

        VBox content = new VBox(15);
        content.setPadding(new Insets(20));

        TextField nameField = new TextField(service.optString("name", ""));
        nameField.setPrefWidth(400);

        TextArea descField = new TextArea(service.optString("description", ""));
        descField.setPrefRowCount(3);
        descField.setPrefWidth(400);

        ComboBox<String> categoryBox = new ComboBox<>();
        categoryBox.getItems().addAll("Hospital", "Clinic", "Government Office", "Bank", "Restaurant", "Salon", "Other");
        categoryBox.setValue(service.optString("category", "Hospital"));
        categoryBox.setPrefWidth(400);

        content.getChildren().addAll(
                new Label("Service Name:"), nameField,
                new Label("Description:"), descField,
                new Label("Category:"), categoryBox
        );

        dialog.getDialogPane().setContent(content);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.showAndWait().ifPresent(response -> {
            if (response == ButtonType.OK) {
                Task<Void> task = new Task<Void>() {
                    @Override
                    protected Void call() throws Exception {
                        apiClient.updateService(service.optString("service_id"), nameField.getText(),
                                descField.getText(), categoryBox.getValue(), null);
                        return null;
                    }

                    @Override
                    protected void succeeded() {
                        showInfo("Success", "Service Updated", "Service updated successfully!");
                        loadServicesAsync();
                    }

                    @Override
                    protected void failed() {
                        showError("Error: " + getException().getMessage());
                    }
                };
                new Thread(task).start();
            }
        });
    }

    private void toggleServiceStatus(String serviceId, String currentStatus) {
        String newStatus = currentStatus.equalsIgnoreCase("active") ? "inactive" : "active";

        Alert confirm = new Alert(Alert.AlertType.CONFIRMATION);
        confirm.setTitle("Confirm");
        confirm.setHeaderText("Change Service Status");
        confirm.setContentText("Set status to " + newStatus + "?");
        confirm.showAndWait().ifPresent(resp -> {
            if (resp == ButtonType.OK) {
                Task<Void> task = new Task<Void>() {
                    @Override
                    protected Void call() throws Exception {
                        apiClient.updateService(serviceId, null, null, null, newStatus);
                        return null;
                    }

                    @Override
                    protected void succeeded() {
                        showInfo("Success", "Status Updated", "Service is now " + newStatus + "!");
                        loadServicesAsync();
                    }

                    @Override
                    protected void failed() {
                        showError("Error: " + getException().getMessage());
                    }
                };
                new Thread(task).start();
            }
        });
    }

    private void deleteService(String serviceId) {
        Alert confirm = new Alert(Alert.AlertType.CONFIRMATION);
        confirm.setTitle("Confirm Delete");
        confirm.setHeaderText("Delete Service");
        confirm.setContentText("Delete this service? This cannot be undone.");
        confirm.showAndWait().ifPresent(response -> {
            if (response == ButtonType.OK) {
                Task<Void> task = new Task<Void>() {
                    @Override
                    protected Void call() throws Exception {
                        apiClient.deleteService(serviceId);
                        return null;
                    }

                    @Override
                    protected void succeeded() {
                        showInfo("Success", "Service Deleted", "Service deleted successfully!");
                        loadServicesAsync();
                        loadStatisticsAsync();
                    }

                    @Override
                    protected void failed() {
                        showError("Error: " + getException().getMessage());
                    }
                };
                new Thread(task).start();
            }
        });
    }

    private void exportServicesCsv() {
        try {
            Path tmp = Files.createTempFile("services-", ".csv");
            try (FileWriter fw = new FileWriter(tmp.toFile())) {
                fw.write("name,category,status,max_capacity,time_per_person,id\n");
                for (JSONObject s : cachedServices) {
                    fw.write(String.join(",",
                            csv(s.optString("name", "")),
                            csv(s.optString("category", "")),
                            csv(s.optString("status", "")),
                            String.valueOf(s.optInt("max_capacity", 0)),
                            String.valueOf(s.optInt("estimated_time_per_person", 0)),
                            csv(s.optString("service_id", ""))
                    ) + "\n");
                }
            }
            showInfo("Exported", "CSV created", "File: " + tmp.toAbsolutePath());
        } catch (Exception ex) {
            showError("Export failed: " + ex.getMessage());
        }
    }

    // ========== QUEUES TAB ==========
    private Tab createQueuesTab() {
        Tab tab = new Tab("📋 Bookings");
        ScrollPane scroll = new ScrollPane();
        scroll.setFitToWidth(true);
        scroll.setStyle("-fx-background: transparent;");

        VBox container = new VBox(20);
        container.setPadding(new Insets(30));

        HBox header = new HBox(10);
        header.setAlignment(Pos.CENTER_LEFT);

        Label title = new Label("All Queue Bookings");
        title.setFont(Font.font("System", FontWeight.BOLD, 24));
        title.setTextFill(Color.web("#2c3e50"));

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        Button exportBtn = new Button("📄 Export CSV");
        exportBtn.setStyle(createButtonStyle("primary"));
        exportBtn.setOnAction(e -> exportQueuesCsv());

        Button refreshBtn = new Button("🔄 Refresh");
        refreshBtn.setStyle(createButtonStyle("primary"));
        refreshBtn.setOnAction(e -> loadAllQueuesAsync());

        header.getChildren().addAll(title, spacer, exportBtn, refreshBtn);

        HBox filters = new HBox(10);
        filters.setAlignment(Pos.CENTER_LEFT);

        queuesSearchField = new TextField();
        queuesSearchField.setPromptText("🔍 Search name / user ID / queue ID...");
        queuesSearchField.setPrefWidth(280);
        queuesSearchField.textProperty().addListener((obs, o, n) -> applyQueueFilters());

        queuesStatusFilter = new ComboBox<>();
        queuesStatusFilter.getItems().addAll("All statuses", "waiting", "in-progress", "completed", "cancelled");
        queuesStatusFilter.setValue("All statuses");
        queuesStatusFilter.setOnAction(e -> applyQueueFilters());

        queuesServiceFilter = new ComboBox<>();
        queuesServiceFilter.getItems().add("All services");
        queuesServiceFilter.setValue("All services");
        queuesServiceFilter.setOnAction(e -> applyQueueFilters());

        filters.getChildren().addAll(queuesSearchField, queuesStatusFilter, queuesServiceFilter);

        allQueuesBox = new VBox(15);

        container.getChildren().addAll(header, filters, allQueuesBox);
        scroll.setContent(container);
        tab.setContent(scroll);

        return tab;
    }

    private void loadAllQueuesAsync() {
        Task<String> task = new Task<String>() {
            @Override
            protected String call() throws Exception {
                System.out.println("🔄 [DEBUG] Calling apiClient.getAllQueues()...");
                String response = apiClient.getAllQueues();
                System.out.println("✅ [DEBUG] getAllQueues() returned: " + (response != null ? response.substring(0, Math.min(100, response.length())) + "..." : "NULL"));
                return response;
            }

            @Override
            protected void succeeded() {
                try {
                    String rawResponse = getValue();
                    if (rawResponse == null || rawResponse.trim().isEmpty()) {
                        throw new Exception("Empty response from API");
                    }
                    
                    JSONArray arr = new JSONArray(rawResponse);
                    System.out.println("📈 [DEBUG] Parsed " + arr.length() + " queues");
                    
                    cachedQueues = new ArrayList<>();
                    Set<String> serviceTypes = new HashSet<>();

                    for (int i = 0; i < arr.length(); i++) {
                        JSONObject item = arr.getJSONObject(i);
                        cachedQueues.add(item);
                        String st = item.optString("serviceType", "");
                        if (!st.isEmpty()) serviceTypes.add(st);
                    }

                    Platform.runLater(() -> {
                        String currentVal = queuesServiceFilter.getValue();
                        if (currentVal == null) currentVal = "All services";
                        
                        queuesServiceFilter.getItems().clear();
                        queuesServiceFilter.getItems().add("All services");
                        
                        List<String> sorted = new ArrayList<>(serviceTypes);
                        Collections.sort(sorted);
                        queuesServiceFilter.getItems().addAll(sorted);
                        
                        if (queuesServiceFilter.getItems().contains(currentVal)) {
                            queuesServiceFilter.setValue(currentVal);
                        } else {
                            queuesServiceFilter.setValue("All services");
                        }
                        
                        applyQueueFilters();
                    });
                } catch (Exception ex) {
                    System.err.println("❌ [ERROR] Queues parse failed: " + ex.getMessage());
                    ex.printStackTrace();
                    Platform.runLater(() -> showEmptyQueuesWithError("Parse error: " + ex.getMessage()));
                }
            }

            @Override
            protected void failed() {
                Throwable ex = getException();
                System.err.println("💥 [API ERROR] getAllQueues() failed: " + ex.getMessage());
                ex.printStackTrace();
                Platform.runLater(() -> showEmptyQueuesWithError("API Error: " + ex.getMessage()));
            }
        };
        new Thread(task).start();
    }

    private void showEmptyQueuesWithError(String error) {
        allQueuesBox.getChildren().clear();
        VBox errorBox = new VBox(10);
        errorBox.setPadding(new Insets(30));
        errorBox.setAlignment(Pos.CENTER);
        
        Label errorIcon = new Label("⚠️");
        errorIcon.setFont(Font.font(40));
        
        Label errorLabel = new Label(error);
        errorLabel.setTextFill(Color.web("#f44336"));
        errorLabel.setFont(Font.font(14));
        errorLabel.setWrapText(true);
        
        Label hint = new Label("Check console logs for detailed error info");
        hint.setTextFill(Color.web("#999"));
        hint.setFont(Font.font(12));
        
        errorBox.getChildren().addAll(errorIcon, errorLabel, hint);
        allQueuesBox.getChildren().add(errorBox);
    }

    private void applyQueueFilters() {
        allQueuesBox.getChildren().clear();

        if (cachedQueues.isEmpty()) {
            Label empty = new Label("No queue bookings found");
            empty.setFont(Font.font(14));
            empty.setTextFill(Color.web("#999"));
            empty.setPadding(new Insets(40));
            allQueuesBox.getChildren().add(empty);
            return;
        }

        String q = queuesSearchField != null ? queuesSearchField.getText().trim().toLowerCase() : "";
        String statusSel = queuesStatusFilter != null && queuesStatusFilter.getValue() != null ? queuesStatusFilter.getValue() : "All statuses";
        String serviceSel = queuesServiceFilter != null && queuesServiceFilter.getValue() != null ? queuesServiceFilter.getValue() : "All services";

        List<JSONObject> filtered = cachedQueues.stream().filter(item -> {
            String name = item.optString("name", "").toLowerCase();
            String status = item.optString("status", "waiting");
            String serviceType = item.optString("serviceType", "");
            String queueId = item.optString("queue_id", "").toLowerCase();
            String userIdStr = String.valueOf(item.optInt("user_id", 0));

            boolean textMatch = q.isEmpty() || name.contains(q) || queueId.contains(q) || userIdStr.contains(q);
            boolean statusMatch = "All statuses".equals(statusSel) || statusSel.equalsIgnoreCase(status);
            boolean serviceMatch = "All services".equals(serviceSel) || serviceSel.equalsIgnoreCase(serviceType);

            return textMatch && statusMatch && serviceMatch;
        }).collect(Collectors.toList());

        if (filtered.isEmpty()) {
            Label none = new Label("No bookings match current filters.");
            none.setTextFill(Color.web("#999"));
            none.setPadding(new Insets(20));
            allQueuesBox.getChildren().add(none);
            return;
        }

        for (JSONObject item : filtered) {
            allQueuesBox.getChildren().add(createQueueCard(item));
        }
    }

    private VBox createQueueCard(JSONObject item) {
        VBox card = new VBox(15);
        card.setPadding(new Insets(20));
        card.setStyle("-fx-background-color: white; -fx-background-radius: 10; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.08), 8, 0, 0, 2);");

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
        statusLabel.setStyle("-fx-background-radius: 12; -fx-font-size: 11; -fx-font-weight: bold; " + getStatusStyle(status));

        header.getChildren().addAll(serviceLabel, spacer, statusLabel);

        GridPane details = new GridPane();
        details.setHgap(25);
        details.setVgap(10);

        details.add(createDetailRow("👤 Name:", item.optString("name", "N/A")), 0, 0);
        details.add(createDetailRow("👥 User ID:", "#" + item.optInt("user_id", 0)), 1, 0);
        details.add(createDetailRow("📝 Purpose:", item.optString("purpose", "N/A")), 0, 1, 2, 1);
        details.add(createDetailRow("📍 Position:", "#" + item.optInt("position", 0)), 0, 2);
        details.add(createDetailRow("🆔 Queue ID:", shortId(item.optString("queue_id", "N/A"))), 1, 2);

        HBox actions = new HBox(10);
        actions.setAlignment(Pos.CENTER_RIGHT);

        String queueId = item.optString("queue_id", "");

        Button updateBtn = new Button("Update Status");
        updateBtn.setStyle(createButtonStyle("warning"));
        updateBtn.setOnAction(e -> showUpdateQueueDialog(queueId));

        Button deleteBtn = new Button("Delete");
        deleteBtn.setStyle(createButtonStyle("danger"));
        deleteBtn.setOnAction(e -> deleteQueue(queueId));

        actions.getChildren().addAll(updateBtn, deleteBtn);

        card.getChildren().addAll(header, new Separator(), details, actions);
        return card;
    }

    private String getStatusStyle(String status) {
        switch (status.toLowerCase()) {
            case "waiting": return "-fx-background-color: #fff3cd; -fx-text-fill: #856404;";
            case "in-progress": return "-fx-background-color: #cfe2ff; -fx-text-fill: #084298;";
            case "completed": return "-fx-background-color: #d1e7dd; -fx-text-fill: #0f5132;";
            case "cancelled": return "-fx-background-color: #f8d7da; -fx-text-fill: #842029;";
            default: return "-fx-background-color: #e2e3e5; -fx-text-fill: #41464b;";
        }
    }

    private void showUpdateQueueDialog(String queueId) {
        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle("Update Queue Status");
        dialog.setHeaderText("Select new status for: " + shortId(queueId));

        VBox content = new VBox(15);
        content.setPadding(new Insets(20));

        ComboBox<String> statusBox = new ComboBox<>();
        statusBox.getItems().addAll("waiting", "in-progress", "completed", "cancelled");
        statusBox.setValue("completed");
        statusBox.setPrefWidth(250);

        content.getChildren().addAll(new Label("Status:"), statusBox);

        dialog.getDialogPane().setContent(content);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.showAndWait().ifPresent(response -> {
            if (response == ButtonType.OK) {
                Task<Void> task = new Task<Void>() {
                    @Override
                    protected Void call() throws Exception {
                        apiClient.adminUpdateQueue(queueId, null, statusBox.getValue());
                        return null;
                    }

                    @Override
                    protected void succeeded() {
                        showInfo("Success", "Status Updated", "Queue status updated!");
                        loadAllQueuesAsync();
                        loadStatisticsAsync();
                    }

                    @Override
                    protected void failed() {
                        showError("Error: " + getException().getMessage());
                    }
                };
                new Thread(task).start();
            }
        });
    }

    private void deleteQueue(String queueId) {
        Alert confirm = new Alert(Alert.AlertType.CONFIRMATION);
        confirm.setTitle("Confirm Delete");
        confirm.setHeaderText("Delete Queue Booking");
        confirm.setContentText("Delete this booking? This cannot be undone.");
        confirm.showAndWait().ifPresent(response -> {
            if (response == ButtonType.OK) {
                Task<Void> task = new Task<Void>() {
                    @Override
                    protected Void call() throws Exception {
                        apiClient.adminDeleteQueue(queueId);
                        return null;
                    }

                    @Override
                    protected void succeeded() {
                        showInfo("Success", "Booking Deleted", "Queue booking deleted!");
                        loadAllQueuesAsync();
                        loadStatisticsAsync();
                    }

                    @Override
                    protected void failed() {
                        showError("Error: " + getException().getMessage());
                    }
                };
                new Thread(task).start();
            }
        });
    }

    private void exportQueuesCsv() {
        try {
            Path tmp = Files.createTempFile("queues-", ".csv");
            try (FileWriter fw = new FileWriter(tmp.toFile())) {
                fw.write("serviceType,status,name,user_id,purpose,position,queue_id\n");
                for (JSONObject q : cachedQueues) {
                    fw.write(String.join(",",
                            csv(q.optString("serviceType", "")),
                            csv(q.optString("status", "")),
                            csv(q.optString("name", "")),
                            String.valueOf(q.optInt("user_id", 0)),
                            csv(q.optString("purpose", "")),
                            String.valueOf(q.optInt("position", 0)),
                            csv(q.optString("queue_id", ""))
                    ) + "\n");
                }
            }
            showInfo("Exported", "CSV created", "File: " + tmp.toAbsolutePath());
        } catch (Exception ex) {
            showError("Export failed: " + ex.getMessage());
        }
    }

    // ========== SETTINGS TAB ==========
    private Tab createSettingsTab() {
        Tab tab = new Tab("⚙️ Settings");
        VBox root = new VBox(15);
        root.setPadding(new Insets(30));

        Label title = new Label("Admin Settings");
        title.setFont(Font.font("System", FontWeight.BOLD, 20));
        title.setTextFill(Color.web("#2c3e50"));

        Label tip = new Label("💡 Future: Add role management, audit logs, and system configs here");
        tip.setFont(Font.font(13));
        tip.setTextFill(Color.web("#7f8c8d"));

        root.getChildren().addAll(title, new Separator(), tip);
        tab.setContent(root);
        return tab;
    }
}
