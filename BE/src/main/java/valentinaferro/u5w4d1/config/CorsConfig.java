package valentinaferro.u5w4d1.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Permette al frontend (che gira su un'altra origine/porta) di chiamare l'API.
// Senza questa configurazione il browser blocca le richieste con errore CORS.
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    // Origini del frontend, lette da application.properties (separate da virgola).
    @Value("${frontend.origins}")
    private String[] frontendOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(frontendOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
