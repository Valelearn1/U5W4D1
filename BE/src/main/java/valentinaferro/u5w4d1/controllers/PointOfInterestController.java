package valentinaferro.u5w4d1.controllers;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import valentinaferro.u5w4d1.payloads.NewPointOfInterestDTO;
import valentinaferro.u5w4d1.payloads.PointOfInterestRespDTO;
import valentinaferro.u5w4d1.services.PointOfInterestService;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/pois")
public class PointOfInterestController {

    private final PointOfInterestService pointOfInterestService;

    public PointOfInterestController(PointOfInterestService pointOfInterestService) {
        this.pointOfInterestService = pointOfInterestService;
    }

    // GET /api/pois?minLat=..&maxLat=..&minLng=..&maxLng=..
    // Lista dei POI dentro il rettangolo visibile della mappa (lista laterale sincronizzata).
    @GetMapping
    public List<PointOfInterestRespDTO> getInViewport(@RequestParam BigDecimal minLat,
                                                      @RequestParam BigDecimal maxLat,
                                                      @RequestParam BigDecimal minLng,
                                                      @RequestParam BigDecimal maxLng) {
        return pointOfInterestService.getInViewport(minLat, maxLat, minLng, maxLng);
    }

    // GET /api/pois/{id} - un singolo POI.
    @GetMapping("/{id}")
    public PointOfInterestRespDTO getById(@PathVariable Long id) {
        return pointOfInterestService.findById(id);
    }

    // POST /api/pois - crea un nuovo POI. 201 Created.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PointOfInterestRespDTO create(@RequestBody @Valid NewPointOfInterestDTO body) {
        return pointOfInterestService.create(body);
    }

    // PUT /api/pois/{id} - aggiorna un POI esistente.
    @PutMapping("/{id}")
    public PointOfInterestRespDTO update(@PathVariable Long id,
                                         @RequestBody @Valid NewPointOfInterestDTO body) {
        return pointOfInterestService.update(id, body);
    }

    // DELETE /api/pois/{id} - elimina un POI. 204 No Content.
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        pointOfInterestService.delete(id);
    }
}
