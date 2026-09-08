package valentinaferro.u5w4d1.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@Getter
@Setter

public class PointOfInterest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private Tipologia tipologia;

    @Column(precision = 9, scale = 6)
    private BigDecimal latitudine;
    @Column(precision = 9, scale = 6)
    private BigDecimal longitudine;
    private String indirizzo;
    private String descrizione;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime creatoIl;

}
