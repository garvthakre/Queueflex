// LoginScreen.java - Enhanced with modern UI and animations
import javafx.animation.*;
import javafx.geometry.*;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.effect.DropShadow;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.text.*;
import javafx.stage.Stage;
import javafx.util.Duration;

public class LoginScreen {
    private Stage stage;
    private ApiClient apiClient;
    
    public LoginScreen(Stage stage) {
        this.stage = stage;
        this.apiClient = new ApiClient();
    }
    
    public void show() {
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: linear-gradient(to bottom right, #667eea, #764ba2);");
        
        // Left side - Branding
        VBox leftPanel = createBrandingPanel();
        
        // Right side - Login form
        VBox rightPanel = createLoginForm();
        
        HBox mainContent = new HBox();
        mainContent.getChildren().addAll(leftPanel, rightPanel);
        HBox.setHgrow(leftPanel, Priority.ALWAYS);
        HBox.setHgrow(rightPanel, Priority.ALWAYS);
        
        root.setCenter(mainContent);
        
        Scene scene = new Scene(root, 1000, 650);
        stage.setScene(scene);
        stage.centerOnScreen();
        stage.show();
        
        // Slide in animation
        TranslateTransition slideIn = new TranslateTransition(Duration.millis(600), rightPanel);
        slideIn.setFromX(400);
        slideIn.setToX(0);
        slideIn.setInterpolator(Interpolator.EASE_OUT);
        slideIn.play();
    }
    
    private VBox createBrandingPanel() {
        VBox panel = new VBox(30);
        panel.setAlignment(Pos.CENTER);
        panel.setPadding(new Insets(50));
        panel.setPrefWidth(500);
        
        Label icon = new Label("🎫");
        icon.setFont(Font.font(100));
        
        Label title = new Label("QueueFlex");
        title.setFont(Font.font("System", FontWeight.BOLD, 48));
        title.setTextFill(Color.WHITE);
        
        Label subtitle = new Label("Smart Queue Management");
        subtitle.setFont(Font.font("System", FontWeight.NORMAL, 20));
        subtitle.setTextFill(Color.web("#e0e0e0"));
        
        VBox features = new VBox(15);
        features.setAlignment(Pos.CENTER_LEFT);
        features.setMaxWidth(350);
        
        features.getChildren().addAll(
            createFeatureItem("✓", "Real-time queue tracking"),
            createFeatureItem("✓", "Multiple service management"),
            createFeatureItem("✓", "Instant notifications"),
            createFeatureItem("✓", "Admin analytics dashboard")
        );
        
        panel.getChildren().addAll(icon, title, subtitle, features);
        
        // Fade in animation
        FadeTransition fade = new FadeTransition(Duration.millis(800), panel);
        fade.setFromValue(0);
        fade.setToValue(1);
        fade.play();
        
        return panel;
    }
    
    private HBox createFeatureItem(String icon, String text) {
        HBox item = new HBox(15);
        item.setAlignment(Pos.CENTER_LEFT);
        
        Label iconLabel = new Label(icon);
        iconLabel.setFont(Font.font(18));
        iconLabel.setTextFill(Color.web("#4caf50"));
        iconLabel.setStyle("-fx-font-weight: bold;");
        
        Label textLabel = new Label(text);
        textLabel.setFont(Font.font(16));
        textLabel.setTextFill(Color.WHITE);
        
        item.getChildren().addAll(iconLabel, textLabel);
        return item;
    }
    
    private VBox createLoginForm() {
        VBox panel = new VBox(25);
        panel.setAlignment(Pos.CENTER);
        panel.setPadding(new Insets(50));
        panel.setPrefWidth(500);
        panel.setStyle("-fx-background-color: white; -fx-background-radius: 0;");
        
        VBox formContainer = new VBox(20);
        formContainer.setMaxWidth(350);
        formContainer.setAlignment(Pos.CENTER);
        
        Label welcomeLabel = new Label("Welcome Back");
        welcomeLabel.setFont(Font.font("System", FontWeight.BOLD, 32));
        welcomeLabel.setTextFill(Color.web("#2c3e50"));
        
        Label instructionLabel = new Label("Sign in to continue to QueueFlex");
        instructionLabel.setFont(Font.font(14));
        instructionLabel.setTextFill(Color.web("#7f8c8d"));
        
        // Email field with icon
        VBox emailBox = new VBox(8);
        Label emailLabel = new Label("Email Address");
        emailLabel.setFont(Font.font("System", FontWeight.SEMI_BOLD, 12));
        emailLabel.setTextFill(Color.web("#555"));
        
        TextField emailField = new TextField();
        emailField.setPromptText("Enter your email");
        emailField.setPrefHeight(45);
        emailField.setStyle("-fx-background-radius: 8; -fx-border-color: #ddd; " +
                           "-fx-border-radius: 8; -fx-padding: 10; " +
                           "-fx-font-size: 14;");
        
        emailBox.getChildren().addAll(emailLabel, emailField);
        
        // Password field with icon
        VBox passwordBox = new VBox(8);
        Label passwordLabel = new Label("Password");
        passwordLabel.setFont(Font.font("System", FontWeight.SEMI_BOLD, 12));
        passwordLabel.setTextFill(Color.web("#555"));
        
        PasswordField passwordField = new PasswordField();
        passwordField.setPromptText("Enter your password");
        passwordField.setPrefHeight(45);
        passwordField.setStyle("-fx-background-radius: 8; -fx-border-color: #ddd; " +
                              "-fx-border-radius: 8; -fx-padding: 10; " +
                              "-fx-font-size: 14;");
        
        passwordBox.getChildren().addAll(passwordLabel, passwordField);
        
        // Remember me and forgot password
        HBox optionsBox = new HBox();
        optionsBox.setAlignment(Pos.CENTER_LEFT);
        
        CheckBox rememberMe = new CheckBox("Remember me");
        rememberMe.setTextFill(Color.web("#555"));
        
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        
        Hyperlink forgotPassword = new Hyperlink("Forgot Password?");
        forgotPassword.setTextFill(Color.web("#667eea"));
        forgotPassword.setStyle("-fx-font-size: 12;");
        
        optionsBox.getChildren().addAll(rememberMe, spacer, forgotPassword);
        
        // Login button
        Button loginButton = new Button("Sign In");
        loginButton.setPrefHeight(45);
        loginButton.setMaxWidth(Double.MAX_VALUE);
        loginButton.setStyle("-fx-background-color: #667eea; -fx-text-fill: white; " +
                           "-fx-background-radius: 8; -fx-font-size: 15; " +
                           "-fx-font-weight: bold; -fx-cursor: hand;");
        
        DropShadow shadow = new DropShadow();
        shadow.setColor(Color.web("#667eea", 0.3));
        shadow.setRadius(10);
        loginButton.setEffect(shadow);
        
        // Message label
        Label messageLabel = new Label();
        messageLabel.setWrapText(true);
        messageLabel.setMaxWidth(350);
        messageLabel.setAlignment(Pos.CENTER);
        messageLabel.setStyle("-fx-font-size: 13;");
        
        // Signup link
        HBox signupBox = new HBox(5);
        signupBox.setAlignment(Pos.CENTER);
        
        Label noAccountLabel = new Label("Don't have an account?");
        noAccountLabel.setTextFill(Color.web("#7f8c8d"));
        
        Hyperlink signupLink = new Hyperlink("Sign Up");
        signupLink.setStyle("-fx-text-fill: #667eea; -fx-font-weight: bold;");
        signupLink.setOnAction(e -> {
            SignupScreen signupScreen = new SignupScreen(stage, apiClient);
            signupScreen.show();
        });
        
        signupBox.getChildren().addAll(noAccountLabel, signupLink);
        
        // Hover effects
        loginButton.setOnMouseEntered(e -> {
            loginButton.setStyle("-fx-background-color: #5568d3; -fx-text-fill: white; " +
                               "-fx-background-radius: 8; -fx-font-size: 15; " +
                               "-fx-font-weight: bold; -fx-cursor: hand;");
            ScaleTransition scale = new ScaleTransition(Duration.millis(100), loginButton);
            scale.setToX(1.02);
            scale.setToY(1.02);
            scale.play();
        });
        
        loginButton.setOnMouseExited(e -> {
            loginButton.setStyle("-fx-background-color: #667eea; -fx-text-fill: white; " +
                               "-fx-background-radius: 8; -fx-font-size: 15; " +
                               "-fx-font-weight: bold; -fx-cursor: hand;");
            ScaleTransition scale = new ScaleTransition(Duration.millis(100), loginButton);
            scale.setToX(1.0);
            scale.setToY(1.0);
            scale.play();
        });
        
        // Focus effects
        emailField.setOnMouseClicked(e -> {
            emailField.setStyle("-fx-background-radius: 8; -fx-border-color: #667eea; " +
                              "-fx-border-width: 2; -fx-border-radius: 8; -fx-padding: 10; " +
                              "-fx-font-size: 14;");
        });
        
        passwordField.setOnMouseClicked(e -> {
            passwordField.setStyle("-fx-background-radius: 8; -fx-border-color: #667eea; " +
                                 "-fx-border-width: 2; -fx-border-radius: 8; -fx-padding: 10; " +
                                 "-fx-font-size: 14;");
        });
        
        // Login action
        loginButton.setOnAction(e -> handleLogin(emailField, passwordField, messageLabel, loginButton));
        
        // Enter key support
        passwordField.setOnAction(e -> handleLogin(emailField, passwordField, messageLabel, loginButton));
        
        formContainer.getChildren().addAll(
            welcomeLabel,
            instructionLabel,
            emailBox,
            passwordBox,
            optionsBox,
            loginButton,
            messageLabel,
            signupBox
        );
        
        panel.getChildren().add(formContainer);
        return panel;
    }
    
    private void handleLogin(TextField emailField, PasswordField passwordField, 
                            Label messageLabel, Button loginButton) {
        String email = emailField.getText().trim();
        String password = passwordField.getText();
        
        if (email.isEmpty() || password.isEmpty()) {
            showMessage(messageLabel, "Please enter both email and password", false);
            shakeNode(emailField.getParent().getParent());
            return;
        }
        
        // Disable button and show loading
        loginButton.setDisable(true);
        loginButton.setText("Signing in...");
        
        // Simulate async operation
        new Thread(() -> {
            try {
                boolean success = apiClient.login(email, password);
                
                javafx.application.Platform.runLater(() -> {
                    if (success) {
                        showMessage(messageLabel, "Login successful! Redirecting...", true);
                        
                        // Delay before switching screens
                        PauseTransition pause = new PauseTransition(Duration.seconds(1));
                        pause.setOnFinished(event -> {
                            if (apiClient.isAdmin()) {
                                AdminScreen adminScreen = new AdminScreen(stage, apiClient);
                                adminScreen.show();
                            } else {
                                QueueScreen queueScreen = new QueueScreen(stage, apiClient);
                                queueScreen.show();
                            }
                        });
                        pause.play();
                    } else {
                        showMessage(messageLabel, "Invalid email or password", false);
                        loginButton.setDisable(false);
                        loginButton.setText("Sign In");
                    }
                });
            } catch (Exception ex) {
                javafx.application.Platform.runLater(() -> {
                    showMessage(messageLabel, "Error: " + ex.getMessage(), false);
                    loginButton.setDisable(false);
                    loginButton.setText("Sign In");
                });
            }
        }).start();
    }
    
    private void showMessage(Label label, String message, boolean success) {
        label.setText(message);
        label.setStyle("-fx-text-fill: " + (success ? "#4caf50" : "#f44336") + 
                      "; -fx-font-weight: bold;");
        
        FadeTransition fade = new FadeTransition(Duration.millis(300), label);
        fade.setFromValue(0);
        fade.setToValue(1);
        fade.play();
    }
    
    private void shakeNode(javafx.scene.Node node) {
        TranslateTransition shake = new TranslateTransition(Duration.millis(50), node);
        shake.setFromX(0);
        shake.setByX(10);
        shake.setCycleCount(6);
        shake.setAutoReverse(true);
        shake.play();
    }
}