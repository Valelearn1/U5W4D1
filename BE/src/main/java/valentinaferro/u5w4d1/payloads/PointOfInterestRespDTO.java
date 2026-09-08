package valentinaferro.u5w4d1.payloads;

import valentinaferro.u5w4d1.entities.PointOfInterest;
import valentinaferro.u5w4d1.entities.Tipologia;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// DTO di risposta: e' la forma del JSON che il backend restituisce al frontend.
// Contiene anche id e creatoIl (a differenza del DTO di input), perche' sono
// dati generati dal server che il client deve poter leggere.
public record PointOfInterestRespDTO(
        Long id,
        Tipologia tipologia,
        BigDecimal latitudine,
        BigDecimal longitudine,
        String indirizzo,
        String descrizione,
        LocalDateTime creatoIl
) {

    // Metodo "factory": prende un'entita' letta dal database e costruisce il DTO
    // corrispondente. Serve a tenere la conversione entita' -> DTO in un solo
    // posto, cosi' nel Service basta chiamare PointOfInterestRespDTO.fromEntity(poi).
    public static PointOfInterestRespDTO fromEntity(PointOfInterest p) {
        return new PointOfInterestRespDTO(
                p.getId(),
                p.getTipologia(),
                p.getLatitudine(),
                p.getLongitudine(),
                p.getIndirizzo(),
                p.getDescrizione(),
                p.getCreatoIl()
        );
    }
}
