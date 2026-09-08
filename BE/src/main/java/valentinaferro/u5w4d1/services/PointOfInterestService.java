package valentinaferro.u5w4d1.services;

import org.springframework.stereotype.Service;
import valentinaferro.u5w4d1.entities.PointOfInterest;
import valentinaferro.u5w4d1.exceptions.NotFoundException;
import valentinaferro.u5w4d1.payloads.NewPointOfInterestDTO;
import valentinaferro.u5w4d1.payloads.PointOfInterestRespDTO;
import valentinaferro.u5w4d1.repositories.PointOfInterestRepository;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PointOfInterestService {
    private final PointOfInterestRepository pointOfInterestRepository;

    public PointOfInterestService(PointOfInterestRepository pointOfInterestRepository) {
        this.pointOfInterestRepository = pointOfInterestRepository;
    }

    // Lista dei POI dentro il rettangolo visibile della mappa.
    public List<PointOfInterestRespDTO> getInViewport(BigDecimal minLat, BigDecimal maxLat, BigDecimal minLng, BigDecimal maxLng) {
        return pointOfInterestRepository.findInViewport(minLat, maxLat, minLng, maxLng)
                .stream().map(PointOfInterestRespDTO::fromEntity).toList();
    }

    // Un singolo POI per id. Se non esiste, NotFoundException (-> 404).
    public PointOfInterestRespDTO findById(Long id) {
        return pointOfInterestRepository.findById(id)
                .map(PointOfInterestRespDTO::fromEntity)
                .orElseThrow(() -> new NotFoundException("POI " + id + " non trovato"));
    }

    // Crea un nuovo POI dai dati del DTO.
    public PointOfInterestRespDTO create(NewPointOfInterestDTO body) {
        PointOfInterest poi = new PointOfInterest();
        applyDto(poi, body);
        PointOfInterest salvato = pointOfInterestRepository.save(poi);
        return PointOfInterestRespDTO.fromEntity(salvato);
    }

    // Aggiorna un POI esistente. Se non esiste, NotFoundException (-> 404).
    public PointOfInterestRespDTO update(Long id, NewPointOfInterestDTO body) {
        PointOfInterest poi = pointOfInterestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("POI " + id + " non trovato"));
        applyDto(poi, body);
        PointOfInterest salvato = pointOfInterestRepository.save(poi);
        return PointOfInterestRespDTO.fromEntity(salvato);
    }

    // Elimina un POI. Se non esiste, NotFoundException (-> 404).
    public void delete(Long id) {
        if (!pointOfInterestRepository.existsById(id)) {
            throw new NotFoundException("POI " + id + " non trovato");
        }
        pointOfInterestRepository.deleteById(id);
    }

    // Copia i campi del DTO sull'entità. Usato da create e update per non duplicare i setter.
    // id e creatoIl NON si toccano: id lo genera il DB, creatoIl lo mette @CreationTimestamp.
    private void applyDto(PointOfInterest poi, NewPointOfInterestDTO body) {
        poi.setTipologia(body.tipologia());
        poi.setLatitudine(body.latitudine());
        poi.setLongitudine(body.longitudine());
        poi.setIndirizzo(body.indirizzo());
        poi.setDescrizione(body.descrizione());
    }
}
