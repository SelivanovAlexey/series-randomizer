package me.onedigit.seriesrandomizer.service;

import me.onedigit.seriesrandomizer.model.Episode;
import me.onedigit.seriesrandomizer.model.Series;
import me.onedigit.seriesrandomizer.model.WatchedResult;
import me.onedigit.seriesrandomizer.model.entities.EpisodeEntity;
import me.onedigit.seriesrandomizer.model.entities.SeriesEntity;
import me.onedigit.seriesrandomizer.repository.EpisodeRepository;
import me.onedigit.seriesrandomizer.repository.SeriesRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;


@Service
public class EpisodePickerService {

    private final EpisodeRepository episodeRepository;
    private final SeriesRepository seriesRepository;

    public EpisodePickerService(EpisodeRepository episodeRepository, SeriesRepository seriesRepository) {
        this.episodeRepository = episodeRepository;
        this.seriesRepository = seriesRepository;
    }

    @Transactional(readOnly = true)
    public Episode pickEpisode(String seriesCode, Long currentEpisodeId) {
        SeriesEntity series = seriesRepository.findByCode(seriesCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Сериал не найден: " + seriesCode));

        List<EpisodeEntity> episodes = episodeRepository.findAllBySeriesAndWatchedFalse(series);
        if (episodes.isEmpty()) throw new ResponseStatusException(HttpStatus.CONFLICT, "Сериал уже просмотрен");

        if (currentEpisodeId != null && episodes.size() > 1) {
            episodes.removeIf(e -> e.getId().equals(currentEpisodeId));
        }

        EpisodeEntity pickEntity = episodes.get(ThreadLocalRandom.current().nextInt(episodes.size()));
        return new Episode(pickEntity.getId(), series.getTitle(), pickEntity.getTitle(), pickEntity.getSeason(), pickEntity.getNumber());
    }

    @Transactional
    public Series reset(String seriesCode){
        SeriesEntity series = seriesRepository.findByCode(seriesCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Сериал не найден: " + seriesCode));

        if (episodeRepository.existsBySeriesAndWatchedFalse(series))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Сериал еще не просмотрен");

        episodeRepository.findAllBySeries(series).forEach(e -> e.setWatched(false));
        return new Series(series.getCode(), series.getTitle());
    }

    @Transactional
    public WatchedResult markWatched(Long id) {
        EpisodeEntity episode = episodeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Серия не найдена"));
        episode.setWatched(true);
        return new WatchedResult(episodeRepository.countBySeriesAndWatchedTrue(episode.getSeries()));
    }
}
