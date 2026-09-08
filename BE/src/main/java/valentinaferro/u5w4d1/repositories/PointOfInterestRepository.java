package valentinaferro.u5w4d1.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import valentinaferro.u5w4d1.entities.PointOfInterest;

import java.math.BigDecimal;
import java.util.List;

public interface PointOfInterestRepository extends JpaRepository<PointOfInterest, Long> {

    @Query("SELECT p FROM PointOfInterest p " +
           "WHERE p.latitudine BETWEEN :minLat AND :maxLat " +
           "AND p.longitudine BETWEEN :minLng AND :maxLng")
    List<PointOfInterest> findInViewport(BigDecimal minLat, BigDecimal maxLat,
                                         BigDecimal minLng, BigDecimal maxLng);
}
