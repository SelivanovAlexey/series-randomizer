package me.onedigit.seriesrandomizer.model.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Setter
@Getter
@Table(name = "series")
public class SeriesEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String code;
    private String title;
    @OneToMany(mappedBy = "series")
    private List<EpisodeEntity> episodes;
}
