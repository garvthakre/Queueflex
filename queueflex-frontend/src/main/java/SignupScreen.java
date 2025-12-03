// SignupScreen.java - Enhanced with validation and better UX
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

public class SignupScreen {
    private Stage stage;
    private ApiClient apiClient;
    
    public SignupScreen(Stage stage, ApiClient apiClient) {
        this.stage = stage;
        this.apiClient = apiClient;
    }
    
    public void show() {
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: linear-gradient(to bottom right, #667eea, #764ba2);");
        
        VBox leftPanel = createBrandingPanel();
        VBox rightPanel = createSignupForm();
        
        HBox mainContent = new HBox();
        mainContent.getChildren().addAll(leftPanel, rightPanel);
        HBox.setHgrow(leftPanel, Priority.ALWAYS);
        HBox.setHgrow(rightPanel, Priority.ALWAYS);
        
        root.setCenter(mainContent);
        
        Scene scene = new Scene(root, 1000, 700);
        stage.setScene(scene);
        stage.centerOnScreen();
        stage.show();
        
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
        
        Label title = new Label("Join QueueFlex");
        title.setFont(Font.font("System", FontWeight.BOLD, 42));
        title.setTextFill(Color.WHITE);
        
        Label subtitle = new Label("Start managing queues efficiently");
        subtitle.setFont(Font.font("System", FontWeight.NORMAL, 18));
        subtitle.setTextFill(Color.web("#e0e0e0"));
        
        VBox benefits = new VBox(15);
        benefits.setAlignment(Pos.CENTER_LEFT);
        benefits.setMaxWidth(350);
        
        benefits.getChildren().addAll(
            createBenefitItem("⚡", "Quick Registration", "Get started in seconds"),
            createBenefitItem("🔒", "Secure Authentication", "Your data is encrypted"),
            createBenefitItem("📱", "Real-time Updates", "Never miss your turn"),
            createBenefitItem("👥", "Multi-user Support", "Admin and user roles")
        );
        
        panel.getChildren().addAll(icon, title, subtitle, benefits);
        
        FadeTransition fade = new FadeTransition(Duration.millis(800), panel);
        fade.setFromValue(0);
        fade.setToValue(1);
        fade.play();
        
        return panel;
    }
    
    private VBox createBenefitItem(String icon, String title, String description) {
        VBox item = new VBox(5);
        
        HBox header = new HBox(10);
        header.setAlignment(Pos.CENTER_LEFT);
        
        Label iconLabel = new Label(icon);
        iconLabel.setFont(Font.font(20));
        
        Label titleLabel = new Label(title);
        titleLabel.setFont(Font.font("System", FontWeight.BOLD, 15));
        titleLabel.setTextFill(Color.WHITE);
        
        header.getChildren().addAll(iconLabel, titleLabel);
        
        Label descLabel = new Label(description);
        descLabel.setFont(Font.font(13));
        descLabel.setTextFill(Color.web("#d0d0d0"));
        descLabel.setPadding(new Insets(0, 0, 0, 30));
        
        item.getChildren().addAll(header, descLabel);
        return item;
    }
    
    private VBox createSignupForm() {
        VBox panel = new VBox(20);
        panel.setAlignment(Pos.CENTER);
        panel.setPadding(new Insets(40));
        panel.setPrefWidth(500);
        panel.setStyle("-fx-background-color: white;");
        
        ScrollPane scrollPane = new ScrollPane();
        scrollPane.setFitToWidth(true);
        scrollPane.setStyle("-fx-background: white; -fx-background-color: transparent;");
        scrollPane.setPrefViewportHeight(600);
        
        VBox formContainer = new VBox(18);
        formContainer.setMaxWidth(380);
        formContainer.setAlignment(Pos.CENTER);
        formContainer.setPadding(new Insets(20, 0, 20, 0));
        
        Label welcomeLabel = new Label("Create Account");
        welcomeLabel.setFont(Font.font("System", FontWeight.BOLD, 30));
        welcomeLabel.setTextFill(Color.web("#2c3e50"));
        
        Label instructionLabel = new Label("Fill in the details to get started");
        instructionLabel.setFont(Font.font(13));
        instructionLabel.setTextFill(Color.web("#7f8c8d"));
        
        // Name field
        VBox nameBox = createInputField("Full Name", "Enter your full name", false);
        TextField nameField = (TextField) nameBox.getChildren().get(1);
        
        // Email field
        VBox emailBox = createInputField("Email Address", "Enter your email", false);
        TextField emailField = (TextField) emailBox.getChildren().get(1);
        Label emailValidation = new Label();
        emailValidation.setStyle("-fx-text-fill: #f44336; -fx-font-size: 11;");
        emailBox.getChildren().add(emailValidation);
        
        // Email validation
        emailField.textProperty().addListener((obs, old, newVal) -> {
            if (!newVal.isEmpty() && !newVal.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                emailValidation.setText("⚠ Please enter a valid email address");
                emailField.setStyle("-fx-background-radius: 8; -fx-border-color: #f44336; " +
                                  "-fx-border-width: 2; -fx-border-radius: 8; -fx-padding: 10; " +
                                  "-fx-font-size: 14;");
            } else {
                emailValidation.setText("");
                emailField.setStyle("-fx-background-radius: 8; -fx-border-color: #ddd; " +
                                  "-fx-border-radius: 8; -fx-padding: 10; -fx-font-size: 14;");
            }
        });
        
        // Password field
        VBox passwordBox = createInputField("Password", "Create a strong password", true);
        PasswordField passwordField = (PasswordField) passwordBox.getChildren().get(1);
        
        // Password strength indicator
        ProgressBar strengthBar = new ProgressBar(0);
        strengthBar.setPrefWidth(380);
        strengthBar.setPrefHeight(5);
        Label strengthLabel = new Label("Password strength: ");
        strengthLabel.setFont(Font.font(11));
        strengthLabel.setTextFill(Color.web("#666"));
        
        HBox strengthBox = new HBox(10);
        strengthBox.setAlignment(Pos.CENTER_LEFT);
        strengthBox.getChildren().addAll(strengthLabel, strengthBar);
        passwordBox.getChildren().add(strengthBox);
        
        // Password strength check
        passwordField.textProperty().addListener((obs, old, newVal) -> {
            int strength = calculatePasswordStrength(newVal);
            strengthBar.setProgress(strength / 4.0);
            
            if (strength == 0) {
                strengthLabel.setText("Password strength: ");
                strengthBar.setStyle("-fx-accent: #ddd;");
            } else if (strength == 1) {
                strengthLabel.setText("Password strength: Weak");
                strengthBar.setStyle("-fx-accent: #f44336;");
            } else if (strength == 2) {
                strengthLabel.setText("Password strength: Fair");
                strengthBar.setStyle("-fx-accent: #ff9800;");
            } else if (strength == 3) {
                strengthLabel.setText("Password strength: Good");
                strengthBar.setStyle("-fx-accent: #2196f3;");
            } else {
                strengthLabel.setText("Password strength: Strong");
                strengthBar.setStyle("-fx-accent: #4caf50;");
            }
        });
        
        // Confirm password field
        VBox confirmPasswordBox = createInputField("Confirm Password", "Re-enter your password", true);
        PasswordField confirmPasswordField = (PasswordField) confirmPasswordBox.getChildren().get(1);
        Label confirmValidation = new Label();
        confirmValidation.setStyle("-fx-text-fill: #f44336; -fx-font-size: 11;");
        confirmPasswordBox.getChildren().add(confirmValidation);
        
        confirmPasswordField.textProperty().addListener((obs, old, newVal) -> {
            if (!newVal.isEmpty() && !newVal.equals(passwordField.getText())) {
                confirmValidation.setText("⚠ Passwords do not match");
            } else {
                confirmValidation.setText("");
            }
        });
        
        // Admin checkbox
        HBox adminBox = new HBox(10);
        adminBox.setAlignment(Pos.CENTER_LEFT);
        adminBox.setStyle("-fx-background-color: #f5f7fa; -fx-padding: 15; -fx-background-radius: 8;");
        
        CheckBox adminCheckBox = new CheckBox();
        VBox adminText = new VBox(3);
        Label adminLabel = new Label("Register as Administrator");
        adminLabel.setFont(Font.font("System", FontWeight.BOLD, 13));
        Label adminDesc = new Label("Get access to advanced management features");
        adminDesc.setFont(Font.font(11));
        adminDesc.setTextFill(Color.web("#666"));
        adminText.getChildren().addAll(adminLabel, adminDesc);
        
        adminBox.getChildren().addAll(adminCheckBox, adminText);
        
        // Terms checkbox
        HBox termsBox = new HBox(8);
        termsBox.setAlignment(Pos.CENTER_LEFT);
        CheckBox termsCheckBox = new CheckBox();
        Label termsLabel = new Label("I agree to the ");
        Hyperlink termsLink = new Hyperlink("Terms and Conditions");
        termsLink.setStyle("-fx-text-fill: #667eea;");
        termsBox.getChildren().addAll(termsCheckBox, termsLabel, termsLink);
        
        // Message label
        Label messageLabel = new Label();
        messageLabel.setWrapText(true);
        messageLabel.setMaxWidth(380);
        messageLabel.setAlignment(Pos.CENTER);
        messageLabel.setStyle("-fx-font-size: 13;");
        
        // Signup button
        Button signupButton = new Button("Create Account");
        signupButton.setPrefHeight(45);
        signupButton.setMaxWidth(Double.MAX_VALUE);
        signupButton.setStyle("-fx-background-color: #667eea; -fx-text-fill: white; " +
                             "-fx-background-radius: 8; -fx-font-size: 15; " +
                             "-fx-font-weight: bold; -fx-cursor: hand;");
        
        DropShadow shadow = new DropShadow();
        shadow.setColor(Color.web("#667eea", 0.3));
        shadow.setRadius(10);
        signupButton.setEffect(shadow);
        
        // Back to login
        HBox loginBox = new HBox(5);
        loginBox.setAlignment(Pos.CENTER);
        Label haveAccountLabel = new Label("Already have an account?");
        haveAccountLabel.setTextFill(Color.web("#7f8c8d"));
        Hyperlink loginLink = new Hyperlink("Sign In");
        loginLink.setStyle("-fx-text-fill: #667eea; -fx-font-weight: bold;");
        loginLink.setOnAction(e -> {
            LoginScreen loginScreen = new LoginScreen(stage);
            loginScreen.show();
        });
        loginBox.getChildren().addAll(haveAccountLabel, loginLink);
        
        // Hover effect
        signupButton.setOnMouseEntered(e -> {
            signupButton.setStyle("-fx-background-color: #5568d3; -fx-text-fill: white; " +
                                "-fx-background-radius: 8; -fx-font-size: 15; " +
                                "-fx-font-weight: bold; -fx-cursor: hand;");
        });
        
        signupButton.setOnMouseExited(e -> {
            signupButton.setStyle("-fx-background-color: #667eea; -fx-text-fill: white; " +
                                "-fx-background-radius: 8; -fx-font-size: 15; " +
                                "-fx-font-weight: bold; -fx-cursor: hand;");
        });
        
        // Signup action
        signupButton.setOnAction(e -> handleSignup(nameField, emailField, passwordField, 
            confirmPasswordField, adminCheckBox, termsCheckBox, messageLabel, signupButton));
        
        formContainer.getChildren().addAll(
            welcomeLabel, instructionLabel, nameBox, emailBox, passwordBox, 
            confirmPasswordBox, adminBox, termsBox, signupButton, messageLabel, loginBox
        );
        
        scrollPane.setContent(formContainer);
        panel.getChildren().add(scrollPane);
        return panel;
    }
    
    private VBox createInputField(String label, String prompt, boolean isPassword) {
        VBox box = new VBox(8);
        
        Label fieldLabel = new Label(label);
        fieldLabel.setFont(Font.font("System", FontWeight.SEMI_BOLD, 12));
        fieldLabel.setTextFill(Color.web("#555"));
        
        Control field;
        if (isPassword) {
            field = new PasswordField();
        } else {
            field = new TextField();
        }
        
        ((TextInputControl) field).setPromptText(prompt);
        field.setPrefHeight(45);
        field.setStyle("-fx-background-radius: 8; -fx-border-color: #ddd; " +
                      "-fx-border-radius: 8; -fx-padding: 10; -fx-font-size: 14;");
        
        box.getChildren().addAll(fieldLabel, field);
        return box;
    }
    
    private int calculatePasswordStrength(String password) {
        if (password.isEmpty()) return 0;
        
        int strength = 0;
        if (password.length() >= 8) strength++;
        if (password.matches(".*[a-z].*") && password.matches(".*[A-Z].*")) strength++;
        if (password.matches(".*\\d.*")) strength++;
        if (password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) strength++;
        
        return strength;
    }
    
    private void handleSignup(TextField nameField, TextField emailField, 
                             PasswordField passwordField, PasswordField confirmPasswordField,
                             CheckBox adminCheckBox, CheckBox termsCheckBox,
                             Label messageLabel, Button signupButton) {
        String name = nameField.getText().trim();
        String email = emailField.getText().trim();
        String password = passwordField.getText();
        String confirmPassword = confirmPasswordField.getText();
        boolean isAdmin = adminCheckBox.isSelected();
        
        // Validation
        if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
            showMessage(messageLabel, "⚠ Please fill in all required fields", false);
            return;
        }
        
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            showMessage(messageLabel, "⚠ Please enter a valid email address", false);
            return;
        }
        
        if (password.length() < 6) {
            showMessage(messageLabel, "⚠ Password must be at least 6 characters long", false);
            return;
        }
        
        if (!password.equals(confirmPassword)) {
            showMessage(messageLabel, "⚠ Passwords do not match", false);
            return;
        }
        
        if (!termsCheckBox.isSelected()) {
            showMessage(messageLabel, "⚠ Please agree to the Terms and Conditions", false);
            return;
        }
        
        signupButton.setDisable(true);
        signupButton.setText("Creating Account...");
        
        new Thread(() -> {
            try {
                String response = apiClient.signup(name, email, password, isAdmin);
                
                javafx.application.Platform.runLater(() -> {
                    showMessage(messageLabel, "✓ Account created successfully! Redirecting to login...", true);
                    
                    PauseTransition pause = new PauseTransition(Duration.seconds(2));
                    pause.setOnFinished(event -> {
                        LoginScreen loginScreen = new LoginScreen(stage);
                        loginScreen.show();
                    });
                    pause.play();
                });
            } catch (Exception ex) {
                javafx.application.Platform.runLater(() -> {
                    showMessage(messageLabel, "⚠ Error: " + ex.getMessage(), false);
                    signupButton.setDisable(false);
                    signupButton.setText("Create Account");
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
}