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

    @GetMapping("/series/{code}/pick")
    public Episode pick(@PathVariable String code, @RequestParam(required = false) Long currentEpisodeId) {
        return episodePickerService.pickEpisode(code, currentEpisodeId);
    }

    @PostMapping("/episodes/{id}/watched")
    public WatchedResult watched(@PathVariable Long id) {
        return episodePickerService.markWatched(id);
    }

    @PostMapping("/series/{code}/reset")
    public Series reset(@PathVariable String code) {
        return episodePickerService.reset(code);
    }
}
