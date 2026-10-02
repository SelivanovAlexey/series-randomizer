package me.onedigit.seriesrandomizer.service;

import me.onedigit.seriesrandomizer.model.Series;
import me.onedigit.seriesrandomizer.repository.SeriesRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SeriesService {

    private final SeriesRepository seriesRepository;

    public SeriesService(SeriesRepository seriesRepository) {
        this.seriesRepository = seriesRepository;
    }

    @Transactional(readOnly = true)
    public List<Series> getAll() {
        return seriesRepository.findAll(Sort.by("title")).stream()
                .map(s -> new Series(s.getCode(), s.getTitle()))
                .toList();
    }
}
