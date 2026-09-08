package valentinaferro.u5w4d1.payloads;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import valentinaferro.u5w4d1.entities.Tipologia;

import java.math.BigDecimal;

/*
È il JSON che il frontend manda quando crea o modifica un POI.
 */
public record NewPointOfInterestDTO(
        @NotNull
        Tipologia tipologia,
        @NotNull @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0")
        BigDecimal latitudine,
        @NotNull @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0")
        BigDecimal longitudine,
        @Size(max = 255)
        String indirizzo, // opzionale
        @Size(max = 255)
        String descrizione // opzionale
) {
}
