// LoginScreen.java
import javafx.geometry.*;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.Stage;

public class LoginScreen {
    private Stage stage;
    private ApiClient apiClient;
    
    public LoginScreen(Stage stage) {
        this.stage = stage;
        this.apiClient = new ApiClient();
    }
    
    public void show() {
        VBox layout = new VBox(15);
        layout.setPadding(new Insets(30));
        layout.setAlignment(Pos.CENTER);
        
        Label titleLabel = new Label("QueueFlex Login");
        titleLabel.setStyle("-fx-font-size: 24px; -fx-font-weight: bold;");
        
        TextField emailField = new TextField();
        emailField.setPromptText("Email");
        emailField.setMaxWidth(300);
        
        PasswordField passwordField = new PasswordField();
        passwordField.setPromptText("Password");
        passwordField.setMaxWidth(300);
        
        Button loginButton = new Button("Login");
        loginButton.setMaxWidth(300);
        loginButton.setStyle("-fx-background-color: #4CAF50; -fx-text-fill: white;");
        
        Button signupButton = new Button("Sign Up");
        signupButton.setMaxWidth(300);
        signupButton.setStyle("-fx-background-color: #2196F3; -fx-text-fill: white;");
        
        Label messageLabel = new Label();
        messageLabel.setStyle("-fx-text-fill: red;");
        
        loginButton.setOnAction(e -> {
            String email = emailField.getText();
            String password = passwordField.getText();
            
            if (email.isEmpty() || password.isEmpty()) {
                messageLabel.setText("Please enter email and password");
                return;
            }
            
            try {
                boolean success = apiClient.login(email, password);
                if (success) {
                    messageLabel.setStyle("-fx-text-fill: green;");
                    messageLabel.setText("Login successful!");
                    
                    // Show appropriate screen based on user type
                    if (apiClient.isAdmin()) {
                        AdminScreen adminScreen = new AdminScreen(stage, apiClient);
                        adminScreen.show();
                    } else {
                        QueueScreen queueScreen = new QueueScreen(stage, apiClient);
                        queueScreen.show();
                    }
                } else {
                    messageLabel.setStyle("-fx-text-fill: red;");
                    messageLabel.setText("Login failed!");
                }
            } catch (Exception ex) {
                messageLabel.setStyle("-fx-text-fill: red;");
                messageLabel.setText("Error: " + ex.getMessage());
            }
        });
        
        signupButton.setOnAction(e -> {
            SignupScreen signupScreen = new SignupScreen(stage, apiClient);
            signupScreen.show();
        });
        
        layout.getChildren().addAll(
            titleLabel,
            new Label("Email:"),
            emailField,
            new Label("Password:"),
            passwordField,
            loginButton,
            signupButton,
            messageLabel
        );
        
        Scene scene = new Scene(layout, 400, 450);
        stage.setScene(scene);
        stage.show();
    }
}