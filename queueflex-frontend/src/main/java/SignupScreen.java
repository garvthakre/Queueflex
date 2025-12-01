// SignupScreen.java
import javafx.geometry.*;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.Stage;

public class SignupScreen {
    private Stage stage;
    private ApiClient apiClient;
    
    public SignupScreen(Stage stage, ApiClient apiClient) {
        this.stage = stage;
        this.apiClient = apiClient;
    }
    
    public void show() {
        VBox layout = new VBox(15);
        layout.setPadding(new Insets(30));
        layout.setAlignment(Pos.CENTER);
        
        Label titleLabel = new Label("Sign Up");
        titleLabel.setStyle("-fx-font-size: 24px; -fx-font-weight: bold;");
        
        TextField nameField = new TextField();
        nameField.setPromptText("Full Name");
        nameField.setMaxWidth(300);
        
        TextField emailField = new TextField();
        emailField.setPromptText("Email");
        emailField.setMaxWidth(300);
        
        PasswordField passwordField = new PasswordField();
        passwordField.setPromptText("Password");
        passwordField.setMaxWidth(300);
        
        CheckBox adminCheckBox = new CheckBox("Register as Admin");
        
        Button signupButton = new Button("Sign Up");
        signupButton.setMaxWidth(300);
        signupButton.setStyle("-fx-background-color: #4CAF50; -fx-text-fill: white;");
        
        Button backButton = new Button("Back to Login");
        backButton.setMaxWidth(300);
        backButton.setStyle("-fx-background-color: #757575; -fx-text-fill: white;");
        
        Label messageLabel = new Label();
        messageLabel.setStyle("-fx-text-fill: red;");
        
        signupButton.setOnAction(e -> {
            String name = nameField.getText();
            String email = emailField.getText();
            String password = passwordField.getText();
            boolean isAdmin = adminCheckBox.isSelected();
            
            if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
                messageLabel.setText("Please fill all fields");
                return;
            }
            
            try {
                String response = apiClient.signup(name, email, password, isAdmin);
                messageLabel.setStyle("-fx-text-fill: green;");
                messageLabel.setText("Signup successful! Please login.");
                
                // Clear fields
                nameField.clear();
                emailField.clear();
                passwordField.clear();
                adminCheckBox.setSelected(false);
                
            } catch (Exception ex) {
                messageLabel.setStyle("-fx-text-fill: red;");
                messageLabel.setText("Error: " + ex.getMessage());
            }
        });
        
        backButton.setOnAction(e -> {
            LoginScreen loginScreen = new LoginScreen(stage);
            loginScreen.show();
        });
        
        layout.getChildren().addAll(
            titleLabel,
            new Label("Name:"),
            nameField,
            new Label("Email:"),
            emailField,
            new Label("Password:"),
            passwordField,
            adminCheckBox,
            signupButton,
            backButton,
            messageLabel
        );
        
        Scene scene = new Scene(layout, 400, 500);
        stage.setScene(scene);
        stage.show();
    }
}