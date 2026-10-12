package me.onedigit.seriesrandomizer.repository;

import me.onedigit.seriesrandomizer.model.entities.EpisodeEntity;
import me.onedigit.seriesrandomizer.model.entities.SeriesEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EpisodeRepository extends JpaRepository<EpisodeEntity, Long> {
    List<EpisodeEntity> findAllBySeriesAndWatchedFalse(SeriesEntity series);

    boolean existsBySeriesAndWatchedFalse(SeriesEntity series);

    long countBySeriesAndWatchedTrue(SeriesEntity series);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE EpisodeEntity episode SET episode.watched = false WHERE episode.series = :series")
    void resetEpisodesBySeries(@Param("series") SeriesEntity series);
}
