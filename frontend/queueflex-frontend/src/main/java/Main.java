// Main.java - Enhanced with splash screen and better initialization
import javafx.animation.*;
import javafx.application.Application;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.ProgressBar;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.stage.Stage;
import javafx.stage.StageStyle;
import javafx.util.Duration;

public class Main extends Application {
    
    @Override
    public void start(Stage primaryStage) {
        // Show splash screen first
        showSplashScreen(primaryStage);
    }
    
    private void showSplashScreen(Stage primaryStage) {
        Stage splashStage = new Stage();
        splashStage.initStyle(StageStyle.UNDECORATED);
        
        VBox splashLayout = new VBox(20);
        splashLayout.setAlignment(Pos.CENTER);
        splashLayout.setStyle("-fx-background-color: linear-gradient(to bottom right, #667eea, #764ba2); " +
                             "-fx-padding: 50;");
        
        Label logoLabel = new Label("🎫");
        logoLabel.setFont(Font.font(80));
        
        Label titleLabel = new Label("QueueFlex");
        titleLabel.setFont(Font.font("System", FontWeight.BOLD, 36));
        titleLabel.setTextFill(Color.WHITE);
        
        Label subtitleLabel = new Label("Smart Queue Management System");
        subtitleLabel.setFont(Font.font(14));
        subtitleLabel.setTextFill(Color.web("#e0e0e0"));
        
        ProgressBar progressBar = new ProgressBar();
        progressBar.setPrefWidth(300);
        progressBar.setStyle("-fx-accent: white;");
        
        Label loadingLabel = new Label("Loading...");
        loadingLabel.setFont(Font.font(12));
        loadingLabel.setTextFill(Color.WHITE);
        
        splashLayout.getChildren().addAll(logoLabel, titleLabel, subtitleLabel, progressBar, loadingLabel);
        
        Scene splashScene = new Scene(splashLayout, 500, 400);
        splashStage.setScene(splashScene);
        splashStage.centerOnScreen();
        splashStage.show();
        
        // Animate progress bar
        Timeline timeline = new Timeline(
            new KeyFrame(Duration.ZERO, new KeyValue(progressBar.progressProperty(), 0)),
            new KeyFrame(Duration.seconds(2), new KeyValue(progressBar.progressProperty(), 1))
        );
        
        timeline.setOnFinished(e -> {
            splashStage.close();
            showMainApp(primaryStage);
        });
        
        timeline.play();
    }
    
    private void showMainApp(Stage primaryStage) {
        primaryStage.setTitle("QueueFlex - Smart Queue Management");
        primaryStage.setMinWidth(1000);
        primaryStage.setMinHeight(750);
        
        // Start with login screen
        LoginScreen loginScreen = new LoginScreen(primaryStage);
        loginScreen.show();
        
        // Fade in animation
        FadeTransition fadeIn = new FadeTransition(Duration.millis(500), primaryStage.getScene().getRoot());
        fadeIn.setFromValue(0);
        fadeIn.setToValue(1);
        fadeIn.play();
    }

    public static void main(String[] args) {
        launch(args);
    }
}