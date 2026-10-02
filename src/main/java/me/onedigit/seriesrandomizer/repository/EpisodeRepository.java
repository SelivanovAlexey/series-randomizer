package me.onedigit.seriesrandomizer.repository;

import me.onedigit.seriesrandomizer.model.entities.EpisodeEntity;
import me.onedigit.seriesrandomizer.model.entities.SeriesEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EpisodeRepository extends JpaRepository<EpisodeEntity, Long> {
    List<EpisodeEntity> findAllBySeriesAndWatchedFalse(SeriesEntity series);

    List<EpisodeEntity> findAllBySeries(SeriesEntity series);

    boolean existsBySeriesAndWatchedFalse(SeriesEntity series);

    long countBySeriesAndWatchedTrue(SeriesEntity series);
}
