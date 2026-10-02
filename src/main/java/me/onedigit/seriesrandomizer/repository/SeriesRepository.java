package me.onedigit.seriesrandomizer.repository;

import me.onedigit.seriesrandomizer.model.entities.SeriesEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SeriesRepository extends JpaRepository<SeriesEntity, Long> {
    Optional<SeriesEntity> findByCode(String code);
}
