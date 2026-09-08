package valentinaferro.u5w4d1.payloads;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;

// Forma delle risposte di errore dell'API.
// "errors" e' valorizzato solo per gli errori di validazione; altrimenti e' null
// e @JsonInclude(NON_NULL) lo tiene fuori dal JSON.
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponseDTO(
        LocalDateTime timestamp,
        int status,
        String message,
        List<String> errors
) {
}
