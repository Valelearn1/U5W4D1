package valentinaferro.u5w4d1.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import valentinaferro.u5w4d1.payloads.ErrorResponseDTO;

import java.time.LocalDateTime;
import java.util.List;

// Intercetta le eccezioni lanciate dai controller e le traduce in risposte JSON pulite.
@RestControllerAdvice
public class ExceptionsHandler {

    // POI non trovato -> 404
    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponseDTO handleNotFound(NotFoundException ex) {
        return new ErrorResponseDTO(LocalDateTime.now(), 404, ex.getMessage(), null);
    }

    // Body non valido (@Valid fallito) -> 400 con la lista dei campi sbagliati
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponseDTO handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                .toList();
        return new ErrorResponseDTO(LocalDateTime.now(), 400, "Dati non validi", errors);
    }

    // Qualsiasi altra eccezione non gestita -> 500 (senza esporre lo stacktrace)
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponseDTO handleGeneric(Exception ex) {
        return new ErrorResponseDTO(LocalDateTime.now(), 500, "Errore interno del server", null);
    }
}
