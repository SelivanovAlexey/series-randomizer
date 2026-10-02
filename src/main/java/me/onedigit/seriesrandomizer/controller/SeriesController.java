package me.onedigit.seriesrandomizer.controller;

import me.onedigit.seriesrandomizer.model.Series;
import me.onedigit.seriesrandomizer.service.SeriesService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class SeriesController {

    private final SeriesService seriesService;

    public SeriesController(SeriesService seriesService) {
        this.seriesService = seriesService;
    }

    @GetMapping("/series")
    public List<Series> getAll() {
        return seriesService.getAll();
    }
}
