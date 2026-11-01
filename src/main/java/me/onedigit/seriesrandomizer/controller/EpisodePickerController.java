package me.onedigit.seriesrandomizer.controller;

import me.onedigit.seriesrandomizer.model.Episode;
import me.onedigit.seriesrandomizer.model.Series;
import me.onedigit.seriesrandomizer.model.WatchedResult;
import me.onedigit.seriesrandomizer.service.EpisodePickerService;
import org.springframework.web.bind.annotation.*;

@RestController
public class EpisodePickerController {

    private final EpisodePickerService episodePickerService;

    public EpisodePickerController(EpisodePickerService episodePickerService) {
        this.episodePickerService = episodePickerService;
    }

    @GetMapping({
            "/series/{code}/pick",
            "/s/{code}/p"
    })
    public Episode pick(@PathVariable String code, @RequestParam(required = false) Long currentEpisodeId) {
        return episodePickerService.pickEpisode(code, currentEpisodeId);
    }

    @PostMapping({
            "/episodes/{id}/watched",
            "/e/{id}/w"
    })
    public WatchedResult watched(@PathVariable Long id) {
        return episodePickerService.markWatched(id);
    }

    @PostMapping({
            "/series/{seriesCode}/episodes/{season}/{episode}/watched",
            "/s/{seriesCode}/e/{season}/{episode}/w"
    })
    public WatchedResult watched(@PathVariable String seriesCode, @PathVariable Integer season, @PathVariable Integer episode) {
        return episodePickerService.markWatched(seriesCode, season, episode);
    }

    @PostMapping({
            "/series/{code}/reset",
            "/s/{code}/r"
    })
    public Series reset(@PathVariable String code) {
        return episodePickerService.reset(code);
    }
}
