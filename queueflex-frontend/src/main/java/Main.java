// Main.java
import javafx.application.Application;
import javafx.stage.Stage;

public class Main extends Application {
    
    @Override
    public void start(Stage primaryStage) {
        primaryStage.setTitle("QueueFlex - Smart Queue Management");
        primaryStage.setMinWidth(900);
        primaryStage.setMinHeight(700);
        
        // Start with login screen
        LoginScreen loginScreen = new LoginScreen(primaryStage);
        loginScreen.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}